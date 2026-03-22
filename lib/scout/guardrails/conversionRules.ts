/**
 * Conversion Rules — Every Scout response must move forward.
 *
 * Two enforcement layers:
 *
 * 1. enforceScheduling() — runs FIRST.
 *    Detects false booking confirmations in LLM output and replaces
 *    them with a Calendly push. This is the conversion-critical fix:
 *    Scout must NEVER tell a user "we'll schedule" or "expect to hear
 *    from us" — it must push to Calendly or collect contact info.
 *
 * 2. enforceConversion() — runs SECOND.
 *    If a response lacks any forward motion (no question, no CTA,
 *    no next step), appends a Calendly-first closing line.
 *
 * Scout exists to convert, not to chat.
 * A call is only booked when the user completes a Calendly event.
 */

import { CONVERSION_CLOSERS, SCHEDULING_FORBIDDEN_PATTERNS, CALENDLY_LINK } from "../config/scoutConfig";

export interface ConversionResult {
  hasForwardMotion: boolean;
  enhancedResponse: string;
}

export interface SchedulingCheckResult {
  hadFalseConfirmation: boolean;
  finalResponse: string;
}

/**
 * Patterns that indicate a user is expressing time/day availability.
 * When detected in the USER message, Scout must push to Calendly — not confirm.
 */
const USER_SCHEDULING_INTENT_PATTERNS = [
  // Day references
  /\b(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  // Time references
  /\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/i,
  /\b(?:morning|afternoon|evening|noon|midnight)\b/i,
  // Relative time
  /\b(?:this week|next week|later today|in the morning|in the afternoon)\b/i,
  // Scheduling intent
  /\b(?:works for me|that works|i can do|i'm free|i'm available|available then)\b/i,
];

/**
 * The Calendly push response — used when a user signals time availability.
 * Path A: direct link. Acknowledge their time, push to lock it in.
 */
const CALENDLY_PUSH = `Perfect — grab that time here so it's locked in: ${CALENDLY_LINK} Takes 10 seconds.`;

/**
 * The contact collection response — used as fallback if user resists the link.
 */
const CONTACT_COLLECT = `What's the best number or email to send the invite to?`;

/**
 * Check if the USER's message signals scheduling intent.
 * If yes, Scout must push to Calendly — not let the LLM handle it freely.
 */
export function detectUserSchedulingIntent(userMessage: string): boolean {
  return USER_SCHEDULING_INTENT_PATTERNS.some((pattern) =>
    pattern.test(userMessage)
  );
}

/**
 * enforceScheduling — FIRST guardrail layer.
 *
 * Two checks:
 * 1. If the LLM response contains a forbidden scheduling phrase
 *    (false booking confirmation), replace it with a Calendly push.
 * 2. If the user's message signaled scheduling intent, ensure the
 *    response pushes to Calendly (not just a closer).
 *
 * This runs before enforceConversion so the Calendly push is never
 * overwritten by a generic closer.
 */
export function enforceScheduling(
  llmResponse: string,
  userMessage: string
): SchedulingCheckResult {
  // Check 1: LLM response contains a false booking confirmation
  const hasFalseConfirmation = SCHEDULING_FORBIDDEN_PATTERNS.some(
    ({ pattern }) => pattern.test(llmResponse)
  );

  if (hasFalseConfirmation) {
    // Replace the entire response — don't try to patch it.
    // A partial fix still leaves the false confirmation in the message.
    return {
      hadFalseConfirmation: true,
      finalResponse: CALENDLY_PUSH,
    };
  }

  // Check 2: User signaled time/day availability — ensure Calendly is in response
  const userSignaledScheduling = detectUserSchedulingIntent(userMessage);
  if (userSignaledScheduling) {
    // Check if the LLM response already contains the Calendly link
    const alreadyHasCalendlyLink = llmResponse.includes("calendly.com");
    if (!alreadyHasCalendlyLink) {
      // Append the Calendly push — don't replace, the LLM may have
      // said something useful (acknowledging the time, etc.)
      return {
        hadFalseConfirmation: false,
        finalResponse: `${llmResponse.trimEnd()} ${CALENDLY_PUSH}`,
      };
    }
  }

  // No scheduling issue — pass through unchanged
  return {
    hadFalseConfirmation: false,
    finalResponse: llmResponse,
  };
}

/**
 * Patterns that indicate forward motion in a response.
 * If at least one matches, the response has a next step.
 */
const FORWARD_MOTION_PATTERNS = [
  // Calendly link present — strongest signal
  /calendly\.com/i,
  // Direct questions
  /\?$/m,
  // Call-to-action phrases
  /(?:schedule|book|set up|arrange) (?:a |the )?(?:call|meeting|showing|appointment)/i,
  /(?:what|when|which) (?:time|day|works|would)/i,
  /(?:would you like|want me to|should i|can i)/i,
  /(?:reach out|follow up|connect you|have .+ contact)/i,
  // Confirmations that imply next step
  /(?:i'll|we'll) (?:send|share|forward|prepare)/i,
  /(?:your agent|the team|someone) will/i,
];

/**
 * Check whether a response contains forward motion.
 * Returns true if the response has at least one next-step indicator.
 */
function hasForwardMotion(response: string): boolean {
  return FORWARD_MOTION_PATTERNS.some((pattern) => pattern.test(response));
}

/**
 * Select an appropriate closing line.
 * Prefers Calendly-push closers (indices 0–2) when possible.
 * Falls back to contact collection (index 3) on rotation.
 */
function selectCloser(response: string): string {
  // Simple hash from response length — avoids repeating the same closer
  const hash = response.length % CONVERSION_CLOSERS.length;
  return CONVERSION_CLOSERS[hash];
}

/**
 * enforceConversion — SECOND guardrail layer.
 *
 * If the response already has forward motion, it passes through unchanged.
 * If it lacks a next step, a Calendly-first closing line is appended.
 *
 * Always runs AFTER enforceScheduling.
 */
export function enforceConversion(response: string): ConversionResult {
  const forward = hasForwardMotion(response);

  if (forward) {
    return { hasForwardMotion: true, enhancedResponse: response };
  }

  // Append a closing line to create forward motion
  const closer = selectCloser(response);
  const enhanced = `${response.trimEnd()} ${closer}`;

  return { hasForwardMotion: false, enhancedResponse: enhanced };
}

/**
 * Check if a response is too passive or non-committal.
 * Used as a secondary check after conversion enforcement.
 */
export function isPassiveResponse(response: string): boolean {
  const passivePatterns = [
    /^(?:ok|okay|sure|got it|understood|noted)/i,
    /^(?:i see|i understand|that makes sense)/i,
    /(?:let me know|feel free|no rush|take your time|whenever)/i,
  ];

  return passivePatterns.some((p) => p.test(response));
}
