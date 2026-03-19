import { NextRequest, NextResponse } from "next/server"

// ─── AVAILABILITY ROUTE ───────────────────────────────────────────────────────
// Fetches real available time slots from Calendly for Tom's 60min event
// Called by the chat route to inject live availability into Scout's context

const CALENDLY_TOKEN = process.env.CALENDLY_TOKEN!
const EVENT_TYPE_URI = "https://api.calendly.com/event_types/9770e03a-6a12-4594-b639-08ffa49da25c"
const USER_URI = "https://api.calendly.com/users/c25d94e3-b7dd-4323-80e1-c6887c55aae3"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get("days") || "5")

    const now = new Date()
    const start = now.toISOString()
    const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString()

    const res = await fetch(
      `https://api.calendly.com/event_type_available_times?event_type=${encodeURIComponent(EVENT_TYPE_URI)}&start_time=${encodeURIComponent(start)}&end_time=${encodeURIComponent(end)}`,
      {
        headers: {
          Authorization: `Bearer ${CALENDLY_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    )

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ slots: [], error: data.message }, { status: 500 })
    }

    // Format slots for Scout to present inline
    const slots = (data.collection || []).slice(0, 8).map((slot: {
      start_time: string
      scheduling_url: string
      status: string
    }) => {
      const dt = new Date(slot.start_time)
      const label = dt.toLocaleString("en-US", {
        timeZone: "America/New_York",
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      return {
        label,
        start_time: slot.start_time,
        booking_url: slot.scheduling_url,
      }
    })

    return NextResponse.json({ slots })
  } catch (error) {
    console.error("Availability error:", error)
    return NextResponse.json({ slots: [], error: "Failed to fetch availability" }, { status: 500 })
  }
}
