/**
 * Scout Unified API Route — /api/scout
 *
 * Single endpoint for all Scout interactions.
 * Mode determines behavior. Identity never changes.
 *
 * Request body:
 *   messages  — conversation history [{role, content}]
 *   mode      — "recruit" | "academy" | "os"  (default: "recruit")
 *   channel   — "web" | "sms" | "messenger"   (default: "web")
 *
 * v3 — Context Extractor:
 *   - Parses message history before every LLM call
 *   - Extracts brokerage, deal count, years experience, pain signal + expansion
 *   - Injects CONVERSATION STATE block into system prompt so LLM never re-asks
 *   - Normalizes brokerage abbreviations (KW → Keller Williams, etc.)
 *   - enforceScheduling + enforceConversionPresence added to recruit pipeline
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildSystemPrompt, type ScoutMode, type Channel } from "@/lib/scout/guardrails/systemPrompt";
import { checkInboundCompliance } from "@/lib/scout/guardrails/complianceRules";
import { checkEscalation } from "@/lib/scout/guardrails/escalationRules";
import { validateResponse } from "@/lib/scout/guardrails/responseValidator";
import {
  enforceConversion,
  enforceScheduling,
  enforceConversionPresence,
} from "@/lib/scout/guardrails/conversionRules";
import { FALLBACKS, CALENDLY_LINK } from "@/lib/scout/config/scoutConfig";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── OpenAI client ────────────────────────────────────────────────────────────

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  return _openai;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ScoutRequest {
  messages: Message[];
  mode?: ScoutMode;
  channel?: Channel;
}

// ─── Brokerage Abbreviation Map ───────────────────────────────────────────────
// Used to normalize user input before it reaches the LLM.
// "KW" is a valid answer to "where are you hanging your license?"
// Never make the user explain their own brokerage.

const BROKERAGE_MAP: Record<string, string> = {
  kw: "Keller Williams",
  "keller williams": "Keller Williams",
  exp: "eXp Realty",
  "exp realty": "eXp Realty",
  remax: "RE/MAX",
  "re/max": "RE/MAX",
  "re max": "RE/MAX",
  c21: "Century 21",
  "century 21": "Century 21",
  cb: "Coldwell Banker",
  "coldwell banker": "Coldwell Banker",
  bhhs: "Berkshire Hathaway HomeServices",
  "berkshire hathaway": "Berkshire Hathaway HomeServices",
  era: "ERA Real Estate",
  compass: "Compass",
  rog: "Realty One Group",
  "realty one": "Realty One Group",
  watson: "Watson Realty",
  crr: "Charles Rutenberg Realty",
  "charles rutenberg": "Charles Rutenberg Realty",
  sothebys: "Sotheby's International Realty",
  "sotheby's": "Sotheby's International Realty",
};

function normalizeBrokerage(text: string): string | null {
  const key = text.trim().toLowerCase();
  return BROKERAGE_MAP[key] ?? null;
}

// ─── Context Extractor ────────────────────────────────────────────────────────
// Parses conversation history to extract what Scout already knows.
// This state block is injected into the system prompt so the LLM
// stops asking for information the user has already provided.

interface RecruitContext {
  brokerage: string | null;
  dealCount: number | null;
  yearsExperience: number | null;
  painSignal: string | null;
  painExpanded: boolean;
  userMessageCount: number;
}

// Short pain keywords — if user's entire message is one of these, pain is signaled but not expanded
const PAIN_KEYWORDS = [
  "fees", "fee", "splits", "split", "support", "leads", "technology", "tech",
  "training", "culture", "management", "desk", "monthly", "costs", "expenses",
  "overhead", "commission", "cap", "visibility", "exposure", "tools", "marketing",
];

// Known brokerage name patterns — partial matches within longer messages
const BROKERAGE_PATTERNS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /\bkw\b|keller\s*williams/i, name: "Keller Williams" },
  { pattern: /\bexp\b|eXp\s*realty/i, name: "eXp Realty" },
  { pattern: /\bremax\b|re\/max|re\s*max/i, name: "RE/MAX" },
  { pattern: /\bc21\b|century\s*21/i, name: "Century 21" },
  { pattern: /coldwell\s*banker|\bcb\b/i, name: "Coldwell Banker" },
  { pattern: /berkshire\s*hathaway|\bbhhs\b/i, name: "Berkshire Hathaway HomeServices" },
  { pattern: /\bcompass\b/i, name: "Compass" },
  { pattern: /realty\s*one|realty\s*one\s*group|\brog\b/i, name: "Realty One Group" },
  { pattern: /\bwatson\b/i, name: "Watson Realty" },
  { pattern: /charles\s*rutenberg|\bcrr\b/i, name: "Charles Rutenberg Realty" },
  { pattern: /sotheby'?s?/i, name: "Sotheby's International Realty" },
  { pattern: /\bera\b/i, name: "ERA Real Estate" },
];

function extractRecruitContext(messages: Message[]): RecruitContext {
  const ctx: RecruitContext = {
    brokerage: null,
    dealCount: null,
    yearsExperience: null,
    painSignal: null,
    painExpanded: false,
    userMessageCount: messages.filter((m) => m.role === "user").length,
  };

  const userMessages = messages.filter((m) => m.role === "user");

  for (const msg of userMessages) {
    const text = msg.content.trim();
    const lower = text.toLowerCase();

    // ── Brokerage extraction ──
    if (!ctx.brokerage) {
      // 1. Direct abbreviation/name as the entire message
      const direct = normalizeBrokerage(lower);
      if (direct) {
        ctx.brokerage = direct;
      } else {
        // 2. Pattern match within a longer message
        for (const { pattern, name } of BROKERAGE_PATTERNS) {
          if (pattern.test(text)) {
            ctx.brokerage = name;
            break;
          }
        }
      }
    }

    // ── Deal count extraction ──
    if (ctx.dealCount === null) {
      const dealMatch = text.match(
        /(\d+)\s*(?:deals?|closings?|transactions?|sales?)\s*(?:a\s*year|annually|\/\s*year|per\s*year)?/i
      ) ?? text.match(/close[sd]?\s*(?:about\s*)?(\d+)/i) ?? text.match(/(\d+)\s*(?:a\s*year|annually|per\s*year)/i);
      if (dealMatch) {
        const n = parseInt(dealMatch[1], 10);
        if (!isNaN(n) && n > 0 && n < 200) ctx.dealCount = n;
      }
    }

    // ── Years experience extraction ──
    if (ctx.yearsExperience === null) {
      const yrMatch = text.match(/(\d+)\s*(?:years?|yrs?)\s*(?:experience|in\s*(?:real\s*estate|the\s*business|industry|realty))?/i);
      if (yrMatch) {
        const n = parseInt(yrMatch[1], 10);
        if (!isNaN(n) && n > 0 && n < 50) ctx.yearsExperience = n;
      }
    }

    // ── Pain detection ──
    // Short pain keyword = signal only (not expanded)
    const isShortPainKeyword = PAIN_KEYWORDS.includes(lower) || PAIN_KEYWORDS.some((kw) => lower === `the ${kw}`);
    if (isShortPainKeyword && !ctx.painSignal) {
      ctx.painSignal = text;
    }

    // Expanded pain = longer message that mentions frustration/problem/pain
    const isPainSentence =
      text.split(/\s+/).length > 6 &&
      (lower.includes("fee") || lower.includes("split") || lower.includes("frustrated") ||
        lower.includes("hate") || lower.includes("tired") || lower.includes("problem") ||
        lower.includes("issue") || lower.includes("support") || lower.includes("concern") ||
        lower.includes("cost") || lower.includes("overhead") || lower.includes("monthly"));
    if (isPainSentence) {
      if (!ctx.painSignal) ctx.painSignal = text.slice(0, 80);
      ctx.painExpanded = true;
    }
  }

  // Pain expanded if user mentioned the same pain keyword 2+ times (persistence = real pain)
  const painMentionCount = userMessages.filter((m) =>
    PAIN_KEYWORDS.some((kw) => m.content.toLowerCase().includes(kw))
  ).length;
  if (painMentionCount >= 2) ctx.painExpanded = true;

  return ctx;
}

/**
 * Build CONVERSATION STATE block — injected into the system prompt.
 * Tells the LLM exactly what has been collected and what to do next.
 * This eliminates re-asking for information already provided.
 */
function buildStateBlock(ctx: RecruitContext): string {
  const lines: string[] = [
    "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "CONVERSATION STATE — DO NOT RE-ASK FOR ANYTHING MARKED COLLECTED",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    `Brokerage: ${ctx.brokerage ? `COLLECTED — ${ctx.brokerage}` : "NOT YET — ask this first before anything else"}`,
    `Deal count: ${ctx.dealCount !== null ? `COLLECTED — ${ctx.dealCount} deals/year` : ctx.brokerage ? "NOT YET — ask after brokerage" : "NOT YET"}`,
    `Years experience: ${ctx.yearsExperience !== null ? `COLLECTED — ${ctx.yearsExperience} years` : "unknown"}`,
    `Pain signal: ${ctx.painSignal ? `COLLECTED — "${ctx.painSignal}"` : ctx.dealCount !== null ? "NOT YET — ask what their biggest frustration is" : "NOT YET"}`,
    `Pain expanded: ${ctx.painExpanded ? "YES — agent has elaborated. You may advance toward a call." : "NO — do not ask for a call. Deepen the pain first."}`,
    `User messages sent: ${ctx.userMessageCount}`,
    "",
    "NEXT ACTION:",
  ];

  if (!ctx.brokerage) {
    lines.push("→ Ask where they currently hang their license. Nothing else.");
  } else if (ctx.dealCount === null) {
    lines.push(`→ Brokerage is ${ctx.brokerage}. Ask how many deals they close per year.`);
  } else if (!ctx.painSignal) {
    lines.push(`→ You have brokerage (${ctx.brokerage}) and deals (${ctx.dealCount}/yr). Ask what their biggest frustration is at ${ctx.brokerage}.`);
  } else if (!ctx.painExpanded) {
    lines.push(`→ Pain signal received: "${ctx.painSignal}". Validate it specifically. Ask one deeper follow-up question. DO NOT ask for a call.`);
  } else {
    lines.push(`→ All qualifying info collected. Pain is real and expanded. Advance toward a call: ${CALENDLY_LINK}`);
  }

  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  return lines.join("\n");
}

// ─── Mode-specific LLM parameters ────────────────────────────────────────────

const MODE_LLM_PARAMS: Record<ScoutMode, { temperature: number; max_tokens: number }> = {
  recruit: { temperature: 0.5, max_tokens: 180 },
  academy: { temperature: 0.4, max_tokens: 600 },
  os:      { temperature: 0.3, max_tokens: 400 },
};

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: ScoutRequest = await req.json();
    const { messages, mode = "recruit", channel = "web" } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

    // ── Step 1: Inbound compliance check ─────────────────────────────────────
    const inboundCheck = checkInboundCompliance(lastUserMessage);
    if (inboundCheck.requiresDeflection) {
      const baseFallback = inboundCheck.fallbackOverride ?? FALLBACKS.compliance;
      if (mode === "recruit") {
        const conversion = enforceConversion(baseFallback);
        const finalText = conversion.hasForwardMotion
          ? baseFallback
          : conversion.enhancedResponse;
        return NextResponse.json({ reply: finalText, mode, deflected: true });
      }
      return NextResponse.json({ reply: baseFallback, mode, deflected: true });
    }

    // ── Step 2: Escalation check ──────────────────────────────────────────────
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

    // ── Step 3: Build system prompt with injected context (recruit only) ──────
    let systemPrompt = buildSystemPrompt(mode, channel);

    if (mode === "recruit") {
      const ctx = extractRecruitContext(messages);
      systemPrompt += buildStateBlock(ctx);
    }

    // ── Step 4: Generate LLM response ─────────────────────────────────────────
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

    // ── Step 5: Guardrails (recruit mode) ────────────────────────────────────
    if (mode === "recruit") {
      // 5a: Intercept false booking confirmations in LLM output
      const schedulingResult = enforceScheduling(reply, lastUserMessage);
      reply = schedulingResult.finalResponse;

      // 5b: Guarantee Calendly link if user sent a time/day signal
      reply = enforceConversionPresence(reply, lastUserMessage);

      // 5c: Full response validation (tone, blocked phrases, compliance)
      const validation = validateResponse(reply, channel);
      reply = validation.finalResponse;
    }

    return NextResponse.json({ reply, mode });
  } catch (err: unknown) {
    console.error("[scout] error:", err);
    return NextResponse.json({ reply: FALLBACKS.error }, { status: 500 });
  }
}
