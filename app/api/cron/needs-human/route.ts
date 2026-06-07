import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Daily "who needs a human today" digest — emails Tom an action list each morning.
// Surfaces the leads where automation has done its job and a person should step in.

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) { console.error("[needs-human] SENDGRID_API_KEY not set"); return }
  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "contact@joinbearteam.com", name: "Scout" },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  })
}

interface Lead {
  name: string | null; email: string | null; phone: string | null
  status: string | null; stage: string | null; brokerage: string | null
  event_start: string | null; updated_at: string | null
  deal_count: number | null; drip_step: number | null; notes: string | null
}

const row = (l: Lead, extra?: string) =>
  `<tr>
    <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#0B1B33">${l.name || "—"}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#444">${l.brokerage || "—"}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#444">${l.phone || l.email || "—"}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666">${extra || ""}</td>
  </tr>`

function section(title: string, hint: string, leads: Lead[], extra?: (l: Lead) => string) {
  if (leads.length === 0) return ""
  return `
    <h3 style="margin:24px 0 4px;color:#0B1D3A;font-size:16px">${title} <span style="color:#2F5C8F">(${leads.length})</span></h3>
    <div style="font-size:12px;color:#8A94A6;margin-bottom:8px">${hint}</div>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <tr style="background:#F7F8FA">
        <th style="padding:8px 12px;text-align:left;color:#8A94A6">Name</th>
        <th style="padding:8px 12px;text-align:left;color:#8A94A6">Brokerage</th>
        <th style="padding:8px 12px;text-align:left;color:#8A94A6">Contact</th>
        <th style="padding:8px 12px;text-align:left;color:#8A94A6">Why</th>
      </tr>
      ${leads.map(l => row(l, extra?.(l))).join("")}
    </table>`
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
  )

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
  const cutoff14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const { data } = await supabase
    .from("leads")
    .select("name, email, phone, status, stage, brokerage, event_start, updated_at, deal_count, drip_step, notes")
  const leads: Lead[] = data || []

  const isJoined = (l: Lead) => l.status === "joined" || l.stage === "Closed Won" || l.stage === "Onboarding"

  // 1. Calls booked for today — prep for these
  const callsToday = leads.filter(l => {
    if (!l.event_start) return false
    const t = new Date(l.event_start)
    return t >= todayStart && t < todayEnd && !isJoined(l) && l.status !== "no_show"
  })

  // 2. Replied / active conversations — respond to these
  const replied = leads.filter(l => l.stage === "Active Convo" && !isJoined(l))

  // 3. Stalled — no activity in 14+ days, still open — personal touch
  const stalled = leads.filter(l =>
    !isJoined(l) && l.stage !== "Active Convo" &&
    l.updated_at && new Date(l.updated_at) < cutoff14 &&
    ["scout_captured", "booked", "completed"].includes(l.status || "")
  ).sort((a, b) => (b.deal_count || 0) - (a.deal_count || 0))

  // 4. Drip finished, still not booked/joined — the sequence is done, your move
  const dripDone = leads.filter(l =>
    (l.drip_step || 0) >= 5 && !isJoined(l) && !["booked", "completed"].includes(l.status || "")
  )

  const total = callsToday.length + replied.length + stalled.length + dripDone.length
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  let html: string
  if (total === 0) {
    html = `<div style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto">
      <h2 style="color:#0B1D3A">Who needs a human — ${dateStr}</h2>
      <p style="color:#1B8C3A;font-weight:600">All clear. Nothing needs a personal touch right now — Scout and the drip have it covered.</p>
    </div>`
  } else {
    html = `<div style="font-family:system-ui,sans-serif;max-width:680px;margin:0 auto">
      <h2 style="color:#0B1D3A;margin-bottom:2px">Who needs a human — ${dateStr}</h2>
      <div style="color:#8A94A6;font-size:13px;margin-bottom:8px">${total} ${total === 1 ? "lead needs" : "leads need"} your attention today.</div>
      ${section("📞 Calls today", "Booked for today — prep before they ring.", callsToday, l => l.event_start ? new Date(l.event_start).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "")}
      ${section("💬 Replied — waiting on you", "They texted back; the drip auto-paused. Reply personally.", replied)}
      ${section("⏳ Stalled 14+ days", "Quiet for two weeks. A personal note can revive these.", stalled.slice(0, 10), l => `${l.deal_count || "?"} deals/yr`)}
      ${section("✅ Drip finished, no call yet", "All 5 emails sent, still no booking. Your move.", dripDone.slice(0, 10))}
      <p style="margin-top:24px;font-size:12px;color:#8A94A6">Open your <a href="https://joinbearteam.com/dashboard" style="color:#2F5C8F">dashboard</a> to act on these.</p>
    </div>`
  }

  await sendEmail("contact@joinbearteam.com", `🔔 ${total} need a human today — ${dateStr}`, html)

  return NextResponse.json({
    ok: true,
    counts: { callsToday: callsToday.length, replied: replied.length, stalled: stalled.length, dripDone: dripDone.length, total },
  })
}
