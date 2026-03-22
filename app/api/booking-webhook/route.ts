import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { createHmac, timingSafeEqual } from "crypto"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// ─── CALENDLY WEBHOOK HANDLER ─────────────────────────────────────────────────
//
// Register this URL in Calendly:
//   Dashboard → Integrations → Webhooks → New Webhook
//   URL: https://www.joinbearteam.com/api/booking-webhook
//   Events: invitee.created
//
// Required environment variables (Vercel → Settings → Environment Variables):
//   SUPABASE_URL              — from Supabase project settings
//   SUPABASE_ANON_KEY         — from Supabase project settings
//   RESEND_API_KEY            — already set
//   NOTIFY_EMAIL              — already set (thomas.songer@gmail.com)
//   CALENDLY_WEBHOOK_SECRET   — from Calendly: Integrations → Webhooks → signing key
//
// Signature verification:
//   Calendly sends header: Calendly-Webhook-Signature: t=<timestamp>,v1=<hmac>
//   HMAC is SHA-256 of "<timestamp>.<raw_body>" using your webhook signing key.
//   If CALENDLY_WEBHOOK_SECRET is not set, verification is skipped (dev/test mode).
//
// Fix 3-D: Re-booking deduplication
//   If a lead already has drip_step > 0, they are mid-sequence from a prior call.
//   Re-booking should update event_end (resetting the call timestamp) but NOT
//   reset drip_step or drip_unsubscribed. This prevents duplicate emails from
//   re-entering the drip from Day 1 when the lead has already received some emails.
//   If drip_step is null/0, they haven't started drip yet — safe to write full record.
//
// TA-1: Email 1 fires here, not in the drip cron.
//   The drip cron fires at 8 AM ET — that means Email 1 can be 8–20+ hours after
//   the call ends depending on time of day. Post-call momentum peaks in the first
//   few hours. Email 1 now fires directly from this webhook when invitee.created
//   fires (booking confirmed). The drip cron Day 1 step has been removed.
//   For re-bookings (drip_step > 0), Email 1 is NOT resent.
// ─────────────────────────────────────────────────────────────────────────────

const CALENDLY_LINK = "https://calendly.com/thomas-songer/bear-team-meet"
const FROM_EMAIL    = "Tom Songer <tom@joinbearteam.com>"
const REPLY_TO      = "thomas.songer@gmail.com"

function verifyCalendlySignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader) return false

  // Header format: "t=1234567890,v1=abcdef..."
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.split("=") as [string, string])
  )
  const timestamp = parts["t"]
  const receivedSig = parts["v1"]

  if (!timestamp || !receivedSig) return false

  // Reject payloads older than 5 minutes (replay attack protection)
  const age = Date.now() / 1000 - parseInt(timestamp, 10)
  if (age > 300) return false

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex")

  try {
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(receivedSig, "hex")
    )
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    // Read raw body first — needed for signature verification before JSON parse
    const rawBody = await req.text()

    // ── Signature verification ─────────────────────────────────────────────────
    const secret = process.env.CALENDLY_WEBHOOK_SECRET
    if (secret) {
      const sigHeader = req.headers.get("Calendly-Webhook-Signature")
      const valid = verifyCalendlySignature(rawBody, sigHeader, secret)
      if (!valid) {
        console.warn("Calendly webhook: invalid signature — request rejected")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    } else {
      // Log a warning in production so it's obvious the env var needs to be set
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "CALENDLY_WEBHOOK_SECRET is not set — webhook signature verification is disabled"
        )
      }
    }

    const body = JSON.parse(rawBody)

    // Calendly sends event type in payload.event
    const eventType = body.event
    if (eventType !== "invitee.created") {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const payload = body.payload

    // Extract agent info from Calendly invitee
    const name = payload?.invitee?.name || "Unknown"
    const email = payload?.invitee?.email || ""
    const phone =
      payload?.questions_and_answers?.find(
        (qa: { question: string; answer: string }) =>
          qa.question?.toLowerCase().includes("phone") ||
          qa.question?.toLowerCase().includes("number")
      )?.answer || ""

    const eventStart = payload?.event?.start_time || null
    const eventEnd = payload?.event?.end_time || null
    const calendlyEventUri = payload?.event?.uri || null
    const calendlyInviteeUri = payload?.invitee?.uri || null
    const notes = payload?.invitee?.text_reminder_number || ""

    // Format time for email
    const formattedTime = eventStart
      ? new Date(eventStart).toLocaleString("en-US", {
          timeZone: "America/New_York",
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "Time not captured"

    // ── Write to Supabase ──────────────────────────────────────────────────────
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      )

      // Fix 3-D: Check if this lead already exists and has an active drip sequence.
      // If drip_step > 0, they're mid-sequence — update event_end only, don't
      // reset drip fields. This prevents a re-booked lead from getting duplicate
      // early-sequence emails or spawning a second parallel drip thread.
      const { data: existingLead } = await supabase
        .from("leads")
        .select("id, drip_step, drip_unsubscribed")
        .eq("email", email.toLowerCase().trim())
        .maybeSingle()

      const isRebooking = existingLead && (existingLead.drip_step ?? 0) > 0

      if (isRebooking) {
        // Mid-drip re-booking: update call timestamps and basic info only.
        // Preserve drip_step so the sequence doesn't restart from Email 1.
        const { error } = await supabase
          .from("leads")
          .update({
            name,
            phone,
            event_start: eventStart,
            event_end: eventEnd,
            calendly_event_uri: calendlyEventUri,
            calendly_invitee_uri: calendlyInviteeUri,
            status: "booked",
            // drip_step intentionally NOT reset — sequence continues from current step
            // drip_unsubscribed intentionally NOT changed — respect existing opt-out state
          })
          .eq("id", existingLead.id)

        if (error) {
          console.error("Supabase re-booking update error:", error)
        } else {
          console.log(`Re-booking detected for ${email} at drip_step ${existingLead.drip_step} — drip preserved`)
        }
      } else {
        // New lead or pre-drip re-booking: full upsert
        const { error } = await supabase.from("leads").upsert(
          {
            name,
            email,
            phone,
            event_start: eventStart,
            event_end: eventEnd,
            calendly_event_uri: calendlyEventUri,
            calendly_invitee_uri: calendlyInviteeUri,
            notes,
            status: "booked",
          },
          { onConflict: "calendly_event_uri" }
        )

        if (error) {
          console.error("Supabase insert error:", error)
        }
      }
    }

    // ── TA-1: Email 1 — send immediately on booking confirmation ──────────────
    // Fires within seconds of invitee.created. For new leads only (drip_step = 0).
    // Re-bookings (drip_step > 0) skip this — they're mid-sequence already.
    if (process.env.RESEND_API_KEY && !isRebooking) {
      const firstName = name?.split(" ")[0] || "there"
      // Fetch lead record to get deal_count, avg_price, notes for personalization
      let leadRecord: Record<string, string | number | boolean | null> = { name, email }
      if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
        const { data: freshLead } = await createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY
        ).from("leads").select("*").eq("email", email.toLowerCase().trim()).maybeSingle()
        if (freshLead) leadRecord = freshLead
      }
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: FROM_EMAIL,
        replyTo: REPLY_TO,
        to: email,
        subject: "Great talking with you today",
        html: buildEmail1(firstName, leadRecord),
        tags: [{ name: "drip_step", value: "1" }, { name: "sequence", value: "drip" }],
      }).catch((err: unknown) => console.error("Email 1 send error:", err))

      // Mark drip_step = 1 so the drip cron (which now starts at Day 3) doesn't resend
      if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
        await createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY
        ).from("leads").update({
          drip_step: 1,
          drip_last_sent_at: new Date().toISOString(),
        }).eq("email", email.toLowerCase().trim())
      }
    }

    // ── Send email to Tom ──────────────────────────────────────────────────────
    if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: "Scout <scout@joinbearteam.com>",
        to: process.env.NOTIFY_EMAIL,
        subject: `📞 Call booked — ${name} · ${formattedTime}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;">
            <div style="background:#0B1D3A;padding:20px 24px;border-radius:8px 8px 0 0;">
              <h2 style="color:#fff;margin:0;font-size:18px;">Scout booked a call</h2>
            </div>
            <div style="border:1px solid #E5E7EB;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
              <table style="font-size:15px;border-collapse:collapse;width:100%;">
                <tr>
                  <td style="padding:8px 16px 8px 0;color:#6B7280;white-space:nowrap;">Name</td>
                  <td style="padding:8px 0;font-weight:600;color:#0B1D3A;">${name}</td>
                </tr>
                <tr style="background:#F9FAFB;">
                  <td style="padding:8px 16px 8px 0;color:#6B7280;white-space:nowrap;">Email</td>
                  <td style="padding:8px 0;font-weight:600;color:#0B1D3A;">${email}</td>
                </tr>
                <tr>
                  <td style="padding:8px 16px 8px 0;color:#6B7280;white-space:nowrap;">Phone</td>
                  <td style="padding:8px 0;font-weight:600;color:#0B1D3A;">${phone || "Not provided"}</td>
                </tr>
                <tr style="background:#F9FAFB;">
                  <td style="padding:8px 16px 8px 0;color:#6B7280;white-space:nowrap;">Time</td>
                  <td style="padding:8px 0;font-weight:600;color:#1B8C3A;">${formattedTime}</td>
                </tr>
              </table>
              ${notes ? `<div style="margin-top:16px;padding:12px;background:#F9FAFB;border-radius:6px;font-size:14px;color:#374151;"><strong>Notes:</strong> ${notes}</div>` : ""}
              <p style="margin-top:24px;font-size:13px;color:#9CA3AF;">Booked via Calendly through Scout on joinbearteam.com</p>
            </div>
          </div>
        `,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Booking webhook error:", error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

// ─── EMAIL 1 BUILDER ─────────────────────────────────────────────────────────
// Mirror of drip/route.ts Email 1 — kept in sync manually.
// If you update the Email 1 copy in the drip cron, update this too.

function buildEmail1(
  firstName: string,
  lead: Record<string, string | number | boolean | null>
): string {
  const dealCount = lead.deal_count as number | null
  const avgPrice  = (lead.avg_price as number) || 415000
  const notes     = (lead.notes as string) || ""
  const leadId    = (lead.id as string) || undefined

  let mathBlock = ""
  if (dealCount && dealCount > 0) {
    const gci           = avgPrice * 0.025
    const bearTeamNet60 = gci * 0.6 * dealCount
    const bearTeamNet70 = gci * 0.7 * dealCount
    const fees          = dealCount * 150
    const priceLabel    = (lead.avg_price as number) ? `$${avgPrice.toLocaleString()} avg` : `$${avgPrice.toLocaleString()} Orlando avg`
    mathBlock = `
    <div style="background:#f8f4e8;border-left:4px solid #c9a84c;padding:16px 20px;margin:20px 0;border-radius:4px;">
      <p style="margin:0 0 8px;font-weight:600;color:#1a1a1a;">Your numbers at Bear Team — ${dealCount} deals · ${priceLabel}:</p>
      <p style="margin:0 0 4px;color:#333;">GCI per deal: $${Math.round(gci).toLocaleString()}</p>
      <p style="margin:0 0 4px;color:#333;">Your net at Tier 1 (60/40): $${Math.round(bearTeamNet60 - fees).toLocaleString()} after $150/deal fee</p>
      <p style="margin:0 0 4px;color:#333;">Your net at Tier 2 (70/30): $${Math.round(bearTeamNet70 - fees).toLocaleString()} — kicks in at $16K company dollar</p>
      <p style="margin:0 0 4px;color:#888;font-size:13px;">Zero monthly fees. Zero desk fees. Zero E&O. Only pay when you close.</p>
      <p style="margin:0;color:#aaa;font-size:11px;">Estimates based on information you provided. Actual earnings will vary based on transaction volume, sale price, and other factors.</p>
    </div>`
  }

  let notesCallout = ""
  if (notes && notes.length > 10) {
    notesCallout = `
    <div style="background:#f0f4ff;border-left:4px solid #3b82f6;padding:14px 18px;margin:16px 0;border-radius:4px;">
      <p style="margin:0 0 6px;font-weight:600;color:#1e3a8a;font-size:13px;">FROM OUR CHAT BEFORE THE CALL</p>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">${notes}</p>
    </div>`
  }

  const body = `<p>Hey ${firstName},</p>
    <p>Really enjoyed our conversation today. I want to make sure you have everything you need to think it through clearly.</p>
    ${notesCallout}
    <p>Here's the short version of what we covered:</p>
    <ul style="color:#333;line-height:1.8;">
      <li>Progressive tiers: 60/40 → 70/30 → 80/20 → 90/10</li>
      <li>$16K company dollar cap = automatic tier promotion, not a ceiling</li>
      <li>Zero monthly fees, zero desk fees, zero E&O costs</li>
      <li>$150 flat per closing — same whether it's $200K or $2M</li>
    </ul>
    ${mathBlock}
    <p>If any questions came up after we hung up, just reply here — or if you'd rather talk it through, grab 15 minutes whenever it works: <a href="${CALENDLY_LINK}" style="color:#c9a84c;font-weight:600;">Schedule a call →</a></p>`

  return wrapEmailBooking(body, leadId)
}

function wrapEmailBooking(body: string, leadId?: string): string {
  const unsubLink = leadId
    ? `<a href="https://joinbearteam.com/api/unsubscribe?id=${leadId}" style="color:#aaa;text-decoration:underline;">Unsubscribe</a>`
    : `<span style="color:#aaa;">Reply "stop" to unsubscribe</span>`
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #1a1a1a; padding: 24px 36px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 18px; font-weight: 600; }
    .header span { color: #c9a84c; }
    .body { padding: 32px 36px; color: #333; font-size: 15px; line-height: 1.7; }
    .body p { margin: 0 0 16px; }
    .body ul { margin: 0 0 16px; padding-left: 24px; }
    .footer { padding: 20px 36px; border-top: 1px solid #f0f0f0; }
    .footer p { color: #888; font-size: 13px; margin: 0 0 4px; }
    .sig { margin-top: 24px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
    .sig p { color: #555; font-size: 14px; margin: 0 0 2px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Bear <span>Team</span> Real Estate</h1></div>
    <div class="body">
      ${body}
      <div class="sig">
        <p><strong>Tom Songer</strong></p>
        <p>Team Lead | Bear Team Real Estate</p>
        <p>407-758-8102 | joinbearteam.com</p>
      </div>
    </div>
    <div class="footer">
      <p>Bear Team Real Estate · Orlando, FL</p>
      <p style="font-size:12px;color:#aaa;">${unsubLink}</p>
    </div>
  </div>
</body>
</html>`.trim()
}

