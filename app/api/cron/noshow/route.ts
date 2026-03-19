import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
  const resend = new Resend(process.env.RESEND_API_KEY!)

  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()

  const { data: noShows } = await supabase
    .from("leads")
    .select("id, name, email, phone, event_start")
    .eq("status", "booked")
    .lt("event_start", thirtyMinAgo)
    .neq("email", "")

  if (!noShows || noShows.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 })
  }

  let processed = 0

  for (const lead of noShows) {
    const formattedTime = new Date(lead.event_start).toLocaleString("en-US", {
      timeZone: "America/New_York",
      weekday: "long", month: "long", day: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    })

    const firstName = (lead.name || "there").split(" ")[0]

    // Update status to no_show
    await supabase
      .from("leads")
      .update({ status: "no_show" })
      .eq("id", lead.id)

    // Email Tom
    await resend.emails.send({
      from: "Scout <onboarding@resend.dev>",
      to: process.env.NOTIFY_EMAIL!,
      subject: `No-show — ${lead.name} missed the call (${formattedTime})`,
      html: `
      <div style="font-family:sans-serif;max-width:480px;">
        <div style="background:#0B1D3A;padding:20px 24px;border-radius:8px 8px 0 0;">
          <h2 style="color:#fff;margin:0;font-size:18px;">No-show Alert</h2>
          <p style="color:#FCA5A5;margin:6px 0 0;font-size:14px;">${lead.name} missed their scheduled call</p>
        </div>
        <div style="border:1px solid #E5E7EB;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
          <table style="font-size:15px;border-collapse:collapse;width:100%;">
            <tr>
              <td style="padding:8px 16px 8px 0;color:#6B7280;">Name</td>
              <td style="padding:8px 0;font-weight:600;color:#0B1D3A;">${lead.name}</td>
            </tr>
            <tr style="background:#F9FAFB;">
              <td style="padding:8px 16px 8px 0;color:#6B7280;">Email</td>
              <td style="padding:8px 0;font-weight:600;color:#0B1D3A;">${lead.email}</td>
            </tr>
            <tr>
              <td style="padding:8px 16px 8px 0;color:#6B7280;">Phone</td>
              <td style="padding:8px 0;font-weight:600;color:#0B1D3A;">${lead.phone || "Not provided"}</td>
            </tr>
            <tr style="background:#F9FAFB;">
              <td style="padding:8px 16px 8px 0;color:#6B7280;">Scheduled</td>
              <td style="padding:8px 0;font-weight:600;color:#C62828;">${formattedTime}</td>
            </tr>
          </table>
          <div style="margin-top:20px;background:#FFF7ED;border:1px solid #FED7AA;border-radius:6px;padding:16px;">
            <p style="margin:0;font-size:14px;font-weight:600;color:#92400E;">Suggested next step</p>
            <p style="margin:8px 0 0;font-size:14px;color:#374151;">Reply directly to ${lead.email} or call ${lead.phone || "them"} — keep it short: "Hey ${firstName}, missed you today — still want to connect? Grab a new time here: https://calendly.com/thomas-songer/60min"</p>
          </div>
          <p style="margin-top:20px;font-size:13px;color:#9CA3AF;">Detected automatically by Scout 30 minutes after scheduled call time.</p>
        </div>
      </div>`,
    })

    processed++
  }

  return NextResponse.json({ ok: true, processed })
}
