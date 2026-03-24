import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

import { getScoutPrompt } from "@/lib/scout/guardrails/systemPrompt";
import type { ScoutMode } from "@/lib/scout/guardrails/systemPrompt";
import { checkInboundCompliance } from "@/lib/scout/guardrails/complianceRules";


// --- SENDGRID EMAIL HELPER ----------------------------------------------------
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
// -----------------------------------------------------------------------------

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getOpenAI() { return new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); }

function getSupabase() {
  return createClient(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// --- TYPES --------------------------------------------------------------------

interface LeadRecord {
  id?: string;
  email: string;
  name?: string;
  phone?: string;
  status?: string;
  brokerage?: string;
  deal_count?: number;
  avg_price?: number;
  stage?: string;
  last_contact?: string;
  notes?: string;
  objections?: string;
  created_at?: string;
  updated_at?: string;
  source?: string;
  tier?: string;
  call_outcome?: string;
  top_objection?: string;
  follow_up_date?: string;
}

// --- SUPABASE MEMORY HELPERS --------------------------------------------------

async function getReturningLead(email: string): Promise<LeadRecord | null> {
  if (!email || !email.includes("@")) return null;
  try {
    const { data, error } = await getSupabase()
      .from("leads")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single();
    if (error || !data) return null;
    return data as LeadRecord;
  } catch {
    return null;
  }
}

async function upsertLead(lead: Partial<LeadRecord>): Promise<void> {
  if (!lead.email) return;
  try {
    const supabase = getSupabase();
    const emailKey = lead.email.toLowerCase().trim();
    const { data: existing } = await supabase
      .from("leads")
      .select("id")
      .eq("email", emailKey)
      .maybeSingle();
    const payload = {
      ...lead,
      email: emailKey,
      updated_at: new Date().toISOString(),
    };
    if (existing) {
      await supabase.from("leads").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("leads").insert(payload);
    }
  } catch (err) {
    console.error("Supabase upsert error:", err);
  }
}

function extractEmail(text: string): string | null {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

function extractPhone(text: string): string | null {
  const match = text.match(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
  return match ? match[0].replace(/\D/g, "").slice(-10) : null;
}

const CALENDLY_URL = "https://calendly.com/thomas-songer/bear-team-meet";

function detectPipelineStage(messages: { role: string; content: string }[]): string | null {
  const assistantMessages = messages.filter(m => m.role === "assistant").map(m => m.content.toLowerCase());
  const userMessages = messages.filter(m => m.role === "user").map(m => m.content.toLowerCase());
  const allAssistant = assistantMessages.join(" ");
  const lastAssistant = assistantMessages[assistantMessages.length - 1] || "";
  const lastUser = userMessages[userMessages.length - 1] || "";

  const scoutAskedForTimes = lastAssistant.includes("days and times") || lastAssistant.includes("days/times") || lastAssistant.includes("what time") || lastAssistant.includes("works for you this week") || lastAssistant.includes("mornings and early");
  const userGaveTimes = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|morning|afternoon|evening|am|pm|\d+:\d+|\d+ ?[ap]m|this week|next week|anytime|flexible|tomorrow)/i.test(lastUser);
  if (scoutAskedForTimes && userGaveTimes) return "BOOK";

  if (lastAssistant.includes("calendly.com")) return "BOOK";

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const scoutAskedForEmail = allAssistant.includes("best email") || allAssistant.includes("calendar invite");
  const userJustGaveEmail = emailRegex.test(lastUser);
  if (scoutAskedForEmail && userJustGaveEmail) return "COLLECT_TIMES";

  if (lastAssistant.includes("best email") || lastAssistant.includes("calendar invite")) return "COLLECT_EMAIL";
  if (lastAssistant.includes("best number") || lastAssistant.includes("reach you")) return "COLLECT_PHONE";
  if (lastAssistant.includes("what's your name") || lastAssistant.includes("what is your name") || lastAssistant.includes("full name") || lastAssistant.includes("first and last")) return "COLLECT_NAME";
  if (lastAssistant.includes("worth 15 minutes") || lastAssistant.includes("15-minute") || lastAssistant.includes("15 minute")) return "PITCH";

  return null;
}

function extractLeadFieldsFromConversation(
  messages: { role: string; content: string }[]
): { name?: string; phone?: string; brokerage?: string; deal_count?: number } {
  const result: { name?: string; phone?: string; brokerage?: string; deal_count?: number } = {};

  for (let i = 0; i < messages.length - 1; i++) {
    const msg = messages[i];
    const next = messages[i + 1];
    if (msg.role !== "assistant" || next?.role !== "user") continue;

    const question = msg.content.toLowerCase();
    const answer = next.content.trim();

    const asksForName = question.includes("name");
    if (asksForName && answer.length > 0 && answer.length < 60 && !answer.includes("@") && !answer.match(/\d{7,}/)) {
      result.name = answer;
    }
    if (question.includes("best number") || question.includes("reach you")) {
      const phone = extractPhone(answer);
      if (phone) result.phone = phone;
    }
    if (question.includes("best email") || question.includes("calendar invite")) {
      const email = extractEmail(answer);
      if (email) (result as Record<string, unknown>).email = email;
    }
    if (question.includes("hanging your license") || question.includes("current brokerage") || question.includes("currently with")) {
      if (answer.length < 80) result.brokerage = answer;
    }
    if (question.includes("how many deals") || question.includes("close per year") || question.includes("transactions")) {
      const num = parseInt(answer.replace(/[^0-9]/g, ""), 10);
      if (!isNaN(num) && num >= 0 && num < 500) result.deal_count = num;
    }
  }

  return result;
}

function buildMemoryBlock(lead: LeadRecord): string {
  const lines: string[] = [
    "--- RETURNING RECRUIT - PRIOR CONTEXT ---------------------------------------",
    `This agent has contacted Bear Team before. Do NOT ask them to re-explain their situation.`,
    `Use the context below to pick up where the conversation left off.`,
    "",
  ];

  if (lead.name) lines.push(`Name: ${lead.name}`);
  if (lead.email) lines.push(`Email: ${lead.email}`);
  if (lead.brokerage) lines.push(`Current brokerage: ${lead.brokerage}`);
  if (lead.deal_count !== undefined && lead.deal_count !== null) {
    lines.push(`Deals last year: ${lead.deal_count}`);
  }
  if (lead.avg_price) {
    lines.push(`Average sale price: $${lead.avg_price.toLocaleString()}`);
  }
  if (lead.stage) lines.push(`Pipeline stage: ${lead.stage}`);
  if (lead.last_contact) lines.push(`Last contact: ${lead.last_contact}`);
  if (lead.notes) lines.push(`Notes from last conversation: ${lead.notes}`);
  if (lead.objections) lines.push(`Objections raised previously: ${lead.objections}`);

  lines.push("");
  lines.push("RETURNING AGENT RULES:");
  lines.push("1. Acknowledge them by name if you have it - 'Welcome back, [Name].'");
  lines.push("2. Reference their specific situation immediately - brokerage, deal count.");
  lines.push("3. Do NOT restart the funnel from Stage 1. Jump to Stage 3 (Math Moment) or wherever they left off.");
  lines.push("4. If they previously raised an objection, address it directly in your opening.");
  lines.push("5. Your first qualifying question should advance from where they stopped, not restart.");
  lines.push("-----------------------------------------------------------------------------");

  return lines.join("\n");
}

// --- MODE INFERENCE ----------------------------------------------------------

function inferMode(context: string, pathname?: string): ScoutMode {
  if (context === "academy") return "academy";
  if (context === "operations" || context === "os") return "os";
  if (pathname?.includes("academy")) return "academy";
  if (pathname?.includes("dashboard")) return "os";
  return "recruit";
}

// --- ROUTE HANDLER ------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const urlContext = searchParams.get("context");

    const body = await req.json();
    const { messages, message, context: bodyContext, email: bodyEmail, name: bodyName, phone: bodyPhone } = body;

    const declaredContext = urlContext || bodyContext || "public";

    const chatMessages: { role: "user" | "assistant"; content: string }[] =
      messages || [{ role: "user", content: message || "" }];

    let returningLeadBlock = "";
    const firstUserMessage = chatMessages.find((m) => m.role === "user")?.content || "";
    const lastUserMessage = [...chatMessages]
      .reverse()
      .find((m) => m.role === "user")?.content?.toLowerCase() || "";

    const allUserText = chatMessages
      .filter(m => m.role === "user")
      .map(m => m.content)
      .join(" ");
    const emailFromMessage = extractEmail(allUserText) || extractEmail(firstUserMessage) || extractEmail(lastUserMessage);
    const resolvedEmail = bodyEmail || emailFromMessage;

    if (resolvedEmail) {
      const returningLead = await getReturningLead(resolvedEmail);
      if (returningLead) {
        returningLeadBlock = "\n\n" + buildMemoryBlock(returningLead);
      }

      if (declaredContext === "public") {
        const leadData: Partial<LeadRecord> = { email: resolvedEmail, stage: "scout_captured" };
        if (bodyName) leadData.name = bodyName;
        if (bodyPhone) leadData.phone = bodyPhone;

        if (body.deal_count !== undefined) {
          const dc = Number(body.deal_count);
          leadData.deal_count = dc;
          if (dc >= 20)      leadData.tier = "tier_3";
          else if (dc >= 10) leadData.tier = "tier_2";
          else               leadData.tier = "tier_1";
        }
        if (body.avg_price !== undefined)    leadData.avg_price = Number(body.avg_price);
        if (body.brokerage !== undefined)    leadData.brokerage = body.brokerage;
        if (body.years_licensed !== undefined) (leadData as Record<string, unknown>).years_licensed = Number(body.years_licensed);

        if (body.objections || body.notes) {
          const painText = ((body.objections || "") + " " + (body.notes || "")).toLowerCase();
          let painType: string | null = null;
          if (/\b(fee|fees|monthly|desk|cost|paying|expensive|overhead)\b/.test(painText))      painType = "fees";
          else if (/\b(invisible|ignored|lost|support|no one|alone|boutique|personal)\b/.test(painText)) painType = "visibility";
          else if (/\b(brand|flag|name|keller|coldwell|compass|exp|redfin)\b/.test(painText))   painType = "brand";
          else if (/\b(grow|growth|stuck|plateau|ceiling|more deals|volume)\b/.test(painText))  painType = "growth";
          else if (/\b(system|tech|crm|tools|training|academy|process)\b/.test(painText))       painType = "systems";
          if (painType) (leadData as Record<string, unknown>).pain_type = painType;
          if (body.objections) leadData.objections = body.objections;
          if (body.notes)      leadData.notes = body.notes;
        }

        await upsertLead(leadData);
        if (bodyName && bodyPhone) {
          sendEmail({
            from: "Scout <tom@bearteam.com>",
            to: "tom@bearteam.com",
            subject: `🔔 New Lead: ${bodyName}`,
            html: `<p><strong>Scout captured a new lead:</strong></p><ul><li><strong>Name:</strong> ${bodyName}</li><li><strong>Email:</strong> ${resolvedEmail}</li><li><strong>Phone:</strong> ${bodyPhone}</li></ul><p>Log in to your <a href="https://joinbearteam.com/dashboard">dashboard</a> to follow up.</p>`,
          });
        }
      }
    }
    // --------------------------------------------------------------------------

    // ── SUPABASE STAGE GUARD ──────────────────────────────────────────────────
    // Hydrate lead from Supabase so Scout never re-asks for data it already has.
    const sessionId = body.session_id || body.sessionId || null;
    let existingLead: { name?: string; phone?: string; email?: string } = {};
    if (sessionId) {
      const { data: sessionLead } = await getSupabase()
        .from("leads")
        .select("name, phone, email")
        .eq("session_id", sessionId)
        .maybeSingle();
      existingLead = sessionLead ?? {};
    } else if (resolvedEmail) {
      const { data: emailLead } = await getSupabase()
        .from("leads")
        .select("name, phone, email")
        .eq("email", resolvedEmail.toLowerCase().trim())
        .maybeSingle();
      existingLead = emailLead ?? {};
    }

    // Hard stop — if all three fields exist, skip collection entirely
    if (existingLead.name && existingLead.phone && existingLead.email) {
      const bookingReply = `Welcome back, ${existingLead.name}! I have everything I need. Here's your link to book a quick call with Tom: ${CALENDLY_URL} — takes 30 seconds.`;
      return NextResponse.json({
        reply: bookingReply,
        role: "assistant",
        content: bookingReply,
        pipeline_stage: "BOOK",
        calendly_url: CALENDLY_URL,
      });
    }
    // ── END STAGE GUARD ───────────────────────────────────────────────────────

    const rawContext = (body.context as string) || (body.mode as string) || urlContext || "recruit";
    const mode = inferMode(rawContext, req.url);

    // Build Scout system prompt for this mode (web channel)
    let systemPrompt = getScoutPrompt(mode, "web");

    // ── INJECT KNOWN DATA INTO SYSTEM PROMPT ─────────────────────────────────
    // Tells the LLM exactly what it already has — prevents re-asking at the model level
    if (mode === "recruit" && (existingLead.name || existingLead.phone || existingLead.email)) {
      systemPrompt += `

KNOWN USER DATA (DO NOT ASK AGAIN):
Name: ${existingLead.name || "MISSING"}
Phone: ${existingLead.phone || "MISSING"}
Email: ${existingLead.email || "MISSING"}

CRITICAL RULE:
- Never ask for any field that is not marked MISSING
- Only collect fields marked MISSING
- If all three fields exist, move directly to booking
`;
    }
    // ── END KNOWN DATA INJECTION ──────────────────────────────────────────────

    // Inject returning lead memory block - recruit mode only
    if (returningLeadBlock && mode === "recruit") {
      systemPrompt = systemPrompt + returningLeadBlock;
    }

    // -- Inject CONVERSATION STATE block so Scout knows exactly where it is ----
    if (mode === "recruit") {
      const currentStage = detectPipelineStage(chatMessages);
      const stageInstructions: Record<string, string> = {
        "COLLECT_NAME":  "NEXT ACTION: Ask for their full name - first and last. Say exactly: \"What's your full name - first and last?\" Do not ask anything else.",
        "COLLECT_PHONE": "NEXT ACTION: Ask for their best phone number. Say exactly: \"What's the best number to reach you?\" Do not ask anything else.",
        "COLLECT_EMAIL": "NEXT ACTION: Ask for their best email for the calendar invite. Say exactly: \"And the best email for the calendar invite?\" Do not ask anything else.",
        "COLLECT_TIMES": "NEXT ACTION: Ask for 2-3 preferred days and times. Say exactly: \"What are 2 or 3 days and times that work for you this week or next? Tom is usually available mornings and early afternoons.\" Do not ask anything else.",
        "BOOK":          "NEXT ACTION: You have all the information. Send the Calendly link RIGHT NOW. Say: \"I locked it in. Here's your link: https://calendly.com/thomas-songer/bear-team-meet - takes 30 seconds.\" Do NOT ask for more information.",
        "PITCH":         "NEXT ACTION: Deliver the soft math pitch comparing their current brokerage costs to Bear Team, then ask if 15 minutes with Tom is worth their time.",
      };
      const stageLabel = currentStage ?? "QUALIFY";
      const stageInstruction = stageInstructions[stageLabel] ?? "NEXT ACTION: Continue qualifying. Ask the next unanswered pipeline question.";
      systemPrompt += "\n\n" +
        "=======================================================\n" +
        "CONVERSATION STATE (injected by system - do not repeat this to the user)\n" +
        "=======================================================\n" +
        "CURRENT STAGE: " + stageLabel + "\n" +
        stageInstruction + "\n" +
        "=======================================================";
    }
    // --------------------------------------------------------------------------

    // -- Compliance check ------------------------------------------------------
    const lastMessage = chatMessages.filter(m => m.role === "user").slice(-1)[0]?.content ?? "";
    const compliance = checkInboundCompliance(lastMessage);
    if (compliance.requiresDeflection) {
      const deflected = compliance.fallbackOverride ?? "That's a great question - your agent will be the best person to guide you on that.";
      return NextResponse.json({ reply: deflected, role: "assistant", content: deflected, mode, deflected: true });
    }
    // -------------------------------------------------------------------------

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...chatMessages,
      ],
      max_tokens: 600,
      temperature: 0.4,
    });

    const reply =
      response.choices[0]?.message?.content ||
      "Something went wrong. Try again.";

    const allMessages = [...chatMessages, { role: "assistant", content: reply }];
    const pipelineStage = detectPipelineStage(allMessages);

    let finalReply = reply;
    if (pipelineStage === "BOOK") {
      finalReply = reply
        .replace(/the system will send you a calendly link[^.]*\./gi, "")
        .replace(/i'?ll send you a calendly link[^.]*\./gi, "")
        .replace(/a calendly link will be sent[^.]*\./gi, "")
        .trim();
      if (!finalReply.includes("calendly.com")) {
        finalReply = finalReply + `\n\nI locked it in. Here's your link: ${CALENDLY_URL} - takes 30 seconds.`;
      }
    }

    const extractedFields = extractLeadFieldsFromConversation(allMessages);
    const finalEmail = resolvedEmail || (extractedFields as Record<string, unknown>).email as string | undefined;
    if (finalEmail && declaredContext === "public") {
      const savePayload = { email: finalEmail, ...extractedFields };
      await upsertLead(savePayload);
      const hasEnoughForAlert = finalEmail && (
        extractedFields.name || extractedFields.phone || pipelineStage === "BOOK"
      );
      if (hasEnoughForAlert) {
        sendEmail({
          from: "Scout <tom@bearteam.com>",
          to: "tom@bearteam.com",
          subject: `🔔 Lead Ready to Book: ${extractedFields.name}`,
          html: `
            <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#f8f9fa;padding:24px;border-radius:12px;">
              <h2 style="margin:0 0 16px;color:#0b1d3a;font-size:1.1rem;">Scout qualified a lead - ready to book</h2>
              <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
                <tr><td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;font-size:0.85rem;color:#6b7280;width:110px;">Name</td><td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;font-size:0.9rem;color:#1a1a1a;font-weight:600;">${extractedFields.name}</td></tr>
                <tr><td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;font-size:0.85rem;color:#6b7280;">Phone</td><td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;font-size:0.9rem;color:#1a1a1a;">${extractedFields.phone}</td></tr>
                <tr><td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;font-size:0.85rem;color:#6b7280;">Email</td><td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;font-size:0.9rem;color:#1a1a1a;">${finalEmail}</td></tr>
                ${extractedFields.brokerage ? `<tr><td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;font-size:0.85rem;color:#6b7280;">Brokerage</td><td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;font-size:0.9rem;color:#1a1a1a;">${extractedFields.brokerage}</td></tr>` : ""}
                ${extractedFields.deal_count !== undefined ? `<tr><td style="padding:10px 16px;font-size:0.85rem;color:#6b7280;">Deals/year</td><td style="padding:10px 16px;font-size:0.9rem;color:#1a1a1a;">${extractedFields.deal_count}</td></tr>` : ""}
              </table>
              <div style="margin-top:20px;">
                <a href="https://joinbearteam.com/dashboard" style="display:inline-block;padding:10px 22px;background:#1b365d;color:#fff;border-radius:8px;text-decoration:none;font-size:0.88rem;font-weight:600;">View in Dashboard →</a>
              </div>
            </div>`,
        });
      }
    }

    return NextResponse.json({
      reply: finalReply,
      role: "assistant",
      content: finalReply,
      context: rawContext,
      mode,
      returning: !!returningLeadBlock,
      pipeline_stage: pipelineStage,
      calendly_url: pipelineStage === "BOOK" ? CALENDLY_URL : null,
    });
  } catch (error) {
    console.error("Scout API error:", error);
    return NextResponse.json(
      { reply: "Something went wrong. Try again.", error: true },
      { status: 500 }
    );
  }
}
