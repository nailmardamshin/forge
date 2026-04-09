# Forge Landing — Deploy

## ⚠️ Главное

- **Путь к папке:** `/Users/Nail/Desktop/claude-code/Forge/Assets/landing/`
- **Эта папка — git-репо** `nailmardamshin/forge`. Редактируешь и пушишь отсюда. Никаких копирований в другие места.
- **Хостинг:** Vercel — автоматом деплоит при `git push` в `main`. Деплой занимает ~30 секунд.

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
├── vercel.json         # конфиг Vercel
├── robots.txt          # для поисковиков
├── sitemap.xml         # карта сайта
├── og-template.html    # шаблон OG-картинки
├── assets/             # картинки, лого, favicon
├── backlog.md          # бэклог задач
└── DEPLOY.md           # этот файл
```

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

- ❌ Коммитить секреты (токены, API keys) — только в Vercel env vars
- ❌ Удалять `vercel.json` — там конфиг и security headers
- ❌ Забывать обновлять cache buster после изменения CSS/JS
- ❌ Редактировать файлы в нескольких местах — только в этой папке
