import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { verifyWrite } from "@/lib/db/verifyWrite";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getSupabase() {
  return createClient(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
function getResend() { return new Resend(process.env.RESEND_API_KEY!); }

const TOM_EMAIL = "tom@bearteam.com";
const CALENDLY_LINK = "https://calendly.com/thomas-songer/bear-team-meet";
const FROM_EMAIL = "Tom Songer <tom@bearteam.com>";
const REPLY_TO = "tom@bearteam.com";

// ─── COLD CRON — THREE SEGMENTS ───────────────────────────────────────────────
//
// Segment A — Scout-captured leads who never booked (72h+ since chat, no call)
//   stage = 'scout_captured', created_at > 72h ago
//   Email: "Still open to a quick conversation?"
//
// Segment B — Stalled pipeline leads (had a call, no movement in 14+ days)
//   stage IN ('Follow-Up Queue', 'booked') AND last_contact < 14 days ago
//   Fix 3-B: Added event_end IS NULL filter — no-shows have event_end set and
//   are eligible for drip. Segment B should only catch leads who stalled
//   WITHOUT a completed call (e.g., booked but then lost track of).
//   Leads with event_end are managed by the drip cron, not this one.
//
// Segment C — cold_recovery second touch (7–14 days after first email)
//   Got one cold email, went silent. Final touch → Closed Lost + Tom alert.
//
// TICKET-04: write-verify-send pattern enforced.
//   Stage is written first (SW-3/CB-4 pattern preserved). verifyWrite confirms
//   both the new stage and drip_unsubscribed=false before any Resend call.
//   If verification fails, send is skipped and error is logged.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  // TA-2: 48h → 72h — Scout-captured leads need more consideration time before cold outreach
  // TA-3: 30d → 14d — Stalled pipeline leads go cold faster; 30 days is too long to wait
  const cutoff72h = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString();
  const cutoff14d_stalled = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const cutoff7d  = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000).toISOString();
  const cutoff14d = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

  // ── Segment A: Scout-captured, never booked ──────────────────────────────
  // SW-4/CR-2 fix: added drip_unsubscribed = false filter. Previously missing —
  // a Scout lead who opted out but stayed in scout_captured stage would receive
  // this cold email. drip_unsubscribed is the system-wide opt-out flag.
  const { data: coldLeads, error: errorA } = await getSupabase()
    .from("leads")
    .select("id, name, email, phone, brokerage, created_at, stage")
    .eq("stage", "scout_captured")
    .lt("created_at", cutoff72h)  // TA-2: was 48h, now 72h
    .eq("drip_unsubscribed", false)  // SW-4/CR-2 fix: honor system-wide opt-out
    .not("email", "is", null)
    .neq("email", "");

  if (errorA) {
    console.error("Cold cron Segment A error:", errorA);
    return NextResponse.json({ error: errorA.message }, { status: 500 });
  }

  // ── Segment B: Stalled pipeline — booked/follow-up queue, silent 14d ────
  // Fix 3-B: event_end must be null — leads with event_end had an actual call
  // and are owned by the drip cron. This prevents double-sequencing no-shows
  // who land in Follow-Up Queue but still have event_end set from their booking.
  // TA-3: was 30d — reduced to 14d. A stalled lead at 30 days is nearly cold.
  const { data: stalledLeads, error: errorB } = await getSupabase()
    .from("leads")
    .select("id, name, email, phone, brokerage, last_contact, stage")
    .in("stage", ["Follow-Up Queue", "booked"])
    .or(`last_contact.is.null,last_contact.lt.${cutoff14d_stalled}`)  // TA-3: was cutoff30d
    .is("event_end", null)  // Fix 3-B: exclude leads who had a real call (drip owns them)
    .not("email", "is", null)
    .neq("email", "");

  if (errorB) {
    console.error("Cold cron Segment B error:", errorB);
    // Non-fatal — continue with Segment A
  }

  // ── Segment C: cold_recovery second touch — 7–14 days after first email ──
  const { data: recoveryLeads, error: errorC } = await getSupabase()
    .from("leads")
    .select("id, name, email, phone, brokerage, last_contact, stage")
    .eq("stage", "cold_recovery")
    .lt("last_contact", cutoff7d)
    .gt("last_contact", cutoff14d)
    .not("email", "is", null)
    .neq("email", "");

  if (errorC) {
    console.error("Cold cron Segment C error:", errorC);
    // Non-fatal
  }

  const allLeads = [
    ...(coldLeads || []).map(l => ({ ...l, segment: "A" as const })),
    ...(stalledLeads || []).map(l => ({ ...l, segment: "B" as const })),
    ...(recoveryLeads || []).map(l => ({ ...l, segment: "C" as const })),
  ];

  if (allLeads.length === 0) {
    return NextResponse.json({ sent: 0, message: "No cold leads found" });
  }

  let sent = 0;
  const recovered: string[] = [];

  for (const lead of allLeads) {
    const firstName = lead.name?.split(" ")[0] || "there";
    const isRecovery = lead.segment === "C";
    const isStalled  = lead.segment === "B";

    const subject = isRecovery
      ? `One last thing, ${firstName}`
      : isStalled
      ? `Checking back in — still exploring options?`
      : `Still open to a quick conversation?`;

    const leadId = (lead as { id?: string }).id;
    const html = isRecovery
      ? buildFinalRecoveryEmail(firstName, (lead as { brokerage?: string }).brokerage, leadId)
      : isStalled
      ? buildStalledEmail(firstName, (lead as { brokerage?: string }).brokerage, leadId as string | undefined)
      : buildColdEmail(firstName, leadId);

    try {
      // SW-3/CB-4 fix: stage update BEFORE email send.
      // Previously: email sent first, then stage updated. If Resend threw a transient
      // error, the catch block ran, the update was skipped, and the lead remained in
      // scout_captured (Seg A) or cold_recovery indefinitely — receiving another cold
      // email the next day the cron ran.
      // Now: stage is updated first. Worst case (email fails): lead is marked but
      // doesn't receive the email — recoverable. Tom alert still fires if isRecovery.
      // Best case: both succeed normally. This mirrors the noshow cron's Fix 3-A pattern.
      const newStage = isRecovery ? "Closed Lost" : "cold_recovery";
      const { error: writeError } = await getSupabase()
        .from("leads")
        .update({
          stage: newStage,
          last_contact: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", lead.id);

      if (writeError) {
        console.error(`Cold cron stage write failed for ${lead.email}:`, writeError);
        continue; // do not send if we can't record the state change
      }

      // ── TICKET-04: Verify write before sending ────────────────────────────
      // Confirms the new stage is persisted and drip_unsubscribed is still false
      // before any Resend call is made. Guards against RLS blocks and silent failures.
      const isVerified = await verifyWrite({
        supabase: getSupabase(),
        table: "leads",
        match: { id: lead.id },
        expected: {
          stage: newStage,
          drip_unsubscribed: false,
        },
      });

      if (!isVerified) {
        console.error("WRITE VERIFICATION FAILED", {
          route: "cold",
          leadId: lead.id,
          expectedStage: newStage,
        });
        continue; // skip send — state not confirmed
      }

      // Verification passed — safe to send
      await getResend().emails.send({
        from: FROM_EMAIL,
        replyTo: REPLY_TO,
        to: lead.email,
        subject,
        html,
        tags: [
          { name: "sequence", value: "cold" },
          { name: "segment",  value: lead.segment },
        ],
      });

      if (isRecovery) {
        await getResend().emails.send({
          from: FROM_EMAIL,
          replyTo: REPLY_TO,
          to: TOM_EMAIL,
          subject: `[Final Touch Sent] ${lead.name || lead.email} — no response after 2 emails`,
          html: `
            <div style="font-family:sans-serif;max-width:520px;">
              <div style="background:#7f1d1d;padding:14px 20px;border-radius:6px 6px 0 0;">
                <p style="color:#fca5a5;font-weight:700;margin:0;">📵 Final recovery email sent — no response</p>
              </div>
              <div style="background:#fff;border:1px solid #e5e7eb;padding:18px 20px;border-radius:0 0 6px 6px;">
                <p style="margin:0 0 8px;font-size:14px;color:#374151;"><strong>${lead.name || "Unknown"}</strong>${(lead as { brokerage?: string }).brokerage ? ` · ${(lead as { brokerage?: string }).brokerage}` : ""}</p>
                <p style="margin:0 0 8px;font-size:14px;color:#374151;">Email: ${lead.email}</p>
                <p style="margin:0 0 16px;font-size:14px;color:#374151;">Phone: ${(lead as { phone?: string }).phone || "Not captured"}</p>
                <p style="margin:0;font-size:13px;color:#6b7280;">Stage moved to <strong>Closed Lost</strong>. If worth a personal call, now is the time.</p>
              </div>
            </div>`,
        }).catch(() => {});
      }

      sent++;
      recovered.push(`[${lead.segment}] ${lead.name} <${lead.email}> (was: ${lead.stage} → ${newStage})`);
    } catch (emailErr) {
      console.error(`Failed cold recovery for ${lead.email}:`, emailErr);
    }
  }

  if (sent > 0) {
    const segACount = recovered.filter(l => l.startsWith("[A]")).length;
    const segBCount = recovered.filter(l => l.startsWith("[B]")).length;
    const segCCount = recovered.filter(l => l.startsWith("[C]")).length;
    const leadRows = recovered.map(l => `<li style="margin-bottom:4px;">${l}</li>`).join("");
    await getResend().emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to: TOM_EMAIL,
      subject: `🧊 ${sent} cold recovery email${sent > 1 ? "s" : ""} sent`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;">
          <p><strong>${sent} re-engagement email${sent > 1 ? "s" : ""} sent automatically.</strong></p>
          <table style="border-collapse:collapse;margin-bottom:16px;">
            <tr>
              <td style="padding:4px 16px 4px 0;color:#6B7280;">Segment A (never booked):</td>
              <td style="font-weight:600;">${segACount}</td>
            </tr>
            <tr>
              <td style="padding:4px 16px 4px 0;color:#6B7280;">Segment B (stalled pipeline):</td>
              <td style="font-weight:600;">${segBCount}</td>
            </tr>
            <tr>
              <td style="padding:4px 16px 4px 0;color:#6B7280;">Segment C (final touch → Closed Lost):</td>
              <td style="font-weight:600;">${segCCount}</td>
            </tr>
          </table>
          <ul style="font-size:13px;color:#374151;">${leadRows}</ul>
          <p>Stages updated automatically. View in your <a href="https://joinbearteam.com/dashboard">dashboard</a>.</p>
          <p style="color:#888;font-size:12px;">— Scout Automation | Bear Team Real Estate</p>
        </div>
      `,
    }).catch(() => {});
  }

  return NextResponse.json({
    sent,
    recovered,
    segmentA: (coldLeads || []).length,
    segmentB: (stalledLeads || []).length,
    segmentC: (recoveryLeads || []).length,
    message: `Cold recovery complete. ${sent} email${sent !== 1 ? "s" : ""} sent.`,
  });
}

function buildFinalRecoveryEmail(firstName: string, brokerage?: string, leadId?: string): string {
  const brokerageRef = brokerage ? ` at ${brokerage}` : "";
  const unsubLink = leadId
    ? `<a href="https://joinbearteam.com/api/unsubscribe?id=${leadId}" style="color:#aaa;font-size:11px;text-decoration:underline;">Unsubscribe</a>`
    : `<span style="color:#aaa;font-size:11px;">Reply "stop" to opt out</span>`;
  return `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
      <p>Hi ${firstName},</p>
      <p>Last one from me — I don't want to fill your inbox.</p>
      <p>We connected a couple of weeks ago about what your numbers might look like${brokerageRef} vs. Bear Team.
      If the timing wasn't right then, I get it. Markets move, contracts renew, priorities shift.</p>
      <p>If you ever want to run the math — zero pressure, no pitch — my calendar is always open:</p>
      <p><a href="${CALENDLY_LINK}" style="display:inline-block;background:#1a3a5c;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">Schedule 15 Minutes →</a></p>
      <p>Either way, good luck with your production. Orlando is a strong market right now.</p>
      <p>Tom Songer<br><em>Team Lead | Bear Team Real Estate</em><br><a href="https://joinbearteam.com" style="color:#1a3a5c;">joinbearteam.com</a></p>
      <p style="margin-top:20px;border-top:1px solid #eee;padding-top:12px;color:#aaa;font-size:11px;">Bear Team Real Estate · Licensed under Bethanne Baer, Broker/Owner</p>
      <p style="margin-top:4px;padding-top:0;">${unsubLink}</p>
    </div>`;
}

function buildColdEmail(firstName: string, leadId?: string): string {
  // Messaging fix: cut "I know you're busy" (generic recruiter opener).
  // Opens with a specific fee number to surface the pain point immediately.
  // C-3 compliance fix: "typically" added to fee range claim.
  const unsubLink = leadId
    ? `<a href="https://joinbearteam.com/api/unsubscribe?id=${leadId}" style="color:#aaa;font-size:11px;text-decoration:underline;">Unsubscribe</a>`
    : `<span style="color:#aaa;font-size:11px;">Reply "stop" to opt out</span>`;
  return `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
      <p>Hi ${firstName},</p>
      <p>One number most agents never calculate: what they're paying their brokerage before a single deal closes this year. Monthly fees, desk fees, tech fees, E&O — at most major brokerages that's typically $3,000–$6,000 out of pocket before your first commission check hits.</p>
      <p>I'm Tom Songer, Team Lead at <strong>Bear Team Real Estate</strong> in Orlando. We're a boutique brokerage built for producing agents who are tired of being a revenue unit at a big box — agents who know what they're doing and want a platform that gets out of the way.</p>
      <ul>
        <li>Progressive tiers: 60/40 &rarr; 70/30 &rarr; 80/20 &rarr; 90/10</li>
        <li>$16,000 cap, then you advance automatically</li>
        <li>Zero monthly fees. Zero desk fees. Zero tech fees.</li>
        <li>E&amp;O fully covered. Only cost: $150 flat per closing.</li>
      </ul>
      <p>If you want to run your numbers side by side — takes 10 minutes:</p>
      <p><a href="${CALENDLY_LINK}" style="display:inline-block;background:#1a3a5c;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">Schedule 15 Minutes</a></p>
      <p>Tom Songer<br><em>Team Lead | Bear Team Real Estate</em><br><a href="https://joinbearteam.com" style="color:#1a3a5c;">joinbearteam.com</a></p>
      <p style="margin-top:20px;border-top:1px solid #eee;padding-top:12px;color:#aaa;font-size:11px;">Bear Team Real Estate · Licensed under Bethanne Baer, Broker/Owner</p>
      <p style="margin-top:4px;padding-top:0;">${unsubLink}</p>
    </div>`;
}

function buildStalledEmail(firstName: string, brokerage?: string, leadId?: string): string {
  const brokerageRef = brokerage ? ` at ${brokerage}` : "";
  const unsubLink = leadId
    ? `<a href="https://joinbearteam.com/api/unsubscribe?id=${leadId}" style="color:#aaa;font-size:11px;text-decoration:underline;">Unsubscribe</a>`
    : `<span style="color:#aaa;font-size:11px;">Reply "stop" to opt out</span>`;
  return `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
      <p>Hi ${firstName},</p>
      <p>We spoke a little while back about what a move to Bear Team might look like for you${brokerageRef}.
      I wanted to check back in — no pressure, just making sure you have what you need to make the right call.</p>
      <p>Spring market is here. If you're heading into a busy stretch and want to rethink your cost
      structure before deals start closing, now's the right time for a quick conversation.</p>
      <ul>
        <li>Zero monthly fees. Zero desk fees. Zero E&amp;O.</li>
        <li>$150 flat per closing — that's it.</li>
        <li>Progressive tiers: 60/40 &rarr; 70/30 &rarr; 80/20 &rarr; 90/10</li>
      </ul>
      <p><a href="${CALENDLY_LINK}" style="display:inline-block;background:#1a3a5c;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">Schedule 15 Minutes</a></p>
      <p>If the timing still isn't right, just let me know — I'll follow up when it makes more sense.</p>
      <p>Tom Songer<br><em>Team Lead | Bear Team Real Estate</em><br><a href="https://joinbearteam.com" style="color:#1a3a5c;">joinbearteam.com</a></p>
      <p style="margin-top:20px;border-top:1px solid #eee;padding-top:12px;color:#aaa;font-size:11px;">Bear Team Real Estate · Licensed under Bethanne Baer, Broker/Owner</p>
      <p style="margin-top:4px;padding-top:0;">${unsubLink}</p>
    </div>`;
}
