# Forge Landing — Deploy

## ⚠️ Главное

- **Путь к папке:** `/Users/Nail/Desktop/claude-code/Forge/Assets/landing/`
- **Эта папка — git-репо** `nailmardamshin/forge`. Редактируешь и пушишь отсюда. Никаких копирований в другие места.
- **Production:** Beget shared hosting (серверы в РФ) — `forge-ai.io`
- **Staging:** Vercel (доступен через VPN) — автоматом деплоит при `git push` в `main`

## Workflow внесения изменений

```bash
cd /Users/Nail/Desktop/claude-code/Forge/Assets/landing

# 1. Редактируешь файлы
# 2. При изменении CSS или JS — ОБЯЗАТЕЛЬНО обнови cache buster в index.html:
#    <link rel="stylesheet" href="style.css?v=YYYYMMDD_slug">
#    Иначе браузеры будут показывать старую версию из кеша.

# 3. Коммитишь и пушишь:
git add .
git commit -m "описание изменений"
git push

# 4. Ждёшь ~30 секунд — Vercel сам задеплоит
# 5. Проверяешь на живом сайте
```

## Структура проекта

```
landing/
├── index.html          # структура страницы
├── style.css           # стили (neobrutalism)
├── main.js             # JS: анимации, модалка, форма
├── api/
│   └── lead.js         # Vercel Serverless Function (бэкенд формы)
├── legal/              # юр-документы (Политика + Согласие)
│   ├── README.md       # ⚠️ правила работы с legal — читать ПЕРВЫМ
│   ├── privacy-policy.html
│   ├── consent.html
│   └── legal.css
├── vercel.json         # конфиг Vercel
├── robots.txt          # для поисковиков
├── sitemap.xml         # карта сайта
├── og-template.html    # шаблон OG-картинки
├── assets/             # картинки, лого, favicon
├── backlog.md          # бэклог задач
└── DEPLOY.md           # этот файл
```

## ⚠️ Работаешь с Политикой, Согласием или чекбоксом согласия?

**Читай `legal/README.md` перед правками.** Там: что можно/нельзя менять в юр-текстах, как версионировать согласие (`consent_text_version`), как не сломать серверную валидацию и поля Airtable для юр-аудита.

## Как работает форма лидов

```
Пользователь → Форма → POST /api/lead → Vercel Function
                                              ├─→ Airtable (FORGE CRM → Leads)
                                              └─→ Telegram (уведомление Наилю)
```

### Airtable

- **База:** `FORGE CRM` (`appwANdQ0Txe6BRsy`)
- **Таблица:** `Leads`
- **Поля:** Name, Company, Contact, Task, Source, Status, Notes
- **Source options:** hero, final-cta, footer, modal
- **Status options:** New → Contacted → Qualified → Closed-Won / Closed-Lost

## Environment Variables (Vercel Dashboard)

⚠️ **Эти переменные лежат только в Vercel.** В коде их нет. В git они не попадают.

| Key | Where to get | Purpose |
|-----|--------------|---------|
| `AIRTABLE_API_KEY` | [airtable.com/create/tokens](https://airtable.com/create/tokens) — Personal Access Token, scope `data.records:write` для базы FORGE CRM | Запись лидов в Airtable |
| `TELEGRAM_BOT_TOKEN` | `~/Desktop/claude-code/Syl/.env` → `TELEGRAM_BOT_TOKEN` | Отправка уведомлений через Syl-бота |
| `TELEGRAM_CHAT_ID` | `~/Desktop/claude-code/Syl/.env` → `TELEGRAM_USER_ID` (значение: `210506677`) | Куда слать уведомления |

После добавления/изменения env vars — Vercel требует **Redeploy**:
- Vercel → Deployments → последний деплой → ⋯ → Redeploy

## Vercel Setup (one-time)

1. Зайти на [vercel.com](https://vercel.com) → Sign in with GitHub
2. **New Project** → Import `nailmardamshin/forge`
3. Framework preset: **Other**
4. Root directory: `./`
5. Build command: оставить пустым
6. Output directory: оставить пустым
7. **Deploy**
8. После первого деплоя — зайти в Settings → Environment Variables → добавить 3 переменных
9. Redeploy

## Debug

### Telegram не приходит

1. Vercel → Deployments → последний деплой → **Logs** (или Runtime Logs)
2. Отправить тестовую форму
3. Найти в логах строки с `Telegram error:` или `TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set`
4. Частые причины:
   - Env var с пробелами/переводами строк → пересохранить
   - Chat ID неверный → проверить что это твой Telegram user_id (`210506677`)
   - Ты никогда не писал Syl-боту `/start` → написать в Telegram `/start`

### Airtable не пишет

1. Смотри логи Vercel Function
2. `Airtable error: 401` → неверный токен или нет scope
3. `Airtable error: 422` → неверная схема полей (например переименовали колонку)

### Форма не отправляется вообще

- Проверить DevTools → Network → POST `/api/lead` идёт?
- Если 404 — значит Vercel не видит папку `api/` (проверить что она закоммичена)
- Если 500 — смотреть логи функции

## Что НЕ делать

- ❌ Коммитить секреты (токены, API keys) — на Beget в `.env`, на Vercel в env vars
- ❌ Удалять `vercel.json` — Vercel-staging использует его
- ❌ Удалять `.htaccess` — Beget-production использует его
- ❌ Забывать обновлять cache buster после изменения CSS/JS
- ❌ Редактировать файлы в нескольких местах — только в этой папке
- ❌ Включать оранжевое облачко (Cloudflare proxy) в DNS — сайт перестанет открываться из РФ

---

## Beget (Production)

### Почему Beget, а не Vercel

Vercel и Cloudflare блокируются ТСПУ/РКН в России. Сайт недоступен для ЦА без VPN. Beget — серверы физически в РФ, российские IP, трафик не пересекает границу → ТСПУ не инспектирует.

### Архитектура на Beget

```
~/forge-ai.io/                    ← домашняя директория сайта на Beget
├── .env                          ← секреты (ВРУЧНУЮ, не из git!)
└── public_html/                  ← document root (сюда деплоится git-репо)
    ├── index.html
    ├── style.css
    ├── main.js
    ├── .htaccess                 ← URL rewrite, security headers, cache
    ├── api/
    │   ├── lead.php              ← PHP-бэкенд формы (production)
    │   └── lead.js               ← Vercel-бэкенд (staging, игнорируется Apache)
    ├── vercel.json               ← игнорируется Apache
    ├── legal/
    ├── assets/
    └── ...
```

### Форма лидов на Beget

```
Пользователь → Форма → POST /api/lead → .htaccess → api/lead.php
                                              ├─→ Airtable (FORGE CRM → Leads)
                                              └─→ Telegram (уведомление Наилю)
```

PHP-скрипт `api/lead.php` — 1:1 порт `api/lead.js`:
- Та же валидация, honeypot, consent check
- cURL вместо fetch (таймауты: connect 3s, total 8s)
- Секреты из `.env` (лежит ВЫШЕ `public_html/`, недоступен по HTTP)

### Environment Variables (Beget)

⚠️ **Секреты лежат в `~/.env` (выше public_html/).** В коде их нет. В git не попадают.

| Key | Where to get | Purpose |
|-----|--------------|---------|
| `AIRTABLE_API_KEY` | [airtable.com/create/tokens](https://airtable.com/create/tokens) — PAT, scope `data.records:write` для базы FORGE CRM | Запись лидов |
| `TELEGRAM_BOT_TOKEN` | `~/Desktop/claude-code/Syl/.env` → `TELEGRAM_BOT_TOKEN` | Уведомления через Syl-бота |
| `TELEGRAM_CHAT_ID` | `210506677` (Telegram user_id Наиля) | Куда слать уведомления |

### Workflow (Beget)

```bash
cd /Users/Nail/Desktop/claude-code/Forge/Assets/landing

# 1. Редактируешь файлы
# 2. При изменении CSS или JS — обязательно обнови cache buster в index.html:
#    <link rel="stylesheet" href="style.css?v=YYYYMMDD_slug">

# 3. Коммитишь и пушишь:
git add .
git commit -m "описание изменений"
git push

# 4. Beget подтягивает через git-deploy (~1-2 мин)
# 5. Vercel деплоит staging (~30 секунд)
# 6. Проверяешь на живом сайте
```

### Деплой на Beget (первоначальная настройка)

> Пошаговая инструкция — делать ОДИН РАЗ при миграции

#### Шаг 1: Создать хостинг на Beget

1. Зайти в [beget.com](https://beget.com) → Панель управления
2. **Сайты** → Добавить сайт → `forge-ai.io`
3. Beget создаст структуру `~/forge-ai.io/public_html/`

#### Шаг 2: Переключить PHP на 8.1+

1. **Сайты** → `forge-ai.io` → **PHP** → выбрать **8.1** или выше
2. Убедиться что модули включены: `curl`, `mbstring`, `json` (обычно по умолчанию)

#### Шаг 3: Создать `.env` с секретами

1. Через **SSH** (`ssh <login>@<login>.beget.tech`) или **Файловый менеджер** в панели
2. Перейти в `~/forge-ai.io/` (НЕ в `public_html/`!)
3. Создать файл `.env`:
   ```
   AIRTABLE_API_KEY=pat...ваш_токен...
   TELEGRAM_BOT_TOKEN=123456:ABC...ваш_токен...
   TELEGRAM_CHAT_ID=210506677
   ```
4. Значения токенов взять:
   - `AIRTABLE_API_KEY` — из Vercel Dashboard → Settings → Environment Variables
   - `TELEGRAM_BOT_TOKEN` — из `~/Desktop/claude-code/Syl/.env`
   - `TELEGRAM_CHAT_ID` — `210506677`

#### Шаг 4: Настроить Git-деплой

1. В панели Beget → **Git** (или **Деплой**)
2. Привязать репозиторий `nailmardamshin/forge`
3. Ветка: `main`
4. Папка деплоя: `forge-ai.io/public_html`
5. Автодеплой при push: **включить**

Альтернатива (если Git-деплой недоступен):
- Через SSH: `cd ~/forge-ai.io/public_html && git clone https://github.com/nailmardamshin/forge.git .`
- Обновление: `cd ~/forge-ai.io/public_html && git pull`

#### Шаг 5: Включить SSL

1. **Сайты** → `forge-ai.io` → **SSL** → **Бесплатный SSL (Let's Encrypt)**
2. Подождать ~5 минут (выпуск сертификата)
3. После подтверждения SSL — раскомментировать в `.htaccess` строки HTTPS-редиректа:
   ```apache
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
   ```
4. Позже — раскомментировать HSTS-заголовок (после проверки что всё работает)

#### Шаг 6: Переключить DNS в Cloudflare

> ⚠️ Делать ПОСЛЕ успешного деплоя и SSL!

1. Зайти в [Cloudflare Dashboard](https://dash.cloudflare.com) → `forge-ai.io` → **DNS**
2. Узнать IP сервера Beget: в панели Beget → **Сайты** → `forge-ai.io` → IP-адрес (или через SSH: `hostname -I`)

3. **Изменить A-запись** `forge-ai.io`:
   - Type: `A`
   - Name: `@` (или `forge-ai.io`)
   - Content: `<IP Beget>`
   - Proxy: **OFF** (серое облачко, DNS only) — **КРИТИЧНО!** Оранжевое = Cloudflare proxy = блокируется РКН
   - TTL: `5 min` (вернуть `Auto` после стабилизации)

4. **Изменить запись для www**:
   - Type: `A`
   - Name: `www`
   - Content: `<IP Beget>` (тот же IP)
   - Proxy: **OFF** (серое облачко)

5. Подождать 5-15 минут (DNS propagation с TTL 300)
6. Проверить: `dig forge-ai.io` → должен показать IP Beget

#### Шаг 7: Проверить

Открыть `https://forge-ai.io` **без VPN** с телефона на мобильном интернете.

### Чеклист тестирования после миграции

- [ ] `https://forge-ai.io` открывается **без VPN** из РФ
- [ ] CSS/JS/картинки/шрифты грузятся (DevTools → Network → нет 404)
- [ ] Форма: заполнить и отправить → лид в Airtable (таблица Leads)
- [ ] Telegram: уведомление от Syl-бота пришло
- [ ] Consent: отправка без галочки → ошибка «Требуется согласие»
- [ ] Honeypot: POST с `website` → тихий 200 (через DevTools/curl)
- [ ] `/legal/privacy-policy` — открывается (без .html в URL)
- [ ] `/legal/consent` — открывается
- [ ] SSL: замочек в адресной строке, нет mixed content warnings
- [ ] `http://forge-ai.io` → редирект на `https://` (после раскомментирования в .htaccess)
- [ ] `www.forge-ai.io` → редирект на `forge-ai.io`
- [ ] Мобилка: вёрстка, форма, модалка — всё ок
- [ ] Cookie-баннер: появляется, Accept загружает Метрику, Reject — нет
- [ ] Security headers: DevTools → Network → Response Headers (X-Frame-Options, CSP и др.)
- [ ] `robots.txt` и `sitemap.xml` — доступны
- [ ] `/.env` → 403 Forbidden (не отдаётся по HTTP)
- [ ] Vercel staging (`forge-ai.vercel.app` или через VPN) — по-прежнему работает

### Rollback

Если что-то пошло не так — вернуть DNS в Cloudflare:
1. A-запись `forge-ai.io` → IP Vercel (или CNAME → `cname.vercel-dns.com`)
2. Proxy: **ON** (оранжевое облачко) — если нужен Vercel
3. TTL обновится за 5 минут

### Debug (Beget)

#### Форма не отправляется
1. DevTools → Network → POST `/api/lead` → Status code?
2. Если 404 → `.htaccess` rewrite не работает. Проверить что `mod_rewrite` включён
3. Если 500 → смотреть error log: SSH → `tail -f ~/forge-ai.io/public_html/error.log` или в панели Beget → Логи
4. Если пустой ответ → PHP crash. Временно добавить в начало `lead.php`: `ini_set('display_errors', '1');`

#### Airtable/Telegram не работают
1. SSH на Beget: `curl -I https://api.airtable.com` → проверить что доступен
2. `curl -I https://api.telegram.org` → проверить что доступен
3. Если 000/timeout → API заблокирован из ДЦ Beget → проксировать через VPS

#### SSL не выпускается
1. DNS уже переключен на Beget? Let's Encrypt валидирует через HTTP → IP должен быть Beget
2. В Cloudflare proxy OFF (серое облачко)?
3. Подождать 10-15 минут, повторить

---
