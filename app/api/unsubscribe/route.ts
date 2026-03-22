import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/unsubscribe?id=[lead_id]
// Linked from footer of every drip email.
// Sets drip_unsubscribed = true and renders a confirmation page.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const leadId = searchParams.get("id")

  if (!leadId) {
    return new NextResponse(buildPage("Invalid link.", false), {
      headers: { "Content-Type": "text/html" },
    })
  }

  const { error } = await getSupabase()
    .from("leads")
    .update({
      drip_unsubscribed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)

  if (error) {
    console.error("Unsubscribe error:", error)
    return new NextResponse(buildPage("Something went wrong. Please reply to any email with 'stop' and we'll remove you manually.", false), {
      headers: { "Content-Type": "text/html" },
    })
  }

  return new NextResponse(buildPage("You've been unsubscribed.", true), {
    headers: { "Content-Type": "text/html" },
  })
}

function buildPage(message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribe — Bear Team Real Estate</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 40px 16px; }
    .card { max-width: 480px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; }
    .icon { font-size: 40px; margin-bottom: 16px; }
    h1 { color: #1a1a1a; font-size: 20px; margin: 0 0 12px; }
    p { color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
    .brand { color: #9ca3af; font-size: 13px; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? "✓" : "⚠️"}</div>
    <h1>${success ? "You're unsubscribed." : "Oops."}</h1>
    <p>${message}</p>
    ${success ? `<p style="color:#9ca3af;font-size:13px;">You won't receive any more recruiting emails from Bear Team Real Estate. If you change your mind, visit <a href="https://joinbearteam.com" style="color:#1a3a5c;">joinbearteam.com</a> anytime.</p>` : ""}
    <div class="brand">Bear Team Real Estate · Orlando, FL</div>
  </div>
</body>
</html>`
}
