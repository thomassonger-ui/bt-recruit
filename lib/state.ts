/**
 * Conversation state management for SMS conversion system.
 * Persisted to Supabase — survives Vercel cold starts.
 * Falls back to in-memory if Supabase is unavailable.
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type Stage =
  | "ENGAGE"
  | "QUALIFY"
  | "ALIGN"
  | "TRANSITION"
  | "CALL_NOW"
  | "FOLLOW_UP";

export type Intent =
  | "buyers"
  | "listings"
  | "both"
  | "pricing"
  | "high_intent"
  | "objection"
  | "unknown";

export interface ContactState {
  phone: string;
  stage: Stage;
  intent: Intent;
  dealContext: string;
  messageCount: number;
  lastInteraction: number;
}

// In-memory fallback — used if Supabase read/write fails
const fallback = new Map<string, ContactState>();

export async function getContact(phone: string): Promise<ContactState> {
  try {
    const { data, error } = await supabase
      .from("sms_sessions")
      .select("*")
      .eq("phone", phone)
      .single();

    if (error || !data) {
      return freshState(phone);
    }

    return {
      phone: data.phone,
      stage: data.stage as Stage,
      intent: data.intent as Intent,
      dealContext: data.deal_context,
      messageCount: data.message_count,
      lastInteraction: new Date(data.last_interaction).getTime(),
    };
  } catch {
    const existing = fallback.get(phone);
    return existing ?? freshState(phone);
  }
}

export async function saveContact(contact: ContactState): Promise<void> {
  contact.lastInteraction = Date.now();
  contact.messageCount += 1;

  try {
    await supabase.from("sms_sessions").upsert(
      {
        phone: contact.phone,
        stage: contact.stage,
        intent: contact.intent,
        deal_context: contact.dealContext,
        message_count: contact.messageCount,
        last_interaction: new Date(contact.lastInteraction).toISOString(),
      },
      { onConflict: "phone" }
    );
  } catch {
    fallback.set(contact.phone, contact);
  }
}

/**
 * Returns contacts that haven't interacted in the given number of minutes.
 * Queries Supabase directly for accuracy across instances.
 */
export async function getStaleContacts(
  minutesIdle: number
): Promise<ContactState[]> {
  const threshold = new Date(
    Date.now() - minutesIdle * 60 * 1000
  ).toISOString();

  try {
    const { data, error } = await supabase
      .from("sms_sessions")
      .select("*")
      .lt("last_interaction", threshold)
      .not("stage", "in", '("CALL_NOW","FOLLOW_UP")');

    if (error || !data) return [];

    return data.map((row) => ({
      phone: row.phone,
      stage: row.stage as Stage,
      intent: row.intent as Intent,
      dealContext: row.deal_context,
      messageCount: row.message_count,
      lastInteraction: new Date(row.last_interaction).getTime(),
    }));
  } catch {
    const threshold = Date.now() - minutesIdle * 60 * 1000;
    const stale: ContactState[] = [];
    fallback.forEach((contact) => {
      if (
        contact.lastInteraction < threshold &&
        contact.stage !== "CALL_NOW" &&
        contact.stage !== "FOLLOW_UP"
      ) {
        stale.push(contact);
      }
    });
    return stale;
  }
}

// ─── Internal ────────────────────────────────────────────────────────────────

function freshState(phone: string): ContactState {
  return {
    phone,
    stage: "ENGAGE",
    intent: "unknown",
    dealContext: "",
    messageCount: 0,
    lastInteraction: Date.now(),
  };
}
