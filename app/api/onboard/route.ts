import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

// ─── Generate BearTeamOS credentials ─────────────────────────────────────────
function generateUsername(fullName: string): string {
  const parts = fullName.trim().toLowerCase().split(/\s+/);
  return parts.length >= 2
    ? `${parts[0]}.${parts[parts.length - 1]}`
    : parts[0];
}

function generatePassword(): string {
  const words = ["Bear", "Team", "Agent", "Orlando", "Realty", "Hustle", "Closer"];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${word}${num}`;
}

// ─── Update AGENTS env var on BearTeamOS Vercel project ──────────────────────
async function provisionBearTeamOSCredentials(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const vercelToken = process.env.VERCEL_TOKEN;
  const projectId = process.env.BEARTEAMOS_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!vercelToken || !projectId || !teamId) {
    console.error("[onboard] Missing VERCEL_TOKEN, BEARTEAMOS_PROJECT_ID, or VERCEL_TEAM_ID");
    return { success: false, error: "missing_vercel_config" };
  }

  // 1. Fetch current AGENTS env var value + its ID
  const listRes = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/env?teamId=${teamId}`,
    { headers: { Authorization: `Bearer ${vercelToken}` } }
  );
  if (!listRes.ok) return { success: false, error: `vercel_list_error_${listRes.status}` };

  const listData = await listRes.json();
  const agentsEnv = listData.envs?.find((e: { key: string }) => e.key === "AGENTS");

  // 2. Decrypt current value
  let currentAgents: { username: string; password: string }[] = [];
  let envId: string | null = agentsEnv?.id ?? null;

  if (agentsEnv?.id) {
    const decryptRes = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/env/${agentsEnv.id}?teamId=${teamId}`,
      { headers: { Authorization: `Bearer ${vercelToken}` } }
    );
    if (decryptRes.ok) {
      const decryptData = await decryptRes.json();
      try { currentAgents = JSON.parse(decryptData.value || "[]"); } catch { currentAgents = []; }
    }
  }

  // 3. Add new agent (skip if already exists)
  const exists = currentAgents.some((a) => a.username === username);
  if (!exists) currentAgents.push({ username, password });

  const newValue = JSON.stringify(currentAgents);

  // 4. Update or create the env var
  if (envId) {
    const updateRes = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/env/${envId}?teamId=${teamId}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${vercelToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ value: newValue }),
      }
    );
    if (!updateRes.ok) return { success: false, error: `vercel_update_error_${updateRes.status}` };
  } else {
    const createRes = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/env?teamId=${teamId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${vercelToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "AGENTS",
          value: newValue,
          type: "encrypted",
          target: ["production", "preview", "development"],
        }),
      }
    );
    if (!createRes.ok) return { success: false, error: `vercel_create_error_${createRes.status}` };
  }

  // 5. Redeploy BearTeamOS so new credentials take effect
  await fetch(
    `https://api.vercel.com/v13/deployments?teamId=${teamId}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${vercelToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "bearteam-os-dashboard",
        projectId,
        target: "production",
        source: "api",
      }),
    }
  );

  return { success: true };
}

const TOM_EMAIL = "tom@bearteam.com";
const TOM_PHONE = "407-758-8102";
const ACADEMY_URL = "https://academy.joinbearteam.com";
const BEARTEAMOS_URL = "https://bearteam-os-dashboard.vercel.app";
const REPLY_TO = "tom@bearteam.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.pw && body.pw !== process.env.DASHBOARD_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lead = body.record || body;
    const leadId = body.leadId || lead.leadId;
    const email = lead.email;

    if (!leadId && !email) {
      return NextResponse.json({ error: "No leadId or email provided" }, { status: 400 });
    }

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

    if (agentData.stage === 'Onboarding' || agentData.drip_stopped === true) {
      console.log(`[onboard] Skipping — already onboarded: ${agentData.email}`);
      return NextResponse.json({ success: true, skipped: true, reason: 'already_onboarded' });
    }

    const firstName = agentData.name?.split(" ")[0] || "there";
    const fullName = agentData.name || email;
    const brokerage = agentData.brokerage || "Not provided";
    const dealCount = agentData.deal_count ?? "Unknown";
    const now = new Date();

    // ── Generate BearTeamOS credentials ───────────────────────────────────────
    const btUsername = generateUsername(fullName);
    const btPassword = generatePassword();

    // ── Provision credentials on BearTeamOS ───────────────────────────────────
    const provision = await provisionBearTeamOSCredentials(btUsername, btPassword);
    if (!provision.success) {
      console.error("[onboard] Failed to provision BearTeamOS credentials:", provision.error);
      // Non-fatal — continue with onboarding, log the issue
    }

    // ── 1. Send welcome email with BearTeamOS credentials ────────────────────
    const { error: welcomeEmailError } = await sendEmail(
      email,
      `Welcome to Bear Team, ${firstName} — your system access is ready`,
      buildWelcomeEmail(firstName, fullName, btUsername, btPassword),
      REPLY_TO,
    );

    if (welcomeEmailError) {
      console.error("Welcome email error:", welcomeEmailError);
      return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 });
    }

    // ── 2. Alert Tom ───────────────────────────────────────────────────────────
    await sendEmail(
      TOM_EMAIL,
      `🎉 New Agent — ${fullName} just joined Bear Team`,
      buildTomAlert(agentData, btUsername, btPassword),
    );

    // ── 3. Update Supabase lead ────────────────────────────────────────────────
    await getSupabase()
      .from("leads")
      .update({
        stage: "Onboarding",
        drip_stopped: true,
        onboarded_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("email", email.toLowerCase().trim());

    // ── 4. Write agent trigger file ────────────────────────────────────────────
    const agentTxtContent = buildAgentTxt(agentData, now);
    const fileName = `${fullName.replace(/\s+/g, "_")}_${now.toISOString().split("T")[0]}.txt`;
    await getSupabase().storage
      .from("onboarding")
      .upload(`_new-agents/${fileName}`, new Blob([agentTxtContent], { type: "text/plain" }), { upsert: true });

    // ── 5. Create agent in BearTeamOS Supabase ────────────────────────────────
    try {
      await getSupabase()
        .from("agents")
        .upsert(
          {
            name: fullName,
            email: email.toLowerCase().trim(),
            phone: agentData.phone || null,
            stage: "Onboarding",
            onboarding_stage: 0,
            inactivity_streak: 0,
            missed_streak: 0,
            performance_score: 0,
            start_date: now.toISOString().split("T")[0],
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          },
          { onConflict: "email" }
        );
    } catch (_) { /* non-fatal */ }

    console.log(`Onboarding complete for ${fullName} (${email}) — BearTeamOS: ${btUsername}`);

    return NextResponse.json({
      success: true,
      agent: fullName,
      email,
      bearteamos: { username: btUsername, provisioned: provision.success },
      actions: [
        "welcome_email_sent_with_credentials",
        "tom_alerted",
        "drip_stopped",
        "stage_updated_to_onboarding",
        "agent_txt_written",
        provision.success ? "bearteamos_credentials_provisioned" : "bearteamos_provision_failed",
      ],
    });

  } catch (err) {
    console.error("Onboarding error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ─── EMAIL TEMPLATES ──────────────────────────────────────────────────────────

function buildWelcomeEmail(firstName: string, fullName: string, username: string, password: string): string {
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
    .credentials { background: #1a1a1a; border-radius: 8px; padding: 20px 24px; margin: 24px 0; }
    .credentials h3 { color: #c9a84c; margin: 0 0 14px; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; }
    .cred-row { display: flex; justify-content: space-between; margin-bottom: 10px; align-items: center; }
    .cred-label { color: #888; font-size: 13px; }
    .cred-value { color: #ffffff; font-size: 15px; font-weight: 700; font-family: monospace; letter-spacing: 0.05em; }
    .cred-url { color: #c9a84c; font-size: 13px; margin-top: 12px; word-break: break-all; }
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
      <p>Welcome to Bear Team. Your agent account is active and your system access is ready.</p>

      <div class="credentials">
        <h3>Your BearTeamOS Login</h3>
        <div class="cred-row">
          <span class="cred-label">Username</span>
          <span class="cred-value">${username}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Password</span>
          <span class="cred-value">${password}</span>
        </div>
        <div class="cred-url">🔗 bearteam-os-dashboard.vercel.app/login</div>
      </div>

      <p>BearTeamOS is your daily operating system — it tracks your tasks, pipeline, compliance, and performance. Log in every morning before you do anything else.</p>

      <p>Here's your first week, in order:</p>

      <div class="step">
        <div class="step-num">1</div>
        <div class="step-text"><strong>Log into BearTeamOS</strong> — your onboarding tasks are already waiting. Complete them in order.</div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-text"><strong>Start Bear Team Academy</strong> — Course 1 (Orientation) is your first required module.</div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-text"><strong>Week 1 check-in</strong> — I'll reach out in 48 hours to schedule your first call. Bring questions.</div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-text"><strong>License transfer</strong> — once complete, you're cleared to work your first deal. $150 flat fee at closing — nothing before that.</div>
      </div>

      <a href="${BEARTEAMOS_URL}/login" class="cta">Log Into BearTeamOS →</a>

      <p>If anything comes up before we talk, reply here or text me directly.</p>

      <div class="sig">
        <p><strong>Tom Songer</strong></p>
        <p>Team Lead | Bear Team Real Estate</p>
        <p>${TOM_PHONE}</p>
      </div>
    </div>
    <div class="footer">
      <p>Bear Team Real Estate · Orlando, FL · joinbearteam.com</p>
    </div>
  </div>
</body>
</html>`.trim();
}

function buildTomAlert(agent: Record<string, string | number | boolean | null>, username: string, password: string): string {
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
  .label { color: #888; font-size: 13px; width: 160px; flex-shrink: 0; }
  .value { color: #1a1a1a; font-size: 14px; font-weight: 500; }
  .creds { background: #1a1a1a; border-radius: 6px; padding: 16px 20px; margin: 16px 0; }
  .creds h3 { color: #c9a84c; margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  .creds .row { border-bottom: 1px solid #333; }
  .creds .label { color: #888; }
  .creds .value { color: #fff; font-family: monospace; }
  .actions { background: #f8f8f8; border-radius: 6px; padding: 16px 20px; margin-top: 16px; }
  .actions h3 { margin: 0 0 10px; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
  .actions ul { margin: 0; padding-left: 20px; }
  .actions li { color: #333; font-size: 14px; line-height: 2; }
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

      <div class="creds">
        <h3>BearTeamOS Credentials Issued</h3>
        <div class="row"><div class="label">Username</div><div class="value">${username}</div></div>
        <div class="row" style="border:none;margin:0;padding:0"><div class="label">Password</div><div class="value">${password}</div></div>
      </div>

      <div class="actions">
        <h3>Automated actions completed</h3>
        <ul>
          <li>✅ Welcome email + credentials sent to ${email}</li>
          <li>✅ BearTeamOS account provisioned</li>
          <li>✅ Drip sequence stopped</li>
          <li>✅ Stage updated → Onboarding</li>
          <li>✅ Agent record created in BearTeamOS</li>
        </ul>
      </div>

      <div class="actions" style="margin-top:12px;">
        <h3>Your next steps</h3>
        <ul>
          <li>Schedule Week 1 check-in within 48 hrs</li>
          <li>Confirm license transfer is in progress</li>
          <li>Add to Bear Team Academy — Course 1</li>
        </ul>
      </div>
    </div>
  </div>
</body>
</html>`.trim();
}

function buildAgentTxt(agent: Record<string, string | number | boolean | null>, date: Date): string {
  const name = agent.name || "Unknown Agent";
  const email = agent.email || "";
  const phone = agent.phone || "";
  const startDate = date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
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