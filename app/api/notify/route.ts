import { NextRequest, NextResponse } from "next/server"


// ─── SENDGRID EMAIL HELPER ────────────────────────────────────────────────────
async function sendEmail({
  to, from: fromAddr, replyTo, subject, html
}: {
  to: string
  from: string
  replyTo?: string
  subject: string
  html: string
}): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) { console.error("[sendEmail] SENDGRID_API_KEY not set"); return }
  const body: Record<string, unknown> = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: fromAddr },
    subject,
    content: [{ type: "text/html", value: html }],
  }
  if (replyTo) body.reply_to = { email: replyTo }
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errText = await res.text()
    console.error(`[sendEmail] SendGrid error ${res.status}:`, errText)
  } else {
    console.log(`[sendEmail] Sent OK to ${to}`)
  }
}
// ─────────────────────────────────────────────────────────────────────────────

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
        await sendEmail({
      from: "Scout <tom@bearteam.com>",
      to: process.env.NOTIFY_EMAIL!,
      subject: "Someone is using Scout",
      html: `<p>Someone just started chatting with Scout on <strong>joinbearteam.com</strong>.</p><p style="color:#6B7280;font-size:13px;">This is an automated notification from your BearTeam website.</p>`,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
