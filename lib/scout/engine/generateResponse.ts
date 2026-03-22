/**
 * Scout Response Generator — The full pipeline.
 *
 * Every message flows through the same pipeline:
 *
 * 1. Classify inbound message (decision tree)
 * 2. Check inbound compliance (deflect risky topics before LLM)
 * 3. Check escalation rules (hand off if needed)
 * 4. Build context-aware prompt (includes known agent signals)
 * 5. Generate response via LLM
 * 6. Run response through guardrails:
 *    6a. enforceScheduling — intercept false booking confirmations → Calendly push
 *    6b. validateResponse  — compliance + tone + length
 * 7. Return safe, compliant, conversion-focused response
 *
 * PACING FIX:
 * - buildUserPrompt now passes dealCount and yearsExperience when known.
 * - messageCount >= 2 no longer triggers "Push toward a call" — it signals
 *   "deepen pain, call only if pain is expanded." This prevents Scout from
 *   jumping to scheduling after a single one-word pain signal.
 * - painExpanded flag added: when true, allows the call ask.
 */

import OpenAI from "openai";
import {
  buildSystemPrompt,
  type Channel,
} from "../guardrails/systemPrompt";
import { checkInboundCompliance } from "../guardrails/complianceRules";
import { checkEscalation } from "../guardrails/escalationRules";
import { validateResponse } from "../guardrails/responseValidator";
import { enforceConversion, enforceScheduling } from "../guardrails/conversionRules";
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
    // Known agent signals — passed from Scout chat UI when available
    dealCount?: number;         // e.g. 20 (transactions per year)
    yearsExperience?: number;   // e.g. 4
    brokerage?: string;         // e.g. "KW", "EXP"
    painExpanded?: boolean;     // true once user has elaborated beyond a 1-word signal
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
 * Build the user prompt with classification context and known agent signals.
 *
 * Known signals (dealCount, yearsExperience, brokerage) are injected when
 * available so the LLM can personalize the pain-depth response.
 *
 * Call timing: the "push toward a call" note is gated behind painExpanded.
 * A conversation that has reached messageCount >= 2 but where the user has
 * only given a one-word pain signal (e.g. "fees") does NOT trigger the call
 * push — it triggers deeper pain exploration instead.
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

  // ── Known agent signals — inject for personalization ──
  // These allow the LLM to reference production level and experience
  // naturally when responding to pain signals.
  if (context?.dealCount !== undefined) {
    prompt += `\nKnown: Agent closes approximately ${context.dealCount} deals/year.`;
  }
  if (context?.yearsExperience !== undefined) {
    prompt += `\nKnown: Agent has approximately ${context.yearsExperience} years of experience.`;
  }
  if (context?.brokerage) {
    prompt += `\nKnown: Agent currently at ${context.brokerage}.`;
  }

  // ── Conversation depth and call timing ──
  if (context?.messageCount !== undefined) {
    prompt += `\nMessage count: ${context.messageCount}`;

    if (context.painExpanded === true) {
      // Pain has been elaborated — call ask is appropriate
      prompt += "\nPain status: EXPANDED. The agent has elaborated on their frustration. You may now advance toward a call if it fits naturally.";
    } else if (context.messageCount >= 2) {
      // Conversation is going but pain is still shallow — deepen, don't pitch
      prompt += "\nPain status: SURFACE ONLY. Do not ask for a call yet. Deepen pain with one smart follow-up question that uses any known agent signals.";
    }
  }

  return prompt;
}

/**
 * Call the LLM with guardrail-enforced prompts.
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
 */
export async function generateScoutResponse(
  request: ScoutRequest
): Promise<ScoutResponse> {
  const guardrailsApplied: string[] = [];

  try {
    // ── Step 1: Classify ──
    const classification = classifyMessage(request.message);
    guardrailsApplied.push(`classified:${classification.category}:${classification.guardrailLevel}`);

    // ── Step 2: Inbound compliance check ──
    const inboundCheck = checkInboundCompliance(request.message);
    if (inboundCheck.requiresDeflection) {
      guardrailsApplied.push(`inbound_deflection:${inboundCheck.deflectionReason}`);

      const baseFallback = inboundCheck.fallbackOverride ?? FALLBACKS.compliance;
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
    const systemPrompt = buildSystemPrompt("recruit", request.channel);
    let userPrompt = buildUserPrompt(
      request.message,
      classification,
      request.context
    );

    if (escalation.level === "soft") {
      userPrompt +=
        '\nIMPORTANT: Include an offer to connect them with their agent. Example: "I\'ll have your agent reach out to help with that."';
    }

    // ── Step 5: Generate LLM response ──
    let llmResponse = await callLLM(
      systemPrompt,
      userPrompt,
      classification.guardrailLevel
    );

    if (!llmResponse) {
      guardrailsApplied.push("llm:empty_response");
      llmResponse = FALLBACKS.uncertain;
    }

    // ── Step 6a: Scheduling guardrail — runs before all other guardrails ──
    // Intercepts false booking confirmations and replaces with Calendly push.
    // Also ensures Calendly link is present when user signals time/day intent.
    const schedulingCheck = enforceScheduling(llmResponse, request.message);
    if (schedulingCheck.hadFalseConfirmation) {
      guardrailsApplied.push("scheduling:false_confirmation_replaced");
    } else if (schedulingCheck.finalResponse !== llmResponse) {
      guardrailsApplied.push("scheduling:calendly_link_appended");
    }
    llmResponse = schedulingCheck.finalResponse;

    // ── Step 6b: Compliance + tone validation ──
    const validation = validateResponse(llmResponse, request.channel);
    guardrailsApplied.push(...validation.modifications);

    // ── Step 7: Return ──
    return {
      text: validation.finalResponse,
      classification,
      escalated: escalation.shouldEscalate,
      guardrailsApplied,
    };
  } catch {
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
