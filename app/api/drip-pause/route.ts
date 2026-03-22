import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST /api/drip-pause
// Body: { leadId, pw, action: "pause" | "resume" }
// Pausing sets drip_unsubscribed = true (stops all future drip emails)
// Resuming sets drip_unsubscribed = false (re-enables drip from current step)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { leadId, pw, action } = body

  if (pw !== DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!leadId || !["pause", "resume"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const isPausing = action === "pause"

  const { error } = await getSupabase()
    .from("leads")
    .update({
      drip_unsubscribed: isPausing,
      updated_at: new Date().toISOString(),
      ...(isPausing ? { stage: "Active Convo" } : {}), // mark as active convo when manually paused (replied)
    })
    .eq("id", leadId)

  if (error) {
    console.error("Drip pause error:", error)
    return NextResponse.json({ error: "DB update failed" }, { status: 500 })
  }

  return NextResponse.json({ success: true, action, leadId })
}
