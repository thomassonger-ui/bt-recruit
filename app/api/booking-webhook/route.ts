import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const eventType = body.event
    const payload = body.payload || {}

    console.log(`[webhook] event=${eventType}`)

    if (eventType !== "invitee.created") {
      return NextResponse.json({ ok: true, skipped: eventType })
    }

    // Get invitee URI from payload
    const inviteeUri = typeof payload.invitee === "string"
      ? payload.invitee
      : payload.invitee?.uri || null

    const scheduledEvent = payload.scheduled_event || {}
    const eventStart = scheduledEvent.start_time || null
    const eventEnd = scheduledEvent.end_time || null
    const eventUri = scheduledEvent.uri || null

    console.log(`[webhook] inviteeUri=${inviteeUri} eventStart=${eventStart}`)

    // Fetch invitee details
    let name = "Unknown"
    let email = ""
    let phone = ""

    if (inviteeUri && process.env.CALENDLY_TOKEN) {
      const r = await fetch(inviteeUri, {
        headers: { Authorization: `Bearer ${process.env.CALENDLY_TOKEN}` }
      })
      console.log(`[webhook] Calendly API status=${r.status}`)
      if (r.ok) {
        const data = await r.json()
        const inv = data.resource || {}
        name  = inv.name  || "Unknown"
        email = inv.email || ""
        const qa = inv.questions_and_answers || []
        phone = qa.find((q: { question: string; answer: string }) =>
          q.question?.toLowerCase().includes("phone") ||
          q.question?.toLowerCase().includes("number")
        )?.answer || ""
        console.log(`[webhook] Got invitee: name=${name} email=${email}`)
      } else {
        const txt = await r.text()
        console.error(`[webhook] Calendly API failed: ${r.status} ${txt}`)
      }
    } else {
      console.error(`[webhook] Missing inviteeUri=${inviteeUri} or CALENDLY_TOKEN=${!!process.env.CALENDLY_TOKEN}`)
    }

    if (!email) {
      console.error(`[webhook] No email resolved — notifying Tom`)
      if (process.env.NOTIFY_EMAIL && process.env.SENDGRID_API_KEY) {
        await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: process.env.NOTIFY_EMAIL }] }],
            from: { email: "tom@bearteam.com" },
            subject: "⚠️ Booking received — email missing, manual entry needed",
            content: [{ type: "text/html", value: `<p>Booking fired but email could not be resolved.</p><p>Invitee URI: ${inviteeUri}</p><p>Event start: ${eventStart}</p>` }]
          })
        })
      }
      return NextResponse.json({ ok: false, error: "no email" })
    }

    // Write to Supabase
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      const emailKey = email.toLowerCase().trim()

      const { data: existing } = await sb.from("leads").select("id").eq("email", emailKey).maybeSingle()
      console.log(`[webhook] existing lead: ${existing ? existing.id : "none"}`)

      const { error } = existing
        ? await sb.from("leads").update({
            name, phone, event_start: eventStart, event_end: eventEnd,
            calendly_event_uri: eventUri, calendly_invitee_uri: inviteeUri,
            status: "booked", updated_at: new Date().toISOString()
          }).eq("id", existing.id)
        : await sb.from("leads").insert({
            name, email: emailKey, phone,
            event_start: eventStart, event_end: eventEnd,
            calendly_event_uri: eventUri, calendly_invitee_uri: inviteeUri,
            status: "booked"
          })

      if (error) {
        console.error(`[webhook] Supabase error:`, JSON.stringify(error))
      } else {
        console.log(`[webhook] Supabase write OK — ${name} ${emailKey}`)
      }
    }

    // Notify Tom
    if (process.env.NOTIFY_EMAIL && process.env.SENDGRID_API_KEY) {
      const timeStr = eventStart
        ? new Date(eventStart).toLocaleString("en-US", { timeZone: "America/New_York", weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })
        : "Unknown time"
      await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: process.env.NOTIFY_EMAIL }] }],
          from: { email: "tom@bearteam.com" },
          subject: `📞 Call booked — ${name} · ${timeStr}`,
          content: [{ type: "text/html", value: `<p><strong>${name}</strong><br>${email}<br>${phone || "no phone"}<br>${timeStr} ET</p>` }]
        })
      })
    }

    return NextResponse.json({ ok: true, name, email })

  } catch (err) {
    console.error("[webhook] Error:", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
