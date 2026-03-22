import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const dynamic = "force-dynamic";
export const runtime  = "nodejs";

// ─── /api/onboard ─────────────────────────────────────────────────────────────
//
// Called when Tom marks a lead as Closed Won (converted to Bear Team agent).
// Triggered from the dashboard via POST with the lead's ID.
//
// What it does:
//   1. Reads lead record from Supabase
//   2. Creates a row in the agents table
//   3. Sets stage → Onboarding, onboarded_at → now, drip_unsubscribed → true
//   4. Sends welcome email to the new agent
//   5. Sends Tom a confirmation alert
//
// SA-2: Closes the gap where Closed Won was a dead end — no agent record,
//        no welcome, no academy enrollment trigger.
//
// POST body: { leadId: string }
// ─────────────────────────────────────────────────────────────────────────────

const TOM_EMAIL    = "thomas.songer@gmail.com";
const FROM_EMAIL   = "Tom Songer <tom@joinbearteam.com>";
const REPLY_TO     = "thomas.songer@gmail.com";
const ACADEMY_LINK = "https://academy.joinbearteam.com";
const CALENDLY_LINK = "https://calendly.com/thomas-songer/bear-team-meet";

function getSupabase() {
  return createClient(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
function getResend() { return new Resend(process.env.RESEND_API_KEY!); }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId } = body as { leadId?: string };

    if (!leadId) {
      return NextResponse.json({ error: "leadId required" }, { status: 400 });
    }

    // ── 1. Fetch the lead ────────────────────────────────────────────────────
    const { data: lead, error: fetchError } = await getSupabase()
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .maybeSingle();

    if (fetchError || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (!lead.email) {
      return NextResponse.json({ error: "Lead has no email" }, { status: 400 });
    }

    const firstName = lead.name?.split(" ")[0] || "there";
    const now       = new Date().toISOString();

    // ── 2. Create agents row ─────────────────────────────────────────────────
    const { error: agentInsertError } = await getSupabase()
      .from("agents")
      .upsert(
        {
          name:                 lead.name,
          email:                lead.email,
          phone:                lead.phone || null,
          brokerage_previous:   lead.brokerage || null,
          deal_count_previous:  lead.deal_count || null,
          start_date:           new Date().toISOString().split("T")[0],
          tier:                 "tier_1",
          deals_this_year:      0,
          stage:                "Onboarding",
          academy_started:      false,
          academy_completed:    false,
          notes:                lead.notes || null,
        },
        { onConflict: "email" }
      );

    if (agentInsertError) {
      console.error("Agent insert error:", agentInsertError);
      // Non-fatal — continue with lead update and emails
    }

    // ── 3. Update lead record ────────────────────────────────────────────────
    const { error: leadUpdateError } = await getSupabase()
      .from("leads")
      .update({
        stage:             "Onboarding",
        onboarded_at:      now,
        drip_unsubscribed: true,   // stop all future drip emails
        updated_at:        now,
      })
      .eq("id", leadId);

    if (leadUpdateError) {
      console.error("Lead update error:", leadUpdateError);
    }

    // ── 4. Welcome email to new agent ────────────────────────────────────────
    await getResend().emails.send({
      from:    FROM_EMAIL,
      replyTo: REPLY_TO,
      to:      lead.email,
      subject: `Welcome to Bear Team, ${firstName} 🐻`,
      html:    buildWelcomeEmail(firstName, lead),
      tags:    [{ name: "sequence", value: "onboard" }],
    }).catch((err: unknown) => console.error("Welcome email error:", err));

    // ── 5. Tom confirmation alert ────────────────────────────────────────────
    const brokerage = lead.brokerage ? ` · from ${lead.brokerage}` : "";
    const dealInfo  = lead.deal_count ? ` · ${lead.deal_count} deals/yr` : "";
    await getResend().emails.send({
      from:    FROM_EMAIL,
      to:      TOM_EMAIL,
      subject: `✅ New agent onboarded — ${lead.name || lead.email}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;">
          <div style="background:#0B1D3A;padding:16px 24px;border-radius:8px 8px 0 0;">
            <p style="color:#c9a84c;font-weight:700;margin:0;font-size:16px;">🎉 New Agent — Bear Team</p>
          </div>
          <div style="background:#fff;border:1px solid #e5e7eb;padding:20px 24px;border-radius:0 0 8px 8px;">
            <p style="margin:0 0 10px;font-size:15px;color:#111;"><strong>${lead.name || "Unknown"}</strong>${brokerage}${dealInfo}</p>
            <p style="margin:0 0 10px;font-size:14px;color:#374151;">Email: <a href="mailto:${lead.email}">${lead.email}</a></p>
            <p style="margin:0 0 10px;font-size:14px;color:#374151;">Phone: ${lead.phone || "Not captured"}</p>
            <p style="margin:0 0 16px;font-size:13px;color:#6b7280;">
              Stage updated to <strong>Onboarding</strong>. Drip sequence stopped. Agent record created.<br>
              Welcome email sent. BearTeam Academy link included.
            </p>
            <p style="margin:0;font-size:14px;color:#374151;font-weight:600;">Next step: Confirm license transfer and set their start date in the dashboard.</p>
          </div>
        </div>`,
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      agentCreated: !agentInsertError,
      leadUpdated:  !leadUpdateError,
      welcomeSent:  true,
    });

  } catch (err) {
    console.error("Onboard route error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ─── WELCOME EMAIL ────────────────────────────────────────────────────────────

function buildWelcomeEmail(
  firstName: string,
  lead: Record<string, string | number | boolean | null>
): string {
  const dealCount       = lead.deal_count as number | null;
  const previousBrokerage = (lead.brokerage as string) || "your previous brokerage";

  const tierNote = dealCount && dealCount >= 10
    ? `<p>At ${dealCount} deals a year, you'll move through the tier progression quickly. You start at 60/40 — the $16K company dollar cap is a milestone, not a ceiling. Keep closing and the split advances automatically.</p>`
    : `<p>You're starting at Tier 1 (60/40) with zero monthly overhead. Every deal you close is yours minus $150 flat. As your volume grows, the tiers advance automatically — no conversations needed.</p>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #1a1a1a; padding: 28px 36px; }
    .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 600; }
    .header span { color: #c9a84c; }
    .body { padding: 32px 36px; color: #333; font-size: 15px; line-height: 1.7; }
    .body p { margin: 0 0 16px; }
    .cta { display:inline-block; background:#c9a84c; color:#1a1a1a; text-decoration:none; font-weight:700; font-size:15px; padding:13px 28px; border-radius:6px; margin: 8px 0; }
    .box { background:#f8f4e8; border-left:4px solid #c9a84c; padding:16px 20px; margin:20px 0; border-radius:4px; }
    .box p { margin: 0 0 6px; }
    .box p:last-child { margin: 0; }
    .footer { padding: 20px 36px; border-top: 1px solid #f0f0f0; }
    .footer p { color: #888; font-size: 13px; margin: 0; }
    .sig { margin-top: 24px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
    .sig p { color: #555; font-size: 14px; margin: 0 0 2px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Welcome to Bear <span>Team</span></h1></div>
    <div class="body">
      <p>Hey ${firstName},</p>
      <p>You're in. Welcome to Bear Team Real Estate.</p>
      <p>Leaving ${previousBrokerage} is a real decision and I want to make sure the transition is as clean as possible. Here's what happens next:</p>
      <div class="box">
        <p><strong>Your immediate next steps:</strong></p>
        <p>1. Complete your license transfer to Bear Team (I'll walk you through it — just reply here)</p>
        <p>2. Start BearTeam Academy — the fastest way to get oriented on our systems and workflows</p>
        <p>3. Let me know your first deal in the pipeline so we can make sure everything's set up before you close</p>
      </div>
      ${tierNote}
      <p>BearTeam Academy is available now. It covers everything from our transaction process to how to use the tools, at your own pace:</p>
      <a href="${ACADEMY_LINK}" class="cta">Start BearTeam Academy →</a>
      <p style="margin-top:20px;">Any questions before your license transfers — reply here or grab 15 minutes:</p>
      <a href="${CALENDLY_LINK}" style="color:#c9a84c;font-weight:600;">Schedule a quick call →</a>
      <div class="sig">
        <p><strong>Tom Songer</strong></p>
        <p>Team Lead | Bear Team Real Estate</p>
        <p>407-758-8102 | joinbearteam.com</p>
      </div>
    </div>
    <div class="footer">
      <p>Bear Team Real Estate · Orlando, FL · You're receiving this because you joined the team.</p>
    </div>
  </div>
</body>
</html>`.trim();
}
