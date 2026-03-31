/**
 * BearSignal Cron — /api/cron/signal
 *
 * Runs weekdays at 9:00 AM ET (13:00 UTC) via vercel.json.
 *
 * Flow:
 *   1. Generate content for today's channel via Scout
 *   2. Write to signal_queue (status = pending)
 *   3. Pull all pending rows
 *   4. Send each via SendGrid
 *   5. Mark sent / error per row
 *
 * Channel rotation (day of week):
 *   Mon → email
 *   Tue → linkedin
 *   Wed → linkedin
 *   Thu → linkedin
 *   Fri → email
 *   Sat/Sun → skip
 */

import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/bearsignal/runtime/generator";
import { queueContent, getPendingQueue, markSent, markError } from "@/bearsignal/runtime/queue";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FROM_EMAIL = "Tom Songer <tom@bearteam.com>";
const REPLY_TO   = "tom@bearteam.com";

type Channel = "email" | "linkedin";

const CHANNEL_BY_DOW: Record<number, Channel | null> = {
  0: null,
  1: "email",
  2: "linkedin",
  3: "linkedin",
  4: "linkedin",
  5: "email",
  6: null,
};

const CHANNEL_SUBJECTS: Record<Channel, string> = {
  email:    "Bear Team — Agent Opportunity This Week",
  linkedin: "[BearSignal] LinkedIn Draft — Review Ready",
};

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.error("[signal-cron] SENDGRID_API_KEY not set");
    return;
  }
  const body = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: FROM_EMAIL },
    reply_to: { email: REPLY_TO },
    subject,
    content: [{ type: "text/html", value: html }],
  };
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error("SendGrid " + res.status + ": " + errText);
  }
  console.log("[signal-cron] Sent OK to " + to);
}

function contentToHtml(content: string): string {
  const lines = content.split("\n").map((line) =>
    "<p style=\"margin:0 0 12px;\">" + line + "</p>"
  ).join("");
  return (
    "<div style=\"font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111;\">" +
    lines +
    "<hr style=\"border:none;border-top:1px solid #eee;margin:24px 0;\" />" +
    "<p style=\"font-size:12px;color:#888;\">BearSignal — Bear Team Real Estate | Orlando, FL</p>" +
    "</div>"
  );
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = "Bearer " + process.env.CRON_SECRET;
  if (authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const toEmail = process.env.SIGNAL_TO_EMAIL || "tom@bearteam.com";
  const now     = new Date();
  const dow     = now.getDay();
  const channel = CHANNEL_BY_DOW[dow];
  const results: { id: string; channel: string; status: string; error?: string }[] = [];

  // Step 1: Generate + queue today's content (skip weekends)
  if (channel) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ("https://" + process.env.VERCEL_URL);
    const generated = await generateContent(channel, baseUrl);
    if (generated) {
      try {
        await queueContent(generated);
        console.log("[signal-cron] Queued " + channel + " content");
      } catch (err) {
        console.error("[signal-cron] Queue write failed:", err);
      }
    } else {
      console.warn("[signal-cron] Generator returned null for channel: " + channel);
    }
  } else {
    console.log("[signal-cron] Weekend — skipping (dow=" + dow + ")");
  }

  // Step 2: Drain all pending rows
  const pending = await getPendingQueue();
  console.log("[signal-cron] " + pending.length + " pending row(s) to send");

  for (const row of pending) {
    const ch = row.channel as Channel;
    const subject = CHANNEL_SUBJECTS[ch] || "[BearSignal] Content Ready";
    try {
      await sendEmail(toEmail, subject, contentToHtml(row.content));
      await markSent(row.id);
      results.push({ id: row.id, channel: row.channel, status: "sent" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[signal-cron] Send failed for " + row.id + ":", msg);
      await markError(row.id, msg);
      results.push({ id: row.id, channel: row.channel, status: "error", error: msg });
    }
  }

  return NextResponse.json({
    ok: true,
    date: now.toISOString(),
    channel: channel || "skipped",
    processed: results.length,
    results,
  });
}
