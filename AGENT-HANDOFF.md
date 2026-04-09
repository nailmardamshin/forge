# Инструкция для параллельного агента

**Читай это первым** — в соседнем окне я (Claude) сделала реорганизацию папок лендинга. Чтобы ты не запутался и не потерял свою работу — вот что изменилось.

## ⚠️ Что поменялось

### Старая структура (больше не существует)

```
/Users/Nail/Desktop/claude-code/Forge/Assets/landing-v2/    ← редактировалось
/tmp/forge-landing/                                         ← git-репо, копировали файлы сюда вручную
```

### Новая структура (ровно одна папка)

```
/Users/Nail/Desktop/claude-code/Forge/Assets/landing/       ← и редактируем, и пушим отсюда
```

Эта папка **сама по себе** git-репо, подключённый к `nailmardamshin/forge`. Редактируешь файл и сразу `git push` — не нужно ничего копировать.

## Что я сделала только что

1. Перенесла `.git` из `/tmp/forge-landing/` в `landing-v2/`
2. Переименовала `landing-v2/` → `landing/`
3. Закоммитила твои SEO-файлы (`robots.txt`, `sitemap.xml`, `og-template.html`, фавиконки) — **они теперь в main на GitHub**
4. Удалила `/tmp/forge-landing/` (там осталась пустота)
5. Удалила старый `Forge/Assets/landing.html` (неактуальный артефакт)
6. Обновила `.forge-rules.md` — там теперь новая секция про лендинг
7. Обновила `DEPLOY.md` в папке лендинга

## Твои свежие коммиты безопасны

Всё что ты успел сделать до этой реорганизации — в git. Я проверила `git status` перед переездом, рабочая копия была чистая. Твои файлы (robots.txt, sitemap.xml, og-template.html, фавиконки и т.д.) я закоммитила в коммите:

```
01ffa8d chore: consolidate landing dir — add SEO files (robots, sitemap, og, favicons) + .gitignore
```

## Важно про параллельную работу

Теперь мы работаем в **одной** папке — значит нужно быть аккуратнее:

1. **Перед правкой** — сделай `git pull` чтобы подтянуть мои последние коммиты:
   ```bash
   cd /Users/Nail/Desktop/claude-code/Forge/Assets/landing
   git pull
   ```

2. **После правки** — сразу коммить и пуш, не накапливай:
   ```bash
   git add .
   git commit -m "seo: описание"
   git push
   ```

3. **Если пуш отклонён** (потому что я запушила что-то первее) — сделай `git pull --rebase` и пушь снова:
   ```bash
   git pull --rebase
   git push
   ```

4. **При изменении CSS/JS** — обновляй cache buster в `index.html`:
   ```html
   <link rel="stylesheet" href="style.css?v=20260409_slug">
   ```

## Деплой

После `git push` в main — Vercel автоматом деплоит за ~30 секунд. Проверяешь на живом сайте (URL у Наиля, пока временный `forge-xxxxx.vercel.app`).

## Env Variables

В коде нигде не должно быть секретов (Airtable key, Telegram token). Они только в **Vercel → Settings → Environment Variables**:

- `AIRTABLE_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Для SEO-задач эти переменные не нужны — ты с ними не работаешь.

## Структура файлов

```
landing/
├── index.html          ← твоя основная цель для SEO (meta, structured data)
├── style.css           ← стили
├── main.js             ← JS + модалка формы
├── api/lead.js         ← бэкенд формы (не трогай)
├── vercel.json         ← конфиг Vercel
├── robots.txt          ← твоё
├── sitemap.xml         ← твоё
├── og-template.html    ← твоё
├── assets/             ← картинки, OG-images, фавиконки
├── DEPLOY.md           ← инструкция по деплою
└── AGENT-HANDOFF.md    ← этот файл
```

## Вопросы? Читай

- `DEPLOY.md` — как деплоить и отлаживать
- `.forge-rules.md` (в `Forge/`) — общие правила проекта Forge
- `backlog.md` — текущий бэклог задач по лендингу

---

**Кратко:** работаем в `/Users/Nail/Desktop/claude-code/Forge/Assets/landing/`, это git-репо, пушим туда напрямую, Vercel деплоит сам.
