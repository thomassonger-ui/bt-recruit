import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);

const TOM_EMAIL = "thomas.songer@gmail.com";
const CALENDLY_LINK = "https://calendly.com/thomas-songer/bear-team-meet";
const FROM_EMAIL = "Tom Songer <tom@joinbearteam.com>";
const REPLY_TO = "thomas.songer@gmail.com";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data: coldLeads, error } = await supabase
    .from("leads")
    .select("id, name, email, phone, brokerage, created_at")
    .eq("stage", "scout_captured")
    .lt("created_at", cutoff);

  if (error) {
    console.error("Cold cron Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!coldLeads || coldLeads.length === 0) {
    return NextResponse.json({ sent: 0, message: "No cold leads found" });
  }

  let sent = 0;
  const recovered: string[] = [];

  for (const lead of coldLeads) {
    const firstName = lead.name?.split(" ")[0] || "there";

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        replyTo: REPLY_TO,
        to: lead.email,
        subject: `Still open to a quick conversation?`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
            <p>Hi ${firstName},</p>
            <p>I know you're busy — just wanted to make sure my earlier message didn't get buried.</p>
            <p>I'm Tom Songer, Team Lead at <strong>Bear Team Real Estate</strong> in Orlando.
            We're a boutique brokerage built specifically for producing agents who are tired of
            high fees and low support.</p>
            <p>A few things that might be worth 15 minutes of your time:</p>
            <ul>
              <li>Progressive commission tiers: 60/40 &rarr; 70/30 &rarr; 80/20 &rarr; 90/10</li>
              <li>$16,000 cap, then you advance automatically</li>
              <li>Zero monthly fees. Zero desk fees. Zero tech fees.</li>
              <li>E&amp;O fully covered. Only cost: $150 flat per closing.</li>
            </ul>
            <p>If any of that sounds interesting, grab 15 minutes on my calendar.</p>
            <p>
              <a href="${CALENDLY_LINK}"
                 style="display:inline-block;background:#1a3a5c;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">
                Schedule 15 Minutes
              </a>
            </p>
            <p>Either way — best of luck with your business this spring.</p>
            <p>
              Tom Songer<br>
              <em>Team Lead | Bear Team Real Estate</em><br>
              <a href="https://joinbearteam.com" style="color:#1a3a5c;">joinbearteam.com</a>
            </p>
          </div>
        `,
      });

      await supabase
        .from("leads")
        .update({
          stage: "cold_recovery",
          last_contact: new Date().toISOString(),
        })
        .eq("id", lead.id);

      sent++;
      recovered.push(`${lead.name} <${lead.email}>`);
    } catch (emailErr) {
      console.error(`Failed cold recovery for ${lead.email}:`, emailErr);
    }
  }

  if (sent > 0) {
    const leadRows = recovered.map((l) => `<li>${l}</li>`).join("");
    await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to: TOM_EMAIL,
      subject: `🧊 ${sent} lead${sent > 1 ? "s" : ""} went cold — recovery email sent`,
      html: `
        <p><strong>${sent} lead${sent > 1 ? "s" : ""} had no booking after 48 hours.</strong>
        A re-engagement email was sent automatically to each.</p>
        <ul>${leadRows}</ul>
        <p>Stage updated to <code>cold_recovery</code>.
        View in your <a href="https://joinbearteam.com/dashboard">dashboard</a>.</p>
        <p style="color:#888;font-size:12px;">— Scout Automation | Bear Team Real Estate</p>
      `,
    }).catch(() => {});
  }

  return NextResponse.json({
    sent,
    recovered,
    message: `Cold recovery complete. ${sent} email${sent !== 1 ? "s" : ""} sent.`,
  });
}
