import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function sig() {
  return `<p style="margin-top:24px;font-size:14px;color:#374151;">Tom Songer | Team Lead | Bear Team Real Estate<br>407-758-8102</p>`
}

function wrap(body: string) {
  return `<div style="font-family:sans-serif;max-width:520px;font-size:15px;line-height:1.7;color:#1A1A1A;">${body}</div>`
}

const DRIPS = [
  {
    day: 0,
    key: "drip_1",
    subject: (name: string) => `Good talking with you, ${name.split(" ")[0]}`,
    html: (firstName: string) => wrap(`
      <p>Appreciated the conversation today. A few things worth having in writing:</p>
      <p>Zero monthly fees. Zero desk fees. E&O covered by Bear Team. Your only cost is $150 flat at closing — the same whether the deal is $200K or $2M.</p>
      <p>Most agents are surprised by how much they're paying before a single deal closes. At Bear Team, a slow month costs you nothing.</p>
      <p>If you want to run the math on your specific numbers before deciding, reply here and I'll put it together for you.</p>
      ${sig()}
    `),
  },
  {
    day: 2,
    key: "drip_2",
    subject: () => `The number most agents don't check`,
    html: (firstName: string) => wrap(`
      <p>Quick question: what did you actually net last year after splits, fees, and E&O?</p>
      <p>Most agents know their GCI. Very few know what hits their bank account after everything comes out. The gap is usually $4,000–$12,000 — sometimes more.</p>
      <p>Bear Team's progressive tier model means you keep more at every level, and the tiers advance automatically when you produce. No negotiations. No politics. No reset games.</p>
      <p>If you want, reply with how many deals you closed last year and I'll show you exactly what that same production would have netted here.</p>
      ${sig()}
    `),
  },
  {
    day: 4,
    key: "drip_3",
    subject: () => `What agents usually ask before they move`,
    html: (firstName: string) => wrap(`
      <p>Three things come up in almost every conversation:</p>
      <p><strong>"Will I lose my pipeline?"</strong> — No. Your clients are your clients. You bring your relationships, your database, your sphere. Nothing changes on that side.</p>
      <p><strong>"How long does the switch take?"</strong> — One license transfer form with FREC. Typically 3–5 business days. You can keep working deals the entire time.</p>
      <p><strong>"What does onboarding look like?"</strong> — BearTeam Academy covers everything: commission structure, transaction workflow, compliance. Free, self-paced, built for agents who are already producing.</p>
      <p>What's the one thing holding you back right now?</p>
      ${sig()}
    `),
  },
  {
    day: 7,
    key: "drip_4",
    subject: () => `Leaving this with you`,
    html: (firstName: string) => wrap(`
      <p>I'm not going to keep filling your inbox. This is the last one.</p>
      <p>Bear Team is built for agents who are producing and want to keep more of what they earn — without monthly fees eating into slow months, without a cap they never hit, and without having to recruit to make the math work.</p>
      <p>If the timing isn't right, I get it. But if you want to take another look before the year moves forward, grab 10 minutes here: <a href="https://calendly.com/thomas-songer/60min" style="color:#0B1D3A;font-weight:600;">calendly.com/thomas-songer/60min</a></p>
      <p>Either way — good luck out there.</p>
      ${sig()}
    `),
  },
]

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
  const resend = new Resend(process.env.RESEND_API_KEY!)

  const { data: leads } = await supabase
    .from("leads")
    .select("id, name, email, event_end, notes")
    .eq("status", "completed")
    .neq("email", "")
    .not("event_end", "is", null)

  if (!leads || leads.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  const now = Date.now()
  let sent = 0

  for (const lead of leads) {
    const firstName = (lead.name || "there").split(" ")[0]
    const eventEnd = new Date(lead.event_end).getTime()
    const daysSinceCall = (now - eventEnd) / (1000 * 60 * 60 * 24)
    const hoursSinceCall = (now - eventEnd) / (1000 * 60 * 60)
    const sentDrips = (lead.notes || "").match(/drip_\d/g) || []

    for (const drip of DRIPS) {
      if (sentDrips.includes(drip.key)) continue

      const shouldSend = drip.day === 0 ? hoursSinceCall >= 2 : daysSinceCall >= drip.day
      if (!shouldSend) continue

      const { error } = await resend.emails.send({
        from: "Tom Songer <onboarding@resend.dev>",
        to: lead.email,
        subject: drip.subject(lead.name || "there"),
        html: drip.html(firstName),
      })

      if (!error) {
        const newNotes = `${lead.notes || ""} ${drip.key}`.trim()
        await supabase.from("leads").update({ notes: newNotes }).eq("id", lead.id)
        sent++
      }

      // One drip per lead per run
      break
    }
  }

  return NextResponse.json({ ok: true, sent })
}
