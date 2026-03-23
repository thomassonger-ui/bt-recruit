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
//   NOTIFY_EMAIL              — already set (tom@bearteam.com)
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
// SW-2/CR-1: booking-webhook sends pre-call confirmation only.
//   invitee.created fires at BOOKING time, not after the call completes.
//   Email 1 (post-call recap) is owned by the drip cron after event_end passes.
//
// TICKET-04: write-verify-send pattern enforced.
//   After any Supabase write, verifyWrite confirms the row is persisted before
//   sending the confirmation email. If verification fails, email is skipped.
// ─────────────────────────────────────────────────────────────────────────────

const CALENDLY_LINK = "https://calendly.com/thomas-songer/bear-team-meet"
const FROM_EMAIL    = "Tom Songer <tom@bearteam.com>"
const REPLY_TO      = "tom@bearteam.com"

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

    // CR-3 fix: Handle invitee.canceled.
    // Without this, a lead who books then cancels keeps event_end set and the drip
    // cron fires Email 1 ("Great talking with you") after the call slot passes —
    // even though the call never happened. Cancellation clears event_end so the
    // drip cron can't pick them up. Stage is reset to scout_captured (they chatted
    // with Scout) or Follow-Up Queue if they were further in pipeline.
    if (eventType === "invitee.canceled") {
      const cancelPayload = body.payload
      const cancelEmail   = cancelPayload?.invitee?.email || ""
      if (cancelEmail && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
        const { data: lead } = await supabase.from("leads").select("id, stage, drip_step")
          .eq("email", cancelEmail.toLowerCase().trim()).maybeSingle()
        if (lead) {
          await supabase.from("leads").update({
            event_end:   null,              // clear so drip cron doesn't fire on the slot
            event_start: null,
            status:      "cancelled",
            // Only reset stage if still pre-call — don't overwrite mid-drip state
            ...(lead.drip_step === 0 || lead.drip_step === null
              ? { stage: "Follow-Up Queue" } : {}),
            updated_at: new Date().toISOString(),
          }).eq("id", lead.id)
          console.log(`Cancellation handled for ${cancelEmail} — event_end cleared`)
        }
      }
      return NextResponse.json({ ok: true, handled: "cancellation" })
    }

    if (eventType !== "invitee.created") {
      return NextResponse.json({ ok: true, skipped: true })
    }

    const payload = body.payload

    // Extract agent info from Calendly invitee
    // Calendly v2 uses payload.scheduled_event for event data (not payload.event)
    // Questions are under payload.invitee.questions_and_answers
    const name = payload?.invitee?.name || "Unknown"
    const email = payload?.invitee?.email || ""

    // questions_and_answers can be on invitee OR top-level payload depending on webhook version
    const qaList = payload?.invitee?.questions_and_answers || payload?.questions_and_answers || []
    const phone =
      qaList.find(
        (qa: { question: string; answer: string }) =>
          qa.question?.toLowerCase().includes("phone") ||
          qa.question?.toLowerCase().includes("number")
      )?.answer || ""

    // scheduled_event is the v2 field; fall back to event for older webhooks
    const scheduledEvent = payload?.scheduled_event || payload?.event || {}
    const eventStart = scheduledEvent?.start_time || null
    const eventEnd = scheduledEvent?.end_time || null
    const calendlyEventUri = scheduledEvent?.uri || null
    const calendlyInviteeUri = payload?.invitee?.uri || null
    const notes = payload?.invitee?.text_reminder_number || ""

    console.log(`[booking-webhook] Parsed: name=${name} email=${email} start=${eventStart}`)
    if (!email) {
      console.error("[booking-webhook] WARNING: invitee email is empty — full payload:", JSON.stringify(body).slice(0, 500))
    }

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

    // ── SW-1 fix: isRebooking hoisted here so it's in scope for all downstream logic.
    // Previously declared inside the SUPABASE_URL conditional — if that env var was
    // missing, isRebooking was undefined, !isRebooking evaluated true, and Email 1
    // fired to every booking unconditionally. Default false = safest fallback.
    let isRebooking = false

    // ── Write to Supabase ──────────────────────────────────────────────────────
    // SW-5 fix: use SERVICE_ROLE_KEY for all writes in this route.
    // Previously used SUPABASE_ANON_KEY. If RLS is enabled on the leads table,
    // anon key writes silently fail. Service role bypasses RLS — consistent with
    // drip, noshow, and onboard routes which all use the service role key.
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
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

      // SW-1 fix: isRebooking now written to the outer-scope variable declared above.
      isRebooking = !!(existingLead && (existingLead.drip_step ?? 0) > 0)

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
          .eq("id", existingLead!.id)

        if (error) {
          console.error("Supabase re-booking update error:", error)
        } else {
          console.log(`Re-booking detected for ${email} at drip_step ${existingLead!.drip_step} — drip preserved`)
        }
      } else {
        // New lead or pre-drip re-booking: full upsert
        // Try update first, then insert if no row exists
        const emailKey = email.toLowerCase().trim()
        console.log(`[booking-webhook] Processing lead: name=${name} email=${emailKey} phone=${phone}`)
        console.log(`[booking-webhook] Event: start=${eventStart} end=${eventEnd}`)

        const { data: existing, error: selectErr } = await supabase
          .from("leads").select("id").eq("email", emailKey).maybeSingle()

        if (selectErr) console.error("[booking-webhook] Supabase select error:", selectErr)
        console.log(`[booking-webhook] Existing lead: ${existing ? "found id=" + existing.id : "not found — inserting"}`)

        const { error } = existing
          ? await supabase.from("leads").update({
              name, phone,
              event_start: eventStart, event_end: eventEnd,
              calendly_event_uri: calendlyEventUri,
              calendly_invitee_uri: calendlyInviteeUri,
              notes, status: "booked",
              updated_at: new Date().toISOString(),
            }).eq("id", existing.id)
          : await supabase.from("leads").insert({
              name, email: emailKey, phone,
              event_start: eventStart, event_end: eventEnd,
              calendly_event_uri: calendlyEventUri,
              calendly_invitee_uri: calendlyInviteeUri,
              notes, status: "booked",
            })

        if (error) {
          console.error("[booking-webhook] Supabase write error:", JSON.stringify(error))
        } else {
          console.log(`[booking-webhook] Supabase write OK`)
        }
      }

      // Send booking confirmation email directly after upsert — no verifyWrite gate
      console.log(`[booking-webhook] isRebooking=${isRebooking} email=${email} hasResendKey=${!!process.env.RESEND_API_KEY}`)
      if (process.env.RESEND_API_KEY && !isRebooking && email) {
        const firstName = name?.split(" ")[0] || "there"
        // Fetch lead for personalization
        let leadRecord: Record<string, string | number | boolean | null> = { name, email }
        const { data: freshLead } = await supabase
          .from("leads")
          .select("*")
          .eq("email", email.toLowerCase().trim())
          .maybeSingle()
        if (freshLead) leadRecord = freshLead

        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: FROM_EMAIL,
          replyTo: REPLY_TO,
          to: email,
          subject: `Looking forward to our call, ${firstName}`,
          html: buildBookingConfirmationEmail(firstName, leadRecord, formattedTime),
          tags: [{ name: "sequence", value: "booking_confirmation" }],
        }).catch((err: unknown) => console.error("Booking confirmation email error:", err))
      }
    } else if (process.env.RESEND_API_KEY && !isRebooking && email) {
      // No Supabase — send confirmation anyway
      const firstName = name?.split(" ")[0] || "there"
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: FROM_EMAIL,
        replyTo: REPLY_TO,
        to: email,
        subject: `Looking forward to our call, ${firstName}`,
        html: buildBookingConfirmationEmail(firstName, { name, email }, formattedTime),
      }).catch((err: unknown) => console.error("Booking confirmation fallback error:", err))
    }

    // ── Send email to Tom ──────────────────────────────────────────────────────
    if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: "Scout <tom@bearteam.com>",
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

// ─── BOOKING CONFIRMATION EMAIL ───────────────────────────────────────────────
// SW-2/CR-1 fix: Replaces the old "Great talking with you today" Email 1 that
// fired at booking time. This is now a true pre-call confirmation — accurate,
// useful, and CAN-SPAM compliant. The post-call recap (Email 1) is now owned
// by the drip cron and fires after event_end.

function buildBookingConfirmationEmail(
  firstName: string,
  lead: Record<string, string | number | boolean | null>,
  formattedTime: string
): string {
  const brokerage = (lead.brokerage as string) || null
  const brokerageNote = brokerage
    ? `<p>I know you're weighing your options at ${brokerage}. Come with your questions — I'd rather give you the real numbers than a pitch.</p>`
    : `<p>Come with your questions — I'd rather give you the real numbers than a pitch.</p>`

  const body = `<p>Hey ${firstName},</p>
    <p>You're booked — looking forward to the call.</p>
    <p style="background:#f8f4e8;border-left:4px solid #c9a84c;padding:12px 16px;border-radius:4px;"><strong>📅 ${formattedTime} ET</strong></p>
    ${brokerageNote}
    <p>A few things worth having in mind before we talk:</p>
    <ul style="color:#333;line-height:1.8;">
      <li>How many deals did you close last year?</li>
      <li>What's your average sale price?</li>
      <li>What's the one thing about your current setup that's most in the way?</li>
    </ul>
    <p>If anything comes up before the call, just reply here. Otherwise, I'll see you then.</p>`

  return wrapEmailBooking(body, undefined)
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
      <p style="font-size:12px;color:#aaa;">Licensed under Bethanne Baer, Broker/Owner</p>
      <p style="font-size:12px;color:#aaa;">${unsubLink}</p>
    </div>
  </div>
</body>
</html>`.trim()
}
