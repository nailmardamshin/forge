# Forge Landing — Deploy

## ⚠️ Главное

- **Путь к папке:** `/Users/Nail/Desktop/claude-code/Forge/Assets/landing/`
- **Эта папка — git-репо** `nailmardamshin/forge`. Редактируешь и пушишь отсюда. Никаких копирований.
- **Hosting:** Beget shared hosting (серверы в РФ) — `forge-ai.io`

## История: почему не Vercel

Изначально лендинг хостился на **Vercel** с автодеплоем из GitHub — удобно, push → деплой за 30 секунд. Но **Vercel и Cloudflare блокируются ТСПУ/РКН в России**: целевая аудитория (CEO/COO компаний 100-300 человек) не могла открыть сайт без VPN. Проверено на Wi-Fi и мобильных операторах: HTML грузился частично, CSS/JS — нет (DPI дропает по SNI).

**10-13 апреля 2026** переехали на **Beget shared hosting** — серверы физически в РФ, ТСПУ не инспектирует трафик. Vercel и Cloudflare убраны полностью. Подробности миграции — в коммите `feat(deploy): migrate landing to Beget for RU accessibility`.

---

## Workflow внесения изменений

```
Локально → git push → GitHub → forge-deploy → Beget
```

```bash
cd /Users/Nail/Desktop/claude-code/Forge/Assets/landing

# 1. Редактируешь файлы
# 2. При изменении CSS или JS — ОБЯЗАТЕЛЬНО обнови cache buster в index.html:
#    <link rel="stylesheet" href="style.css?v=YYYYMMDD_slug">
#    Иначе браузеры покажут старую версию из кеша.

# 3. Коммитишь и пушишь:
git add .
git commit -m "описание изменений"
git push

# 4. Деплоишь на Beget (одна команда):
forge-deploy

# 5. Проверяешь forge-ai.io
```

**`forge-deploy`** — алиас в `~/.zshrc`:
```bash
alias forge-deploy='ssh nailma2c@nailma2c.beget.tech "cd ~/forge-ai.io/public_html && git pull"'
```

Если алиас не работает в текущем терминале — `source ~/.zshrc` или открой новый таб.

---

## Структура проекта

```
landing/
├── index.html          # структура страницы
├── style.css           # стили (neobrutalism)
├── main.js             # JS: анимации, модалка, форма, cookie consent
├── api/
│   └── lead.php        # PHP-бэкенд формы (1:1 порт со старого lead.js)
├── legal/              # юр-документы
│   ├── README.md       # ⚠️ правила работы с legal — читать ПЕРВЫМ
│   ├── privacy-policy.html
│   ├── consent.html
│   └── legal.css
├── .htaccess           # Apache: rewrite, security headers, cache, HSTS
├── .env.example        # шаблон env vars (real .env — на сервере выше public_html/)
├── .gitignore
├── robots.txt
├── sitemap.xml
├── og-template.html    # шаблон OG-картинки
├── assets/             # картинки, лого, favicon, шрифты
├── backlog.md          # бэклог задач
└── DEPLOY.md           # этот файл
```

## ⚠️ Работаешь с Политикой, Согласием или чекбоксом согласия?

**Читай `legal/README.md` перед правками.** Там: что можно/нельзя менять в юр-текстах, как версионировать согласие (`consent_text_version`), как не сломать серверную валидацию и поля Airtable для юр-аудита.

---

## Как работает форма лидов

```
Пользователь → Форма → POST /api/lead → .htaccess rewrite → api/lead.php
                                              ├─→ Airtable (FORGE CRM → Leads)
                                              └─→ Telegram (уведомление через Syl-бота)
```

PHP-скрипт `api/lead.php`:
- Валидация полей, honeypot (`website`), consent check (строго `=== true`)
- cURL к Airtable и Telegram (таймауты: connect 3s, total 8s)
- Секреты из `.env` (лежит в `~/forge-ai.io/.env`, **выше** `public_html/` — недоступен по HTTP)
- `mb_substr` для кириллицы, UTF-8 encoding
- Если Airtable упал, но Telegram ок — успех (graceful degradation)

### Airtable

- **База:** `FORGE CRM` (`appwANdQ0Txe6BRsy`)
- **Таблица:** `Leads`
- **Поля:** Name, Company, Contact, Task, Source, Status, Notes, Consent given, Consent timestamp, Consent text version, IP, User agent
- **Source options:** hero, final-cta, footer, modal, nav, mobile-menu
- **Status options:** New → Contacted → Qualified → Closed-Won / Closed-Lost

### Environment Variables

⚠️ **Секреты лежат в `~/forge-ai.io/.env` на сервере Beget.** Выше `public_html/`, недоступны по HTTP. В git не попадают (`.env` в `.gitignore`).

| Key | Откуда взять | Зачем |
|-----|--------------|-------|
| `AIRTABLE_API_KEY` | [airtable.com/create/tokens](https://airtable.com/create/tokens) — PAT, scope `data.records:write` для базы FORGE CRM | Запись лидов |
| `TELEGRAM_BOT_TOKEN` | `~/Desktop/claude-code/Syl/.env` локально | Уведомления через Syl-бота |
| `TELEGRAM_CHAT_ID` | `210506677` (Telegram user_id Наиля) | Куда слать |

---

## Архитектура на Beget

```
~/forge-ai.io/                    ← домашняя директория сайта
├── .env                          ← секреты (создаётся вручную, не в git)
└── public_html/                  ← document root, сюда git clone
    ├── index.html
    ├── style.css
    ├── main.js
    ├── .htaccess
    ├── api/lead.php
    ├── legal/
    ├── assets/
    └── ...
```

---

## Первоначальная настройка Beget (one-time)

> Если уже всё настроено — пропускай. Это для случая если придётся переезжать на другой аккаунт или восстанавливать с нуля.

### Шаг 1: Создать сайт

1. [beget.com](https://beget.com) → Панель управления
2. **Хостинг** → **Сайты** → Создать сайт → имя: `forge-ai.io`
3. Beget создаст `~/forge-ai.io/public_html/`

### Шаг 2: PHP, HTTPS, SSH

1. **Хостинг** → **Сайты** → ⚙️ настройки сайта → **PHP 8.2**, **HTTP/2 ON**, **редирект HTTP→HTTPS ON**
2. На дашборде Хостинг — включить тоггл **SSH-доступ**
3. Сменить SSH-пароль: **Хостинг** → **FTP** → клик по `/forge-ai.io/public_html` → сменить пароль (он же SSH-пароль)

### Шаг 3: SSH-ключ для passwordless деплоя

С локального мака:
```bash
ssh-copy-id nailma2c@nailma2c.beget.tech
# Пароль введёшь один раз
```

После этого `ssh nailma2c@nailma2c.beget.tech` без пароля.

### Шаг 4: `.env` с секретами на сервере

```bash
ssh nailma2c@nailma2c.beget.tech
cd ~/forge-ai.io
nano .env
```

Содержимое:
```
AIRTABLE_API_KEY=pat...
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=210506677
```

⚠️ **`.env` ровно в `~/forge-ai.io/`**, а НЕ в `public_html/`. Это специально — недоступен по HTTP.

После создания: `chmod 600 .env`

### Шаг 5: Git clone репо в public_html

```bash
ssh nailma2c@nailma2c.beget.tech
cd ~/forge-ai.io
mv public_html public_html.bak       # бэкап если папка не пустая
git clone https://github.com/nailmardamshin/forge.git public_html
ls -la public_html/                  # проверить что файлы на месте
```

### Шаг 6: Алиас на локальном маке

```bash
echo "alias forge-deploy='ssh nailma2c@nailma2c.beget.tech \"cd ~/forge-ai.io/public_html && git pull\"'" >> ~/.zshrc
source ~/.zshrc
```

### Шаг 7: SSL

1. **Домены** → ⋮ рядом с `forge-ai.io` → **Управление SSL сертификатами** → **LetsEncrypt** (бесплатно)
2. Подождать 5-15 минут (выпуск)
3. Письмо «Сертификат установлен» → проверить `https://forge-ai.io`

### Шаг 8: NS на Beget

Beget полностью управляет SSL и виртуалхостами только когда домен использует **его NS-серверы**. Поэтому переключи NS у регистратора:

1. **reg.ru** → управление доменом `forge-ai.io` → **DNS-серверы**
2. Заменить на:
   ```
   ns1.beget.com
   ns2.beget.com
   ns1.beget.pro
   ns2.beget.pro
   ```
3. Сохранить. Пропагация — от 15 минут до нескольких часов
4. Beget сам пропишет правильную A-запись

> ⚠️ **Важно про IP:** `87.236.19.23` — это SSH-сервер `serena1`, **не IP вебсервера**. Реальный IP сайта смотри в **Домены** → **DNS** → запись A для `forge-ai.io` (на момент миграции — `45.130.41.162`). Если используешь внешний DNS — A-запись должна указывать именно туда.

### Шаг 9: Проверить

Открыть `https://forge-ai.io` **без VPN** с телефона на мобильном интернете.

---

## Чеклист тестирования

- [ ] `https://forge-ai.io` открывается **без VPN** из РФ
- [ ] CSS/JS/картинки/шрифты грузятся (DevTools → Network → нет 404)
- [ ] Форма: заполнить и отправить → лид в Airtable (таблица Leads)
- [ ] Telegram: уведомление от Syl-бота пришло
- [ ] Consent: отправка без галочки → ошибка «Требуется согласие»
- [ ] Honeypot: POST с `website` → тихий 200 (через DevTools/curl)
- [ ] `/legal/privacy-policy` — открывается (без .html в URL)
- [ ] `/legal/consent` — открывается
- [ ] SSL: замочек, нет mixed content warnings
- [ ] `http://forge-ai.io` → 301 на `https://`
- [ ] `www.forge-ai.io` → 301 на `forge-ai.io`
- [ ] Мобилка: вёрстка, форма, модалка
- [ ] Cookie-баннер: появляется, Accept загружает Метрику, Reject — нет
- [ ] Security headers: X-Frame-Options, CSP, HSTS, X-Content-Type-Options
- [ ] `robots.txt` и `sitemap.xml` — 200
- [ ] `/.env` → 405 (не отдаётся)

---

## Debug

### Форма не отправляется
1. DevTools → Network → POST `/api/lead` → status code?
2. **404** → `.htaccess` rewrite не работает, проверь что `mod_rewrite` включён
3. **500** → смотри логи: `ssh nailma2c@nailma2c.beget.tech 'tail -f ~/forge-ai.io/public_html/error.log'` или в панели Beget → Логи
4. **Пустой ответ** → PHP crash. Временно добавь в начало `lead.php`: `ini_set('display_errors', '1');`

### Airtable/Telegram не пишут
1. SSH на Beget: `curl -I https://api.airtable.com` → доступен?
2. `curl -I https://api.telegram.org` → доступен?
3. Если 000/timeout → API заблокирован из ДЦ Beget → проксировать через VPS

### SSL не отдаёт сертификат / HTTPS не работает
1. NS переключены на Beget? Если внешний DNS — A-запись на правильный IP из Beget DNS-панели
2. `openssl s_client -connect forge-ai.io:443 -servername forge-ai.io` → видишь `no peer certificate available`? Значит IP в DNS не совпадает с виртуалхостом Beget
3. Подожди 10-15 минут после установки сертификата

### `forge-deploy` не работает
1. `alias | grep forge-deploy` — алиас есть?
2. Если нет — `source ~/.zshrc` или открыть новый таб
3. SSH-доступ выключился? Beget → Хостинг → тоггл
4. Ключ потерялся: `ssh-copy-id nailma2c@nailma2c.beget.tech`

### Браузер показывает старую версию
- Cache buster `?v=` не обновили после правки CSS/JS

---

## Что НЕ делать

- ❌ Коммитить секреты — `.env` только на сервере, в git не попадает
- ❌ Удалять `.htaccess` — там вся Apache-конфигурация
- ❌ Забывать обновлять cache buster после CSS/JS
- ❌ Редактировать файлы прямо на сервере — только локально → push → `forge-deploy`. Иначе следующий `git pull` всё затрёт
- ❌ Возвращать NS на Cloudflare — сайт перестанет открываться из РФ из-за блокировок CF

---

## Rollback

Если Beget упадёт или что-то критичное сломалось:

1. Самое простое — откатить последний коммит локально и задеплоить:
   ```bash
   git revert HEAD
   git push
   forge-deploy
   ```
2. Если упал сам Beget — поднять временный сервер на VPS (Timeweb, любой РФ-провайдер), залить туда репо, поменять A-запись `forge-ai.io` в Beget DNS на новый IP. Время восстановления: 1-2 часа
