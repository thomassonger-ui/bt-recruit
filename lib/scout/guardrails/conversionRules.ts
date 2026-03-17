/**
 * Conversion Rules — Every Scout response must move forward.
 *
 * If a response lacks forward motion (no question, no CTA, no next step),
 * it gets a closing line appended automatically.
 *
 * Scout exists to convert, not to chat.
 */

import { CONVERSION_CLOSERS } from "../config/scoutConfig";

export interface ConversionResult {
  hasForwardMotion: boolean;
  enhancedResponse: string;
}

/**
 * Patterns that indicate forward motion in a response.
 * If at least one matches, the response has a next step.
 */
const FORWARD_MOTION_PATTERNS = [
  // Direct questions
  /\?$/m,
  // Call-to-action phrases
  /(?:schedule|book|set up|arrange) (?:a |the )?(?:call|meeting|showing|appointment)/i,
  /(?:what|when|which) (?:time|day|works|would)/i,
  /(?:would you like|want me to|should i|can i)/i,
  /(?:reach out|follow up|connect you|have .+ contact)/i,
  /(?:let me|i'll) (?:have|get|connect|set)/i,
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
 * Uses a simple rotation based on response content to avoid repetition.
 */
function selectCloser(response: string): string {
  // Simple hash from response to pick a closer — avoids repeating the same one
  const hash = response.length % CONVERSION_CLOSERS.length;
  return CONVERSION_CLOSERS[hash];
}

/**
 * Enforce conversion rules on a response.
 *
 * If the response already has forward motion, it passes through unchanged.
 * If it lacks a next step, a closing line is appended.
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
