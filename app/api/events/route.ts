import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD

function db() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
  )
}

function authed(pw: string | null) {
  return !!DASHBOARD_PASSWORD && pw === DASHBOARD_PASSWORD
}

// GET /api/events?pw=... — list events (upcoming first)
export async function GET(req: NextRequest) {
  const pw = new URL(req.url).searchParams.get("pw")
  if (!authed(pw)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await db()
    .from("recruiting_events")
    .select("*")
    .order("event_date", { ascending: true, nullsFirst: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const events = data || []
  const totals = events.reduce(
    (a, e) => ({
      invited: a.invited + (e.invited || 0),
      attended: a.attended + (e.attended || 0),
      recruited: a.recruited + (e.recruited || 0),
    }),
    { invited: 0, attended: 0, recruited: 0 }
  )
  return NextResponse.json({ events, totals })
}

// POST /api/events — create an event
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (!authed(body.pw)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const row = {
    type: body.type === "workshop" ? "workshop" : "broker_open",
    title: (body.title || "").toString().slice(0, 200) || "Untitled Event",
    event_date: body.event_date || null,
    event_time: body.event_time || null,
    location: body.location || null,
    notes: body.notes || null,
    invited: Number(body.invited) || 0,
    attended: Number(body.attended) || 0,
    recruited: Number(body.recruited) || 0,
    status: body.status || "planned",
  }
  const { data, error } = await db().from("recruiting_events").insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ event: data })
}

// PATCH /api/events — update an event's fields/stats
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (!authed(body.pw)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const patch: Record<string, unknown> = {}
  for (const k of ["title", "type", "event_date", "event_time", "location", "notes", "status"]) {
    if (body[k] !== undefined) patch[k] = body[k]
  }
  for (const k of ["invited", "attended", "recruited"]) {
    if (body[k] !== undefined) patch[k] = Number(body[k]) || 0
  }
  const { data, error } = await db()
    .from("recruiting_events")
    .update(patch)
    .eq("id", body.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ event: data })
}

// DELETE /api/events?pw=...&id=... — remove an event
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (!authed(searchParams.get("pw"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  const { error } = await db().from("recruiting_events").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
