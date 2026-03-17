/**
 * Conversation state management for SMS conversion system.
 * In-memory store — replace with DB when scaling.
 */

export type Stage =
  | "ENGAGE"
  | "QUALIFY"
  | "ALIGN"
  | "TRANSITION"
  | "CALL_NOW"
  | "FOLLOW_UP";

export type Intent =
  | "buyers"
  | "listings"
  | "both"
  | "pricing"
  | "high_intent"
  | "objection"
  | "unknown";

export interface ContactState {
  phone: string;
  stage: Stage;
  intent: Intent;
  dealContext: string;
  messageCount: number;
  lastInteraction: number;
}

const store = new Map<string, ContactState>();

export function getContact(phone: string): ContactState {
  const existing = store.get(phone);
  if (existing) return existing;

  const fresh: ContactState = {
    phone,
    stage: "ENGAGE",
    intent: "unknown",
    dealContext: "",
    messageCount: 0,
    lastInteraction: Date.now(),
  };
  store.set(phone, fresh);
  return fresh;
}

export function saveContact(contact: ContactState): void {
  contact.lastInteraction = Date.now();
  contact.messageCount += 1;
  store.set(contact.phone, contact);
}

/**
 * Hook for future re-engagement: returns contacts
 * that haven't interacted in the given number of minutes.
 */
export function getStaleContacts(minutesIdle: number): ContactState[] {
  const threshold = Date.now() - minutesIdle * 60 * 1000;
  const stale: ContactState[] = [];
  store.forEach((contact) => {
    if (
      contact.lastInteraction < threshold &&
      contact.stage !== "CALL_NOW" &&
      contact.stage !== "FOLLOW_UP"
    ) {
      stale.push(contact);
    }
  });
  return stale;
}
