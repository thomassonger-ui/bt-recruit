/**
 * Scout Response Generator — The full pipeline.
 *
 * This is the single entry point for generating any Scout response.
 * Every message flows through the same pipeline:
 *
 * 1. Classify inbound message (decision tree)
 * 2. Check inbound compliance (deflect risky topics before LLM)
 * 3. Check escalation rules (hand off if needed)
 * 4. Build context-aware prompt
 * 5. Generate response via LLM
 * 6. Run response through guardrails (compliance + conversion + tone)
 * 7. Final validation
 * 8. Return safe, compliant, conversion-focused response
 *
 * Nothing bypasses this pipeline. Every channel uses it.
 *
 * AUDIT FIXES (v2):
 * - Removed dead mapChannel identity function.
 * - guardrailLevel from classification now adjusts LLM temperature
 *   and max_tokens (tighter at elevated/maximum levels).
 */

import OpenAI from "openai";
import {
  buildSystemPrompt,
  type Channel,
} from "../guardrails/systemPrompt";
import { checkInboundCompliance } from "../guardrails/complianceRules";
import { checkEscalation } from "../guardrails/escalationRules";
import { validateResponse } from "../guardrails/responseValidator";
import { enforceConversion } from "../guardrails/conversionRules";
import { classifyMessage, type Classification, type GuardrailLevel } from "./decisionTree";
import { FALLBACKS } from "../config/scoutConfig";

/* ── OpenAI client — lazy initialization ── */
let _openai: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

/* ── Types ── */
export interface ScoutRequest {
  message: string;
  channel: Channel;
  context?: {
    stage?: string;
    intent?: string;
    dealContext?: string;
    messageCount?: number;
  };
}

export interface ScoutResponse {
  text: string;
  classification: Classification;
  escalated: boolean;
  guardrailsApplied: string[];
}

/**
 * LLM parameters based on guardrail level.
 * Higher guardrail levels = lower temperature, fewer tokens.
 */
const LLM_PARAMS: Record<
  GuardrailLevel,
  { temperature: number; max_tokens: number }
> = {
  standard: { temperature: 0.6, max_tokens: 150 },
  elevated: { temperature: 0.4, max_tokens: 120 },
  maximum: { temperature: 0.2, max_tokens: 100 },
};

/**
 * Build the user prompt with classification context and strategy guidance.
 */
function buildUserPrompt(
  message: string,
  classification: Classification,
  context?: ScoutRequest["context"]
): string {
  let prompt = `User message: "${message}"`;
  prompt += `\nClassification: ${classification.category}`;
  prompt += `\nGuardrail level: ${classification.guardrailLevel}`;
  prompt += `\nResponse strategy: ${classification.responseStrategy}`;

  if (context?.stage) {
    prompt += `\nConversation stage: ${context.stage}`;
  }
  if (context?.intent) {
    prompt += `\nDetected intent: ${context.intent}`;
  }
  if (context?.dealContext) {
    prompt += `\nDeal context: "${context.dealContext}"`;
  }
  if (context?.messageCount !== undefined) {
    prompt += `\nMessage count: ${context.messageCount}`;
    if (context.messageCount >= 2) {
      prompt += "\nNote: This conversation has been going. Push toward a call.";
    }
  }

  return prompt;
}

/**
 * Call the LLM with guardrail-enforced prompts.
 * Temperature and max_tokens are adjusted by guardrail level.
 */
async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  guardrailLevel: GuardrailLevel
): Promise<string> {
  const params = LLM_PARAMS[guardrailLevel];

  const completion = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: params.temperature,
    max_tokens: params.max_tokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}

/**
 * Main pipeline — generate a Scout response.
 *
 * This function is the single entry point. All channels
 * (SMS, web chat, messenger) use this same pipeline.
 */
export async function generateScoutResponse(
  request: ScoutRequest
): Promise<ScoutResponse> {
  const guardrailsApplied: string[] = [];

  try {
    // ── Step 1: Classify the inbound message ──
    const classification = classifyMessage(request.message);
    guardrailsApplied.push(`classified:${classification.category}:${classification.guardrailLevel}`);

    // ── Step 2: Inbound compliance check ──
    // Catch risky topics BEFORE they reach the LLM.
    // v3: Uses fallbackOverride for neighborhood-specific safe rewrite.
    //     Runs conversion enforcement so CTA is always present.
    const inboundCheck = checkInboundCompliance(request.message);
    if (inboundCheck.requiresDeflection) {
      guardrailsApplied.push(
        `inbound_deflection:${inboundCheck.deflectionReason}`
      );

      // Use specific fallback if provided, otherwise generic
      const baseFallback = inboundCheck.fallbackOverride ?? FALLBACKS.compliance;

      // Ensure CTA is present on the deflection response
      const conversion = enforceConversion(baseFallback);
      const finalText = conversion.hasForwardMotion
        ? baseFallback
        : conversion.enhancedResponse;

      if (!conversion.hasForwardMotion) {
        guardrailsApplied.push("conversion:closer_appended_to_deflection");
      }

      return {
        text: finalText,
        classification,
        escalated: false,
        guardrailsApplied,
      };
    }

    // ── Step 3: Escalation check ──
    // Detect if this requires a licensed agent
    const escalation = checkEscalation(request.message);
    if (escalation.shouldEscalate && escalation.level === "hard") {
      guardrailsApplied.push(`escalation:hard:${escalation.reason}`);
      return {
        text: escalation.response ?? FALLBACKS.escalation,
        classification,
        escalated: true,
        guardrailsApplied,
      };
    }

    if (escalation.shouldEscalate && escalation.level === "soft") {
      guardrailsApplied.push(`escalation:soft:${escalation.reason}`);
    }

    // ── Step 4: Build prompts ──
    const systemPrompt = buildSystemPrompt(request.channel);
    let userPrompt = buildUserPrompt(
      request.message,
      classification,
      request.context
    );

    // If soft escalation, add instruction to include agent handoff
    if (escalation.level === "soft") {
      userPrompt +=
        '\nIMPORTANT: Include an offer to connect them with their agent. Example: "I\'ll have your agent reach out to help with that."';
    }

    // ── Step 5: Generate LLM response ──
    // guardrailLevel now controls temperature and token limits
    let llmResponse = await callLLM(
      systemPrompt,
      userPrompt,
      classification.guardrailLevel
    );

    // Empty response fallback
    if (!llmResponse) {
      guardrailsApplied.push("llm:empty_response");
      llmResponse = FALLBACKS.uncertain;
    }

    // ── Step 6: Run through guardrails ──
    const validation = validateResponse(llmResponse, request.channel);
    guardrailsApplied.push(...validation.modifications);

    // ── Step 7: Return final response ──
    return {
      text: validation.finalResponse,
      classification,
      escalated: escalation.shouldEscalate,
      guardrailsApplied,
    };
  } catch {
    // Failsafe — never leave the user hanging
    guardrailsApplied.push("error:pipeline_failure");
    return {
      text: FALLBACKS.error,
      classification: {
        category: "unknown",
        guardrailLevel: "maximum",
        responseStrategy: "error_fallback",
        requiresEscalation: false,
      },
      escalated: false,
      guardrailsApplied,
    };
  }
}
