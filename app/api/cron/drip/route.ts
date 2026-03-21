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
const CALENDLY_LINK = "https://calendly.com/thomas-songer/bear-team-meet";
const FROM_EMAIL = "Tom Songer <tom@joinbearteam.com>";
const REPLY_TO = "thomas.songer@gmail.com";

// ─── DRIP SEQUENCE LOGIC ──────────────────────────────────────────────────────
//
// Triggered after a recruit has a call with Tom (event_end has passed,
// stage is NOT Closed Won/Lost, and they haven't unsubscribed).
//
// Schedule (days after call):
//   Email 1 — Day 1:  "Great talking with you" — recap + math
//   Email 2 — Day 3:  "The number most agents miss" — fee comparison
//   Email 3 — Day 7:  "What agents say after 90 days" — social proof
//   Email 4 — Day 10: "Still thinking it over?" — objection handling
//   Email 5 — Day 14: "Last one from me" — final soft close
//
// Cron runs daily at 8 AM ET via vercel.json.
// ─────────────────────────────────────────────────────────────────────────────

const DRIP_SCHEDULE = [
  { day: 1,  emailIndex: 0, subject: "Great talking with you today" },
  { day: 3,  emailIndex: 1, subject: "The number most agents never calculate" },
  { day: 7,  emailIndex: 2, subject: "What agents tell us after 90 days at Bear Team" },
  { day: 10, emailIndex: 3, subject: "Still thinking it over?" },
  { day: 14, emailIndex: 4, subject: "Last one from me, [firstName]" },
];

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const results = [];

    for (const step of DRIP_SCHEDULE) {
      // Find leads whose call ended exactly `step.day` days ago (within a 24hr window)
      const windowStart = new Date(now.getTime() - (step.day * 24 * 60 * 60 * 1000));
      const windowEnd   = new Date(now.getTime() - ((step.day - 1) * 24 * 60 * 60 * 1000));

      const { data: leads, error } = await getSupabase()
        .from("leads")
        .select("*")
        .lt("event_end", windowEnd.toISOString())
        .gt("event_end", windowStart.toISOString())
        .not("stage", "in", '("Closed Won","Closed Lost")')
        .not("email", "is", null)
        .neq("email", "")
        .or(`drip_step.is.null,drip_step.lt.${step.emailIndex + 1}`)
        .eq("drip_unsubscribed", false);

      if (error) {
        console.error(`Drip step ${step.day} query error:`, error);
        continue;
      }

      if (!leads || leads.length === 0) continue;

      for (const lead of leads) {
        const firstName = lead.name?.split(" ")[0] || "there";
        const subject = step.subject.replace("[firstName]", firstName);

        const html = buildDripEmail(step.emailIndex, firstName, lead);

        const { error: emailError } = await getResend().emails.send({
          from: FROM_EMAIL,
          replyTo: REPLY_TO,
          to: lead.email,
          subject,
          html,
        });

        if (emailError) {
          console.error(`Drip email error for ${lead.email}:`, emailError);
          continue;
        }

        // Update drip_step and last drip sent timestamp
        await getSupabase()
          .from("leads")
          .update({
            drip_step: step.emailIndex + 1,
            drip_last_sent_at: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq("id", lead.id);

        results.push({
          email: lead.email,
          name: lead.name,
          drip_step: step.emailIndex + 1,
          subject,
        });
      }
    }

    // Notify Tom if any drip emails went out
    if (results.length > 0) {
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: TOM_EMAIL,
        subject: `[Scout Drip] ${results.length} nurture email(s) sent today`,
        html: buildTomDripSummary(results),
      });
    }

    return NextResponse.json({ processed: results.length, results });

  } catch (err) {
    console.error("Drip cron error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ─── EMAIL TEMPLATES ──────────────────────────────────────────────────────────

function buildDripEmail(
  index: number,
  firstName: string,
  lead: Record<string, string | number | boolean | null>
): string {
  const brokerage = (lead.brokerage as string) || "your current brokerage";
  const dealCount = lead.deal_count as number | null;

  // Calculate Bear Team math if we have deal count
  let mathBlock = "";
  if (dealCount && dealCount > 0) {
    const avgPrice = (lead.avg_price as number) || 415000;
    const commission = 0.025;
    const gci = avgPrice * commission;
    const bearTeamNet = gci * 0.6 * dealCount; // conservative Tier 1
    const typicalNet = gci * 0.7 * dealCount;  // typical 70/30 elsewhere
    const fees = dealCount * 150;
    const bearTeamTotal = bearTeamNet - fees;
    mathBlock = `
    <div style="background:#f8f4e8;border-left:4px solid #c9a84c;padding:16px 20px;margin:20px 0;border-radius:4px;">
      <p style="margin:0 0 8px;font-weight:600;color:#1a1a1a;">Your numbers at Bear Team (${dealCount} deals, conservative):</p>
      <p style="margin:0 0 4px;color:#333;">GCI per deal: $${gci.toLocaleString()}</p>
      <p style="margin:0 0 4px;color:#333;">Your net (60/40 Tier 1): $${bearTeamTotal.toLocaleString()}</p>
      <p style="margin:0 0 4px;color:#333;">Transaction fees: $${fees.toLocaleString()} total</p>
      <p style="margin:0;color:#888;font-size:13px;">Zero monthly fees. Zero desk fees. Zero E&O.</p>
    </div>`;
  }

  const emails = [
    // Email 1 — Day 1: Recap + math
    `<p>Hey ${firstName},</p>
    <p>Really enjoyed our conversation today. I want to make sure you have everything you need to think it through clearly.</p>
    <p>Here's the short version of what we covered:</p>
    <ul style="color:#333;line-height:1.8;">
      <li>Progressive tiers: 60/40 → 70/30 → 80/20 → 90/10</li>
      <li>$16K cap = automatic promotion, not a ceiling</li>
      <li>Zero monthly fees, zero desk fees, zero E&O costs</li>
      <li>$150 flat per closing — same whether it's $200K or $2M</li>
    </ul>
    ${mathBlock}
    <p>If any questions came up after we hung up, just reply here. I'm easy to reach.</p>`,

    // Email 2 — Day 3: The number most agents miss
    `<p>Hey ${firstName},</p>
    <p>One thing I didn't spend enough time on in our call — the number most agents never actually calculate:</p>
    <p><strong>What are you paying your brokerage every year in fees before a single deal closes?</strong></p>
    <p>At most brokerages, that number is $1,200–$3,600/year in monthly fees alone. Add desk fees, tech fees, E&O — you're often at $4,000–$6,000 out of pocket before your first commission check.</p>
    <p>At Bear Team: <strong>$0</strong>. The only time money leaves your pocket is when a deal closes — $150 flat.</p>
    ${mathBlock}
    <p>If you're at ${brokerage}, what does that number actually look like for you? Worth running before you decide anything.</p>`,

    // Email 3 — Day 7: Social proof
    `<p>Hey ${firstName},</p>
    <p>I want to share something agents tell us pretty consistently about 90 days in:</p>
    <p><em>"I didn't realize how much mental overhead I had from the fees until they were gone."</em></p>
    <p>It's not just the math — though the math is real. It's the shift from paying to produce to just producing. No monthly invoice in the back of your mind. No desk fee when you have a slow month.</p>
    <p>The agents who fit best here are the ones who are already producing and just want the platform to get out of their way. That's what we built.</p>
    <p>Is there anything specific that's still giving you pause? I'd rather answer it directly than let it sit.</p>`,

    // Email 4 — Day 10: Objection handling
    `<p>Hey ${firstName},</p>
    <p>I'll be direct — when agents go quiet at this stage, it's usually one of three things:</p>
    <ol style="color:#333;line-height:2;">
      <li><strong>"I just renewed my agreement"</strong> — When does it come up? This is the right time to plan, not when you're rushed at renewal.</li>
      <li><strong>"I'm worried about my clients"</strong> — Your license, database, and relationships are yours. The brokerage cannot hold them.</li>
      <li><strong>"The brand matters to my clients"</strong> — How many clients chose you because of the flag vs. because of you? Most producers are the brand.</li>
    </ol>
    <p>If it's something else entirely, just tell me. I'd rather have a straight conversation than send another email.</p>
    <p>If the timing isn't right, that's a real answer too — just let me know and I'll follow up when it makes sense.</p>`,

    // Email 5 — Day 14: Final soft close
    `<p>Hey ${firstName},</p>
    <p>Last one from me — I don't believe in wearing people down.</p>
    <p>If Bear Team is the right move, you already know it. The math works, the model is clean, and the support is real. When the timing is right, the door is open.</p>
    <p>If you want to revisit at any point — next month, next quarter, or at your next renewal — just reply to this email or grab 15 minutes whenever it works:</p>
    <a href="${CALENDLY_LINK}" style="display:inline-block;background:#c9a84c;color:#1a1a1a;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:6px;margin:16px 0;">Schedule a Call →</a>
    <p>Either way, good luck with your production. Orlando is a good market right now — go close something.</p>`,
  ];

  return wrapEmail(emails[index] || emails[0]);
}

function wrapEmail(body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #1a1a1a; padding: 24px 36px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 18px; font-weight: 600; }
    .header span { color: #c9a84c; }
    .body { padding: 32px 36px; color: #333; font-size: 15px; line-height: 1.7; }
    .body p { margin: 0 0 16px; }
    .body ul, .body ol { margin: 0 0 16px; padding-left: 24px; }
    .footer { padding: 20px 36px; border-top: 1px solid #f0f0f0; }
    .footer p { color: #888; font-size: 13px; margin: 0 0 4px; }
    .sig { margin-top: 24px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
    .sig p { color: #555; font-size: 14px; margin: 0 0 2px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bear <span>Team</span> Real Estate</h1>
    </div>
    <div class="body">
      ${body}
      <div class="sig">
        <p><strong>Tom Songer</strong></p>
        <p>Team Lead | Bear Team Real Estate</p>
        <p>407-758-8102 | joinbearteam.com</p>
      </div>
    </div>
    <div class="footer">
      <p>Bear Team Real Estate · Orlando, FL</p>
      <p style="font-size:12px;color:#aaa;">You're receiving this because you had a conversation with Bear Team. Reply "stop" to unsubscribe.</p>
    </div>
  </div>
</body>
</html>`.trim();
}

function buildTomDripSummary(results: Array<{ email: string; name: string; drip_step: number; subject: string }>): string {
  const rows = results.map(r =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${r.name || r.email}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">Email ${r.drip_step}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#555;font-size:13px;">${r.subject}</td>
    </tr>`
  ).join("");

  return `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: -apple-system, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; }
  .header { background: #1a1a1a; padding: 20px 28px; }
  .header h1 { color: #c9a84c; margin: 0; font-size: 16px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f8f8f8; padding: 10px 12px; text-align: left; font-size: 12px; color: #888; text-transform: uppercase; }
</style></head>
<body>
  <div class="container">
    <div class="header"><h1>Scout Drip — ${results.length} email(s) sent today</h1></div>
    <table>
      <tr><th>Name</th><th>Step</th><th>Subject</th></tr>
      ${rows}
    </table>
  </div>
</body>
</html>`.trim();
}
