import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) { console.error("[digest] SENDGRID_API_KEY not set"); return }
  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "thomas.songer@gmail.com", name: "Scout" },
      reply_to: { email: "thomas.songer@gmail.com" },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  })
}

export async function GET(req: Request) {
  // Verify this is a legitimate Vercel cron call
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: leads } = await supabase
    .from("leads")
    .select("name, email, phone, status, notes, created_at")
    .gte("created_at", sevenDaysAgo)
    .order("created_at", { ascending: false })

  const now = new Date()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  const dateRange = `${fmt(weekAgo)} – ${fmt(now)}`
  const count = leads?.length ?? 0

  const rows = count === 0
    ? `<tr><td colspan="5" style="text-align:center;padding:20px;color:#9CA3AF;">No new leads this week</td></tr>`
    : (leads ?? []).map((l, i) => `
      <tr style="background:${i % 2 === 0 ? "#fff" : "#F9FAFB"}">
        <td style="padding:10px 12px;font-weight:600;color:#0B1D3A;">${l.name || "—"}</td>
        <td style="padding:10px 12px;color:#374151;">${l.email || "—"}</td>
        <td style="padding:10px 12px;color:#374151;">${l.phone || "—"}</td>
        <td style="padding:10px 12px;color:#374151;">${l.status || "—"}</td>
        <td style="padding:10px 12px;color:#374151;">${l.notes || "—"}</td>
      </tr>`).join("")

  const html = `
<div style="font-family:sans-serif;max-width:640px;margin:0 auto;">
  <div style="background:#0B1D3A;padding:24px 28px;border-radius:8px 8px 0 0;">
    <h2 style="color:#fff;margin:0;font-size:20px;">Bear Team Weekly Leads</h2>
    <p style="color:#93C5FD;margin:6px 0 0;font-size:14px;">${dateRange}</p>
  </div>
  <div style="border:1px solid #E5E7EB;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
    <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:6px;padding:14px 18px;margin-bottom:20px;">
      <span style="font-size:28px;font-weight:700;color:#1B8C3A;">${count}</span>
      <span style="font-size:15px;color:#374151;margin-left:8px;">new lead${count !== 1 ? "s" : ""} this week</span>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#F3F4F6;">
          <th style="padding:10px 12px;text-align:left;color:#6B7280;font-weight:600;">Name</th>
          <th style="padding:10px 12px;text-align:left;color:#6B7280;font-weight:600;">Email</th>
          <th style="padding:10px 12px;text-align:left;color:#6B7280;font-weight:600;">Phone</th>
          <th style="padding:10px 12px;text-align:left;color:#6B7280;font-weight:600;">Status</th>
          <th style="padding:10px 12px;text-align:left;color:#6B7280;font-weight:600;">Notes</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:20px;font-size:12px;color:#9CA3AF;">Sent automatically every Monday at 8:00 AM by Scout | Bear Team Real Estate</p>
  </div>
</div>`

  await sendEmail(
    process.env.NOTIFY_EMAIL!,
    `Bear Team Weekly Leads — ${count} new lead${count !== 1 ? "s" : ""} | ${dateRange}`,
    html,
  )

  return NextResponse.json({ ok: true, leads: count })
}
// cron deploy trigger Thu Mar 19 01:14:49 EDT 2026
