/**
 * Response Validator — Final gate before any response is sent.
 *
 * Every Scout response passes through this validator after
 * compliance, conversion, and escalation checks. This is the
 * last line of defense.
 *
 * If validation fails, the response is either rewritten or
 * replaced with a safe fallback. Nothing unsafe gets through.
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
 */
function checkTone(response: string): { passed: boolean; cleaned: string } {
  let cleaned = response;
  let passed = true;

  // Remove emojis
  const emojiPattern =
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}]/gu;
  if (emojiPattern.test(cleaned)) {
    cleaned = cleaned.replace(emojiPattern, "").replace(/\s{2,}/g, " ").trim();
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
 * Check length — enforce sentence and character limits.
 */
function checkLength(
  response: string,
  channel: "sms" | "web" | "messenger" = "web"
): { passed: boolean; trimmed: string } {
  const maxLen = channel === "sms" ? TONE.smsMaxLength : TONE.maxLength;

  // Count sentences (rough — split on period, question mark, or newline)
  const sentences = response
    .split(/[.?]\s+/)
    .filter((s) => s.trim().length > 0);

  let trimmed = response;
  let passed = true;

  // Trim to max sentences
  if (sentences.length > TONE.maxSentences) {
    trimmed = sentences.slice(0, TONE.maxSentences).join(". ");
    if (!trimmed.endsWith("?") && !trimmed.endsWith(".")) {
      trimmed += ".";
    }
    passed = false;
  }

  // Trim to max length (for SMS especially)
  if (channel === "sms" && trimmed.length > maxLen * 1.5) {
    // Allow some overflow for SMS but not excessive
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
 * 3. Length check (enforce limits)
 * 4. Conversion check (ensure forward motion)
 * 5. Passive check (reject non-committal responses)
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
      // Hard block — replace entire response
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

  // 3. Length — enforce limits
  const length = checkLength(current, channel);
  if (!length.passed) {
    current = length.trimmed;
    modifications.push("length:trimmed");
  }

  // 4. Conversion — ensure forward motion
  const conversion = enforceConversion(current);
  if (!conversion.hasForwardMotion) {
    current = conversion.enhancedResponse;
    modifications.push("conversion:closer_appended");
  }

  // 5. Passive check — reject wimpy responses
  if (isPassiveResponse(current)) {
    current = FALLBACKS.uncertain;
    modifications.push("passive:replaced_with_fallback");
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
