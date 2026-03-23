import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

import { getScoutPrompt } from "@/lib/scout/guardrails/systemPrompt";
import type { ScoutMode } from "@/lib/scout/guardrails/systemPrompt";
import { checkInboundCompliance } from "@/lib/scout/guardrails/complianceRules";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getOpenAI() { return new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); }
function getResend() { return new Resend(process.env.RESEND_API_KEY!); }

// Lazy init — avoids build-time crash
function getSupabase() {
  return createClient(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

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

// ─── SUPABASE MEMORY HELPERS ──────────────────────────────────────────────────

/**
 * Look up a returning recruit by email in Supabase.
 * Returns their lead record if found, null if not.
 */
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

/**
 * Upsert a lead record — creates new or updates existing on email match.
 * Called when Scout captures a new lead OR when a returning lead provides
 * updated information during a conversation.
 */
async function upsertLead(lead: Partial<LeadRecord>): Promise<void> {
  if (!lead.email) return;

  try {
    await getSupabase()
      .from("leads")
      .upsert(
        {
          ...lead,
          email: lead.email.toLowerCase().trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );
  } catch (err) {
    console.error("Supabase upsert error:", err);
  }
}

/**
 * Extracts an email address from a message string, if present.
 * Scout can use this to trigger memory lookup mid-conversation.
 */
function extractEmail(text: string): string | null {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

/**
 * Extracts a phone number from a message string, if present.
 */
function extractPhone(text: string): string | null {
  const match = text.match(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
  return match ? match[0].replace(/\D/g, "").slice(-10) : null;
}

/**
 * Detects which pipeline stage the conversation has reached based on
 * Scout's responses. Returns the stage string or null.
 * Used by the frontend to trigger Calendly handoff at BOOK stage.
 */
const CALENDLY_URL = "https://calendly.com/thomas-songer/bear-team-meet";

function detectPipelineStage(messages: { role: string; content: string }[]): string | null {
  const assistantMessages = messages.filter(m => m.role === "assistant").map(m => m.content.toLowerCase());
  const userMessages = messages.filter(m => m.role === "user").map(m => m.content.toLowerCase());
  const allAssistant = assistantMessages.join(" ");
  const lastAssistant = assistantMessages[assistantMessages.length - 1] || "";
  const lastUser = userMessages[userMessages.length - 1] || "";

  // BOOK stage — Scout asked for times AND user just replied with time preferences
  // OR Scout explicitly sends the Calendly link in reply
  const scoutAskedForTimes = lastAssistant.includes("days and times") || lastAssistant.includes("days/times") || lastAssistant.includes("what time") || lastAssistant.includes("works for you this week") || lastAssistant.includes("mornings and early");
  const userGaveTimes = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|morning|afternoon|evening|am|pm|\d+:\d+|\d+ ?[ap]m|this week|next week|anytime|flexible|tomorrow)/i.test(lastUser);
  if (scoutAskedForTimes && userGaveTimes) return "BOOK";

  // BOOK stage fallback — Scout explicitly includes the Calendly link
  if (lastAssistant.includes("calendly.com")) return "BOOK";

  // COLLECT_TIMES stage — Scout asked for email and user just provided it
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const scoutAskedForEmail = allAssistant.includes("best email") || allAssistant.includes("calendar invite");
  const userJustGaveEmail = emailRegex.test(lastUser);
  if (scoutAskedForEmail && userJustGaveEmail) return "COLLECT_TIMES";

  // COLLECT_EMAIL stage
  if (lastAssistant.includes("best email") || lastAssistant.includes("calendar invite")) return "COLLECT_EMAIL";

  // COLLECT_PHONE stage
  if (lastAssistant.includes("best number") || lastAssistant.includes("reach you")) return "COLLECT_PHONE";

  // COLLECT_NAME stage
  if (lastAssistant.includes("what's your name") || lastAssistant.includes("what is your name")) return "COLLECT_NAME";

  // PITCH stage
  if (lastAssistant.includes("worth 15 minutes") || lastAssistant.includes("15-minute") || lastAssistant.includes("15 minute")) return "PITCH";

  return null;
}

/**
 * Scans the full conversation to extract name/phone/brokerage/deals
 * from user messages based on what Scout asked just before.
 */
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

    // Name capture
    if ((question.includes("what's your name") || question.includes("your name?")) && answer.length > 0 && answer.length < 60 && !answer.includes("@")) {
      result.name = answer;
    }

    // Phone capture
    if (question.includes("best number") || question.includes("reach you")) {
      const phone = extractPhone(answer);
      if (phone) result.phone = phone;
    }

    // Brokerage capture
    if (question.includes("hanging your license") || question.includes("current brokerage") || question.includes("currently with")) {
      if (answer.length < 80) result.brokerage = answer;
    }

    // Deal count capture
    if (question.includes("how many deals") || question.includes("close per year") || question.includes("transactions")) {
      const num = parseInt(answer.replace(/[^0-9]/g, ""), 10);
      if (!isNaN(num) && num >= 0 && num < 500) result.deal_count = num;
    }
  }

  return result;
}

/**
 * Builds a returning-agent context block to inject into the system prompt.
 * This gives Scout full prior context so the agent never has to re-explain.
 */
function buildMemoryBlock(lead: LeadRecord): string {
  const lines: string[] = [
    "─── RETURNING RECRUIT — PRIOR CONTEXT ───────────────────────────────────────",
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
  lines.push("1. Acknowledge them by name if you have it — 'Welcome back, [Name].'");
  lines.push("2. Reference their specific situation immediately — brokerage, deal count.");
  lines.push("3. Do NOT restart the funnel from Stage 1. Jump to Stage 3 (Math Moment) or wherever they left off.");
  lines.push("4. If they previously raised an objection, address it directly in your opening.");
  lines.push("5. Your first qualifying question should advance from where they stopped, not restart.");
  lines.push("─────────────────────────────────────────────────────────────────────────────");

  return lines.join("\n");
}

// ─── MODE INFERENCE ──────────────────────────────────────────────────────────
// Maps legacy context strings and URL pathnames to Scout mode.
// Explicit mode in request body always wins.

function inferMode(context: string, pathname?: string): ScoutMode {
  if (context === "academy") return "academy";
  if (context === "operations" || context === "os") return "os";
  if (pathname?.includes("academy")) return "academy";
  if (pathname?.includes("dashboard")) return "os";
  return "recruit";
}

// ─── ROUTE HANDLER ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const urlContext = searchParams.get("context");

    const body = await req.json();
    const { messages, message, context: bodyContext, email: bodyEmail, name: bodyName, phone: bodyPhone } = body;

    // Context priority: URL param → request body → default public
    const declaredContext = urlContext || bodyContext || "public";

    // Support both single message and full conversation history
    const chatMessages: { role: "user" | "assistant"; content: string }[] =
      messages || [{ role: "user", content: message || "" }];

    // ─── MEMORY LAYER — Returning Recruit Lookup ───────────────────────────────
    // 1. Check if email was passed explicitly in the request body
    // 2. If not, scan the first user message for an email address
    // 3. If we have an email, query Supabase for a returning lead record
    // 4. If found, inject their prior context into the system prompt

    let returningLeadBlock = "";
    const firstUserMessage = chatMessages.find((m) => m.role === "user")?.content || "";
    const lastUserMessage = [...chatMessages]
      .reverse()
      .find((m) => m.role === "user")?.content?.toLowerCase() || "";

    // Determine email — explicit body param takes priority over extracted
    const emailFromMessage = extractEmail(firstUserMessage) || extractEmail(lastUserMessage);
    const resolvedEmail = bodyEmail || emailFromMessage;

    if (resolvedEmail) {
      const returningLead = await getReturningLead(resolvedEmail);
      if (returningLead) {
        returningLeadBlock = "\n\n" + buildMemoryBlock(returningLead);
      }

      // Save/update lead record whenever we have an email — captures name+phone if provided
      if (declaredContext === "public") {
        const leadData: Partial<LeadRecord> = { email: resolvedEmail, stage: "scout_captured" };
        if (bodyName) leadData.name = bodyName;
        if (bodyPhone) leadData.phone = bodyPhone;

        // ── Priority 2: Auto-compute tier from deal_count ──────────────────
        // Stored so email variants can branch without re-calculating each time.
        // tier_1 = <10 deals, tier_2 = 10–19, tier_3 = 20+
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

        // ── Priority 3: Classify pain_type from Scout-captured frustration ──
        // Scout stores raw objection/frustration text in `objections`. This
        // classifies it into one of 5 structured buckets so downstream emails
        // can vary hooks without parsing freeform text at send time.
        // Classification is keyword-based — fast, no LLM call needed.
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
        // Fire-and-forget Tom alert on full lead capture
        if (bodyName && bodyPhone) {
          getResend().emails.send({
            from: "Scout <scout@joinbearteam.com>",
            to: "thomas.songer@gmail.com",
            subject: `🔔 New Lead: ${bodyName}`,
            html: `<p><strong>Scout captured a new lead:</strong></p><ul><li><strong>Name:</strong> ${bodyName}</li><li><strong>Email:</strong> ${resolvedEmail}</li><li><strong>Phone:</strong> ${bodyPhone}</li></ul><p>Log in to your <a href="https://joinbearteam.com/dashboard">dashboard</a> to follow up.</p>`,
          }).catch(() => {});
        }
      }
    }
    // ──────────────────────────────────────────────────────────────────────────

    // Mode is set via body, URL param, or inferred from pathname — never from message content
    const rawContext = (body.context as string) || (body.mode as string) || urlContext || "recruit";
    const mode = inferMode(rawContext, req.url);

    // Build Scout system prompt for this mode (web channel)
    let systemPrompt = getScoutPrompt(mode, "web");

    // Inject returning lead memory block — recruit mode only
    if (returningLeadBlock && mode === "recruit") {
      systemPrompt = systemPrompt + returningLeadBlock;
    }

    // ── Compliance check — runs before LLM on every request ──────────────────
    const lastMessage = chatMessages.filter(m => m.role === "user").slice(-1)[0]?.content ?? "";
    const compliance = checkInboundCompliance(lastMessage);
    if (compliance.requiresDeflection) {
      const deflected = compliance.fallbackOverride ?? "That's a great question — your agent will be the best person to guide you on that.";
      return NextResponse.json({ reply: deflected, role: "assistant", content: deflected, mode, deflected: true });
    }
    // ─────────────────────────────────────────────────────────────────────────

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

    // Detect pipeline stage from full conversation + new reply
    const allMessages = [...chatMessages, { role: "assistant", content: reply }];
    const pipelineStage = detectPipelineStage(allMessages);

    // If BOOK stage: append the actual Calendly link into Scout's reply so it shows in chat
    let finalReply = reply;
    if (pipelineStage === "BOOK") {
      // Strip any vague "system will send" language and replace with real link
      finalReply = reply
        .replace(/the system will send you a calendly link[^.]*\./gi, "")
        .replace(/i'?ll send you a calendly link[^.]*\./gi, "")
        .replace(/a calendly link will be sent[^.]*\./gi, "")
        .trim();
      if (!finalReply.includes("calendly.com")) {
        finalReply = finalReply + `\n\nHere's your link to book 15 minutes with Tom: ${CALENDLY_URL}`;
      }
    }

    // Extract lead fields from conversation to save to Supabase
    const extractedFields = extractLeadFieldsFromConversation(allMessages);
    if (resolvedEmail && Object.keys(extractedFields).length > 0 && declaredContext === "public") {
      await upsertLead({ email: resolvedEmail, ...extractedFields });
      // Fire Tom alert when name+phone are both captured for the first time
      if (extractedFields.name && extractedFields.phone) {
        getResend().emails.send({
          from: "Scout <scout@joinbearteam.com>",
          to: "thomas.songer@gmail.com",
          subject: `🔔 Lead Ready to Book: ${extractedFields.name}`,
          html: `<p><strong>Scout qualified a lead and they're ready to book:</strong></p><ul><li><strong>Name:</strong> ${extractedFields.name}</li><li><strong>Email:</strong> ${resolvedEmail}</li><li><strong>Phone:</strong> ${extractedFields.phone}</li>${extractedFields.brokerage ? `<li><strong>Brokerage:</strong> ${extractedFields.brokerage}</li>` : ""}${extractedFields.deal_count !== undefined ? `<li><strong>Deals/year:</strong> ${extractedFields.deal_count}</li>` : ""}</ul><p><a href="https://joinbearteam.com/dashboard">View in dashboard →</a></p>`,
        }).catch(() => {});
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


