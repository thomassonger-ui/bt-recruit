/**
 * Escalation Rules — Detect when Scout must hand off to a human.
 *
 * Some conversations require a licensed agent. Scout does not guess,
 * negotiate, or interpret legal documents. When escalation triggers
 * fire, Scout immediately defers.
 *
 * AUDIT FIXES (v2):
 * - Switched from substring .includes() to word-boundary regex patterns
 *   to prevent false positives ("sue" matching inside "issue").
 * - Imported ESCALATION_TRIGGER_PATTERNS instead of ESCALATION_TRIGGERS.
 */

import { ESCALATION_TRIGGER_PATTERNS, FALLBACKS } from "../config/scoutConfig";

export type EscalationLevel = "none" | "soft" | "hard";

export interface EscalationResult {
  shouldEscalate: boolean;
  level: EscalationLevel;
  reason: string | null;
  response: string | null;
}

/**
 * Hard escalation — user is asking about contracts, offers, legal matters.
 * Scout must immediately hand off. No attempt to answer.
 */
function checkHardEscalation(message: string): string | null {
  // Word-boundary pattern matching (fixes "sue" in "issue" etc.)
  for (const { pattern, label } of ESCALATION_TRIGGER_PATTERNS) {
    if (pattern.test(message)) {
      return label;
    }
  }

  // Additional pattern-based hard escalation
  const hardPatterns = [
    /(?:is this|is that) a (?:good|fair|reasonable) (?:price|deal|offer)/i,
    /(?:can you|will you) (?:negotiate|counter|write|draft)/i,
    /(?:sign|signed|signing) (?:the|a|this) (?:contract|agreement|offer|listing)/i,
    /what (?:are|is) my (?:legal |)(?:rights|options|obligation)/i,
    /(?:should i|can i) (?:back out|cancel|withdraw|terminate)/i,
    /(?:breach|default|violation|penalty|damages)\b/i,
  ];

  for (const pattern of hardPatterns) {
    if (pattern.test(message)) {
      return "pattern:" + pattern.source.slice(0, 40);
    }
  }

  return null;
}

/**
 * Soft escalation — user shows high buying/selling intent.
 * Scout acknowledges and connects them with an agent proactively.
 */
function checkSoftEscalation(message: string): string | null {
  const softPatterns = [
    /(?:i want to|ready to|looking to) (?:buy|sell|list|make an offer)/i,
    /(?:found|saw|love) (?:a |the )?(?:house|home|property|listing|condo)/i,
    /(?:pre-?approved|pre-?qualified|got approved)/i,
    /(?:my house|my home|my property) (?:is|just|needs)/i,
    /(?:just got|just received) (?:an offer|a counter)/i,
    /(?:moving|relocating|transferring) (?:to|from|in)/i,
  ];

  for (const pattern of softPatterns) {
    if (pattern.test(message)) {
      return "high_intent:" + pattern.source.slice(0, 40);
    }
  }

  return null;
}

/**
 * Main escalation check — runs both hard and soft checks.
 *
 * Hard escalation: Scout stops and defers immediately.
 * Soft escalation: Scout can still respond but must include agent handoff.
 */
export function checkEscalation(message: string): EscalationResult {
  // Hard check first — highest priority
  const hardReason = checkHardEscalation(message);
  if (hardReason) {
    return {
      shouldEscalate: true,
      level: "hard",
      reason: hardReason,
      response: FALLBACKS.escalation,
    };
  }

  // Soft check — agent should follow up
  const softReason = checkSoftEscalation(message);
  if (softReason) {
    return {
      shouldEscalate: true,
      level: "soft",
      reason: softReason,
      response: null, // LLM still generates, but must include handoff
    };
  }

  return {
    shouldEscalate: false,
    level: "none",
    reason: null,
    response: null,
  };
}
