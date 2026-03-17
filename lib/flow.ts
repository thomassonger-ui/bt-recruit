/**
 * Conversation state machine.
 * Deterministic stage transitions with intent-aware acceleration.
 */

import type { Stage, Intent, ContactState } from "./state";

/**
 * Determines whether the conversation should push toward a call.
 * Centralized logic used by both the state machine and response engine.
 */
export function shouldOfferCall(contact: ContactState): boolean {
  // Always push if high intent
  if (contact.intent === "high_intent") return true;

  // Push if pricing — deflect details, move to call
  if (contact.intent === "pricing") return true;

  // Push if they've shared deal context (real business = real call)
  if (contact.dealContext.length > 0 && contact.messageCount >= 1) return true;

  // Push by message 2-3 regardless
  if (contact.messageCount >= 2) return true;

  return false;
}

/**
 * Advances the conversation stage based on current state and intent.
 * Returns the new stage.
 */
export function nextStage(current: Stage, intent: Intent, contact: ContactState): Stage {
  // High intent or pricing → accelerate to call
  if (intent === "high_intent") {
    return "CALL_NOW";
  }

  if (intent === "pricing") {
    return current === "ENGAGE" ? "TRANSITION" : "CALL_NOW";
  }

  // Objection → stay in current stage (don't advance, re-engage)
  if (intent === "objection") {
    return current;
  }

  // Standard progression
  const progression: Record<Stage, Stage> = {
    ENGAGE: "QUALIFY",
    QUALIFY: "ALIGN",
    ALIGN: "TRANSITION",
    TRANSITION: "CALL_NOW",
    CALL_NOW: "FOLLOW_UP",
    FOLLOW_UP: "FOLLOW_UP",
  };

  const next = progression[current];

  // If they should get a call offer but machine hasn't caught up, skip ahead
  if (shouldOfferCall(contact) && next !== "CALL_NOW" && next !== "FOLLOW_UP") {
    return "TRANSITION";
  }

  return next;
}
