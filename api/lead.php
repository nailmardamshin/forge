<?php
// Beget PHP backend — handles form submissions from the landing
// POST /api/lead (rewritten by .htaccess from /api/lead → /api/lead.php)
// 1:1 port of api/lead.js (Vercel Serverless Function)
//
// 1. Validates payload
// 2. Writes lead to Airtable (FORGE CRM → Leads)
// 3. Sends Telegram notification to Nail via Syl bot

declare(strict_types=1);
ini_set('display_errors', '0');
error_reporting(0);
mb_internal_encoding('UTF-8');

// ── Config ──────────────────────────────────────────────────────────
// .env lives ABOVE public_html/ — physically inaccessible via HTTP.
// Beget: ~/forge-ai.io/.env → dirname(__DIR__, 2) from api/lead.php
$envPath = dirname(__DIR__, 2) . '/.env';

// Fallback: .env in same dir as index.html (local dev: php -S from landing/)
if (!file_exists($envPath)) {
    $envPath = dirname(__DIR__) . '/.env';
}

$config = [];
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        $pos = strpos($line, '=');
        if ($pos === false) continue;
        $key = trim(substr($line, 0, $pos));
        $val = trim(substr($line, $pos + 1));
        // Strip surrounding quotes
        if (strlen($val) >= 2 && ($val[0] === '"' || $val[0] === "'")) {
            $val = substr($val, 1, -1);
        }
        $config[$key] = $val;
    }
}

$airtableToken = $config['AIRTABLE_API_KEY'] ?? $_ENV['AIRTABLE_API_KEY'] ?? getenv('AIRTABLE_API_KEY') ?: '';
$tgToken       = $config['TELEGRAM_BOT_TOKEN'] ?? $_ENV['TELEGRAM_BOT_TOKEN'] ?? getenv('TELEGRAM_BOT_TOKEN') ?: '';
$tgChatId      = $config['TELEGRAM_CHAT_ID'] ?? $_ENV['TELEGRAM_CHAT_ID'] ?? getenv('TELEGRAM_CHAT_ID') ?: '';

const AIRTABLE_BASE_ID = 'appwANdQ0Txe6BRsy';
const AIRTABLE_TABLE   = 'Leads';
const CURL_CONNECT_TIMEOUT = 3;
const CURL_TIMEOUT         = 8;

// ── Helpers ─────────────────────────────────────────────────────────

function escapeHtml(string $str): string {
    return htmlspecialchars($str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function validateSource(string $src): string {
    $allowed = ['hero', 'final-cta', 'footer', 'modal', 'nav', 'mobile-menu'];
    return in_array($src, $allowed, true) ? $src : 'modal';
}

function jsonResponse(int $code, array $data): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function curlPost(string $url, array $headers, string $jsonBody): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_POSTFIELDS     => $jsonBody,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => CURL_CONNECT_TIMEOUT,
        CURLOPT_TIMEOUT        => CURL_TIMEOUT,
    ]);
    $response = curl_exec($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error    = curl_error($ch);
    curl_close($ch);
    return ['code' => $httpCode, 'body' => $response, 'error' => $error];
}

// ── CORS headers (before any output) ────────────────────────────────

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// ── Method handling ─────────────────────────────────────────────────

$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($method !== 'POST') {
    jsonResponse(405, ['error' => 'Method not allowed']);
}

// ── Parse body ──────────────────────────────────────────────────────

$raw = file_get_contents('php://input');
$body = json_decode($raw ?: '', true);

if (!is_array($body)) {
    jsonResponse(400, ['error' => 'Invalid JSON']);
}

// ── Honeypot — invisible "website" field ────────────────────────────
// Humans never see it, bots fill it. Silent 200 so bots don't retry.

if (!empty($body['website']) && trim((string) $body['website']) !== '') {
    jsonResponse(200, ['ok' => true]);
}

// ── Validate fields ─────────────────────────────────────────────────

$name    = mb_substr(trim((string) ($body['name'] ?? '')), 0, 200);
$company = mb_substr(trim((string) ($body['company'] ?? '')), 0, 200);
$contact = mb_substr(trim((string) ($body['contact'] ?? '')), 0, 200);
$task    = mb_substr(trim((string) ($body['task'] ?? '')), 0, 2000);
$source  = validateSource((string) ($body['source'] ?? ''));

if ($name === '' || $company === '' || $contact === '') {
    jsonResponse(400, ['error' => 'Заполните обязательные поля']);
}

// ── Validate consent (FZ-152 — server side, client can be bypassed) ─

if (($body['consent'] ?? null) !== true) {
    jsonResponse(400, ['error' => 'Требуется согласие на обработку персональных данных']);
}

$consentTimestamp = (isset($body['consent_timestamp']) && is_string($body['consent_timestamp']) && $body['consent_timestamp'] !== '')
    ? $body['consent_timestamp']
    : gmdate('Y-m-d\TH:i:s\Z');

$consentTextVersion = mb_substr(trim((string) ($body['consent_text_version'] ?? '')), 0, 50);
if ($consentTextVersion === '') {
    $consentTextVersion = 'unknown';
}

// ── Capture IP and User-Agent for proof of consent ──────────────────

$ip = $_SERVER['HTTP_X_FORWARDED_FOR']
    ?? $_SERVER['REMOTE_ADDR']
    ?? '';
$ip = trim(explode(',', $ip)[0]);
$ip = mb_substr($ip, 0, 45);

$userAgent = mb_substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 1000);

// ── Check that at least one output channel is configured ────────────

if ($airtableToken === '' && ($tgToken === '' || $tgChatId === '')) {
    error_log('Forge lead.php: No output channels configured — rejecting lead to avoid data loss');
    jsonResponse(500, ['error' => 'Сервис временно недоступен']);
}

$errors = [];

// ── Write to Airtable ───────────────────────────────────────────────

if ($airtableToken !== '') {
    $airtablePayload = json_encode([
        'fields' => [
            'Name'                 => $name,
            'Company'              => $company,
            'Contact'              => $contact,
            'Task'                 => $task,
            'Source'               => $source,
            'Status'               => 'New',
            'Consent given'        => true,
            'Consent timestamp'    => $consentTimestamp,
            'Consent text version' => $consentTextVersion,
            'IP'                   => $ip,
            'User agent'           => $userAgent,
        ],
        'typecast' => true,
    ], JSON_UNESCAPED_UNICODE);

    $res = curlPost(
        'https://api.airtable.com/v0/' . AIRTABLE_BASE_ID . '/' . AIRTABLE_TABLE,
        [
            'Authorization: Bearer ' . $airtableToken,
            'Content-Type: application/json; charset=utf-8',
        ],
        $airtablePayload
    );

    if ($res['code'] < 200 || $res['code'] >= 300) {
        error_log('Forge lead.php: Airtable error: ' . $res['code'] . ' ' . $res['body'] . ' ' . $res['error']);
        $errors[] = 'airtable';
    }
} else {
    error_log('Forge lead.php: AIRTABLE_API_KEY not set — skipping Airtable');
}

// ── Send Telegram notification ──────────────────────────────────────

if ($tgToken !== '' && $tgChatId !== '') {
    $lines = [
        '🔥 <b>Новый лид Forge</b>',
        '',
        '👤 <b>' . escapeHtml($name) . '</b>',
        '🏢 ' . escapeHtml($company),
        '📞 ' . escapeHtml($contact),
    ];
    if ($task !== '') {
        $lines[] = '';
        $lines[] = '📝 ' . escapeHtml($task);
    }
    $lines[] = '';
    $lines[] = '📍 Источник: <code>' . $source . '</code>';
    $lines[] = '✅ Согласие на ОПД получено (v' . escapeHtml($consentTextVersion) . ')';

    $tgPayload = json_encode([
        'chat_id'                  => $tgChatId,
        'text'                     => implode("\n", $lines),
        'parse_mode'               => 'HTML',
        'disable_web_page_preview' => true,
    ], JSON_UNESCAPED_UNICODE);

    $res = curlPost(
        'https://api.telegram.org/bot' . $tgToken . '/sendMessage',
        ['Content-Type: application/json; charset=utf-8'],
        $tgPayload
    );

    if ($res['code'] < 200 || $res['code'] >= 300) {
        error_log('Forge lead.php: Telegram error: ' . $res['code'] . ' ' . $res['body'] . ' ' . $res['error']);
        $errors[] = 'telegram';
    }
} else {
    error_log('Forge lead.php: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping Telegram');
}

// ── Return result ───────────────────────────────────────────────────
// Success even if one channel failed — as long as one worked

if (count($errors) === 2) {
    jsonResponse(500, ['error' => 'Не удалось сохранить заявку']);
}

jsonResponse(200, ['ok' => true]);
