import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const pw = req.nextUrl.searchParams.get("pw")
  if (pw !== process.env.DASH_PW) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const brokerage = req.nextUrl.searchParams.get("brokerage") || ""
  const county = req.nextUrl.searchParams.get("county") || ""
  const search = req.nextUrl.searchParams.get("search") || ""
  const stage = req.nextUrl.searchParams.get("stage") || ""

  let query = supabase
    .from("agent_prospects")
    .select("*")
    .eq("accepted", false)
    .order("full_name", { ascending: true })
    .limit(200)

  if (brokerage) query = query.ilike("brokerage", `%${brokerage}%`)
  if (county) query = query.ilike("county", `%${county}%`)
  if (search) query = query.or(`full_name.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
  if (stage) query = query.eq("stage", stage)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ prospects: data || [], total: data?.length || 0 })
}

export async function POST(req: NextRequest) {
  try {
    const { prospectId, pw, phone, email } = await req.json()
    if (pw !== process.env.DASH_PW) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: prospect, error: pErr } = await supabase
      .from("agent_prospects")
      .select("*")
      .eq("id", prospectId)
      .single()

    if (pErr || !prospect) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 })
    }

    // Create lead in leads table
    const { error: lErr } = await supabase
      .from("leads")
      .insert({
        name: prospect.full_name,
        email: email || prospect.email || null,
        phone: phone || prospect.phone || null,
        brokerage: prospect.brokerage || null,
        source: "dbpr_prospect",
        status: "scout_captured",
        stage: "scout_captured",
        notes: [
          `License: ${prospect.license_number || "N/A"}`,
          `Status: ${prospect.license_status || "N/A"}`,
          `Licensed: ${prospect.license_date || "N/A"}`,
          `County: ${prospect.county || "N/A"}`,
          prospect.address ? `Address: ${prospect.address}, ${prospect.city || ""}, FL ${prospect.zip || ""}` : "",
        ].filter(Boolean).join(" | "),
      })

    if (lErr) {
      return NextResponse.json({ error: lErr.message }, { status: 500 })
    }

    await supabase
      .from("agent_prospects")
      .update({
        accepted: true,
        accepted_at: new Date().toISOString(),
        phone: phone || prospect.phone,
        email: email || prospect.email,
      })
      .eq("id", prospectId)

    return NextResponse.json({ ok: true, name: prospect.full_name })
  } catch (err) {
    console.error("[prospects]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
