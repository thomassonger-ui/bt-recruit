/**
 * Response Validator — Final gate before any response is sent.
 *
 * Every Scout response passes through this validator after
 * compliance, conversion, and escalation checks. This is the
 * last line of defense.
 *
 * If validation fails, the response is either rewritten or
 * replaced with a safe fallback. Nothing unsafe gets through.
 *
 * AUDIT FIXES (v2):
 * - Emoji regex: removed .test() before .replace() to avoid
 *   the /g flag lastIndex bug that skipped the first emoji.
 * - Passive check: moved BEFORE conversion enforcement so that
 *   a closer appended by enforceConversion is not immediately
 *   destroyed by isPassiveResponse matching "^ok".
 * - Sentence splitting: improved to handle abbreviations,
 *   dollar amounts, and preserve question marks vs periods.
 */

import { TONE, FALLBACKS } from "../config/scoutConfig";
import { checkCompliance } from "./complianceRules";
import { enforceConversion, isPassiveResponse } from "./conversionRules";

export interface ValidationResult {
  valid: boolean;
  finalResponse: string;
  checks: {
    compliance: boolean;
    forwardMotion: boolean;
    tone: boolean;
    length: boolean;
  };
  modifications: string[];
}

/**
 * Check tone — no emojis, no slang, no exclamation marks, professional only.
 *
 * FIX: Emoji removal now uses .replace() directly instead of
 * .test() + .replace(), which caused the /g flag to advance lastIndex
 * and skip the first emoji on the replace pass.
 */
function checkTone(response: string): { passed: boolean; cleaned: string } {
  let cleaned = response;
  let passed = true;

  // Remove emojis — apply replace directly, then check if it changed
  const emojiPattern =
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}]/gu;
  const withoutEmojis = cleaned
    .replace(emojiPattern, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (withoutEmojis !== cleaned) {
    cleaned = withoutEmojis;
    passed = false;
  }

  // Remove excessive exclamation marks
  if (/!{2,}/.test(cleaned)) {
    cleaned = cleaned.replace(/!{2,}/g, ".");
    passed = false;
  }
  // Remove single exclamation marks — professional tone
  if (/!/.test(cleaned)) {
    cleaned = cleaned.replace(/!/g, ".");
    passed = false;
  }

  // Remove excessive question marks
  if (/\?{2,}/.test(cleaned)) {
    cleaned = cleaned.replace(/\?{2,}/g, "?");
    passed = false;
  }

  return { passed, cleaned };
}

/**
 * Split text into sentences, handling abbreviations and dollar amounts.
 *
 * FIX: Previous approach split on /[.?]\s+/ which broke on
 * "Dr. Smith", "$2.5M", "U.S. market" and lost punctuation type.
 * Now preserves sentence terminators and skips false breaks.
 */
function splitSentences(text: string): string[] {
  // Replace known abbreviations with placeholders to prevent false splits
  let safe = text;
  const abbreviations = /\b(Mr|Mrs|Ms|Dr|Jr|Sr|St|Ave|Blvd|Rd|Apt|Ste|U\.S|a\.m|p\.m)\./gi;
  safe = safe.replace(abbreviations, "$1\u0000");

  // Don't split on decimal numbers ($2.5M, 3.5 bath)
  safe = safe.replace(/(\d)\./g, "$1\u0001");

  // Split on sentence-ending punctuation followed by space or end
  const parts = safe
    .split(/(?<=[.?])\s+/)
    .map((s) => s.replace(/\u0000/g, ".").replace(/\u0001/g, "."))
    .filter((s) => s.trim().length > 0);

  return parts;
}

/**
 * Check length — enforce sentence and character limits.
 */
function checkLength(
  response: string,
  channel: "sms" | "web" | "messenger" = "web"
): { passed: boolean; trimmed: string } {
  const maxLen = channel === "sms" ? TONE.smsMaxLength : TONE.maxLength;
  const maxSentences = channel === "sms" ? 2 : TONE.maxSentences;

  const sentences = splitSentences(response);

  let trimmed = response;
  let passed = true;

  // Trim to max sentences — preserve original punctuation
  if (sentences.length > maxSentences) {
    trimmed = sentences.slice(0, maxSentences).join(" ");
    passed = false;
  }

  // Trim to max length (for SMS especially)
  if (channel === "sms" && trimmed.length > maxLen * 1.5) {
    trimmed = trimmed.slice(0, maxLen * 1.5).trimEnd();
    const lastSpace = trimmed.lastIndexOf(" ");
    if (lastSpace > maxLen * 0.8) {
      trimmed = trimmed.slice(0, lastSpace);
    }
    if (!trimmed.endsWith("?") && !trimmed.endsWith(".")) {
      trimmed += ".";
    }
    passed = false;
  }

  return { passed, trimmed };
}

/**
 * Main validation pipeline — the final gate.
 *
 * Order of operations:
 * 1. Compliance check (highest priority — can block entirely)
 * 2. Tone check (clean up language)
 * 3. Passive check (reject non-committal BEFORE adding a closer)
 * 4. Length check (enforce limits)
 * 5. Conversion check (ensure forward motion — last, so closer sticks)
 *
 * FIX: Passive check moved BEFORE conversion enforcement.
 * Previously, enforceConversion would append "What time works best?"
 * to "Ok." making it "Ok. What time works best?" — then isPassiveResponse
 * matched ^ok and replaced the entire thing with the uncertain fallback,
 * destroying the forward motion that was just added.
 */
export function validateResponse(
  response: string,
  channel: "sms" | "web" | "messenger" = "web"
): ValidationResult {
  const modifications: string[] = [];
  let current = response;

  // 1. Compliance — can completely replace the response
  const compliance = checkCompliance(current);
  if (!compliance.passed) {
    modifications.push(`compliance:${compliance.violations.join(",")}`);
    if (compliance.severity === "block" && compliance.rewrittenResponse) {
      return {
        valid: false,
        finalResponse: compliance.rewrittenResponse,
        checks: {
          compliance: false,
          forwardMotion: false,
          tone: true,
          length: true,
        },
        modifications: [
          ...modifications,
          "response_replaced:compliance_block",
        ],
      };
    }
  }

  // 2. Tone — clean up language issues
  const tone = checkTone(current);
  if (!tone.passed) {
    current = tone.cleaned;
    modifications.push("tone:cleaned");
  }

  // 3. Passive check — reject wimpy responses BEFORE adding a closer
  // This prevents the closer from being immediately destroyed
  if (isPassiveResponse(current)) {
    current = FALLBACKS.uncertain;
    modifications.push("passive:replaced_with_fallback");
  }

  // 4. Length — enforce limits
  const length = checkLength(current, channel);
  if (!length.passed) {
    current = length.trimmed;
    modifications.push("length:trimmed");
  }

  // 5. Conversion — ensure forward motion (runs last so closer persists)
  const conversion = enforceConversion(current);
  if (!conversion.hasForwardMotion) {
    current = conversion.enhancedResponse;
    modifications.push("conversion:closer_appended");
  }

  // Final empty check
  if (!current || current.trim().length === 0) {
    current = FALLBACKS.error;
    modifications.push("empty:replaced_with_fallback");
  }

  return {
    valid: compliance.passed && tone.passed && length.passed,
    finalResponse: current,
    checks: {
      compliance: compliance.passed,
      forwardMotion: conversion.hasForwardMotion,
      tone: tone.passed,
      length: length.passed,
    },
    modifications,
  };
}
