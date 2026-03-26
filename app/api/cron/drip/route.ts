import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWrite } from "@/lib/db/verifyWrite";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Lazy init — avoids build-time crash
function getSupabase() {
  return createClient(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


const TOM_EMAIL = "tom@bearteam.com";
const CALENDLY_LINK = "https://calendly.com/thomas-songer/bear-team-meet";
const FROM_EMAIL = "Tom Songer <tom@bearteam.com>";
const REPLY_TO = "tom@bearteam.com";

// ─── DRIP SEQUENCE LOGIC ──────────────────────────────────────────────────────
//
// Triggered after a recruit has a call with Tom (event_end has passed,
// stage is NOT Closed Won/Lost, and they haven't unsubscribed).
//
// Schedule (days after call end):
//   Email 1 — Day 1:  "Great talking with you" — post-call recap + math
//             SW-2 fix: restored to cron. booking-webhook now sends a pre-call
//             CONFIRMATION email (not a recap). The recap fires here, after event_end.
//   Email 2 — Day 3:  "The number most agents miss" — fee comparison
//   Email 3 — Day 7:  "What agents say after 90 days" — social proof
//   Email 4 — Day 10: "Still thinking it over?" — objection handling
//   Email 5 — Day 14: "Last one from me" — final soft close
//
// CB-5 fix: Windows now anchor to drip_last_sent_at for steps 2-5, not event_end.
// This prevents out-of-order delivery when there's a gap between booking and call.
// Email 1 (Day 1) still anchors to event_end — it's the first post-call touchpoint.
//
// CB-1 fix: Day 3 guard now requires drip_step = 1 specifically, not null/0.
// A lead whose Email 1 failed silently (drip_step never set) should not receive
// Email 2 as their first contact. The drip_step.is.null branch is removed for
// all steps except Day 1 — null means Email 1 hasn't fired and the lead is not
// ready for step 2+.
//
// TICKET-04: write-verify-send pattern enforced for every drip email.
//   drip_step is written BEFORE the email send. verifyWrite confirms the new
//   drip_step and drip_unsubscribed=false before any Resend call. If verification
//   fails, the send is skipped and an error is logged. This prevents duplicate
//   sends even if the cron retries after a partial execution.
//
// NULL-UNSUB fix: drip_unsubscribed filter now handles NULL rows.
//   Leads inserted before the drip_unsubscribed column was added have NULL (not false).
//   The old .eq("drip_unsubscribed", false) silently excluded them from every drip step.
//   Fixed to: .or("drip_unsubscribed.is.null,drip_unsubscribed.eq.false")
//
// Cron runs daily at 8 AM ET (noon UTC) via vercel.json.
// ─────────────────────────────────────────────────────────────────────────────

const DRIP_SCHEDULE = [
  { day: 1,  emailIndex: 0, subject: "Great talking with you today",              anchorField: "event_end"          },
  { day: 3,  emailIndex: 1, subject: "The number most agents never calculate",    anchorField: "drip_last_sent_at"  },
  { day: 7,  emailIndex: 2, subject: "What agents tell us after 90 days at Bear Team", anchorField: "drip_last_sent_at" },
  { day: 10, emailIndex: 3, subject: "Still thinking it over?",                   anchorField: "drip_last_sent_at"  },
  { day: 14, emailIndex: 4, subject: "Last one from me, [firstName]",             anchorField: "drip_last_sent_at"  },
];


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
    const results = [];

    // ── PRIORITY-1: Drip cron fallback inference pass ─────────────────────────
    // The no-show cron (13:00 UTC) is the primary writer of call_outcome.
    // This pass runs FIRST at noon UTC as a fallback — it catches any leads
    // whose call completed but whose call_outcome was not yet written by the
    // no-show cron (cron failure, timing gap, leads outside the 2-hour window).
    //
    // Eligibility (all required, same logic as no-show cron inference):
    //   1. event_end is NOT NULL and is more than 4 hours in the past
    //   2. call_outcome IS NULL — no webhook signal (not cancelled/rescheduled)
    //   3. noshow_followup_sent IS NULL or false — not a confirmed no-show
    //   4. Stage is not Closed Won or Closed Lost
    //
    // Safety: only writes when call_outcome IS NULL. The .is("call_outcome", null)
    // in both the SELECT and UPDATE ensures idempotency. If the no-show cron
    // already wrote "no_show" or "cancelled", this pass will never touch that lead.
    // ─────────────────────────────────────────────────────────────────────────
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

    const { data: inferenceLeads, error: inferenceError } = await getSupabase()
      .from("leads")
      .select("id, email, name")
      .not("event_end", "is", null)
      .lt("event_end", fourHoursAgo.toISOString())
      .is("call_outcome", null)
      .or("noshow_followup_sent.is.null,noshow_followup_sent.eq.false")
      .not("stage", "in", '("Closed Won","Closed Lost")');

    if (inferenceError) {
      console.error("[drip-cron] Completion inference query error:", inferenceError);
    } else if (inferenceLeads && inferenceLeads.length > 0) {
      for (const inferLead of inferenceLeads) {
        const { error: inferWriteErr } = await getSupabase()
          .from("leads")
          .update({ call_outcome: "completed", updated_at: now.toISOString() })
          .eq("id", inferLead.id)
          .is("call_outcome", null); // double-guard: only write when still NULL

        if (inferWriteErr) {
          console.error(`[drip-cron] Inference write failed for ${inferLead.email}:`, inferWriteErr);
        } else {
          console.log(`[drip-cron] Completion inferred for ${inferLead.email}`);
        }
      }
      console.log(`[drip-cron] Inference pass: ${inferenceLeads.length} lead(s) marked completed`);
    }
    // ─────────────────────────────────────────────────────────────────────────

    for (const step of DRIP_SCHEDULE) {
      // CB-5 fix: anchor window to anchorField (event_end for Email 1, drip_last_sent_at
      // for Emails 2-5). This prevents out-of-order delivery when a lead books far
      // in advance — Email 2 fires 3 days after Email 1 actually sent, not 3 days
      // after the call, so the sequence spacing is always relative to the prior email.
      const anchor      = step.anchorField;
      const windowStart = new Date(now.getTime() - (step.day * 24 * 60 * 60 * 1000));
      const windowEnd   = new Date(now.getTime() - ((step.day - 1) * 24 * 60 * 60 * 1000));

      // CB-1 fix: step guard tightened.
      // Email 1 (emailIndex 0): allow drip_step null/0 — hasn't started yet.
      // Emails 2-5 (emailIndex 1+): require drip_step = exactly the prior index.
      // A null drip_step means Email 1 never fired — the lead is not ready for step 2+.
      // This prevents a lead with a failed Email 1 from receiving Email 2 out of context.
      const stepFilter = step.emailIndex === 0
        ? `drip_step.is.null,drip_step.eq.0`
        : `drip_step.eq.${step.emailIndex}`;

      // PRIORITY-1: Build query with call_outcome gate for Email 1.
      // For emailIndex 0 (entry point), require call_outcome = "completed".
      // For emailIndex 1-4, call_outcome gate is implied by drip_step chain.
      let query = getSupabase()
        .from("leads")
        .select("*")
        .lt(anchor, windowEnd.toISOString())
        .gt(anchor, windowStart.toISOString())
        .not("stage", "in", '("Closed Won","Closed Lost")')
        .not("email", "is", null)
        .neq("email", "")
        .or(stepFilter)
        // NULL-UNSUB fix: leads created before drip_unsubscribed column existed
        // have NULL in that field. .eq("drip_unsubscribed", false) silently excluded
        // them. Treat NULL as "not unsubscribed" — same as false.
        .or("drip_unsubscribed.is.null,drip_unsubscribed.eq.false")
        .or("noshow_followup_sent.is.null,noshow_followup_sent.eq.false"); // exclude no-shows

      // PRIORITY-1: call_outcome gate — applied to Email 1 entry point only.
      // A lead must have call_outcome = "completed" before entering the post-call
      // drip sequence. This is the single authoritative signal that the call occurred.
      // Emails 2-5 are already protected by the sequential drip_step chain.
      if (step.emailIndex === 0) {
        query = query.eq("call_outcome", "completed");
      }

      const { data: leads, error } = await query;

      if (error) {
        console.error(`Drip step ${step.day} query error:`, error);
        continue;
      }

      if (!leads || leads.length === 0) continue;

      for (const lead of leads) {
        const firstName = lead.name?.split(" ")[0] || "there";
        const subject = step.subject.replace("[firstName]", firstName);
        const newDripStep = step.emailIndex + 1;

        // ── TICKET-04: Write BEFORE send ──────────────────────────────────────
        // drip_step is written first so that if the email send fails, the lead
        // is not re-queued for this step on the next cron run. Idempotent: a
        // lead already at newDripStep will not match the stepFilter query above.
        const { error: updateError } = await getSupabase()
          .from("leads")
          .update({
            drip_step: newDripStep,
            drip_last_sent_at: now.toISOString(),
            updated_at: now.toISOString(),
            ...(newDripStep >= 5 ? { stage: "Long-Term Nurture" } : {}),
          })
          .eq("id", lead.id);

        if (updateError) {
          console.error(`Drip step write failed for ${lead.email}:`, updateError);
          continue; // do not send if we can't record the step
        }

        // ── TICKET-04: Verify write before sending ────────────────────────────
        // Confirm drip_step and drip_unsubscribed are exactly as expected before
        // any email is dispatched. Guards against silent write failures (RLS, etc.)
        const isVerified = await verifyWrite({
          supabase: getSupabase(),
          table: "leads",
          match: { id: lead.id },
          expected: {
            drip_step: newDripStep,
            drip_unsubscribed: false,
          },
        });

        if (!isVerified) {
          console.error("WRITE VERIFICATION FAILED", {
            route: "drip",
            leadId: lead.id,
            expectedStep: newDripStep,
          });
          continue; // skip send — state not confirmed
        }

        // Verification passed — safe to send
        const html = buildDripEmail(step.emailIndex, firstName, lead);

        try {
          await sendEmail({
            from: FROM_EMAIL,
            replyTo: REPLY_TO,
            to: lead.email,
            subject,
            html,
          });
        } catch (emailError) {
          console.error(`Failed to send drip email to ${lead.email}:`, emailError);
          continue;
        }

        // If sequence just completed, alert Tom to take manual action
        if (newDripStep >= 5) {
          const brokerage = lead.brokerage ? ` · ${lead.brokerage}` : "";
          const dealInfo = lead.deal_count ? ` · ${lead.deal_count} deals/yr` : "";
          await sendEmail({
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
      await sendEmail({
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
      <p style="font-size:12px;color:#aaa;">Licensed under Bethanne Baer, Broker/Owner</p>
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
