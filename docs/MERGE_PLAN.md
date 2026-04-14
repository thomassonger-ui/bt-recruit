# Recruiting System Merge Plan

**Goal:** Consolidate bt-pipeline into bt-recruit so Bear Team runs one lead system, one database, one drip engine, one SendGrid sender — with a clean handoff to BearTeamOS at the onboarding moment.

**Owner:** Tom Songer
**Target completion:** Draft May 2026, cut-over June 2026
**Status:** DRAFT — awaiting decisions on open questions below

---

## 1. Why

Today Bear Team has two recruiting systems that don't talk to each other:

| | bt-recruit | bt-pipeline |
|---|---|---|
| Role | Inbound (Scout chat) | Outbound (CSV batches) |
| Database | Supabase | Neon Postgres |
| Drip | 4 crons | 7-step campaign engine |
| Domain | joinbearteam.com | separate Vercel subdomain |
| Sender | thomas.songer@gmail.com | separate SendGrid |

Consequences of running two systems:

- Same person can be captured twice, once per system
- Unsubscribe in one does not propagate to the other
- Two SendGrid senders to authenticate, two sets of templates to maintain
- No single dashboard view of the full pipeline
- bt-pipeline's INFRASTRUCTURE.md no longer matches what's deployed (scope drift — Neon + campaign engine were explicitly out of Phase 1 scope)

After the merge: one `leads` table, one drip engine, one dashboard, one authenticated sender domain. BearTeamOS stays isolated.

---

## 2. Scope

**In scope:**

- Move bt-pipeline's CSV upload + validator into bt-recruit as new API routes
- Consolidate bt-pipeline's 7-step outbound drip into bt-recruit's existing `cron/drip` as a second `campaign` branch
- Migrate any live leads from Neon into Supabase `leads`
- Retire bt-pipeline's Vercel project and Neon Postgres
- Add `source`, `batch_id`, `campaign` columns to Supabase `leads`
- Rewrite bt-pipeline's INFRASTRUCTURE.md as a deprecation notice

**Out of scope:**

- Any changes to BearTeamOS (separate audience, separate table, separate deploy)
- Any changes to `/api/onboard` bridge logic (already works, just needs the bug fixes from the April 14 audit)
- Scout chat pipeline logic (Q1 → Q4 → PITCH flow stays exactly as is)
- Calendly, Twilio, or booking-webhook integrations

**Non-goals:**

- Rebuilding the Scout system prompt
- Changing commission/pitch logic
- Migrating BearTeamOS agent auth

---

## 3. Target architecture

```
INBOUND (Scout chat) ──┐
                       ├──► Supabase `leads` ──► cron/drip ──► SendGrid (authenticated joinbearteam.com)
OUTBOUND (CSV upload) ─┘                          │
                                                  │  agent says yes
                                                  ▼
                                          /api/onboard
                                                  │
                                                  ▼
                                          BearTeamOS (unchanged)
```

Single source of truth: `leads` table. Single unsubscribe: `leads.drip_stopped`. Single dashboard: `joinbearteam.com/dashboard`.

---

## 4. Data model changes

Non-destructive additive migration. No column drops on existing data.

```sql
-- Source tracking
ALTER TABLE leads ADD COLUMN source TEXT DEFAULT 'scout_chat';
  -- values: 'scout_chat' | 'csv_batch' | 'dbpr_import' | 'manual'

-- Outbound batch tracking
ALTER TABLE leads ADD COLUMN batch_id UUID;
  -- null for inbound leads
  -- references a lead_batches row for CSV uploads

-- Campaign tracking (which drip sequence a lead is in)
ALTER TABLE leads ADD COLUMN campaign TEXT DEFAULT 'inbound_nurture';
  -- values: 'inbound_nurture' | 'outbound_batch' | 'revival' | 'paused'

-- New table for batch metadata
CREATE TABLE lead_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  total_rows INT,
  accepted INT,
  skipped INT,
  notes TEXT
);

-- Event log for audit (optional but recommended)
CREATE TABLE lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  event TEXT NOT NULL,     -- 'captured' | 'drip_sent' | 'replied' | 'booked' | 'unsubscribed' | 'onboarded'
  data JSONB,
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Backfill rules:**

- All existing leads get `source = 'scout_chat'` and `campaign = 'inbound_nurture'` (default)
- No batch_id for existing rows
- lead_events table starts empty — only new activity from merge date forward

---

## 5. Migration steps

Each step is independently deployable and reversible. No step breaks Scout.

### Step 1 — Schema migration (1 hr, zero downtime)

- Apply additive SQL above to production Supabase
- Verify Scout chat still captures leads end-to-end
- Spot-check that new columns populate with defaults on insert

### Step 2 — CSV upload route (2 hrs)

- Port `/api/leads/upload` from bt-pipeline into bt-recruit
- Write to Supabase `leads` with `source='csv_batch'` and batch_id
- Require bearer token auth (same pattern as existing `/api/prospects`)
- Add dashboard page `/dashboard/batches` listing recent uploads

### Step 3 — Outbound drip campaign (3 hrs)

- Add `campaign` branch to existing `cron/drip` route
- Port bt-pipeline's 7-step outbound sequence templates
- Sequence runs ONLY for leads where `campaign='outbound_batch'` and `drip_stopped=false`
- Dedupe check: skip any lead where the email already exists with `drip_sent>0` from inbound

### Step 4 — Test parallel run (1 week)

- Upload a 5-lead test batch to the new `/api/leads/upload`
- Verify dedup, verify drip emails go out, verify unsubscribe kills both campaigns
- Compare against bt-pipeline's behavior on the same batch (keep bt-pipeline still running)

### Step 5 — Migrate live bt-pipeline leads (2 hrs)

- Export all active leads from Neon Postgres → CSV
- Upload via new `/api/leads/upload` with `source='csv_batch'` and `campaign='outbound_batch'`
- Preserve original `drip_step` so sequence picks up where it left off

### Step 6 — Cut over (30 min)

- Point any public endpoints bt-pipeline was serving to bt-recruit
- Flip bt-pipeline Vercel deploy to read-only (remove env vars, keep build)
- Update bt-pipeline's INFRASTRUCTURE.md to a deprecation notice pointing here

### Step 7 — Decommission (30 days after cut-over)

- Delete bt-pipeline Vercel project
- Delete Neon Postgres database
- Archive bt-pipeline GitHub repo
- Remove separate SendGrid account (consolidate onto joinbearteam.com domain auth)

**Total estimated work: ~8-10 hours spread across 2-3 weeks.**

---

## 6. Rollback plan

At every step, rollback is: revert the Vercel deploy. Schema changes are additive — no data loss.

- If Step 1 breaks Scout: revert deploy (columns stay, but new defaults are safe)
- If Step 3's outbound drip misbehaves: set all `campaign='outbound_batch'` rows to `campaign='paused'` in one SQL update
- If Step 5 migration corrupts data: existing leads untouched (new rows only), re-export from Neon and re-import cleanly

bt-pipeline stays live and fully operational through Step 6. No hard cut until parallel run proves stable.

---

## 7. Impact on BearTeamOS

**None.** BearTeamOS reads the `agents` table, not `leads`. This merge touches only `leads` and related support tables.

The bridge between the two systems — `/api/onboard` in bt-recruit — is unchanged. It already:

1. Sends the welcome email with BearTeamOS credentials
2. Writes the new agent row into `agents`
3. Updates the AGENTS env var on BearTeamOS Vercel project
4. Triggers BearTeamOS redeploy

Separate audit (April 14, 2026) identified bugs in `/api/onboard` that need fixing before this merge ships — SendGrid domain auth and env var check. Those are prerequisites, not part of this merge.

---

## 8. Open questions (resolve before Step 1)

1. **Do we migrate bt-pipeline's existing leads or start fresh?** Pulling them in preserves drip history but risks importing stale data. Starting fresh is cleaner but loses sequence state.
2. **Do inbound and outbound drips share templates or diverge?** Today they diverge (Scout's pitch vs. cold outreach). Proposal: keep them separate via `campaign` branch, share only the unsubscribe footer and from-address.
3. **Should CSV uploads pause by default?** Proposal: yes. Uploaded batches start with `campaign='paused'` and you manually flip to `outbound_batch` when ready. Matches bt-pipeline's "controlled, small-batch" original principle.
4. **Single sender or two?** Proposal: single `scout@joinbearteam.com` across inbound and outbound after SendGrid domain auth lands. Simpler, one reputation to manage.
5. **Is bt-pipeline's dashboard replaceable?** What does that dashboard show today that bt-recruit's `/dashboard` doesn't? (I haven't audited it — need to look before cut-over.)
6. **Unsubscribe link format?** Today bt-recruit has `/api/unsubscribe`. Does bt-pipeline use the same endpoint or its own? One endpoint for both post-merge.

---

## 9. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Supabase schema migration breaks Scout | Low | High | Additive only, rollback = revert deploy |
| Outbound drip floods agents already in inbound sequence | Medium | High | Dedup check in Step 3, `drip_stopped` flag honored across both |
| SendGrid reputation damage from outbound volume | Medium | Medium | Rate limit per batch (existing in bt-pipeline, port over) |
| Tom's existing bt-pipeline campaigns lose drip state | Low | Medium | Step 5 preserves `drip_step` during import |
| /api/onboard breaks mid-merge | Already broken | High | Fix first (see April 14 audit), separate PR |

---

## 10. Decision log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-14 | Plan doc drafted | Tom approved direction after merged-architecture sketch |

---

*Draft v0.1 — 2026-04-14*
