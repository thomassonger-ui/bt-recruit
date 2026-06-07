import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { getScoutPrompt } from "@/lib/scout/guardrails/systemPrompt";
import type { ScoutMode } from "@/lib/scout/guardrails/systemPrompt";
import { checkInboundCompliance } from "@/lib/scout/guardrails/complianceRules";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getOpenAI() { return new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); }

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) { console.error("[chat] SENDGRID_API_KEY not set"); return; }
  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "contact@joinbearteam.com", name: "Scout" },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  });
}

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
  referred_by?: string;
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
 * Saves a partial session record keyed by sessionId.
 * Used to persist brokerage/deal_count/objections captured mid-conversation
 * before an email is provided, so the data is available for later upsert.
 */
async function saveSessionSnapshot(
  sessionId: string,
  data: {
    brokerage?: string;
    deal_count?: number;
    objections?: string;
    notes?: string;
  }
): Promise<void> {
  if (!sessionId) return;
  try {
    await getSupabase()
      .from("scout_sessions")
      .upsert(
        {
          session_id: sessionId,
          ...data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "session_id" }
      );
  } catch {
    // Non-blocking — session snapshot is best-effort
  }
}

/**
 * Retrieves a prior session snapshot by sessionId.
 * Used to hydrate a lead record when an email is finally provided.
 */
async function getSessionSnapshot(sessionId: string): Promise<{
  brokerage?: string;
  deal_count?: number;
  objections?: string;
  notes?: string;
} | null> {
  if (!sessionId) return null;
  try {
    const { data, error } = await getSupabase()
      .from("scout_sessions")
      .select("brokerage, deal_count, objections, notes")
      .eq("session_id", sessionId)
      .single();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
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
 * Extracts a brokerage name from the conversation messages.
 * Scans all user messages for Q1-style answers.
 */
function extractBrokerage(messages: { role: string; content: string }[]): string | undefined {
  const brokerageMap: Record<string, string> = {
    kw: "Keller Williams", "keller williams": "Keller Williams",
    exp: "eXp Realty", "exp realty": "eXp Realty",
    remax: "RE/MAX", "re/max": "RE/MAX",
    compass: "Compass",
    "coldwell banker": "Coldwell Banker", cb: "Coldwell Banker",
    "realty one": "Realty One Group", rog: "Realty One Group",
    watson: "Watson Realty", "watson realty": "Watson Realty",
    "charles rutenberg": "Charles Rutenberg Realty", crr: "Charles Rutenberg Realty",
    bhhs: "Berkshire Hathaway HomeServices",
    "century 21": "Century 21", c21: "Century 21",
  };

  for (const msg of messages) {
    if (msg.role !== "user") continue;
    const lower = msg.content.toLowerCase();
    for (const [key, val] of Object.entries(brokerageMap)) {
      if (lower.includes(key)) return val;
    }
  }
  return undefined;
}

/**
 * Extracts a deal count from the conversation (Q2 answer).
 */
function extractDealCount(messages: { role: string; content: string }[]): number | undefined {
  for (const msg of messages) {
    if (msg.role !== "user") continue;
    const match = msg.content.match(/\b(\d{1,2})\s*(deals?|closings?|transactions?|homes?|sales?)\b/i);
    if (match) {
      const n = parseInt(match[1]);
      if (n > 0 && n < 100) return n;
    }
  }
  return undefined;
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
    const {
      messages,
      message,
      context: bodyContext,
      email: bodyEmail,
      name: bodyName,
      phone: bodyPhone,
      sessionId,
      source: bodySource,
      ref: bodyRef,
    } = body;

    // Context priority: URL param → request body → default public
    const declaredContext = urlContext || bodyContext || "public";

    // Support both single message and full conversation history
    const chatMessages: { role: "user" | "assistant"; content: string }[] =
      messages || [{ role: "user", content: message || "" }];

    // ─── MEMORY LAYER — Returning Recruit Lookup ───────────────────────────────
    // 1. Check if email was passed explicitly in the request body
    // 2. If not, scan all user messages for an email address
    // 3. If we have an email, query Supabase for a returning lead record
    // 4. If found, inject their prior context into the system prompt
    // 5. On every request, extract brokerage/deal_count from messages and
    //    save a session snapshot — so data is ready when email arrives

    let returningLeadBlock = "";
    const firstUserMessage = chatMessages.find((m) => m.role === "user")?.content || "";
    const lastUserMessage = [...chatMessages]
      .reverse()
      .find((m) => m.role === "user")?.content?.toLowerCase() || "";

    // Determine email — explicit body param takes priority over extracted
    const emailFromMessage = extractEmail(firstUserMessage) || extractEmail(lastUserMessage);
    // Also scan all messages for an email (catches COLLECT_EMAIL_EARLY response)
    const emailFromHistory = chatMessages
      .map((m) => extractEmail(m.content))
      .find((e) => e !== null) ?? null;
    const resolvedEmail = bodyEmail || emailFromMessage || emailFromHistory;

    // ── Session snapshot — save whatever Scout has learned so far ───────────
    // Runs on every request, best-effort, keyed by sessionId
    if (sessionId && declaredContext === "public") {
      const brokerage = extractBrokerage(chatMessages);
      const deal_count = extractDealCount(chatMessages);
      if (brokerage || deal_count) {
        saveSessionSnapshot(sessionId, { brokerage, deal_count }).catch(() => {});
      }
    }

    if (resolvedEmail) {
      const returningLead = await getReturningLead(resolvedEmail);
      if (returningLead) {
        returningLeadBlock = "\n\n" + buildMemoryBlock(returningLead);
      }

      // Save/update lead record whenever we have an email
      if (declaredContext === "public") {
        const leadData: Partial<LeadRecord> = {
          email: resolvedEmail,
          stage: "scout_captured",
          last_contact: new Date().toISOString().split("T")[0],
        };
        if (bodyName) leadData.name = bodyName;
        if (bodyPhone) leadData.phone = bodyPhone;
        if (bodySource) leadData.source = String(bodySource).slice(0, 80);

        // Hydrate from session snapshot if this is the first time we have their email
        if (sessionId && !returningLeadBlock) {
          const snapshot = await getSessionSnapshot(sessionId);
          if (snapshot) {
            if (snapshot.brokerage) leadData.brokerage = snapshot.brokerage;
            if (snapshot.deal_count) leadData.deal_count = snapshot.deal_count;
            if (snapshot.objections) leadData.objections = snapshot.objections;
            if (snapshot.notes) leadData.notes = snapshot.notes;
          }
        }

        // Also capture brokerage/deal_count directly from messages
        const brokerage = extractBrokerage(chatMessages);
        const deal_count = extractDealCount(chatMessages);
        if (brokerage) leadData.brokerage = brokerage;
        if (deal_count) leadData.deal_count = deal_count;
        if (bodyRef) {
          leadData.referred_by = String(bodyRef).slice(0, 60)
          leadData.notes = [leadData.notes, `Referred by: ${leadData.referred_by}`].filter(Boolean).join(" | ")
        };

        await upsertLead(leadData);

        // Fire-and-forget Tom alert on full lead capture
        if (bodyName && bodyPhone) {
          sendEmail(
            "contact@joinbearteam.com",
            `🔔 New Lead: ${bodyName}`,
            `<p><strong>Scout captured a new lead:</strong></p><ul><li><strong>Name:</strong> ${bodyName}</li><li><strong>Email:</strong> ${resolvedEmail}</li><li><strong>Phone:</strong> ${bodyPhone}</li></ul><p>Log in to your <a href="https://joinbearteam.com/dashboard">dashboard</a> to follow up.</p>`,
          ).catch(() => {});
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

    return NextResponse.json({
      reply,
      role: "assistant",
      content: reply,
      context: rawContext,
      mode,
      returning: !!returningLeadBlock, // tells frontend whether memory was loaded
    });
  } catch (error) {
    console.error("Scout API error:", error);
    return NextResponse.json(
      { reply: "Something went wrong. Try again.", error: true },
      { status: 500 }
    );
  }
}
