/**
 * Compliance Rules — Hard validation for every Scout response.
 *
 * These rules run AFTER the LLM generates a response and BEFORE
 * it is sent to the user. If any rule fails, the response is
 * either rewritten or replaced with a safe fallback.
 *
 * Priority: Fair Housing > Legal > Guarantee > Blocked Phrase
 *
 * AUDIT FIXES (v2):
 * - Protected class terms now use word-boundary regex instead of
 *   substring .includes() to prevent false positives on
 *   "single family home", "color of the cabinets", etc.
 * - Blocked phrases now contribute to "block" severity when they
 *   match Fair Housing terms (previously logged but never acted on).
 * - Removed unused `lower` variable in checkLegalBoundaries.
 * - checkInboundCompliance regex flags cleaned up.
 */

import {
  BLOCKED_PHRASES,
  PROTECTED_CLASS_PATTERNS,
  FALLBACKS,
} from "../config/scoutConfig";

export interface ComplianceResult {
  passed: boolean;
  violations: string[];
  severity: "safe" | "warning" | "block";
  rewrittenResponse: string | null;
}

/**
 * Check for Fair Housing Act violations.
 * Uses word-boundary regex patterns to avoid false positives.
 * This is the highest-priority check. Any match = immediate block.
 */
function checkFairHousing(response: string): string[] {
  const violations: string[] = [];

  // Word-boundary protected class matching (fixes false positives)
  for (const { pattern, label } of PROTECTED_CLASS_PATTERNS) {
    if (pattern.test(response)) {
      violations.push(`fair_housing:protected_class:"${label}"`);
    }
  }

  // Steering language patterns
  const steeringPatterns = [
    /you(?:'d| would) (?:love|like|fit in|belong)/i,
    /perfect (?:for|neighborhood for) (?:you|your family|families|singles|couples)/i,
    /(?:not|no) (?:a good|the right) (?:fit|area|neighborhood) for/i,
    /people like you/i,
    /your kind of/i,
    /type of people/i,
  ];

  for (const pattern of steeringPatterns) {
    if (pattern.test(response)) {
      violations.push("fair_housing:steering_language");
    }
  }

  return violations;
}

/**
 * Check for legal overreach — Scout must never give legal advice.
 */
function checkLegalBoundaries(response: string): string[] {
  const violations: string[] = [];

  const legalPatterns = [
    /you (?:should|must|need to) sign/i,
    /(?:in my|from a) legal (?:opinion|perspective)/i,
    /(?:this|that) (?:is|isn't|would be) (?:legal|illegal)/i,
    /you (?:can|should) sue/i,
    /(?:breach|breaching) (?:of |the )?contract/i,
    /(?:your|the) (?:rights|legal rights) (?:are|include)/i,
    /(?:i|we) advise you to/i,
    /tax (?:benefit|deduction|implication|consequence)/i,
  ];

  for (const pattern of legalPatterns) {
    if (pattern.test(response)) {
      violations.push("legal:advice_given");
    }
  }

  // Contract interpretation
  const contractPatterns = [
    /(?:the|this|that) contract (?:means|says|states|requires|allows)/i,
    /(?:according to|per|under) the (?:contract|agreement|terms)/i,
    /clause (?:\d|[a-z])/i,
    /(?:section|paragraph|article) (?:\d)/i,
  ];

  for (const pattern of contractPatterns) {
    if (pattern.test(response)) {
      violations.push("legal:contract_interpretation");
    }
  }

  return violations;
}

/**
 * Check for guarantee language — Scout cannot promise outcomes.
 */
function checkGuarantees(response: string): string[] {
  const violations: string[] = [];

  const guaranteePatterns = [
    /(?:i|we) (?:guarantee|promise)/i,
    /(?:you will|it will|this will) (?:definitely|certainly|absolutely|for sure)/i,
    /guaranteed (?:to |that )/i,
    /(?:100|hundred) percent (?:chance|certain|sure)/i,
    /(?:no|zero) risk/i,
    /(?:will|going to) (?:sell|close|appraise) (?:at|for|above|within)/i,
    /(?:the|this) (?:home|house|property) (?:is worth|will sell for) \$/i,
  ];

  for (const pattern of guaranteePatterns) {
    if (pattern.test(response)) {
      violations.push("guarantee:outcome_promised");
    }
  }

  return violations;
}

/**
 * Check for blocked phrases — words and phrases that should never appear.
 * Now categorized so Fair Housing blocked phrases trigger "block" severity.
 */
function checkBlockedPhrases(response: string): string[] {
  const lower = response.toLowerCase();
  const violations: string[] = [];

  for (const phrase of BLOCKED_PHRASES) {
    if (lower.includes(phrase)) {
      violations.push(`blocked_phrase:"${phrase}"`);
    }
  }

  return violations;
}

/**
 * Determine severity based on violation types.
 * Blocked phrases that are Fair Housing related now trigger "block".
 */
function calculateSeverity(
  violations: string[]
): "safe" | "warning" | "block" {
  if (violations.length === 0) return "safe";

  const hasBlock = violations.some(
    (v) =>
      v.startsWith("fair_housing") ||
      v.startsWith("legal") ||
      v.startsWith("guarantee")
  );

  if (hasBlock) return "block";

  // Blocked phrases that are Fair Housing terms should also block
  const fairHousingPhrases = [
    "safe neighborhood", "safe area", "good neighborhood", "bad neighborhood",
    "bad area", "family-friendly", "family friendly", "family oriented",
    "good schools", "great schools", "school district", "up and coming",
    "up-and-coming", "ethnic", "diverse area", "not diverse",
    "young professionals", "mature community", "retired community",
    "singles area", "no children", "quiet community",
  ];
  const hasFairHousingPhrase = violations.some((v) => {
    const match = v.match(/^blocked_phrase:"(.+)"$/);
    return match && fairHousingPhrases.includes(match[1]);
  });

  if (hasFairHousingPhrase) return "block";

  return "warning";
}

/**
 * Main compliance check — runs all rules against a response.
 */
export function checkCompliance(response: string): ComplianceResult {
  const violations: string[] = [
    ...checkFairHousing(response),
    ...checkLegalBoundaries(response),
    ...checkGuarantees(response),
    ...checkBlockedPhrases(response),
  ];

  const severity = calculateSeverity(violations);

  return {
    passed: violations.length === 0,
    violations,
    severity,
    rewrittenResponse: severity === "block" ? FALLBACKS.compliance : null,
  };
}

/**
 * Quick check for inbound user messages.
 * Detects if the user is asking about topics that require deflection.
 */
export function checkInboundCompliance(message: string): {
  requiresDeflection: boolean;
  deflectionReason: string | null;
} {
  // Neighborhood demographics
  if (
    /(?:what (?:kind|type) of people|who lives|demographics|population)/i.test(
      message
    )
  ) {
    return {
      requiresDeflection: true,
      deflectionReason: "neighborhood_demographics",
    };
  }

  // Safety / crime
  if (/(?:safe|safety|crime|dangerous|sketchy)\s+(?:area|neighborhood|street|town|city)/i.test(message)) {
    return { requiresDeflection: true, deflectionReason: "safety_inquiry" };
  }

  // School quality (steering risk)
  if (/(?:good schools|school (?:ratings?|quality|district))/i.test(message)) {
    return { requiresDeflection: true, deflectionReason: "school_inquiry" };
  }

  return { requiresDeflection: false, deflectionReason: null };
}
