# Forge Landing — Deploy to Vercel

## Setup (one-time)

1. **Vercel account** — sign up at [vercel.com](https://vercel.com) with GitHub
2. **Import project** — New Project → Import `nailmardamshin/forge`
3. **Framework preset** — "Other" (static site, Vercel auto-detects `api/` folder)
4. **Root directory** — `./`
5. **Build command** — leave empty (static HTML)
6. **Output directory** — leave empty

## Environment variables (set in Vercel dashboard)

Settings → Environment Variables:

| Key | Value | Notes |
|-----|-------|-------|
| `AIRTABLE_API_KEY` | `pat...` | Personal access token with `data.records:write` scope for base `appwANdQ0Txe6BRsy` |
| `TELEGRAM_BOT_TOKEN` | `8581305801:...` | Syl bot token (from `~/Syl/.env`) |
| `TELEGRAM_CHAT_ID` | `210506677` | Nail's Telegram user_id |

**IMPORTANT:** never commit these to git. They live only in Vercel env vars.

## How it works

1. User submits form on landing → POST `/api/lead`
2. Vercel Function (`api/lead.js`) validates payload
3. Writes lead to Airtable → `FORGE CRM` → `Leads` table
4. Sends Telegram notification to Nail via Syl bot
5. Returns `{ ok: true }` to frontend

## Airtable schema

Base: `FORGE CRM` (appwANdQ0Txe6BRsy)
Table: `Leads`

Fields:
- `Name` — single line text
- `Company` — single line text
- `Contact` — single line text (Telegram or phone)
- `Task` — multi line text
- `Source` — single select (hero, final-cta, footer, modal)
- `Status` — single select (New, Contacted, Qualified, Closed-Won, Closed-Lost)
- `Notes` — multi line text

## Local test

```bash
npx vercel dev
```

Then POST to `http://localhost:3000/api/lead` with JSON body.
