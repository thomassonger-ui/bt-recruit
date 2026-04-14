/**
 * BearSignal Cron — /api/cron/signal
 *
 * Runs weekdays at 9:00 AM ET (13:00 UTC) via vercel.json.
 *
 * Channel rotation (day of week):
 *   Mon → email (recruiting draft to tom)
 *   Tue → linkedin (auto-post to Join Bear Team page)
 *   Wed → linkedin (auto-post)
 *   Thu → linkedin (auto-post)
 *   Fri → email (recruiting draft to tom)
 *   Sat/Sun → skip
 *
 * LinkedIn posts go directly to Buffer — no queue dependency.
 * Queue writes are best-effort and won't block the post.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/bearsignal/runtime/generator";
import { postToBuffer } from "@/bearsignal/runtime/buffer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FROM_NAME  = "Tom Songer";
const FROM_EMAIL = "tom@bearteam.com";
const REPLY_TO   = "thomas.songer@gmail.com";

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
  linkedin: "[BearSignal] Buffer Posted to LinkedIn — Review Live",
};

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.error("[signal-cron] SENDGRID_API_KEY not set");
    return;
  }
  const body = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: FROM_EMAIL, name: FROM_NAME },
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
  console.log("[signal-cron] Email sent OK to " + to);
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

/** Best-effort queue write — never throws, won't block the post */
async function tryQueueLog(channel: string, content: string, status: string, postId?: string, error?: string): Promise<void> {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabase.from("signal_queue").insert({
      channel,
      content,
      status,
      sent_at: status === "sent" ? new Date().toISOString() : null,
      error: error ?? null,
    });
    console.log("[signal-cron] Queue log written — channel:", channel, "status:", status);
  } catch (err) {
    // Best-effort only — log but don't fail the cron
    console.warn("[signal-cron] Queue log failed (non-blocking):", String(err));
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = "Bearer " + process.env.CRON_SECRET;
  if (authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const toEmail = process.env.SIGNAL_TO_EMAIL || "thomas.songer@gmail.com";
  const now     = new Date();
  const dow     = now.getDay();
  const channel = CHANNEL_BY_DOW[dow];

  if (!channel) {
    console.log("[signal-cron] Weekend — skipping (dow=" + dow + ")");
    return NextResponse.json({ ok: true, channel: "skipped", dow });
  }

  console.log("[signal-cron] Running for channel:", channel, "dow:", dow, "time:", now.toISOString());

  // ── Step 1: Generate content ──────────────────────────────────────────────
  const generated = await generateContent(channel);
  if (!generated) {
    console.error("[signal-cron] Generator returned null for channel:", channel);
    return NextResponse.json({ ok: false, error: "Generator returned null", channel });
  }
  console.log("[signal-cron] Generated", channel, "content —", generated.content.length, "chars");

  // ── Step 2: Send / Post ───────────────────────────────────────────────────
  if (channel === "linkedin") {
    console.log("[signal-cron] Posting to LinkedIn via Buffer...");
    const result = await postToBuffer(generated.content);

    if (result.success) {
      console.log("[signal-cron] LinkedIn posted OK — id:", result.postId);
      // Best-effort queue log
      await tryQueueLog(channel, generated.content, "sent", result.postId);
      // Send confirmation email
      const subject = CHANNEL_SUBJECTS[channel];
      const confirmHtml = contentToHtml(
        "Your LinkedIn post went live (via Buffer).\n\nPost ID: " + (result.postId || "N/A") + "\n\nContent:\n\n" + generated.content
      );
      await sendEmail(toEmail, subject, confirmHtml).catch((e) =>
        console.warn("[signal-cron] Confirmation email failed:", e)
      );
      return NextResponse.json({ ok: true, channel, status: "posted", postId: result.postId });
    } else {
      console.error("[signal-cron] LinkedIn/Buffer failed:", result.error);
      await tryQueueLog(channel, generated.content, "error", undefined, result.error);
      return NextResponse.json({ ok: false, channel, error: result.error }, { status: 500 });
    }

  } else {
    // Email channel — send recruiting draft to Tom
    try {
      const subject = CHANNEL_SUBJECTS[channel];
      await sendEmail(toEmail, subject, contentToHtml(generated.content));
      console.log("[signal-cron] Email sent OK");
      await tryQueueLog(channel, generated.content, "sent");
      return NextResponse.json({ ok: true, channel, status: "sent" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[signal-cron] Email send failed:", msg);
      await tryQueueLog(channel, generated.content, "error", undefined, msg);
      return NextResponse.json({ ok: false, channel, error: msg }, { status: 500 });
    }
  }
}
