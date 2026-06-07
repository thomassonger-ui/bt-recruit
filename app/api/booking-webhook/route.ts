import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const body = JSON.parse(rawBody)
    const eventType = body.event
    const payload = body.payload || {}

    console.log(`[wh] event=${eventType} tokenLen=${process.env.CALENDLY_TOKEN?.length||0}`)

    if (eventType !== "invitee.created") {
      return NextResponse.json({ ok: true, skipped: eventType })
    }

    // Handle ALL possible Calendly payload formats
    const inviteeUri = typeof payload.invitee === "string"
      ? payload.invitee
      : payload.invitee?.uri || null

    let name  = payload.invitee?.name  || payload.name  || ""
    let email = payload.invitee?.email || payload.email || ""
    let phone = ""

    const scheduledEvent = payload.scheduled_event || payload.event_type || {}
    const eventStart = scheduledEvent.start_time || payload.event_start_time || null
    const eventEnd   = scheduledEvent.end_time   || payload.event_end_time   || null
    const eventUri   = scheduledEvent.uri || null

    console.log(`[wh] inviteeUri=${inviteeUri} directEmail=${email} directName=${name}`)

    if (!email && inviteeUri && process.env.CALENDLY_TOKEN) {
      const r = await fetch(inviteeUri, {
        headers: { Authorization: `Bearer ${process.env.CALENDLY_TOKEN}` }
      })
      console.log(`[wh] Calendly API status=${r.status}`)
      if (r.ok) {
        const data = await r.json()
        const inv = data.resource || data
        name  = inv.name  || name  || "Unknown"
        email = inv.email || email || ""
        const qa = inv.questions_and_answers || []
        phone = qa.find((q: {question:string;answer:string}) =>
          q.question?.toLowerCase().includes("phone") || q.question?.toLowerCase().includes("number")
        )?.answer || ""
        console.log(`[wh] API fetch OK: name=${name} email=${email} phone=${phone}`)
      } else {
        const txt = await r.text()
        console.error(`[wh] API fetch FAILED: ${r.status} — ${txt.slice(0,200)}`)
      }
    } else if (email) {
      const qa = payload.invitee?.questions_and_answers || payload.questions_and_answers || []
      phone = qa.find((q: {question:string;answer:string}) =>
        q.question?.toLowerCase().includes("phone") || q.question?.toLowerCase().includes("number")
      )?.answer || ""
      console.log(`[wh] Got email directly from payload: ${email}`)
    }

    if (!email) {
      console.error(`[wh] NO EMAIL. inviteeUri=${inviteeUri} tokenLen=${process.env.CALENDLY_TOKEN?.length||0} rawPayload=${rawBody.slice(0,500)}`)
      if (process.env.NOTIFY_EMAIL && process.env.SENDGRID_API_KEY) {
        await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: process.env.NOTIFY_EMAIL }] }],
            from: { email: "contact@joinbearteam.com", name: "Scout | Bear Team" },
            reply_to: { email: "thomas.songer@gmail.com" },
            subject: "⚠️ Booking — email missing, manual entry needed",
            content: [{ type: "text/html", value: `<p>Invitee URI: ${inviteeUri}</p><p>Token length in Vercel: ${process.env.CALENDLY_TOKEN?.length||0}</p><p>Event: ${eventStart}</p><p>Raw (first 500): ${rawBody.slice(0,500)}</p>` }]
          })
        })
      }
      return NextResponse.json({ ok: false, error: "no email", tokenLen: process.env.CALENDLY_TOKEN?.length||0 })
    }

    name = name || "Unknown"

    // Write to Supabase
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      const emailKey = email.toLowerCase().trim()
      const { data: existing } = await sb.from("leads").select("id, phone").eq("email", emailKey).maybeSingle()

      // Build update payload — only overwrite phone if Calendly gave us one,
      // otherwise preserve whatever Scout already saved
      const updatePayload: Record<string, string | null> = {
        name,
        event_start: eventStart,
        event_end: eventEnd,
        calendly_event_uri: eventUri,
        calendly_invitee_uri: inviteeUri,
        status: "booked",
        updated_at: new Date().toISOString(),
      }
      if (phone) updatePayload.phone = phone  // only set if Calendly returned a phone

      const { error } = existing
        ? await sb.from("leads").update(updatePayload).eq("id", existing.id)
        : await sb.from("leads").insert({
            name, email: emailKey, phone,
            event_start: eventStart, event_end: eventEnd,
            calendly_event_uri: eventUri, calendly_invitee_uri: inviteeUri,
            status: "booked"
          })
      if (error) {
        console.error(`[wh] Supabase error: ${JSON.stringify(error)}`)
      } else {
        console.log(`[wh] Supabase OK: ${name} ${emailKey} phone=${existing?.phone || phone || "none"}`)
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
          from: { email: "contact@joinbearteam.com", name: "Scout | Bear Team" },
          reply_to: { email: "thomas.songer@gmail.com" },
          subject: `📞 Call booked — ${name} · ${timeStr}`,
          content: [{ type: "text/html", value: `<p><strong>${name}</strong><br>${email}<br>${phone||"no phone"}<br>${timeStr} ET</p>` }]
        })
      })
    }

    return NextResponse.json({ ok: true, name, email })

  } catch (err) {
    console.error("[wh] Crash:", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
