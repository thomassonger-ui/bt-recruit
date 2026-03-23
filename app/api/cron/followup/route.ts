import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWrite } from "@/lib/db/verifyWrite";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getSupabase() {
  return createClient(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
function getResend() { return { emails: { send: sendEmail } } as any // replaced; }

const TOM_EMAIL = "tom@bearteam.com";
const CALENDLY_LINK = "https://calendly.com/thomas-songer/bear-team-meet";
const FROM_EMAIL = "Tom Songer <tom@bearteam.com>";
const REPLY_TO = "tom@bearteam.com";

// ─── FOLLOW-UP DATE TRIGGER ────────────────────────────────────────────────────
//
// Priority 1 personalization fix: reads the follow_up_date field Tom sets manually
// post-call (e.g., "check back at their April renewal"). Fires a personalized
// re-engagement email on the exact date Tom flagged — higher intent than any
// scheduled drip step because Tom set it based on a real conversation.
//
// Query: leads where follow_up_date = today AND drip_unsubscribed = false
//        AND stage NOT IN (Closed Won, Closed Lost, Active Convo, Onboarding)
//
// TICKET-04: write-verify-send pattern enforced.
//   follow_up_date is cleared and last_contact is written BEFORE the email send.
//   verifyWrite confirms drip_unsubscribed=false and follow_up_date=null after
//   the write, before any Resend call. If verification fails, send is skipped.
//   This prevents a retry from double-sending if the cron re-runs mid-execution.
//
// Cron runs daily at 9 AM ET (13:00 UTC) — after drip (12:00 UTC) so they
// don't overlap on the same lead on the same day.
// ─────────────────────────────────────────────────────────────────────────────


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

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    // Match follow_up_date = today (date only, not timestamp)
    const todayDate = now.toISOString().split("T")[0]; // "YYYY-MM-DD"

    // SW-6 fix: added noshow_followup_sent filter.
    // A no-show lead can have follow_up_date set by Tom and sit in Follow-Up Queue.
    // Without this guard, they'd receive a re-engagement email with a math block
    // framed as post-call follow-up — after already receiving a no-show email.
    // The messaging sequence would be jarring and out of order.
    // noshow_followup_sent = true means the no-show path already owns this lead's
    // next touchpoint; the followup cron should not also fire.
    const { data: leads, error } = await getSupabase()
      .from("leads")
      .select("*")
      .eq("follow_up_date", todayDate)
      .eq("drip_unsubscribed", false)
      .or("noshow_followup_sent.is.null,noshow_followup_sent.eq.false")  // SW-6 fix
      .not("stage", "in", '("Closed Won","Closed Lost","Active Convo","Onboarding")')
      .not("email", "is", null)
      .neq("email", "");

    if (error) {
      console.error("Follow-up date cron query error:", error);
      return NextResponse.json({ error: "DB query failed" }, { status: 500 });
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ processed: 0, message: "No follow-up dates due today" });
    }

    const results = [];

    for (const lead of leads) {
      const firstName = lead.name?.split(" ")[0] || "there";
      const brokerage = lead.brokerage || "your current brokerage";
      const dealCount = lead.deal_count as number | null;
      const avgPrice = (lead.avg_price as number) || 415000;

      // ── Personalized math block if deal_count is known ───────────────────
      let mathBlock = "";
      if (dealCount && dealCount > 0) {
        const commission = 0.025;
        const gci = avgPrice * commission;
        const netTier1 = Math.round(gci * 0.6 * dealCount - dealCount * 150);
        const netTier2 = Math.round(gci * 0.7 * dealCount - dealCount * 150);
        const priceLabel = lead.avg_price ? `$${avgPrice.toLocaleString()} avg` : `$${avgPrice.toLocaleString()} Orlando avg`;
        mathBlock = `
          <div style="background:#f8f4e8;border-left:4px solid #c9a84c;padding:14px 18px;margin:16px 0;border-radius:4px;">
            <p style="margin:0 0 6px;font-weight:600;color:#1a1a1a;font-size:14px;">Your numbers — ${dealCount} deals · ${priceLabel}:</p>
            <p style="margin:0 0 4px;color:#333;font-size:14px;">Tier 1 (60/40): $${netTier1.toLocaleString()} net after $150/deal fee</p>
            <p style="margin:0 0 4px;color:#333;font-size:14px;">Tier 2 (70/30): $${netTier2.toLocaleString()} — kicks in at $16K company dollar</p>
            <p style="margin:0;color:#888;font-size:12px;">Zero monthly fees. Zero desk fees. Only pay when you close.</p>
          </div>`;
      }

      const html = buildFollowUpEmail(firstName, brokerage, mathBlock, lead.id as string);

      // ── TICKET-04: Write BEFORE send ──────────────────────────────────────
      // Clear follow_up_date and record last_contact before dispatching email.
      // This prevents a cron retry from re-queuing this lead (follow_up_date = null
      // means the query above won't pick them up again). Idempotent: worst case is
      // the email doesn't send but the follow_up_date is cleared — Tom can re-set it.
      const { error: writeError } = await getSupabase()
        .from("leads")
        .update({
          last_contact: now.toISOString(),
          follow_up_date: null,  // cleared before send so retries can't re-fire
          updated_at: now.toISOString(),
        })
        .eq("id", lead.id);

      if (writeError) {
        console.error(`Follow-up write failed for ${lead.email}:`, writeError);
        continue; // do not send if we can't record the state change
      }

      // ── TICKET-04: Verify write before sending ────────────────────────────
      // Confirms follow_up_date is cleared and drip_unsubscribed is still false.
      // If the write failed silently (RLS, constraint), the verify catches it here.
      const isVerified = await verifyWrite({
        supabase: getSupabase(),
        table: "leads",
        match: { id: lead.id },
        expected: {
          follow_up_date: null,
          drip_unsubscribed: false,
        },
      });

      if (!isVerified) {
        console.error("WRITE VERIFICATION FAILED", {
          route: "followup",
          leadId: lead.id,
        });
        continue; // skip send — state not confirmed
      }

      // Verification passed — safe to send
      const { error: emailError } = await getResend().emails.send({
        from: FROM_EMAIL,
        replyTo: REPLY_TO,
        to: lead.email,
        subject: `Checking back in, ${firstName}`,
        html,
      });

      if (emailError) {
        console.error(`Follow-up email failed for ${lead.email}:`, emailError);
        continue;
      }

      results.push({ name: lead.name, email: lead.email });
    }

    // Alert Tom so he knows these landed today
    if (results.length > 0) {
      const rows = results.map(r => `<li style="margin-bottom:4px;">${r.name || r.email} &lt;${r.email}&gt;</li>`).join("");
      await getResend().emails.send({
        from: FROM_EMAIL,
        replyTo: REPLY_TO,
        to: TOM_EMAIL,
        subject: `[Follow-Up Sent] ${results.length} scheduled re-engagement email${results.length > 1 ? "s" : ""} fired today`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;">
            <div style="background:#1a1a1a;padding:14px 20px;border-radius:6px 6px 0 0;">
              <p style="color:#c9a84c;font-weight:700;margin:0;">📅 Follow-Up Date Trigger Fired</p>
            </div>
            <div style="background:#fff;border:1px solid #e5e7eb;padding:18px 20px;border-radius:0 0 6px 6px;">
              <p style="margin:0 0 12px;font-size:14px;color:#374151;">These leads had a <strong>follow_up_date</strong> set to today. A personalized re-engagement email was sent to each.</p>
              <ul style="font-size:13px;color:#374151;padding-left:20px;">${rows}</ul>
              <p style="margin:12px 0 0;font-size:13px;color:#6b7280;">follow_up_date cleared — won't re-fire tomorrow. View leads in your <a href="https://joinbearteam.com/dashboard">dashboard</a>.</p>
            </div>
          </div>`,
      }).catch(() => {});
    }

    return NextResponse.json({ processed: results.length, results });

  } catch (err) {
    console.error("Follow-up date cron error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function buildFollowUpEmail(
  firstName: string,
  brokerage: string,
  mathBlock: string,
  leadId: string
): string {
  const unsubLink = `<a href="https://joinbearteam.com/api/unsubscribe?id=${leadId}" style="color:#aaa;text-decoration:underline;">Unsubscribe</a>`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #1a1a1a; padding: 24px 36px; }
    .header h1 { color: #fff; margin: 0; font-size: 18px; font-weight: 600; }
    .header span { color: #c9a84c; }
    .body { padding: 32px 36px; color: #333; font-size: 15px; line-height: 1.7; }
    .body p { margin: 0 0 16px; }
    .sig { margin-top: 24px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
    .sig p { color: #555; font-size: 14px; margin: 0 0 2px; }
    .footer { padding: 20px 36px; border-top: 1px solid #f0f0f0; }
    .footer p { color: #888; font-size: 13px; margin: 0 0 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Bear <span>Team</span> Real Estate</h1></div>
    <div class="body">
      <p>Hey ${firstName},</p>
      <p>We spoke a while back about what a move from ${brokerage} to Bear Team might look like. You mentioned the timing wasn't quite right — I wanted to check back in now that some time has passed.</p>
      <p>Nothing has changed on our end: zero monthly fees, zero desk fees, $150 flat per closing, and a clean path to 80/20 and 90/10 splits for producers.</p>
      ${mathBlock}
      <p>If you're heading into a renewal or just reassessing your setup, 15 minutes is all it takes to run the math side by side: <a href="${CALENDLY_LINK}" style="color:#c9a84c;font-weight:600;">Schedule a call →</a></p>
      <p>If the timing still isn't right, no problem — just reply and let me know.</p>
      <div class="sig">
        <p><strong>Tom Songer</strong></p>
        <p>Team Lead | Bear Team Real Estate</p>
        <p>407-758-8102 | joinbearteam.com</p>
      </div>
    </div>
    <div class="footer">
      <p>Bear Team Real Estate · Orlando, FL</p>
      <p style="font-size:12px;color:#aaa;">Licensed under Bethanne Baer, Broker/Owner</p>
      <p style="font-size:12px;color:#aaa;">${unsubLink}</p>
    </div>
  </div>
</body>
</html>`.trim();
}
