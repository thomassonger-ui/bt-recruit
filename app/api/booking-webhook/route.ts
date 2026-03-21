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
// ─────────────────────────────────────────────────────────────────────────────

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

    // ── Send email to Tom ──────────────────────────────────────────────────────
    if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: "Scout <onboarding@resend.dev>",
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
