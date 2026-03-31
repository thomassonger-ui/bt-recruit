-- BearTeamOS — Leads Table (Full Schema)
-- Updated: March 2026
-- Run this in your Supabase SQL editor.
-- Safe to re-run — uses IF NOT EXISTS and ADD COLUMN IF NOT EXISTS throughout.

-- ─── LEADS TABLE ─────────────────────────────────────────────────────────────
-- Central record for every agent Scout has talked to or who has booked a call.

create table if not exists leads (
  id                      uuid        default gen_random_uuid() primary key,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now(),

  -- ── Agent identity ──────────────────────────────────────────────────────────
  name                    text,
  email                   text unique,
  phone                   text,

  -- ── Calendly booking details ─────────────────────────────────────────────
  event_start             timestamptz,
  event_end               timestamptz,
  calendly_event_uri      text unique,
  calendly_invitee_uri    text,

  -- ── Scout conversation context ───────────────────────────────────────────
  entry_type              text,         -- new_agent | stuck_agent | producing_agent
  brokerage               text,         -- current brokerage (KW, eXp, Compass, etc.)
  deal_count              int,          -- deals closed last year
  avg_price               numeric,      -- average sale price
  notes                   text,         -- free-form notes from Scout conversation
  objections              text,         -- objections raised (fees, timing, brand, etc.)
  source                  text,         -- scout_chat | calendly | manual | cold_outreach
  tier                    text,         -- tier_1 | tier_2 | tier_3 | team_lead (projected)

  -- ── Pipeline stage ───────────────────────────────────────────────────────
  -- scout_captured → booked → called → Follow-Up Queue → Closed Won | Closed Lost | Onboarding
  stage                   text default ''scout_captured'',
  status                  text default ''booked'',        -- legacy field — use stage
  call_outcome            text,         -- completed | no_show | rescheduled | cancelled
  top_objection           text,         -- primary objection from the call
  follow_up_date          date,         -- manual follow-up date set by Tom
  last_contact            timestamptz,  -- last time Tom or Scout contacted this agent

  -- ── Drip sequence tracking ───────────────────────────────────────────────
  drip_step               int default 0,          -- 0 = not started, 1–5 = email sent
  drip_last_sent_at       timestamptz,
  drip_unsubscribed       boolean default false,   -- set true on Closed Won or opt-out

  -- ── No-show tracking ─────────────────────────────────────────────────────
  noshow_followup_sent    boolean default false,
  noshow_followup_at      timestamptz,

  -- ── Onboarding tracking ──────────────────────────────────────────────────
  onboarded_at            timestamptz,            -- set when stage → Onboarding

  -- ── Personalization fields (Priority 2 + 3 additions) ───────────────────
  -- pain_type: structured classification of agent's stated frustration.
  -- Set by Scout during qualification. Used to vary email hooks downstream.
  -- Values: fees | visibility | brand | growth | systems
  pain_type               text,

  -- years_licensed: captured by Scout. Short tenure → training story.
  -- Long tenure → economics story. New agents need different pitch.
  years_licensed          int
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
create index if not exists leads_email_idx      on leads(email);
create index if not exists leads_stage_idx      on leads(stage);
create index if not exists leads_status_idx     on leads(status);
create index if not exists leads_event_end_idx  on leads(event_end);
create index if not exists leads_created_at_idx on leads(created_at desc);
create index if not exists leads_drip_idx       on leads(drip_step, drip_unsubscribed);

-- ─── MIGRATION: Add missing columns to existing table ────────────────────────
-- Safe to run even if the table already exists. Skips columns that are present.

alter table leads add column if not exists updated_at              timestamptz default now();
alter table leads add column if not exists brokerage               text;
alter table leads add column if not exists deal_count              int;
alter table leads add column if not exists avg_price               numeric;
alter table leads add column if not exists objections              text;
alter table leads add column if not exists source                  text;
alter table leads add column if not exists tier                    text;
alter table leads add column if not exists stage                   text default ''scout_captured'';
alter table leads add column if not exists call_outcome            text;
alter table leads add column if not exists top_objection           text;
alter table leads add column if not exists follow_up_date          date;
alter table leads add column if not exists last_contact            timestamptz;
alter table leads add column if not exists drip_step               int default 0;
alter table leads add column if not exists drip_last_sent_at       timestamptz;
alter table leads add column if not exists drip_unsubscribed       boolean default false;
alter table leads add column if not exists noshow_followup_sent    boolean default false;
alter table leads add column if not exists noshow_followup_at      timestamptz;
alter table leads add column if not exists onboarded_at            timestamptz;
alter table leads add column if not exists pain_type               text;
alter table leads add column if not exists years_licensed          int;

-- ─── AGENTS TABLE ────────────────────────────────────────────────────────────
-- Created when a lead is marked Closed Won via /api/onboard.
-- Tracks active Bear Team agents post-recruitment.

create table if not exists agents (
  id                      uuid        default gen_random_uuid() primary key,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now(),

  name                    text        not null,
  email                   text        unique not null,
  phone                   text,
  license_number          text,

  brokerage_previous      text,         -- where they came from
  deal_count_previous     int,          -- deals last year at prior brokerage
  start_date              date,         -- Bear Team start date

  tier                    text default ''tier_1'',  -- tier_1 | tier_2 | tier_3 | team_lead
  deals_this_year         int default 0,
  stage                   text default ''Onboarding'', -- Onboarding | Active | Inactive

  academy_started         boolean default false,
  academy_completed       boolean default false,
  notes                   text
);

create index if not exists agents_email_idx on agents(email);
create index if not exists agents_stage_idx on agents(stage);

-- ─── SMS SESSIONS TABLE ───────────────────────────────────────────────────────
-- Used by the Twilio SMS route (lib/state.ts) for conversation state.
-- Survives Vercel cold starts via Supabase persistence.

create table if not exists sms_sessions (
  id                uuid        default gen_random_uuid() primary key,
  created_at        timestamptz default now(),

  phone             text        unique not null,
  stage             text        default ''ENGAGE'',
  intent            text        default ''unknown'',
  deal_context      text,
  message_count     int         default 0,
  last_interaction  timestamptz default now()
);

create index if not exists sms_phone_idx            on sms_sessions(phone);
create index if not exists sms_last_interaction_idx on sms_sessions(last_interaction);

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────────────────────────
-- Auto-updates updated_at on every row change for leads and agents.

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_updated_at on leads;
create trigger leads_updated_at
  before update on leads
  for each row execute function set_updated_at();

drop trigger if exists agents_updated_at on agents;
create trigger agents_updated_at
  before update on agents
  for each row execute function set_updated_at();

-- ─── BEARSIGNAL — SIGNAL QUEUE TABLE ─────────────────────────────────────────
-- Stores AI-generated marketing content before and after sending.
-- Written by bearsignal/runtime/queue.ts
-- Read and drained by /api/cron/signal (weekdays, 9 AM ET)
--
-- channel: email | linkedin | facebook | twitter
-- status:  pending → sent | error
-- Run this in your Supabase SQL editor.

create table if not exists signal_queue (
  id         uuid        primary key default gen_random_uuid(),
  content    text        not null,
  channel    text        not null,
  status     text        not null default 'pending',
  created_at timestamptz default now(),
  sent_at    timestamptz,
  error      text
);

create index if not exists signal_queue_status_idx    on signal_queue(status);
create index if not exists signal_queue_channel_idx   on signal_queue(channel);
create index if not exists signal_queue_created_idx   on signal_queue(created_at desc);
