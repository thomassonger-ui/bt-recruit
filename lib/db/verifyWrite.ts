import { SupabaseClient } from "@supabase/supabase-js"

/**
 * verifyWrite — read-after-write confirmation helper.
 *
 * Reads a single row from `table` matching `match` and confirms that every
 * key in `expected` matches the persisted value. Returns true only when all
 * expected fields are confirmed in the database.
 *
 * Usage: call this AFTER a Supabase write and BEFORE sending any email.
 * If it returns false, skip the send and log the failure.
 *
 * TICKET-04 (Write Verification Layer)
 */
export async function verifyWrite({
  supabase,
  table,
  match,
  expected,
}: {
  supabase: SupabaseClient
  table: string
  match: Record<string, unknown>
  expected: Record<string, unknown>
}): Promise<boolean> {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .match(match)
    .single()

  if (error || !data) return false

  for (const key of Object.keys(expected)) {
    if (data[key] !== expected[key]) {
      return false
    }
  }

  return true
}
