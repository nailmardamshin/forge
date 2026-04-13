# Forge Landing — Deploy

## ⚠️ Главное

- **Путь к папке:** `/Users/Nail/Desktop/claude-code/Forge/Assets/landing/`
- **Эта папка — git-репо** `nailmardamshin/forge`. Редактируешь и пушишь отсюда. Никаких копирований в другие места.
- **Production:** Beget shared hosting (серверы в РФ) — `forge-ai.io`
- **Staging:** Vercel (доступен через VPN) — автоматом деплоит при `git push` в `main`

## Workflow внесения изменений

```
Локально → git push → GitHub (источник истины)
                       ├─→ Vercel staging  (автомат, ~30 сек)
                       └─→ Beget production (forge-deploy, ~3 сек)
```

GitHub — главный. Vercel сам синхронится при push. Beget нужно толкнуть командой `forge-deploy`.

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

# 4. Деплоишь на Beget production (одна команда):
forge-deploy

# 5. Проверяешь forge-ai.io
```

**Алиас `forge-deploy`** живёт в `~/.zshrc` и делает:
```bash
ssh nailma2c@nailma2c.beget.tech 'cd ~/forge-ai.io/public_html && git pull'
```

Если алиас не работает в текущем терминале — выполни `source ~/.zshrc` или открой новый таб.

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

### Workflow (Beget) — два шага после правок

```bash
git push        # GitHub получает изменения, Vercel-staging обновляется автоматом
forge-deploy    # Beget подтягивает через git pull, ~3 секунды
```

`forge-deploy` — алиас в `~/.zshrc`:
```bash
alias forge-deploy='ssh nailma2c@nailma2c.beget.tech "cd ~/forge-ai.io/public_html && git pull"'
```

### Деплой на Beget (первоначальная настройка)

> Пошаговая инструкция — делать ОДИН РАЗ при миграции. Если уже всё настроено — пропускай.

#### Шаг 1: Создать хостинг на Beget

1. Зайти в [beget.com](https://beget.com) → Панель управления
2. **Хостинг** → **Сайты** → Создать сайт → имя: `forge-ai.io`
3. Beget создаст структуру `~/forge-ai.io/public_html/`

#### Шаг 2: Включить PHP 8.1+ и SSH

1. **Хостинг** → **Сайты** → ⚙️ настройки сайта → **PHP 8.2**, **HTTP/2 ON**, **редирект HTTP→HTTPS ON**
2. На дашборде Хостинг — включить тоггл **SSH-доступ**
3. Сменить SSH-пароль: **Хостинг** → **FTP** → клик по `/forge-ai.io/public_html` → сменить пароль (он же SSH-пароль)

#### Шаг 3: Скопировать SSH-ключ на сервер (для passwordless деплоя)

С локального мака:
```bash
ssh-copy-id nailma2c@nailma2c.beget.tech
# Введёшь пароль один раз — ключ ляжет в ~/.ssh/authorized_keys на сервере
```

После этого `ssh nailma2c@nailma2c.beget.tech` работает без пароля.

#### Шаг 4: Создать `.env` с секретами на сервере

```bash
ssh nailma2c@nailma2c.beget.tech
cd ~/forge-ai.io
nano .env
```

Содержимое:
```
AIRTABLE_API_KEY=pat...ваш_токен...
TELEGRAM_BOT_TOKEN=123456:ABC...ваш_токен...
TELEGRAM_CHAT_ID=210506677
```

⚠️ **`.env` лежит в `~/forge-ai.io/.env`**, а НЕ в `public_html/`. Это специально — недоступен по HTTP.

Токены:
- `AIRTABLE_API_KEY` — Vercel Dashboard → Settings → Environment Variables
- `TELEGRAM_BOT_TOKEN` — `~/Desktop/claude-code/Syl/.env` локально
- `TELEGRAM_CHAT_ID` — `210506677`

После создания: `chmod 600 .env`

#### Шаг 5: Git clone репо в public_html

```bash
ssh nailma2c@nailma2c.beget.tech
cd ~/forge-ai.io
mv public_html public_html.bak       # бэкап на всякий
git clone https://github.com/nailmardamshin/forge.git public_html
ls -la public_html/                  # проверить что файлы на месте
```

После этого `git pull` в `public_html/` обновляет сайт за секунды.

#### Шаг 6: Добавить алиас на локальном маке

```bash
echo "alias forge-deploy='ssh nailma2c@nailma2c.beget.tech \"cd ~/forge-ai.io/public_html && git pull\"'" >> ~/.zshrc
source ~/.zshrc
```

#### Шаг 7: Включить SSL

1. **Домены** → ⋮ рядом с `forge-ai.io` → **Управление SSL сертификатами** → **LetsEncrypt** (бесплатно)
2. Подождать 5-15 минут (выпуск сертификата)
3. После выпуска — придёт письмо «Сертификат установлен»
4. HTTPS-редирект и HSTS уже включены: первый — в настройках сайта Beget (тоггл), второй — в `.htaccess`

#### Шаг 8: Переключить NS на Beget (или DNS A-запись)

Beget полностью управляет SSL и виртуалхостами только когда домен использует **его NS-серверы**. Поэтому самый надёжный путь — переключить NS у регистратора:

1. Зайти в **reg.ru** → управление доменом `forge-ai.io` → **DNS-серверы**
2. Заменить текущие NS на:
   ```
   ns1.beget.com
   ns2.beget.com
   ns1.beget.pro
   ns2.beget.pro
   ```
3. Сохранить. Пропагация — от 15 минут до нескольких часов
4. Beget сам пропишет правильную A-запись (`45.130.41.162` или другой IP, выделенный для сайта)

> ⚠️ **Важно про IP:** `87.236.19.23` — это SSH-сервер `serena1`, а не IP вебсервера. Реальный IP сайта смотри в **Домены** → **DNS** → запись A для `forge-ai.io`. Если используешь внешний DNS — A-запись должна указывать именно туда.

#### Шаг 9: Проверить

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
- [ ] `http://forge-ai.io` → редирект на `https://` (включается в настройках сайта Beget)
- [ ] `www.forge-ai.io` → редирект на `forge-ai.io`
- [ ] Мобилка: вёрстка, форма, модалка — всё ок
- [ ] Cookie-баннер: появляется, Accept загружает Метрику, Reject — нет
- [ ] Security headers: DevTools → Network → Response Headers (X-Frame-Options, CSP, HSTS)
- [ ] `robots.txt` и `sitemap.xml` — доступны
- [ ] `/.env` → 405 Not Allowed (не отдаётся, контент скрыт)
- [ ] Vercel staging (`forge-ai.vercel.app` или через VPN) — по-прежнему работает

### Rollback

Если что-то пошло не так — вернуть NS обратно на Cloudflare в reg.ru, в Cloudflare поставить A-запись на старый IP:
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

#### SSL не выпускается / HTTPS не отдаёт сертификат
1. NS уже переключены на Beget? Если используешь внешний DNS (Cloudflare/reg.ru) — A-запись должна указывать на **правильный IP** из Beget DNS-панели (не на SSH-сервер!)
2. Подождать 10-15 минут, повторить
3. Если в `openssl s_client -connect forge-ai.io:443` видишь `no peer certificate available` — IP в DNS не совпадает с виртуалхостом Beget. Проверь IP

#### `forge-deploy` не работает
1. Проверь алиас: `alias | grep forge-deploy`
2. Если нет — `source ~/.zshrc` или открыть новый таб
3. SSH-доступ выключился? Проверь тоггл в Beget → Хостинг
4. Ключ потерялся: `ssh-copy-id nailma2c@nailma2c.beget.tech`

---
