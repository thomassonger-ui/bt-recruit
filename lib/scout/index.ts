/**
 * Scout Guardrail System — Public API
 *
 * Single import point for all Scout functionality.
 * Usage: import { generateScoutResponse } from "@/lib/scout";
 */

// Engine
export { generateScoutResponse } from "./engine/generateResponse";
export type { ScoutRequest, ScoutResponse } from "./engine/generateResponse";
export { classifyMessage } from "./engine/decisionTree";
export type {
  MessageCategory,
  GuardrailLevel,
  Classification,
} from "./engine/decisionTree";
export type { EscalationLevel, EscalationResult } from "./guardrails/escalationRules";

// Guardrails
export { checkCompliance, checkInboundCompliance } from "./guardrails/complianceRules";
export { enforceConversion } from "./guardrails/conversionRules";
export { checkEscalation } from "./guardrails/escalationRules";
export { validateResponse } from "./guardrails/responseValidator";
export { buildSystemPrompt } from "./guardrails/systemPrompt";

// Config
export { FALLBACKS, TONE } from "./config/scoutConfig";
