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
 * Routing:
 *   recruit → qualification flow, lead capture, Supabase memory, conversion guardrails
 *   academy → training responses, course knowledge, no recruiting, no guardrail conversion
 *   os      → operational guidance, workflow execution, escalation rules
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildSystemPrompt, type ScoutMode, type Channel } from "@/lib/scout/guardrails/systemPrompt";
import { checkInboundCompliance } from "@/lib/scout/guardrails/complianceRules";
import { checkEscalation } from "@/lib/scout/guardrails/escalationRules";
import { validateResponse } from "@/lib/scout/guardrails/responseValidator";
import { enforceConversion } from "@/lib/scout/guardrails/conversionRules";
import { FALLBACKS } from "@/lib/scout/config/scoutConfig";

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

// ─── Mode-specific LLM parameters ────────────────────────────────────────────
// Recruit: tighter, shorter — every word drives toward a call
// Academy: more space — training needs room to explain
// OS: direct and operational — no extra words

const MODE_LLM_PARAMS: Record<ScoutMode, { temperature: number; max_tokens: number }> = {
  recruit:  { temperature: 0.5, max_tokens: 180 },
  academy:  { temperature: 0.4, max_tokens: 600 },
  os:       { temperature: 0.3, max_tokens: 400 },
};

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: ScoutRequest = await req.json();

    const { messages, mode = "recruit", channel = "web" } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const lastUserMessage = [...messages].reverse().find(m => m.role === "user")?.content ?? "";

    // ── Step 1: Inbound compliance check (all modes) ──────────────────────────
    // Fair Housing and protected class violations are blocked regardless of mode.
    const inboundCheck = checkInboundCompliance(lastUserMessage);
    if (inboundCheck.requiresDeflection) {
      const baseFallback = inboundCheck.fallbackOverride ?? FALLBACKS.compliance;

      // In recruit mode, append a conversion closer. In other modes, clean deflect.
      if (mode === "recruit") {
        const conversion = enforceConversion(baseFallback);
        const finalText = conversion.hasForwardMotion ? baseFallback : conversion.enhancedResponse;
        return NextResponse.json({ reply: finalText, mode, deflected: true });
      }

      return NextResponse.json({ reply: baseFallback, mode, deflected: true });
    }

    // ── Step 2: Escalation check (recruit + os modes) ─────────────────────────
    // Academy mode doesn't use escalation — it redirects out-of-scope questions.
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

    // ── Step 3: Build system prompt ───────────────────────────────────────────
    const systemPrompt = buildSystemPrompt(mode, channel);
    const params = MODE_LLM_PARAMS[mode];

    // ── Step 4: Generate response ─────────────────────────────────────────────
    const openai = getOpenAI();
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

    if (!reply) {
      reply = FALLBACKS.uncertain;
    }

    // ── Step 5: Response validation + guardrails ──────────────────────────────
    // Full guardrail pipeline runs on recruit mode.
    // Academy and OS use lighter validation (tone + length only).
    if (mode === "recruit") {
      const validation = validateResponse(reply, channel);
      reply = validation.finalResponse;
    }

    return NextResponse.json({ reply, mode });

  } catch (err: unknown) {
    console.error("[scout] error:", err);
    return NextResponse.json({ reply: FALLBACKS.error }, { status: 500 });
  }
}
