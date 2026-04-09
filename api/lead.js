// Vercel Serverless Function — handles form submissions from the landing
// POST /api/lead
// 1. Validates payload
// 2. Writes lead to Airtable (FORGE CRM → Leads)
// 3. Sends Telegram notification to Nail via Syl bot

const AIRTABLE_BASE_ID = 'appwANdQ0Txe6BRsy';
const AIRTABLE_TABLE = 'Leads';

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function validateSource(src) {
  const allowed = ['hero', 'final-cta', 'footer', 'modal', 'nav', 'mobile-menu'];
  return allowed.includes(src) ? src : 'modal';
}

export default async function handler(req, res) {
  // CORS headers (allow from any origin since this is a public landing form)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};

    // Honeypot — invisible 'website' field. Humans never see it, bots fill it.
    // Reject silently with 200 so bots don't retry or learn the signal.
    if (body.website && String(body.website).trim().length > 0) {
      return res.status(200).json({ ok: true });
    }

    const name = String(body.name || '').trim().slice(0, 200);
    const company = String(body.company || '').trim().slice(0, 200);
    const contact = String(body.contact || '').trim().slice(0, 200);
    const task = String(body.task || '').trim().slice(0, 2000);
    const source = validateSource(body.source);

    // Validate required fields
    if (!name || !company || !contact) {
      return res.status(400).json({ error: 'Заполните обязательные поля' });
    }

    // Validate consent (FZ-152 — server side, client can be bypassed)
    if (body.consent !== true) {
      return res.status(400).json({ error: 'Требуется согласие на обработку персональных данных' });
    }
    const consentTimestamp = typeof body.consent_timestamp === 'string' && body.consent_timestamp
      ? body.consent_timestamp
      : new Date().toISOString();
    const consentTextVersion = String(body.consent_text_version || '').trim().slice(0, 50) || 'unknown';

    // Capture IP and User-Agent for proof of consent
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || '';
    const userAgent = String(req.headers['user-agent'] || '').slice(0, 1000);

    const airtableToken = process.env.AIRTABLE_API_KEY;
    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.TELEGRAM_CHAT_ID;

    // Refuse to silently accept leads if no output channels are configured
    // (misconfigured Vercel env vars — otherwise user sees success, lead is lost)
    if (!airtableToken && (!tgToken || !tgChatId)) {
      console.error('No output channels configured — rejecting lead to avoid data loss');
      return res.status(500).json({ error: 'Сервис временно недоступен' });
    }

    const errors = [];

    // Write to Airtable
    if (airtableToken) {
      try {
        const airtableRes = await fetch(
          `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${airtableToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fields: {
                Name: name,
                Company: company,
                Contact: contact,
                Task: task,
                Source: source,
                Status: 'New',
                'Consent given': true,
                'Consent timestamp': consentTimestamp,
                'Consent text version': consentTextVersion,
                IP: ip,
                'User agent': userAgent
              },
              typecast: true
            })
          }
        );

        if (!airtableRes.ok) {
          const text = await airtableRes.text();
          console.error('Airtable error:', airtableRes.status, text);
          errors.push('airtable');
        }
      } catch (err) {
        console.error('Airtable request failed:', err);
        errors.push('airtable');
      }
    } else {
      console.warn('AIRTABLE_API_KEY not set — skipping Airtable');
    }

    // Send Telegram notification
    if (tgToken && tgChatId) {
      try {
        const lines = [
          '🔥 <b>Новый лид Forge</b>',
          '',
          `👤 <b>${escapeHtml(name)}</b>`,
          `🏢 ${escapeHtml(company)}`,
          `📞 ${escapeHtml(contact)}`
        ];
        if (task) {
          lines.push('', `📝 ${escapeHtml(task)}`);
        }
        lines.push('', `📍 Источник: <code>${source}</code>`);
        lines.push(`✅ Согласие на ОПД получено (v${escapeHtml(consentTextVersion)})`);

        const tgRes = await fetch(
          `https://api.telegram.org/bot${tgToken}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: tgChatId,
              text: lines.join('\n'),
              parse_mode: 'HTML',
              disable_web_page_preview: true
            })
          }
        );

        if (!tgRes.ok) {
          const text = await tgRes.text();
          console.error('Telegram error:', tgRes.status, text);
          errors.push('telegram');
        }
      } catch (err) {
        console.error('Telegram request failed:', err);
        errors.push('telegram');
      }
    } else {
      console.warn('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping Telegram');
    }

    // Return success even if one channel failed — as long as one worked
    if (errors.length === 2) {
      return res.status(500).json({ error: 'Не удалось сохранить заявку' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Внутренняя ошибка' });
  }
}
