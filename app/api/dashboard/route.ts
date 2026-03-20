import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || "bearteam2026"
const AVG_PRICE = 415000
const COMMISSION_RATE = 0.025
const GCI_PER_DEAL = AVG_PRICE * COMMISSION_RATE // $10,375

export async function GET(req: NextRequest) {
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
  const stalledCutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) // 14 days ago

  // ── Fetch all leads (extended fields) ──────────────────────────────────────
  const { data: leads } = await supabase
    .from("leads")
    .select("id, created_at, updated_at, name, email, phone, status, notes, event_start, event_end, stage, brokerage, deal_count, avg_price, drip_step, noshow_followup_sent, onboarded_at")
    .order("created_at", { ascending: false })

  // ── Fetch conversation count + sessions ────────────────────────────────────
  const { count: convCount } = await supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })

  const { data: sessions } = await supabase
    .from("conversations")
    .select("session_id, created_at")

  const allLeads = leads || []
  const totalLeads = allLeads.length
  const weekLeads = allLeads.filter(l => new Date(l.created_at) >= startOfWeek).length
  const monthLeads = allLeads.filter(l => new Date(l.created_at) >= startOfMonth).length

  // ── Status breakdown ───────────────────────────────────────────────────────
  const statusCounts = allLeads.reduce((acc: Record<string, number>, l) => {
    acc[l.status || "unknown"] = (acc[l.status || "unknown"] || 0) + 1
    return acc
  }, {})

  // ── Funnel ─────────────────────────────────────────────────────────────────
  const booked = allLeads.filter(l => ["booked", "no_show", "completed"].includes(l.status)).length
  const showed = allLeads.filter(l => l.status === "completed").length
  const noShows = allLeads.filter(l => l.status === "no_show").length
  const joined = allLeads.filter(l => l.status === "joined" || l.stage === "Closed Won" || l.stage === "Onboarding").length
  const uniqueSessions = new Set((sessions || []).map((s: { session_id: string }) => s.session_id)).size

  // ── 1. PIPELINE VALUE ──────────────────────────────────────────────────────
  // Estimate GCI value at each stage with probability weighting
  const pipelineLeads = allLeads.filter(l => !["joined", "Closed Won", "Onboarding", "Closed Lost"].includes(l.stage || l.status || ""))

  const stageWeights: Record<string, number> = {
    "New Lead": 0.05,
    "Outreach Sent": 0.10,
    "Active Convo": 0.20,
    "scout_captured": 0.15,
    "booked": 0.35,
    "Call Scheduled": 0.35,
    "completed": 0.50,
    "Follow-Up Queue": 0.25,
    "Offer Extended": 0.65,
  }

  let totalPipelineValue = 0
  let weightedPipelineValue = 0

  const pipelineByStage = pipelineLeads.reduce((acc: Record<string, { count: number; value: number; weighted: number }>, l) => {
    const stage = l.stage || l.status || "unknown"
    const dealCount = l.deal_count || 6 // default to 6 deals if unknown
    const agentGCI = GCI_PER_DEAL * dealCount
    const annualValue = agentGCI * 0.4 // Bear Team's 40% at Tier 1
    const weight = stageWeights[stage] || 0.1
    const weighted = annualValue * weight

    if (!acc[stage]) acc[stage] = { count: 0, value: 0, weighted: 0 }
    acc[stage].count++
    acc[stage].value += annualValue
    acc[stage].weighted += weighted
    totalPipelineValue += annualValue
    weightedPipelineValue += weighted
    return acc
  }, {})

  // Closed Won value (actual revenue locked in)
  const closedWonLeads = allLeads.filter(l => l.stage === "Closed Won" || l.stage === "Onboarding" || l.status === "joined")
  const closedWonValue = closedWonLeads.reduce((sum, l) => {
    const dealCount = l.deal_count || 6
    return sum + (GCI_PER_DEAL * dealCount * 0.4)
  }, 0)

  // ── 2. CONVERSION FUNNEL LEAK DETECTION ───────────────────────────────────
  // Where are leads dropping off and what's the $ cost of each leak?
  const funnelStages = [
    { name: "Scout Sessions", count: uniqueSessions },
    { name: "Leads Captured", count: totalLeads },
    { name: "Calls Booked", count: booked },
    { name: "Showed Up", count: showed },
    { name: "Joined", count: joined },
  ]

  const funnelWithLeaks = funnelStages.map((stage, i) => {
    const prev = i > 0 ? funnelStages[i - 1].count : stage.count
    const dropoff = prev - stage.count
    const dropoffRate = prev > 0 ? Math.round((dropoff / prev) * 100) : 0
    const lostValue = dropoff * GCI_PER_DEAL * 0.4 * 0.3 // conservative conversion assumption
    return { ...stage, dropoff, dropoffRate, lostValue }
  })

  // Biggest leak stage
  const biggestLeak = funnelWithLeaks.reduce((max, s) => s.dropoff > max.dropoff ? s : max, funnelWithLeaks[0])

  // ── 3. RESPONSE TIME CORRELATION ──────────────────────────────────────────
  // How quickly after lead capture does a call get booked?
  // Faster response → higher show rate
  const leadsWithBothTimestamps = allLeads.filter(l => l.created_at && l.event_start)
  const responseTimeBuckets = { under1hr: 0, under4hr: 0, under24hr: 0, over24hr: 0 }
  let totalResponseMinutes = 0

  leadsWithBothTimestamps.forEach(l => {
    const leadTime = new Date(l.created_at).getTime()
    const bookTime = new Date(l.event_start).getTime()
    const minutes = (bookTime - leadTime) / (1000 * 60)
    totalResponseMinutes += minutes
    if (minutes <= 60) responseTimeBuckets.under1hr++
    else if (minutes <= 240) responseTimeBuckets.under4hr++
    else if (minutes <= 1440) responseTimeBuckets.under24hr++
    else responseTimeBuckets.over24hr++
  })

  const avgResponseMinutes = leadsWithBothTimestamps.length > 0
    ? Math.round(totalResponseMinutes / leadsWithBothTimestamps.length)
    : 0

  const avgResponseDisplay = avgResponseMinutes < 60
    ? `${avgResponseMinutes}m`
    : avgResponseMinutes < 1440
    ? `${Math.round(avgResponseMinutes / 60)}h`
    : `${Math.round(avgResponseMinutes / 1440)}d`

  // ── 4. SOURCE ATTRIBUTION ──────────────────────────────────────────────────
  // Track which sources are generating the most leads and conversions
  // Source is inferred from notes field ("Slot selected" = Calendly/Scout)
  const sourceBreakdown = allLeads.reduce((acc: Record<string, { leads: number; booked: number; joined: number }>, l) => {
    let source = "Direct"
    const notes = (l.notes || "").toLowerCase()
    if (notes.includes("slot selected") || notes.includes("calendly")) source = "Scout Chat"
    else if (notes.includes("referral") || notes.includes("referred")) source = "Referral"
    else if (notes.includes("linkedin")) source = "LinkedIn"
    else if (notes.includes("instagram") || notes.includes("facebook")) source = "Social"

    if (!acc[source]) acc[source] = { leads: 0, booked: 0, joined: 0 }
    acc[source].leads++
    if (["booked", "no_show", "completed"].includes(l.status)) acc[source].booked++
    if (l.status === "joined" || l.stage === "Closed Won" || l.stage === "Onboarding") acc[source].joined++
    return acc
  }, {})

  // Best converting source
  const bestSource = Object.entries(sourceBreakdown)
    .map(([source, data]) => ({
      source,
      ...data,
      convRate: data.leads > 0 ? Math.round((data.booked / data.leads) * 100) : 0
    }))
    .sort((a, b) => b.convRate - a.convRate)[0]

  // ── 5. STALLED LEAD REACTIVATION ──────────────────────────────────────────
  // Leads that haven't moved in 14+ days and aren't closed
  const stalledLeads = allLeads.filter(l => {
    const lastActivity = new Date(l.updated_at || l.created_at)
    const isStalled = lastActivity < stalledCutoff
    const isActive = !["joined", "Closed Won", "Onboarding", "Closed Lost"].includes(l.stage || "")
      && !["joined"].includes(l.status || "")
    return isStalled && isActive && l.email
  }).map(l => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    stage: l.stage || l.status,
    brokerage: l.brokerage,
    deal_count: l.deal_count,
    last_activity: l.updated_at || l.created_at,
    days_stalled: Math.floor((now.getTime() - new Date(l.updated_at || l.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    drip_step: l.drip_step,
    estimated_value: GCI_PER_DEAL * (l.deal_count || 6) * 0.4,
  })).sort((a, b) => b.estimated_value - a.estimated_value) // highest value first

  const stalledValue = stalledLeads.reduce((sum, l) => sum + l.estimated_value, 0)

  // ── Build weekly trend (last 8 weeks) ──────────────────────────────────────
  const weeklyTrend = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date(now.getTime() - (7 - i) * 7 * 24 * 60 * 60 * 1000)
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    const count = allLeads.filter(l => {
      const d = new Date(l.created_at)
      return d >= weekStart && d < weekEnd
    }).length
    return {
      week: weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      leads: count,
    }
  })

  return NextResponse.json({
    // Existing
    summary: { totalLeads, weekLeads, monthLeads, uniqueSessions, convCount },
    funnel: {
      visitors: uniqueSessions,
      leads: totalLeads,
      booked,
      noShows,
      showed,
      joined,
      bookRate: totalLeads > 0 ? Math.round((booked / totalLeads) * 100) : 0,
      showRate: booked > 0 ? Math.round((showed / booked) * 100) : 0,
      joinRate: showed > 0 ? Math.round((joined / showed) * 100) : 0,
    },
    statusCounts,
    recentLeads: allLeads.slice(0, 20),
    // New modules
    pipeline: {
      totalValue: Math.round(totalPipelineValue),
      weightedValue: Math.round(weightedPipelineValue),
      closedWonValue: Math.round(closedWonValue),
      byStage: pipelineByStage,
      activeCount: pipelineLeads.length,
    },
    funnelLeaks: {
      stages: funnelWithLeaks,
      biggestLeak: biggestLeak.name,
      biggestLeakDropoff: biggestLeak.dropoff,
      biggestLeakValue: Math.round(biggestLeak.lostValue),
    },
    responseTime: {
      avgDisplay: avgResponseDisplay,
      avgMinutes: avgResponseMinutes,
      buckets: responseTimeBuckets,
      sampleSize: leadsWithBothTimestamps.length,
    },
    sourceAttribution: {
      breakdown: sourceBreakdown,
      bestSource: bestSource?.source || "Scout Chat",
      bestSourceConvRate: bestSource?.convRate || 0,
    },
    stalledLeads: {
      leads: stalledLeads.slice(0, 10),
      totalCount: stalledLeads.length,
      totalValue: Math.round(stalledValue),
    },
    weeklyTrend,
  })
}
