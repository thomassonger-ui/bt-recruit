import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST /api/rsvp — public RSVP capture from the /events page.
// Origin-gated (same approach as /api/notify) to block open-internet spam.
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin") || ""
  const referer = req.headers.get("referer") || ""
  const isOwnOrigin =
    origin.includes("joinbearteam.com") ||
    origin.includes("vercel.app") ||
    origin.includes("localhost") ||
    referer.includes("joinbearteam.com") ||
    referer.includes("vercel.app") ||
    referer.includes("localhost")
  if (!isOwnOrigin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const first = (body.firstName || "").toString().trim().slice(0, 80)
    const last = (body.lastName || "").toString().trim().slice(0, 80)
    const email = (body.email || "").toString().trim().slice(0, 160)
    const phone = (body.phone || "").toString().trim().slice(0, 40)
    const brokerage = (body.brokerage || "").toString().trim().slice(0, 120)
    const workshop = (body.workshop || "").toString().trim().slice(0, 120)
    const utm = (body.utm || "").toString().trim().slice(0, 200)

    const name = `${first} ${last}`.trim()
    if (!name || (!email && !phone)) {
      return NextResponse.json({ error: "Missing name and contact" }, { status: 400 })
    }

    const { error } = await db().from("leads").insert({
      name,
      email: email || null,
      phone: phone || null,
      brokerage: brokerage || null,
      source: "events_rsvp",
      stage: "scout_captured",
      status: "rsvp",
      notes: [
        "RSVP via /events",
        workshop ? `Workshop: ${workshop}` : "",
        utm ? `UTM: ${utm}` : "",
      ].filter(Boolean).join(" | "),
    })

    if (error) {
      console.error("[rsvp]", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[rsvp]", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
