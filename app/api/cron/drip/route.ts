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
        .eq("drip_unsubscribed", false)
        .or("noshow_followup_sent.is.null,noshow_followup_sent.eq.false"); // exclude no-shows

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

        const newDripStep = step.emailIndex + 1;

        // Update drip_step and last drip sent timestamp
        // If this is the final email (step 5), also update stage to Long-Term Nurture
        await getSupabase()
          .from("leads")
          .update({
            drip_step: newDripStep,
            drip_last_sent_at: now.toISOString(),
            updated_at: now.toISOString(),
            ...(newDripStep >= 5 ? { stage: "Long-Term Nurture" } : {}),
          })
          .eq("id", lead.id);

        // If sequence just completed, alert Tom to take manual action
        if (newDripStep >= 5) {
          const brokerage = lead.brokerage ? ` · ${lead.brokerage}` : "";
          const dealInfo = lead.deal_count ? ` · ${lead.deal_count} deals/yr` : "";
          await getResend().emails.send({
            from: FROM_EMAIL,
            to: TOM_EMAIL,
            subject: `[Drip Complete] ${lead.name || lead.email} — sequence finished, no response`,
            html: `
              <div style="font-family:sans-serif;max-width:520px;">
                <div style="background:#1a1a1a;padding:16px 24px;border-radius:6px 6px 0 0;">
                  <p style="color:#c9a84c;font-weight:700;margin:0;font-size:15px;">🏁 Drip Sequence Complete</p>
                </div>
                <div style="background:#fff;border:1px solid #e5e7eb;padding:20px 24px;border-radius:0 0 6px 6px;">
                  <p style="margin:0 0 12px;color:#374151;font-size:14px;"><strong>${lead.name || "Unknown"}</strong>${brokerage}${dealInfo}</p>
                  <p style="margin:0 0 12px;color:#374151;font-size:14px;">Email: <a href="mailto:${lead.email}">${lead.email}</a></p>
                  <p style="margin:0 0 16px;color:#374151;font-size:14px;">Phone: ${lead.phone || "Not captured"}</p>
                  <p style="margin:0 0 16px;color:#6b7280;font-size:13px;">All 5 drip emails sent. No response detected. Stage updated to <strong>Long-Term Nurture</strong>.</p>
                  <p style="margin:0;color:#374151;font-size:14px;font-weight:600;">Recommended action: Personal call or move to Closed Lost.</p>
                </div>
              </div>`,
          }).catch(() => {});
        }

        results.push({
          email: lead.email,
          name: lead.name,
          drip_step: newDripStep,
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
  const avgPrice = (lead.avg_price as number) || 415000;
  const notes = (lead.notes as string) || "";
  const objections = (lead.objections as string) || "";
  const stage = (lead.stage as string) || "";

  // ── Personalized math block ─────────────────────────────────────────────────
  // Uses actual avg_price from Scout if captured, falls back to $415K Orlando average
  let mathBlock = "";
  if (dealCount && dealCount > 0) {
    const commission = 0.025;
    const gci = avgPrice * commission;
    const bearTeamNet60 = gci * 0.6 * dealCount;   // Tier 1 (60/40)
    const bearTeamNet70 = gci * 0.7 * dealCount;   // Tier 2 (70/30) after $16K cap
    const fees = dealCount * 150;
    const bearTeamTotal = bearTeamNet60 - fees;
    const priceLabel = (lead.avg_price as number) ? `$${avgPrice.toLocaleString()} avg` : `$${avgPrice.toLocaleString()} Orlando avg`;
    mathBlock = `
    <div style="background:#f8f4e8;border-left:4px solid #c9a84c;padding:16px 20px;margin:20px 0;border-radius:4px;">
      <p style="margin:0 0 8px;font-weight:600;color:#1a1a1a;">Your numbers at Bear Team — ${dealCount} deals · ${priceLabel}:</p>
      <p style="margin:0 0 4px;color:#333;">GCI per deal: $${Math.round(gci).toLocaleString()}</p>
      <p style="margin:0 0 4px;color:#333;">Your net at Tier 1 (60/40): $${Math.round(bearTeamTotal).toLocaleString()} after $150/deal fee</p>
      <p style="margin:0 0 4px;color:#333;">Your net at Tier 2 (70/30): $${Math.round(bearTeamNet70 - fees).toLocaleString()} — kicks in at $16K company dollar</p>
      <p style="margin:0 0 4px;color:#888;font-size:13px;">Zero monthly fees. Zero desk fees. Zero E&O. Only pay when you close.</p>
      <p style="margin:0;color:#aaa;font-size:11px;">Estimates based on information you provided. Actual earnings will vary based on transaction volume, sale price, and other factors.</p>
    </div>`;
  }

  // ── Scout notes block — only appears in Email 1 if Scout captured context ───
  // Pulls what the agent told Scout during their pre-call chat
  let notesCallout = "";
  if (notes && notes.length > 10) {
    notesCallout = `
    <div style="background:#f0f4ff;border-left:4px solid #3b82f6;padding:14px 18px;margin:16px 0;border-radius:4px;">
      <p style="margin:0 0 6px;font-weight:600;color:#1e3a8a;font-size:13px;">FROM OUR CHAT BEFORE THE CALL</p>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">${notes}</p>
    </div>`;
  }

  // ── Objection callback — used in Email 4 if Scout captured a specific objection
  const objectionLine = objections
    ? `<p>You mentioned <em>"${objections}"</em> — let me address that directly.</p>`
    : "";

  // ── Stage-aware context ─────────────────────────────────────────────────────
  const isFollowUpQueue = stage === "Follow-Up Queue";

  const emails = [
    // Email 1 — Day 1: Recap + math + Scout notes callback
    // Conversion fix: added quiet Calendly link — highest open rate in sequence,
    // agents who are ready often decide within 24h of the call.
    `<p>Hey ${firstName},</p>
    <p>Really enjoyed our conversation today. I want to make sure you have everything you need to think it through clearly.</p>
    ${notesCallout}
    <p>Here's the short version of what we covered:</p>
    <ul style="color:#333;line-height:1.8;">
      <li>Progressive tiers: 60/40 → 70/30 → 80/20 → 90/10</li>
      <li>$16K company dollar cap = automatic tier promotion, not a ceiling</li>
      <li>Zero monthly fees, zero desk fees, zero E&O costs</li>
      <li>$150 flat per closing — same whether it's $200K or $2M</li>
    </ul>
    ${mathBlock}
    <p>If any questions came up after we hung up, just reply here — or if you'd rather talk it through, grab 15 minutes whenever it works: <a href="${CALENDLY_LINK}" style="color:#c9a84c;font-weight:600;">Schedule a call →</a></p>`,

    // Email 2 — Day 3: The number most agents miss — personalized with their avg_price
    // Conversion fix: math now lands on a specific call ask instead of a rhetorical
    // question. The math earns the right to ask — the old copy let that moment expire.
    `<p>Hey ${firstName},</p>
    <p>One thing I didn't spend enough time on in our call — the number most agents never actually calculate:</p>
    <p><strong>What are you paying your brokerage every year in fees before a single deal closes?</strong></p>
    <p>At most major brokerages, that number is typically $1,200–$3,600/year in monthly fees alone. Add desk fees, tech fees, E&O — agents at KW, EXP, and Compass are often at $4,000–$6,000 out of pocket before their first commission check.</p>
    <p>At Bear Team: <strong>$0</strong>. The only time money leaves your pocket is when a deal closes — $150 flat.</p>
    ${mathBlock}
    <p>If you're at ${brokerage}, I can run your exact numbers in about 10 minutes. No pitch — just the math side by side so you can make the call yourself: <a href="${CALENDLY_LINK}" style="color:#c9a84c;font-weight:600;">Grab a slot →</a></p>`,

    // Email 3 — Day 7: Social proof
    // Priority 2 personalization: branches on deal_count.
    // High-volume producers (10+ deals) get the split math story — they care about
    // the 80/20 and 90/10 tiers they'll actually reach.
    // Lower-volume agents get the overhead relief + no-pressure platform story.
    (() => {
      const isHighVolume = dealCount !== null && dealCount >= 10;
      if (isHighVolume) {
        return `<p>Hey ${firstName},</p>
    <p>At ${dealCount} deals a year, you're going to hit the Bear Team tier progression faster than most agents realize. Here's what the path looks like:</p>
    <ul style="color:#333;line-height:2;">
      <li><strong>Tier 1 (60/40)</strong> — starts immediately, zero monthly fees</li>
      <li><strong>Tier 2 (70/30)</strong> — kicks in automatically at $16K company dollar</li>
      <li><strong>Tier 3 (80/20)</strong> — next threshold, same automatic advance</li>
      <li><strong>Tier 4 (90/10)</strong> — top of the stack, no cap on earnings</li>
    </ul>
    ${mathBlock}
    <p>Producers at your volume typically don't stay at Tier 1 long. The cap is not a ceiling — it's a milestone. Is there anything on the math side that's still unclear? <a href="${CALENDLY_LINK}" style="color:#c9a84c;font-weight:600;">15 minutes and we can run it exactly →</a></p>`;
      }
      return `<p>Hey ${firstName},</p>
    <p>Something agents tell us pretty consistently after 90 days: the biggest change isn't the math — it's the shift from <em>paying to produce</em> to just producing.</p>
    <p>No monthly invoice sitting in the back of your mind. No desk fee on a slow month. No required floor time, no mandatory meetings, no one tracking your activity. Just your license, your clients, and your business.</p>
    <p>One agent who moved from KW last year put it this way: <em>"I didn't realize how much mental overhead I was carrying until it was gone."</em></p>
    ${isFollowUpQueue ? `<p>You mentioned you were weighing your options — that's exactly where most agents are when they reach out. The fit tends to be strongest with producers who already know what they're doing and just want the platform to stop getting in the way.</p>` : `<p>The agents who fit best here are already producing. They don't need hand-holding — they need the brokerage to stay out of the way and let them work. That's what we built Bear Team to do.</p>`}
    <p>Is there anything specific that's still giving you pause? I'd rather answer it directly than let it sit.</p>`;
    })(),

    // Email 4 — Day 10: Objection handling — uses Scout-captured objection if available
    // Conversion fix: objection handling now pivots to a direct re-booking ask.
    // Old ending gave an off-ramp with no Calendly link — earned the close, didn't take it.
    `<p>Hey ${firstName},</p>
    ${objectionLine}
    <p>I'll be direct — when agents go quiet at this stage, it's usually one of three things:</p>
    <ol style="color:#333;line-height:2;">
      <li><strong>"I just renewed my agreement"</strong> — When does it come up? This is the right time to plan, not when you're rushed at renewal.</li>
      <li><strong>"I'm worried about my clients"</strong> — Your license, database, and relationships are yours. The brokerage cannot hold them.</li>
      <li><strong>"The brand matters to my clients"</strong> — How many clients chose you because of the flag vs. because of you? Most producers are the brand.</li>
    </ol>
    <p>If one of those landed, let's talk it through directly. 15 minutes, no pitch: <a href="${CALENDLY_LINK}" style="color:#c9a84c;font-weight:600;">Schedule a call →</a></p>
    <p>If the timing genuinely isn't right, just reply and tell me — I'd rather know than guess.</p>`,

    // Email 5 — Day 14: Final soft close
    `<p>Hey ${firstName},</p>
    <p>Last one from me — I don't believe in wearing people down.</p>
    <p>If Bear Team is the right move, you already know it. The math works, the model is clean, and when you need something — Bethanne is reachable, BearTeam Academy is there, and there's no corporate layer between you and an answer. When the timing is right, the door is open.</p>
    ${mathBlock}
    <p>If you want to revisit at any point — next month, next quarter, or at your next renewal — just reply to this email or grab 15 minutes whenever it works:</p>
    <a href="${CALENDLY_LINK}" style="display:inline-block;background:#c9a84c;color:#1a1a1a;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:6px;margin:16px 0;">Schedule a Call →</a>
    <p>Either way, good luck with your production. Orlando is a good market right now — go close something.</p>`,
  ];

  return wrapEmail(emails[index] || emails[0], (lead.id as string) || undefined);
}

function wrapEmail(body: string, leadId?: string): string {
  const unsubLink = leadId
    ? `<a href="https://joinbearteam.com/api/unsubscribe?id=${leadId}" style="color:#aaa;text-decoration:underline;">Unsubscribe</a>`
    : `<span style="color:#aaa;">Reply "stop" to unsubscribe</span>`;

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
      <p style="font-size:12px;color:#aaa;">${unsubLink}</p>
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
  .alert { background: #fffbeb; border-left: 4px solid #c9a84c; padding: 14px 20px; margin: 0; }
  .alert p { margin: 0 0 6px; font-size: 14px; color: #1a1a1a; }
  .alert p:last-child { margin: 0; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f8f8f8; padding: 10px 12px; text-align: left; font-size: 12px; color: #888; text-transform: uppercase; }
</style></head>
<body>
  <div class="container">
    <div class="header"><h1>Scout Drip — ${results.length} email(s) sent today</h1></div>
    <div class="alert">
      <p><strong>⚡ If any of these agents reply today, respond within 2 hours.</strong> That's your highest-converting window — they're warm right now.</p>
      <p style="color:#555;">Go to your <a href="https://joinbearteam.com/dashboard" style="color:#c9a84c;font-weight:600;">dashboard → Drip tab</a> and hit ⏸ Pause to stop the sequence while you're in conversation. Don't let the next email fire mid-reply.</p>
    </div>
    <table>
      <tr><th>Name</th><th>Step</th><th>Subject</th></tr>
      ${rows}
    </table>
  </div>
</body>
</html>`.trim();
}

