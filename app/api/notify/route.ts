import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(req: NextRequest) {
  // Only accept requests originating from our own domain (or Vercel preview URLs).
  // This isn't cryptographic auth, but it blocks random open-internet spam.
  // For stronger protection, move this call server-side into /api/chat.
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
