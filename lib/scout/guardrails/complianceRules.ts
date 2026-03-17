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
  STEERING_PHRASES,
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
 * Check for steering phrases — explicit neighborhood/family language.
 * These are phrase-level (not substring), case-insensitive, word-boundary.
 * Any match = immediate block + neighborhood-safe rewrite.
 *
 * v3: Added as dedicated check to catch "family-friendly", "safe neighborhood",
 *     "community feel", "good area for kids" that were slipping through.
 */
function checkSteeringPhrases(response: string): string[] {
  const lower = response.toLowerCase();
  const violations: string[] = [];

  for (const phrase of STEERING_PHRASES) {
    // Word-boundary match to avoid partial substring hits
    const escaped = phrase.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(lower)) {
      violations.push(`steering_phrase:"${phrase}"`);
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
 * Steering phrases, Fair Housing, legal, and guarantee violations = block.
 * Blocked phrases that are Fair Housing related also trigger block.
 */
function calculateSeverity(
  violations: string[]
): "safe" | "warning" | "block" {
  if (violations.length === 0) return "safe";

  // Any of these prefixes = immediate block
  const hasBlock = violations.some(
    (v) =>
      v.startsWith("fair_housing") ||
      v.startsWith("legal") ||
      v.startsWith("guarantee") ||
      v.startsWith("steering_phrase")
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
 * Determine which fallback to use based on violation types.
 * Steering phrases and Fair Housing violations get the neutral
 * neighborhood rewrite. Everything else gets the generic compliance fallback.
 */
function selectFallback(violations: string[]): string {
  const hasNeighborhoodViolation = violations.some(
    (v) =>
      v.startsWith("steering_phrase") ||
      v.startsWith("fair_housing:steering") ||
      v.includes("safe neighborhood") ||
      v.includes("safe area") ||
      v.includes("family-friendly") ||
      v.includes("family friendly") ||
      v.includes("community feel") ||
      v.includes("good area for kids")
  );

  return hasNeighborhoodViolation
    ? FALLBACKS.neighborhood
    : FALLBACKS.compliance;
}

/**
 * Main compliance check — runs all rules against a response.
 *
 * v3: Added checkSteeringPhrases to the pipeline.
 *     Steering violations now use the neighborhood-safe rewrite
 *     instead of the generic compliance fallback.
 */
export function checkCompliance(response: string): ComplianceResult {
  const violations: string[] = [
    ...checkFairHousing(response),
    ...checkSteeringPhrases(response),
    ...checkLegalBoundaries(response),
    ...checkGuarantees(response),
    ...checkBlockedPhrases(response),
  ];

  const severity = calculateSeverity(violations);

  return {
    passed: violations.length === 0,
    violations,
    severity,
    rewrittenResponse: severity === "block" ? selectFallback(violations) : null,
  };
}

/**
 * Quick check for inbound user messages.
 * Detects if the user is asking about topics that require deflection.
 *
 * v3: Added neighborhood/family question detection. These now return
 *     the neighborhood-safe rewrite instead of the generic fallback.
 */
export function checkInboundCompliance(message: string): {
  requiresDeflection: boolean;
  deflectionReason: string | null;
  fallbackOverride: string | null;
} {
  // Neighborhood for families — most common Fair Housing risk question
  if (
    /(?:good|great|best|nice|safe)\b.*\b(?:for families|for kids|for children)/i.test(message) ||
    /(?:family|families|kids|children)\b.*\b(?:neighborhood|area|community|place)/i.test(message) ||
    /(?:neighborhood|area|community)\b.*\b(?:family|families|kids|children)/i.test(message)
  ) {
    return {
      requiresDeflection: true,
      deflectionReason: "neighborhood_family",
      fallbackOverride: FALLBACKS.neighborhood,
    };
  }

  // Neighborhood demographics
  if (
    /(?:what (?:kind|type) of people|who lives|demographics|population)/i.test(
      message
    )
  ) {
    return {
      requiresDeflection: true,
      deflectionReason: "neighborhood_demographics",
      fallbackOverride: FALLBACKS.neighborhood,
    };
  }

  // Safety / crime
  if (/(?:safe|safety|crime|dangerous|sketchy)\s+(?:area|neighborhood|street|town|city)/i.test(message)) {
    return {
      requiresDeflection: true,
      deflectionReason: "safety_inquiry",
      fallbackOverride: FALLBACKS.neighborhood,
    };
  }

  // School quality (steering risk) — "good schools", "schools good", "school ratings"
  if (/(?:good schools|schools?\s+(?:good|great|best|nice)|school (?:ratings?|quality|district))/i.test(message)) {
    return {
      requiresDeflection: true,
      deflectionReason: "school_inquiry",
      fallbackOverride: FALLBACKS.neighborhood,
    };
  }

  // General neighborhood quality questions
  if (
    /(?:good|nice|best|great)\s+(?:neighborhood|area|community|part of town)/i.test(message) ||
    /(?:what(?:'s| is) the)\s+(?:neighborhood|area|community)\s+like/i.test(message)
  ) {
    return {
      requiresDeflection: true,
      deflectionReason: "neighborhood_quality",
      fallbackOverride: FALLBACKS.neighborhood,
    };
  }

  return { requiresDeflection: false, deflectionReason: null, fallbackOverride: null };
}
