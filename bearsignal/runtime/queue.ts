/**
 * BearSignal — Queue Layer
 * Writes generated content to signal_queue (Supabase).
 * The cron at /api/cron/signal reads pending rows and sends them.
 */

import { createClient } from "@supabase/supabase-js";
import type { SignalContent } from "./generator";

function getSupabase() {
  return createClient(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface QueueRow {
  id: string;
  content: string;
  channel: string;
  status: "pending" | "sent" | "error";
  created_at: string;
  sent_at: string | null;
  error: string | null;
}

/** Write a generated content item to signal_queue with status = pending */
export async function queueContent(item: SignalContent): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("signal_queue").insert({
    channel: item.channel,
    content: item.content,
    status: "pending",
  });
  if (error) {
    console.error("[queue] Failed to insert into signal_queue:", error.message);
    throw error;
  }
  console.log(`[queue] Queued ${item.channel} content`);
}

/** Pull all pending rows from signal_queue */
export async function getPendingQueue(): Promise<QueueRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("signal_queue")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[queue] Failed to fetch pending queue:", error.message);
    return [];
  }
  return (data ?? []) as QueueRow[];
}

/** Mark a row as sent */
export async function markSent(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("signal_queue")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error(`[queue] markSent failed for ${id}:`, error.message);
}

/** Mark a row as error with message */
export async function markError(id: string, message: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("signal_queue")
    .update({ status: "error", error: message })
    .eq("id", id);
  if (error) console.error(`[queue] markError failed for ${id}:`, error.message);
}
