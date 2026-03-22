/**
 * Scout Unified API Route — /api/scout
 *
 * Conversation pipeline (recruit mode):
 *   QUALIFY  → 4 questions: brokerage → deals/year → biggest frustration → what would make you move
 *   PITCH    → soft math comparison, Bear Team advantage, warm appointment ask
 *   COLLECT  → name → phone → email (one at a time)
 *   SAVE     → upsert lead to Supabase leads table
 *   BOOK     → send Calendly link to confirm 15-minute call
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { buildSystemPrompt, type ScoutMode, type Channel } from "@/lib/scout/guardrails/systemPrompt";
import { checkInboundCompliance } from "@/lib/scout/guardrails/complianceRules";
import { checkEscalation } from "@/lib/scout/guardrails/escalationRules";
import { validateResponse } from "@/lib/scout/guardrails/responseValidator";
import { enforceScheduling, enforceConversionPresence } from "@/lib/scout/guardrails/conversionRules";
import { FALLBACKS, CALENDLY_LINK } from "@/lib/scout/config/scoutConfig";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ── OpenAI ─────────────────────────────────────────────────────────────────────
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  return _openai;
}

// ── Supabase ───────────────────────────────────────────────────────────────────
let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ScoutRequest {
  messages: Message[];
  mode?: ScoutMode;
  channel?: Channel;
}

// Pipeline stages — in order
type RecruitStage =
  | "Q1_BROKERAGE"      // Ask where they hang their license
  | "Q2_DEALS"          // Ask how many deals/year
  | "Q3_FRUSTRATION"    // Ask their biggest frustration
  | "Q4_MOVE"           // Ask what would make them consider a move
  | "PITCH"             // Soft math pitch + warm appointment ask
  | "COLLECT_NAME"      // Ask for their name
  | "COLLECT_PHONE"     // Ask for their phone number
  | "COLLECT_EMAIL"     // Ask for their email
  | "BOOK";             // Save to Supabase + send Calendly link

// ── Brokerage normalization ────────────────────────────────────────────────────
const BROKERAGE_MAP: Record<string, string> = {
  kw: "Keller Williams", "keller williams": "Keller Williams",
  exp: "eXp Realty", "exp realty": "eXp Realty",
  remax: "RE/MAX", "re/max": "RE/MAX", "re max": "RE/MAX",
  c21: "Century 21", "century 21": "Century 21",
  cb: "Coldwell Banker", "coldwell banker": "Coldwell Banker",
  bhhs: "Berkshire Hathaway HomeServices", "berkshire hathaway": "Berkshire Hathaway HomeServices",
  era: "ERA Real Estate", compass: "Compass",
  rog: "Realty One Group", "realty one": "Realty One Group",
  watson: "Watson Realty", crr: "Charles Rutenberg Realty",
  "charles rutenberg": "Charles Rutenberg Realty",
  sothebys: "Sotheby's International Realty", "sotheby's": "Sotheby's International Realty",
};

const BROKERAGE_PATTERNS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /\bkw\b|keller\s*williams/i, name: "Keller Williams" },
  { pattern: /\bexp\b|eXp\s*realty/i, name: "eXp Realty" },
  { pattern: /\bremax\b|re\/max|re\s*max/i, name: "RE/MAX" },
  { pattern: /\bc21\b|century\s*21/i, name: "Century 21" },
  { pattern: /coldwell\s*banker|\bcb\b/i, name: "Coldwell Banker" },
  { pattern: /berkshire\s*hathaway|\bbhhs\b/i, name: "Berkshire Hathaway HomeServices" },
  { pattern: /\bcompass\b/i, name: "Compass" },
  { pattern: /realty\s*one|realty\s*one\s*group|\broj\b/i, name: "Realty One Group" },
  { pattern: /\bwatson\b/i, name: "Watson Realty" },
  { pattern: /charles\s*rutenberg|\bcrr\b/i, name: "Charles Rutenberg Realty" },
  { pattern: /sotheby's?/i, name: "Sotheby's International Realty" },
  { pattern: /\bera\b/i, name: "ERA Real Estate" },
];

function normalizeBrokerage(text: string): string | null {
  const key = text.trim().toLowerCase();
  return BROKERAGE_MAP[key] ?? null;
}

// New licensee patterns
const NEW_LICENSEE_PATTERNS = [
  /just (?:got|received|passed|earned) (?:my |the )?(?:license|exam|test)/i,
  /brand[- ]?new (?:agent|licensee)/i,
  /new (?:agent|to (?:real estate|the business|realty))/i,
  /exploring (?:where to hang|my options|brokerages)/i,
  /looking for (?:a |my first )?brokerage/i,
  /first brokerage/i,
  /where (?:should i hang|to hang my)/i,
  /haven't (?:decided|chosen|picked)(?: a brokerage)?/i,
  /not (?:with|at) (?:a |any )?brokerage(?: yet)?/i,
  /no (?:current )?brokerage/i,
];

// ── Context extractor ──────────────────────────────────────────────────────────
interface RecruitContext {
  stage: RecruitStage;
  brokerage: string | null;
  newLicensee: boolean;
  dealCount: number | null;
  frustration: string | null;
  moveReason: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  userMessageCount: number;
}

function extractRecruitContext(messages: Message[]): RecruitContext {
  const ctx: RecruitContext = {
    stage: "Q1_BROKERAGE",
    brokerage: null,
    newLicensee: false,
    dealCount: null,
    frustration: null,
    moveReason: null,
    contactName: null,
    contactPhone: null,
    contactEmail: null,
    userMessageCount: 0,
  };

  const userMessages = messages.filter((m) => m.role === "user");
  ctx.userMessageCount = userMessages.length;

  // Walk all assistant messages to understand what was asked,
  // and user messages to extract answers
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const text = msg.content.trim();
    const lower = text.toLowerCase();

    if (msg.role === "user") {
      // ── Brokerage / new licensee ──
      if (!ctx.brokerage && !ctx.newLicensee) {
        if (NEW_LICENSEE_PATTERNS.some((p) => p.test(text))) {
          ctx.newLicensee = true;
          ctx.brokerage = "New licensee — no current brokerage";
        } else {
          const direct = normalizeBrokerage(lower);
          if (direct) {
            ctx.brokerage = direct;
          } else {
            for (const { pattern, name } of BROKERAGE_PATTERNS) {
              if (pattern.test(text)) { ctx.brokerage = name; break; }
            }
          }
        }
      }

      // ── Deal count ──
      if (ctx.dealCount === null) {
        const m = text.match(/(\d+)\s*(?:deals?|closings?|transactions?|sales?)\s*(?:a\s*year|annually|per\s*year|\/\s*year)?/i)
          ?? text.match(/closes?\s*(?:about\s*)?(\d+)/i)
          ?? text.match(/(\d+)\s*(?:a\s*year|annually|per\s*year)/i)
          ?? text.match(/^(\d{1,3})$/); // bare number like "8" or "12"
        if (m) {
          const n = parseInt(m[1], 10);
          if (!isNaN(n) && n > 0 && n < 200) ctx.dealCount = n;
        }
      }

      // ── Frustration (Q3) ──
      // Only capture after brokerage AND deals are collected
      if (!ctx.frustration && ctx.brokerage && ctx.dealCount !== null) {
        // Any meaningful user response after deals is the frustration answer
        if (text.split(/\s+/).length >= 1 && !isContactInfo(text)) {
          ctx.frustration = text.slice(0, 120);
        }
      }

      // ── Move reason (Q4) ──
      // Only capture after frustration is set
      if (!ctx.moveReason && ctx.frustration && text !== ctx.frustration) {
        if (!isContactInfo(text)) {
          ctx.moveReason = text.slice(0, 120);
        }
      }

      // ── Contact info ──
      if (!ctx.contactEmail) {
        const emailMatch = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) ctx.contactEmail = emailMatch[0];
      }
      if (!ctx.contactPhone) {
        const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
        if (phoneMatch) ctx.contactPhone = phoneMatch[0].replace(/\s+/g, "");
      }
      // Name: capture if assistant asked for it (previous assistant msg contains "your name")
      if (!ctx.contactName && i > 0) {
        const prevAssistant = messages.slice(0, i).reverse().find((m) => m.role === "assistant");
        if (prevAssistant && /your name|what(?:'s| is) your name/i.test(prevAssistant.content)) {
          // Verify it doesn't look like contact info
          if (!isContactInfo(text) && text.split(/\s+/).length <= 5) {
            ctx.contactName = text;
          }
        }
      }
    }
  }

  // ── Determine current pipeline stage ──
  ctx.stage = resolveStage(ctx);
  return ctx;
}

function isContactInfo(text: string): boolean {
  return /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/.test(text)
    || /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
}

function resolveStage(ctx: RecruitContext): RecruitStage {
  if (!ctx.brokerage && !ctx.newLicensee) return "Q1_BROKERAGE";
  if (ctx.dealCount === null && !ctx.newLicensee) return "Q2_DEALS";
  // New licensee skips Q2 (no deals yet) — goes straight to Q3 about goals
  if (!ctx.frustration) return "Q3_FRUSTRATION";
  if (!ctx.moveReason) return "Q4_MOVE";
  if (!ctx.contactName) return "COLLECT_NAME";
  if (!ctx.contactPhone) return "COLLECT_PHONE";
  if (!ctx.contactEmail) return "COLLECT_EMAIL";
  return "BOOK";
}

// ── State block injected into every LLM call ──────────────────────────────────
function buildStateBlock(ctx: RecruitContext): string {
  const lines: string[] = [
    "\n\n════════════════════════════════════════════════════",
    "CONVERSATION STATE — CURRENT PIPELINE POSITION",
    "════════════════════════════════════════════════════",
    `Stage: ${ctx.stage}`,
    `Brokerage: ${ctx.newLicensee ? "NEW LICENSEE (no current brokerage)" : ctx.brokerage ?? "NOT YET COLLECTED"}`,
    `Deal count: ${ctx.dealCount !== null ? `${ctx.dealCount}/year` : "NOT YET COLLECTED"}`,
    `Frustration: ${ctx.frustration ?? "NOT YET COLLECTED"}`,
    `Move reason: ${ctx.moveReason ?? "NOT YET COLLECTED"}`,
    `Name: ${ctx.contactName ?? "NOT YET COLLECTED"}`,
    `Phone: ${ctx.contactPhone ?? "NOT YET COLLECTED"}`,
    `Email: ${ctx.contactEmail ?? "NOT YET COLLECTED"}`,
    "",
    "NEXT ACTION (follow this exactly — do not skip steps):",
  ];

  switch (ctx.stage) {
    case "Q1_BROKERAGE":
      lines.push("→ Ask: \"Where are you currently hanging your license?\" — nothing else.");
      break;
    case "Q2_DEALS":
      lines.push(`→ Brokerage collected: ${ctx.brokerage}. Ask: \"How many deals do you typically close per year?\" — nothing else.`);
      break;
    case "Q3_FRUSTRATION":
      if (ctx.newLicensee) {
        lines.push("→ NEW LICENSEE. Answer their question warmly. Then ask: \"What's most important to you as you choose your first brokerage — training, support, the commission structure, or something else?\"");
      } else {
        lines.push(`→ You have brokerage (${ctx.brokerage}) and deals (${ctx.dealCount}/yr). Ask: \"What's your biggest frustration with ${ctx.brokerage} right now?\" — one question, nothing else.`);
      }
      break;
    case "Q4_MOVE":
      lines.push(`→ Frustration collected: "${ctx.frustration}". Validate it with one sentence. Then ask: \"What would it take for you to seriously consider making a move?\" — one question.`);
      break;
    case "PITCH": {
      const deals = ctx.dealCount ?? 8;
      const avgPrice = 300000;
      const kwMonthly = 85;
      const kwSplit = 0.30; // 70/30
      const btSplit = 0.40; // starts 60/40 but caps at $16K then advances
      const btCap = 16000;
      const btFlat = 150;
      const annualGCI = deals * avgPrice * 0.03;
      const kwBrokerCut = Math.min(annualGCI * kwSplit, 32000) + (kwMonthly * 12);
      const btBrokerCut = Math.min(annualGCI * btSplit, btCap) + (deals * btFlat);
      const savings = Math.round(kwBrokerCut - btBrokerCut);
      lines.push(`→ ALL 4 QUESTIONS COMPLETE. Deliver the soft math pitch:`);
      lines.push(`  - Acknowledge their move reason: "${ctx.moveReason}"`);
      lines.push(`  - Run the math: at ${deals} deals/year, Bear Team's structure saves roughly $${savings.toLocaleString()}/year vs. a standard brokerage (zero monthly fees + $16K cap)`);
      lines.push(`  - End with the warm appointment ask: "Worth 15 minutes with Tom to see your exact numbers? He can walk you through what you'd actually net." — do NOT send Calendly yet. Collect their info first.`);
      break;
    }
    case "COLLECT_NAME":
      lines.push("→ They responded positively to the appointment ask. Now ask: \"What's your name?\" — one question, nothing else.");
      break;
    case "COLLECT_PHONE":
      lines.push(`→ Name collected: ${ctx.contactName}. Ask: \"What's the best number to reach you, ${ctx.contactName}?\" — nothing else.`);
      break;
    case "COLLECT_EMAIL":
      lines.push(`→ Phone collected. Ask: \"And the best email for the calendar invite?\" — nothing else.`);
      break;
    case "BOOK":
      lines.push(`→ ALL CONTACT INFO COLLECTED. Say: "Perfect — here's Tom's calendar to lock in your 15 minutes: ${CALENDLY_LINK} — takes 30 seconds." Then stop. Do NOT say anything else.`);
      break;
  }

  lines.push("════════════════════════════════════════════════════");
  return lines.join("\n");
}

// ── LLM params by mode ─────────────────────────────────────────────────────────
const MODE_LLM_PARAMS: Record<ScoutMode, { temperature: number; max_tokens: number }> = {
  recruit: { temperature: 0.5, max_tokens: 180 },
  academy: { temperature: 0.4, max_tokens: 600 },
  os:      { temperature: 0.3, max_tokens: 400 },
};

// ── Supabase lead save ─────────────────────────────────────────────────────────
async function saveLeadToSupabase(ctx: RecruitContext): Promise<void> {
  try {
    const supabase = getSupabase();
    const payload = {
      name: ctx.contactName,
      phone: ctx.contactPhone,
      email: ctx.contactEmail,
      brokerage: ctx.newLicensee ? "New Licensee" : ctx.brokerage,
      deal_count: ctx.dealCount,
      notes: [
        ctx.frustration ? `Frustration: ${ctx.frustration}` : null,
        ctx.moveReason ? `Move reason: ${ctx.moveReason}` : null,
      ].filter(Boolean).join(" | "),
      source: "scout_chat",
      stage: "scout_captured",
      pain_type: derivePainType(ctx.frustration ?? ""),
      updated_at: new Date().toISOString(),
    };

    // Upsert on email if available, otherwise insert
    if (ctx.contactEmail) {
      await supabase.from("leads").upsert(payload, { onConflict: "email" });
    } else {
      await supabase.from("leads").insert(payload);
    }
  } catch (err) {
    console.error("[scout] Supabase save error:", err);
    // Non-fatal — don't block the Calendly response
  }
}

function derivePainType(frustration: string): string {
  const lower = frustration.toLowerCase();
  if (/fee|cost|month|overhead|desk|tech/i.test(lower)) return "fees";
  if (/split|commission|cap|percent/i.test(lower)) return "splits";
  if (/support|help|mentor|train|resource/i.test(lower)) return "support";
  if (/lead|prospect|pipeline|business/i.test(lower)) return "leads";
  if (/culture|management|office|toxic|micro/i.test(lower)) return "culture";
  if (/visib|brand|market|recogni/i.test(lower)) return "visibility";
  return "other";
}

// ── Route ──────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: ScoutRequest = await req.json();
    const { messages, mode = "recruit", channel = "web" } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

    // ── Step 1: Compliance check ──
    const inboundCheck = checkInboundCompliance(lastUserMessage);
    if (inboundCheck.requiresDeflection) {
      return NextResponse.json({
        reply: inboundCheck.fallbackOverride ?? FALLBACKS.compliance,
        mode,
        deflected: true,
      });
    }

    // ── Step 2: Escalation check ──
    if (mode === "recruit" || mode === "os") {
      const escalation = checkEscalation(lastUserMessage);
      if (escalation.shouldEscalate && escalation.level === "hard") {
        return NextResponse.json({
          reply: escalation.response ?? FALLBACKS.escalation,
          mode,
          escalated: true,
        });
      }
    }

    // ── Step 3: Extract context + determine stage ──
    let systemPrompt = buildSystemPrompt(mode, channel);
    let ctx: RecruitContext | null = null;

    if (mode === "recruit") {
      ctx = extractRecruitContext(messages);
      systemPrompt += buildStateBlock(ctx);

      // ── Step 3a: If BOOK stage — save to Supabase, return Calendly ──
      if (ctx.stage === "BOOK") {
        await saveLeadToSupabase(ctx);
        const name = ctx.contactName ? `, ${ctx.contactName.split(" ")[0]}` : "";
        return NextResponse.json({
          reply: `Perfect${name} — here's Tom's calendar to lock in your 15 minutes: ${CALENDLY_LINK}\n\nTakes 30 seconds. Looking forward to connecting.`,
          mode,
          stage: "BOOK",
          booked: true,
        });
      }
    }

    // ── Step 4: Generate LLM response ──
    const openai = getOpenAI();
    const params = MODE_LLM_PARAMS[mode];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: params.temperature,
      max_tokens: params.max_tokens,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-20),
      ],
    });

    let reply = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!reply) reply = FALLBACKS.uncertain;

    // ── Step 5: Guardrails (recruit mode only) ──
    if (mode === "recruit") {
      const schedulingResult = enforceScheduling(reply, lastUserMessage);
      reply = schedulingResult.finalResponse;
      reply = enforceConversionPresence(reply, lastUserMessage);
      const validation = validateResponse(reply, channel);
      reply = validation.finalResponse;
    }

    return NextResponse.json({ reply, mode, stage: ctx?.stage });
  } catch (err: unknown) {
    console.error("[scout] error:", err);
    return NextResponse.json({ reply: FALLBACKS.error }, { status: 500 });
  }
}
