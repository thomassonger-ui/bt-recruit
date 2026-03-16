import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: "Scout <onboarding@resend.dev>",
      to: process.env.NOTIFY_EMAIL!,
      subject: "Someone is using Scout",
      html: `<p>Someone just started chatting with Scout on <strong>joinbearteam.com</strong>.</p><p style="color:#6B7280;font-size:13px;">This is an automated notification from your BearTeam website.</p>`,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
