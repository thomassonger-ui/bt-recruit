-- BearTeam Scout — Leads Table
-- Run this in your Supabase SQL editor at supabase.com

create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),

  -- Agent identity (from Calendly webhook)
  name text,
  email text,
  phone text,

  -- Booking details
  event_start timestamptz,
  event_end timestamptz,
  calendly_event_uri text unique,  -- prevents duplicate inserts
  calendly_invitee_uri text,

  -- Context captured from Scout conversation
  entry_type text,  -- 'new_agent' | 'stuck_agent' | 'producing_agent'
  notes text,       -- any additional info from the booking form

  -- Status tracking
  status text default 'booked'  -- 'booked' | 'called' | 'joined' | 'no_show'
);

-- Index for quick lookups by email and status
create index if not exists leads_email_idx on leads(email);
create index if not exists leads_status_idx on leads(status);
create index if not exists leads_created_at_idx on leads(created_at desc);
