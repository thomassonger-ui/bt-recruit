import { NextRequest, NextResponse } from "next/server"

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
    const apiKey = process.env.SENDGRID_API_KEY
    if (!apiKey) {
      console.error("[notify] SENDGRID_API_KEY not set")
      return NextResponse.json({ ok: false }, { status: 500 })
    }
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: process.env.NOTIFY_EMAIL! }] }],
        from: { email: "thomas.songer@gmail.com", name: "Scout" },
        reply_to: { email: "thomas.songer@gmail.com" },
        subject: "Someone is using Scout",
        content: [{
          type: "text/html",
          value: `<p>Someone just started chatting with Scout on <strong>joinbearteam.com</strong>.</p><p style="color:#6B7280;font-size:13px;">This is an automated notification from your BearTeam website.</p>`,
        }],
      }),
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
