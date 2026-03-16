import { NextResponse } from "next/server"
import twilio from "twilio"

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function POST() {
  try {
    await client.messages.create({
      body: "Someone is using Scout on joinbearteam.com",
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.NOTIFY_PHONE_NUMBER!,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
