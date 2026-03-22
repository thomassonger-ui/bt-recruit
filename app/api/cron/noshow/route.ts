import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Lazy init — avoids build-time crash
function getSupabase() {
  return createClient(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getResend() { return new Resend(process.env.RESEND_API_KEY!); }

const TOM_EMAIL = "thomas.songer@gmail.com";
const TOM_PHONE = "407-758-8102";
const CALENDLY_LINK = "https://calendly.com/thomas-songer/bear-team-meet";
const FROM_EMAIL = "Scout <scout@joinbearteam.com>";

// ─── NO-SHOW DETECTION LOGIC ──────────────────────────────────────────────────
//
// A lead is a no-show if ALL of these are true:
// 1. event_end is in the past (the call window has passed)
// 2. event_end was within the last 2 hours (avoid re-triggering old no-shows)
// 3. stage is NOT 'Closed Won' or 'Closed Lost'
// 4. noshow_followup_sent is NULL or false
//
// Fix 3-A: Supabase is updated BEFORE sending emails so that if the email
// send fails, the lead is already marked as processed. This prevents the drip
// cron from treating a no-show as a completed call the next morning.
//
// Cron runs every 30 minutes via vercel.json cron config.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized triggers
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // Find no-show leads: event ended, within last 2 hours, not yet followed up
    const { data: noShows, error } = await getSupabase()
      .from("leads")
      .select("*")
      .lt("event_end", now.toISOString())       // call window has passed
      .gt("event_end", twoHoursAgo.toISOString()) // within last 2 hours
      .not("stage", "in", '("Closed Won","Closed Lost")')
      .or("noshow_followup_sent.is.null,noshow_followup_sent.eq.false");

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json({ error: "DB query failed" }, { status: 500 });
    }

    if (!noShows || noShows.length === 0) {
      return NextResponse.json({ message: "No no-shows found", processed: 0 });
    }

    const results = [];

    for (const lead of noShows) {
      const firstName = lead.name?.split(" ")[0] || "there";

      // ── FIX 3-A: Mark as processed FIRST, then send emails ───────────────
      // This prevents the drip cron from picking up this lead the next morning
      // if the email send fails. Worst case: marked sent but email failed
      // (recoverable). Without this, a failed email leaves noshow_followup_sent
      // null and drip fires a warm "Great talking with you" to someone you
      // never actually spoke to.
      const { error: updateError } = await getSupabase()
        .from("leads")
        .update({
          noshow_followup_sent: true,
          noshow_followup_at: now.toISOString(),
          stage: "Follow-Up Queue",
          updated_at: now.toISOString(),
        })
        .eq("id", lead.id);

      if (updateError) {
        console.error(`Failed to mark no-show for ${lead.email}:`, updateError);
        continue; // skip this lead if we can't update — safer than proceeding
      }

      // ── Email to recruit ──────────────────────────────────────────────────
      const recruitEmail = buildRecruitEmail(firstName, lead.email);
      const { error: recruitEmailError } = await getResend().emails.send({
        from: FROM_EMAIL,
        to: lead.email,
        subject: `We missed you today, ${firstName}`,
        html: recruitEmail,
      });

      if (recruitEmailError) {
        console.error(`Failed to send recruit email to ${lead.email}:`, recruitEmailError);
        // Lead already marked — Tom still gets notified below, can follow up manually
      }

      // ── Notification email to Tom ─────────────────────────────────────────
      const tomEmail = buildTomNotificationEmail(lead);
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: TOM_EMAIL,
        subject: `[No-Show] ${lead.name || lead.email} missed their call`,
        html: tomEmail,
      });

      results.push({ email: lead.email, name: lead.name, status: "followup_sent" });
    }

    console.log(`No-show cron: processed ${results.length} leads`, results);
    return NextResponse.json({ processed: results.length, results });

  } catch (err) {
    console.error("No-show cron error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ─── EMAIL TEMPLATES ──────────────────────────────────────────────────────────

function buildRecruitEmail(firstName: string, email: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #1a1a1a; padding: 28px 36px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.3px; }
    .header span { color: #c9a84c; }
    .body { padding: 36px; }
    .body p { color: #333333; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .cta { display: block; background: #c9a84c; color: #1a1a1a; text-decoration: none; font-weight: 700; font-size: 15px; text-align: center; padding: 14px 28px; border-radius: 6px; margin: 28px 0; }
    .footer { padding: 20px 36px; border-top: 1px solid #f0f0f0; }
    .footer p { color: #888888; font-size: 13px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bear <span>Team</span> Real Estate</h1>
    </div>
    <div class="body">
      <p>Hey ${firstName},</p>
      <p>We had a 15-minute call on the calendar today — looks like you weren't able to make it. No problem at all.</p>
      <p>I wanted to make sure this didn't fall through the cracks. A lot of agents are surprised when they actually run the numbers on what they'd net at Bear Team vs. where they are now — and I'd hate for you to miss that conversation.</p>
      <p>Grab another slot whenever works for you:</p>
      <a href="${CALENDLY_LINK}" class="cta">Schedule a New 15-Minute Call →</a>
      <p>Or if it's easier, just reply to this email and we'll figure out a time directly.</p>
      <p>Either way — no pressure, no pitch. Just 15 minutes and the math.</p>
      <p style="margin-bottom: 4px;">Tom Songer</p>
      <p style="color: #888; font-size: 13px; margin: 0;">Team Lead | Bear Team Real Estate | ${TOM_PHONE}</p>
    </div>
    <div class="footer">
      <p>Bear Team Real Estate · Orlando, FL · joinbearteam.com</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function buildTomNotificationEmail(lead: Record<string, string | number | boolean | null>): string {
  const name = lead.name || "Unknown";
  const email = lead.email || "No email";
  const phone = lead.phone || "No phone";
  const brokerage = lead.brokerage || "Unknown brokerage";
  const dealCount = lead.deal_count ?? "Unknown";
  const eventStart = lead.event_start
    ? new Date(lead.event_start as string).toLocaleString("en-US", { timeZone: "America/New_York" })
    : "Unknown";

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #c0392b; padding: 20px 28px; }
    .header h1 { color: #fff; margin: 0; font-size: 17px; font-weight: 600; }
    .body { padding: 28px; }
    .row { display: flex; margin-bottom: 12px; }
    .label { color: #888; font-size: 13px; width: 120px; flex-shrink: 0; padding-top: 2px; }
    .value { color: #222; font-size: 14px; font-weight: 500; }
    .cta { display: inline-block; background: #1a1a1a; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 10px 20px; border-radius: 5px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ No-Show Alert — Follow-up sent automatically</h1>
    </div>
    <div class="body">
      <div class="row"><div class="label">Name</div><div class="value">${name}</div></div>
      <div class="row"><div class="label">Email</div><div class="value">${email}</div></div>
      <div class="row"><div class="label">Phone</div><div class="value">${phone}</div></div>
      <div class="row"><div class="label">Brokerage</div><div class="value">${brokerage}</div></div>
      <div class="row"><div class="label">Deal Count</div><div class="value">${dealCount}</div></div>
      <div class="row"><div class="label">Call Was At</div><div class="value">${eventStart} ET</div></div>
      <div class="row"><div class="label">Stage</div><div class="value">→ Follow-Up Queue</div></div>
      <p style="color: #555; font-size: 14px; margin-top: 20px;">A follow-up email was sent to ${email} automatically. If you want to reach out personally, their phone is above.</p>
      <a href="https://supabase.com/dashboard/project/bbithigafmsyzlmuaokw/editor" class="cta">View in Supabase →</a>
    </div>
  </div>
</body>
</html>
  `.trim();
}
