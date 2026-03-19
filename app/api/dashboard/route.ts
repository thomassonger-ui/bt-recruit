import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || "bearteam2026"

export async function GET(req: NextRequest) {
  // Simple password protection via query param
  const { searchParams } = new URL(req.url)
  const pw = searchParams.get("pw")
  if (pw !== DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )

  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - 7)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Fetch all leads
  const { data: leads } = await supabase
    .from("leads")
    .select("id, created_at, name, email, phone, status, notes, event_start")
    .order("created_at", { ascending: false })

  // Fetch conversation count
  const { count: convCount } = await supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })

  // Fetch unique conversation sessions
  const { data: sessions } = await supabase
    .from("conversations")
    .select("session_id")

  const allLeads = leads || []
  const totalLeads = allLeads.length
  const weekLeads = allLeads.filter(l => new Date(l.created_at) >= startOfWeek).length
  const monthLeads = allLeads.filter(l => new Date(l.created_at) >= startOfMonth).length

  // Status breakdown
  const statusCounts = allLeads.reduce((acc: Record<string, number>, l) => {
    acc[l.status || "unknown"] = (acc[l.status || "unknown"] || 0) + 1
    return acc
  }, {})

  // Funnel
  const booked = allLeads.filter(l => ["booked", "no_show", "completed"].includes(l.status)).length
  const showed = allLeads.filter(l => l.status === "completed").length
  const noShows = allLeads.filter(l => l.status === "no_show").length

  // Unique sessions
  const uniqueSessions = new Set((sessions || []).map(s => s.session_id)).size

  return NextResponse.json({
    summary: { totalLeads, weekLeads, monthLeads, uniqueSessions, convCount },
    funnel: {
      visitors: uniqueSessions,
      leads: totalLeads,
      booked,
      noShows,
      showed,
      bookRate: totalLeads > 0 ? Math.round((booked / totalLeads) * 100) : 0,
      showRate: booked > 0 ? Math.round((showed / booked) * 100) : 0,
    },
    statusCounts,
    recentLeads: allLeads.slice(0, 20),
  })
}
