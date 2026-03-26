import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Lazy init — avoids build-time crash
function getSupabase() {
  return createClient(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function sendEmail(to: string, subject: string, html: string, replyTo?: string): Promise<{ error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) { console.error("[onboard] SENDGRID_API_KEY not set"); return { error: "SENDGRID_API_KEY not set" }; }
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "tom@bearteam.com", name: "Tom Songer" },
      ...(replyTo ? { reply_to: { email: replyTo } } : {}),
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  });
  if (!res.ok) { return { error: `SendGrid error ${res.status}` }; }
  return {};
}

const TOM_EMAIL = "tom@bearteam.com";
const TOM_PHONE = "407-758-8102";
const ACADEMY_URL = "https://academy.joinbearteam.com";
const BEARTEAMOS_URL = "https://www.joinbearteam.com";
const FROM_EMAIL = "Tom Songer <tom@bearteam.com>";
const REPLY_TO = "tom@bearteam.com";

// ─── POST /api/onboard ────────────────────────────────────────────────────────
//
// Triggered two ways:
//
// 1. MANUALLY by Tom — POST with { email } when he marks an agent as Closed Won
//    Example: curl -X POST /api/onboard -d '{"email":"agent@example.com"}'
//
// 2. AUTOMATICALLY via Supabase Database Webhook — when leads.stage = 'Closed Won'
//    Supabase sends a POST to this endpoint with the full row as payload.
//
// What it does:
// - Sends welcome email to new agent with first steps + Academy link
// - Sends Tom a new agent alert with full profile
// - Updates lead stage to 'Onboarding' in Supabase
// - Stops the nurture drip (sets drip_stopped = true)
// - Creates agent record in agents table (if it exists)
// - Writes an agent .txt file to BearTeamOS/_new-agents/ trigger folder
//   (picked up by Cowork COWORK_INSTRUCTIONS.md workflow)
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Password check when called from dashboard UI
    if (body.pw && body.pw !== process.env.DASHBOARD_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Support three call patterns:
    // 1. Dashboard UI:        { leadId, pw }
    // 2. Direct/curl:         { email }
    // 3. Supabase webhook:    { record: { ...full row } }
    const lead = body.record || body;
    const leadId = body.leadId || lead.leadId;
    const email = lead.email;

    if (!leadId && !email) {
      return NextResponse.json({ error: "No leadId or email provided" }, { status: 400 });
    }

    // Fetch the full lead record by leadId or email
    let agentData = lead;
    if (leadId || !lead.name) {
      const query = getSupabase().from("leads").select("*");
      const { data, error } = leadId
        ? await query.eq("id", leadId).single()
        : await query.eq("email", email.toLowerCase().trim()).single();

      if (error || !data) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
      agentData = data;
    }

    const firstName = agentData.name?.split(" ")[0] || "there";
    const fullName = agentData.name || email;
    const phone = agentData.phone || "Not provided";
    const brokerage = agentData.brokerage || "Not provided";
    const dealCount = agentData.deal_count ?? "Unknown";
    const now = new Date();

    // ── 1. Send welcome email to new agent ───────────────────────────────────
    const { error: welcomeEmailError } = await sendEmail(
      email,
      `Welcome to Bear Team, ${firstName} — here's your first step`,
      buildWelcomeEmail(firstName, fullName),
      REPLY_TO,
    );

    if (welcomeEmailError) {
      console.error("Welcome email error:", welcomeEmailError);
      return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 });
    }

    // ── 2. Send Tom a new agent alert ─────────────────────────────────────────
    await sendEmail(
      TOM_EMAIL,
      `🎉 New Agent — ${fullName} just joined Bear Team`,
      buildTomAlert(agentData),
    );

    // ── 3. Update Supabase — stop drip, advance stage ─────────────────────────
    await getSupabase()
      .from("leads")
      .update({
        stage: "Onboarding",
        drip_stopped: true,
        onboarded_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("email", email.toLowerCase().trim());

    // ── 4. Write agent trigger file for COWORK_INSTRUCTIONS.md ───────────────
    // This file lands in BearTeamOS/_new-agents/ and triggers Cowork onboarding
    const agentTxtContent = buildAgentTxt(agentData, now);
    const fileName = `${fullName.replace(/\s+/g, "_")}_${now.toISOString().split("T")[0]}.txt`;

    await getSupabase().storage
      .from("onboarding")
      .upload(`_new-agents/${fileName}`, new Blob([agentTxtContent], { type: "text/plain" }), {
        upsert: true,
      });

    // ── 5. Log to Supabase agents table (create if not present) ───────────────
    try {
      await getSupabase()
        .from("agents")
        .upsert(
          {
            name: fullName,
            email: email.toLowerCase().trim(),
            phone: agentData.phone || null,
            brokerage_previous: brokerage,
            deal_count_previous: dealCount,
            start_date: now.toISOString().split("T")[0],
            stage: "Onboarding",
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          },
          { onConflict: "email" }
        );
    } catch (_) { /* agents table may not exist yet — non-fatal */ }

    console.log(`Onboarding triggered for ${fullName} (${email})`);

    return NextResponse.json({
      success: true,
      agent: fullName,
      email,
      actions: [
        "welcome_email_sent",
        "tom_alerted",
        "drip_stopped",
        "stage_updated_to_onboarding",
        "agent_txt_written",
      ],
    });

  } catch (err) {
    console.error("Onboarding error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ─── EMAIL TEMPLATES ──────────────────────────────────────────────────────────

function buildWelcomeEmail(firstName: string, fullName: string): string {
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
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; }
    .header span { color: #c9a84c; }
    .header p { color: #c9a84c; margin: 6px 0 0; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase; }
    .body { padding: 36px; color: #333; font-size: 15px; line-height: 1.7; }
    .body p { margin: 0 0 16px; }
    .step { display: flex; gap: 16px; margin: 12px 0; align-items: flex-start; }
    .step-num { background: #c9a84c; color: #1a1a1a; font-weight: 700; font-size: 13px; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
    .step-text { color: #333; font-size: 15px; }
    .step-text strong { color: #1a1a1a; }
    .cta { display: block; background: #c9a84c; color: #1a1a1a; text-decoration: none; font-weight: 700; font-size: 15px; text-align: center; padding: 14px 28px; border-radius: 6px; margin: 28px 0; }
    .sig { margin-top: 24px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
    .sig p { color: #555; font-size: 14px; margin: 0 0 2px; }
    .footer { padding: 20px 36px; border-top: 1px solid #f0f0f0; }
    .footer p { color: #888; font-size: 13px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bear <span>Team</span></h1>
      <p>Real Estate · Orlando, FL</p>
    </div>
    <div class="body">
      <p>Hey ${firstName},</p>
      <p>Welcome to Bear Team. I'm glad you made the call — and I'm glad you made the move.</p>
      <p>Here's what happens next, in order:</p>

      <div class="step">
        <div class="step-num">1</div>
        <div class="step-text"><strong>Check your email</strong> — your welcome packet and onboarding docs are on the way from our team within 24 hours.</div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-text"><strong>Start Bear Team Academy</strong> — Course 1 (Orientation) is your first required step. It covers culture, expectations, and how Bear Team actually works.</div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-text"><strong>Your Week 1 check-in</strong> — I'll reach out in the next 48 hours to schedule your first check-in. Bring your questions.</div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-text"><strong>Your first deal</strong> — once you're in the Academy and your license transfer is complete, you're ready to go. The $150 flat fee kicks in at closing — nothing before that.</div>
      </div>

      <a href="${ACADEMY_URL}" class="cta">Start Bear Team Academy →</a>

      <p>If anything comes up before we talk — questions, paperwork, anything — just reply here or text me directly.</p>

      <div class="sig">
        <p><strong>Tom Songer</strong></p>
        <p>Team Lead | Bear Team Real Estate</p>
        <p>${TOM_PHONE} | ${BEARTEAMOS_URL}</p>
      </div>
    </div>
    <div class="footer">
      <p>Bear Team Real Estate · Orlando, FL · joinbearteam.com</p>
    </div>
  </div>
</body>
</html>`.trim();
}

function buildTomAlert(agent: Record<string, string | number | boolean | null>): string {
  const name = agent.name || "Unknown";
  const email = agent.email || "—";
  const phone = agent.phone || "—";
  const brokerage = agent.brokerage || "—";
  const dealCount = agent.deal_count ?? "—";
  const avgPrice = agent.avg_price ? `$${Number(agent.avg_price).toLocaleString()}` : "—";
  const notes = agent.notes || "—";

  return `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: -apple-system, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .header { background: #1a6b3c; padding: 20px 28px; }
  .header h1 { color: #fff; margin: 0; font-size: 18px; font-weight: 700; }
  .body { padding: 28px; }
  .row { display: flex; margin-bottom: 12px; border-bottom: 1px solid #f5f5f5; padding-bottom: 12px; }
  .label { color: #888; font-size: 13px; width: 140px; flex-shrink: 0; }
  .value { color: #1a1a1a; font-size: 14px; font-weight: 500; }
  .actions { background: #f8f8f8; border-radius: 6px; padding: 16px 20px; margin-top: 20px; }
  .actions h3 { margin: 0 0 10px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
  .actions ul { margin: 0; padding-left: 20px; }
  .actions li { color: #333; font-size: 14px; line-height: 2; }
  .cta { display: inline-block; background: #1a1a1a; color: #fff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 10px 20px; border-radius: 5px; margin-top: 20px; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 New Agent — ${name} joined Bear Team</h1>
    </div>
    <div class="body">
      <div class="row"><div class="label">Name</div><div class="value">${name}</div></div>
      <div class="row"><div class="label">Email</div><div class="value">${email}</div></div>
      <div class="row"><div class="label">Phone</div><div class="value">${phone}</div></div>
      <div class="row"><div class="label">Previous Brokerage</div><div class="value">${brokerage}</div></div>
      <div class="row"><div class="label">Deals Last Year</div><div class="value">${dealCount}</div></div>
      <div class="row"><div class="label">Avg Sale Price</div><div class="value">${avgPrice}</div></div>
      <div class="row"><div class="label">Notes</div><div class="value">${notes}</div></div>

      <div class="actions">
        <h3>Automated actions completed</h3>
        <ul>
          <li>✅ Welcome email sent to ${email}</li>
          <li>✅ Drip sequence stopped</li>
          <li>✅ Stage updated → Onboarding</li>
          <li>✅ Agent .txt file written to _new-agents/</li>
        </ul>
      </div>

      <div class="actions" style="margin-top:12px;">
        <h3>Your next steps</h3>
        <ul>
          <li>Schedule Week 1 check-in (48 hrs)</li>
          <li>Send welcome packet + onboarding docs</li>
          <li>Confirm license transfer is in progress</li>
          <li>Add to Bear Team Academy — Course 1</li>
        </ul>
      </div>

      <a href="https://getSupabase().com/dashboard/project/bbithigafmsyzlmuaokw/editor" class="cta">View in Supabase →</a>
    </div>
  </div>
</body>
</html>`.trim();
}

function buildAgentTxt(
  agent: Record<string, string | number | boolean | null>,
  date: Date
): string {
  const name = agent.name || "Unknown Agent";
  const email = agent.email || "";
  const phone = agent.phone || "";
  const startDate = date.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  });

  return `Name: ${name}
License #: [PENDING — add before processing]
Role: Buyer Agent
Start Date: ${startDate}
Email: ${email}
Phone: ${phone}
Referred by: Scout AI — joinbearteam.com/chat
Previous Brokerage: ${agent.brokerage || "Unknown"}
Deals Last Year: ${agent.deal_count ?? "Unknown"}
Notes: ${agent.notes || "None"}
`;
}
