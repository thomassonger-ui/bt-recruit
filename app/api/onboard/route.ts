import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || "bearteam2026"

export async function POST(req: NextRequest) {
  try {
    const { leadId, pw } = await req.json()

    if (pw !== DASHBOARD_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )

    // Fetch lead details
    const { data: lead, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single()

    if (error || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Update status to joined
    await supabase
      .from("leads")
      .update({ status: "joined" })
      .eq("id", leadId)

    const resend = new Resend(process.env.RESEND_API_KEY)
    const firstName = (lead.name || "there").split(" ")[0]

    // 1. Welcome email to agent
    await resend.emails.send({
      from: "Tom Songer <onboarding@resend.dev>",
      to: lead.email,
      subject: `Welcome to Bear Team, ${firstName}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;font-size:15px;line-height:1.7;color:#1A1A1A;">
          <div style="background:#0B1D3A;padding:24px 28px;border-radius:8px 8px 0 0;">
            <h2 style="color:#fff;margin:0;font-size:20px;">Welcome to Bear Team, ${firstName}.</h2>
          </div>
          <div style="border:1px solid #E5E7EB;border-top:none;border-radius:0 0 8px 8px;padding:28px;">
            <p>You made a good call. Here's exactly what happens next:</p>

            <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:20px;margin:20px 0;">
              <p style="margin:0 0 12px;font-weight:700;color:#0B1D3A;">Step 1 — License Transfer Form</p>
              <p style="margin:0;color:#374151;">You'll need to complete a license transfer with FREC. Beth will send you the form directly. It takes 3–5 business days. You can keep working your current deals the entire time — nothing stops.</p>
            </div>

            <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:20px;margin:20px 0;">
              <p style="margin:0 0 12px;font-weight:700;color:#0B1D3A;">Step 2 — BearTeam Academy</p>
              <p style="margin:0;color:#374151;">Once your license transfer is confirmed, you'll get access to BearTeam Academy — free, self-paced training covering your commission structure, transaction workflow, and compliance. Start with Course 1: Orientation.</p>
              <p style="margin:12px 0 0;"><a href="https://www.joinbearteam.com/academy" style="background:#0B1D3A;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Go to BearTeam Academy</a></p>
            </div>

            <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:8px;padding:20px;margin:20px 0;">
              <p style="margin:0 0 12px;font-weight:700;color:#0B1D3A;">Step 3 — Your First Deal</p>
              <p style="margin:0;color:#374151;">When you have a deal ready to submit, Scout is here to walk you through the transaction workflow. Everything is in the Academy — checklists, forms, deadlines. Your only cost is the $150 flat transaction fee at closing.</p>
            </div>

            <p>Questions before the paperwork arrives? Reply here or call me directly.</p>

            <p style="margin-top:28px;font-size:14px;color:#374151;">
              Tom Songer | Team Lead | Bear Team Real Estate<br>
              407-758-8102 | thomas.songer@gmail.com
            </p>
          </div>
        </div>
      `,
    })

    // 2. Alert Tom and Beth
    await resend.emails.send({
      from: "Scout <onboarding@resend.dev>",
      to: process.env.NOTIFY_EMAIL!,
      subject: `New agent joined — ${lead.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;">
          <div style="background:#1B8C3A;padding:20px 24px;border-radius:8px 8px 0 0;">
            <h2 style="color:#fff;margin:0;font-size:18px;">New Agent Joined Bear Team</h2>
          </div>
          <div style="border:1px solid #E5E7EB;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
            <table style="font-size:15px;border-collapse:collapse;width:100%;">
              <tr>
                <td style="padding:8px 16px 8px 0;color:#6B7280;">Name</td>
                <td style="padding:8px 0;font-weight:600;color:#0B1D3A;">${lead.name}</td>
              </tr>
              <tr style="background:#F9FAFB;">
                <td style="padding:8px 16px 8px 0;color:#6B7280;">Email</td>
                <td style="padding:8px 0;font-weight:600;color:#0B1D3A;">${lead.email}</td>
              </tr>
              <tr>
                <td style="padding:8px 16px 8px 0;color:#6B7280;">Phone</td>
                <td style="padding:8px 0;font-weight:600;color:#0B1D3A;">${lead.phone || "Not provided"}</td>
              </tr>
            </table>
            <div style="margin-top:20px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:6px;padding:16px;">
              <p style="margin:0;font-size:14px;font-weight:600;color:#166534;">Next step</p>
              <p style="margin:8px 0 0;font-size:14px;color:#374151;">Send ${firstName} the FREC license transfer form. Welcome email already sent to ${lead.email}.</p>
            </div>
            <p style="margin-top:16px;font-size:13px;color:#9CA3AF;">Triggered from Scout dashboard · Bear Team Real Estate</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Onboard error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
