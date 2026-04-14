# bt-recruit

Main hub for Bear Team Real Estate's recruiting and Scout AI. Deployed at **www.joinbearteam.com** (via Vercel project `website-rouge-one-80`).

This repo contains:
- **Scout** — OpenAI gpt-4o lead qualification chatbot (`app/api/chat/route.ts`)
- **Recruiting pipeline** — DBPR imports, drip (SendGrid), SMS (Twilio), Calendly
- **`/api/onboard`** — human-trigger-only onboarding route (Dashboard "Mark Joined" button)
- **`/api/booking-webhook`** — Calendly webhook → `leads.status=booked`

---

## Guardrails — Non-Negotiable

Codified April 2026 after the ghost-credentials incident. Do not regress on these.

1. **`/api/onboard` is human-trigger-only.** Gated by `DASHBOARD_PASSWORD` (required, not optional). Called ONLY from the Dashboard "Mark Joined" button in `app/dashboard/page.tsx` → `confirmMarkJoined`. **NEVER** wire Supabase Database Webhooks, Vercel crons, Calendly webhooks, SendGrid webhooks, or any automation to this route.
2. **Scout (`/api/chat`) writes ONLY to `leads` (stage=`scout_captured`, source=`scout_chat`), `scout_sessions`, and `conversations`.** It MUST NOT write to `agents`, MUST NOT set `onboarded_at`, `drip_stopped`, or `stage=Onboarding`, and MUST NOT issue credentials.
3. **Tom `[LEAD]` alert fires exactly once per new lead.** Guarded by `!returningLead` — on first email capture only. Never on every chat turn.
4. **BearTeamOS credentials (Vercel `AGENTS` env var on the BearTeamOS project) are provisioned ONLY by `/api/onboard`.** No other route, webhook, or cron can add/modify AGENTS entries.
5. **Supabase Database Webhooks: `/api/onboard` is a forbidden destination.** Audit every webhook on the `leads` table before enabling. Calendly booking webhooks flow to `/api/booking-webhook` only.
6. **Agent lifecycle is one-way and human-gated:**
   `agent_prospects` → `leads(stage=scout_captured)` → `leads(status=booked)` → `leads(stage=Closed Won)` → (Tom clicks **Mark Joined**) → `leads(stage=Onboarding)` + `agents` row + AGENTS env var entry + welcome email.
7. **Scout runs on OpenAI gpt-4o. Not Claude.**

See `CLAUDE.md` for the full model reference and pitch math library.

---

## Routes (ownership reference)

| Route | Purpose | Allowed callers |
|---|---|---|
| `app/api/chat/route.ts` | LIVE Scout route (used by chat page) | Public chat UI |
| `app/api/scout/route.ts` | Unified Scout route (exists, NOT wired to page) | — |
| `app/api/booking-webhook/route.ts` | Calendly webhook — sets `leads.status=booked`, alerts Tom | Calendly only |
| `app/api/onboard/route.ts` | Provisions agent credentials + welcome email | **Dashboard "Mark Joined" button only** (requires `DASHBOARD_PASSWORD`) |
| `app/api/cron/*` | Scheduled jobs (DBPR import, drip, digest, etc.) | Vercel cron only (none call `/api/onboard`) |

---

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

See `CLAUDE.md` and the `BEARTEAMOS_PROJECT_REF.md` architecture doc. Minimum required for Scout + onboarding:

- `OPENAI_API_KEY` — Scout gpt-4o
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` — Supabase
- `SENDGRID_API_KEY`, `NOTIFY_EMAIL` — email delivery
- `CALENDLY_TOKEN` — booking
- `DASHBOARD_PASSWORD` — **REQUIRED** to authorize `/api/onboard`

---

## Deploy

Pushes to `main` auto-deploy via Vercel to `website-rouge-one-80.vercel.app` → `www.joinbearteam.com`.
