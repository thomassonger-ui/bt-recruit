/**
 * Coach API Route — /api/coach
 *
 * Scout in Academy mode.
 * This route is the entry point for the BearTeam Academy Coach chat panel.
 *
 * It delegates to the unified Scout engine at /api/scout with mode: "academy".
 * All guardrails, Fair Housing compliance, and identity rules apply.
 *
 * This route exists as a clean separation point so the Academy page
 * never directly calls /api/scout — Coach has its own URL, its own context,
 * and could be extended independently in the future.
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildSystemPrompt } from "@/lib/scout/guardrails/systemPrompt";
import { checkInboundCompliance } from "@/lib/scout/guardrails/complianceRules";
import { FALLBACKS } from "@/lib/scout/config/scoutConfig";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  return _openai;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const lastUserMessage = [...messages].reverse().find(
      (m: { role: string }) => m.role === "user"
    )?.content ?? "";

    // Fair Housing compliance — always active regardless of mode
    const inboundCheck = checkInboundCompliance(lastUserMessage);
    if (inboundCheck.requiresDeflection) {
      const reply = inboundCheck.fallbackOverride ?? FALLBACKS.compliance;
      return NextResponse.json({ reply });
    }

    // Build system prompt: Scout in Academy mode, web channel
    const systemPrompt = buildSystemPrompt("web", "academy");

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.4,
      max_tokens: 600,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-20),
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? FALLBACKS.uncertain;
    return NextResponse.json({ reply });

  } catch (err: unknown) {
    console.error("[coach/academy] error:", err);
    return NextResponse.json({ reply: FALLBACKS.error }, { status: 500 });
  }
}
