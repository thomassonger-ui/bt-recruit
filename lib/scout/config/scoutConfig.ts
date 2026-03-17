/**
 * Scout Configuration — Central source of truth.
 *
 * All tone settings, blocked phrases, escalation triggers,
 * and response templates live here. Nothing is scattered.
 */

/* ── Tone ── */
export const TONE = {
  style: "professional" as const,
  maxSentences: 3,
  maxLength: 280,
  smsMaxLength: 160,
} as const;

/* ── Blocked phrases — never appear in any Scout response ── */
export const BLOCKED_PHRASES = [
  // Fair housing violations
  "safe neighborhood",
  "safe area",
  "good neighborhood",
  "bad neighborhood",
  "bad area",
  "family-friendly",
  "family friendly",
  "family oriented",
  "good schools",
  "great schools",
  "school district",
  "up and coming",
  "up-and-coming",
  "ethnic",
  "church nearby",
  "mosque nearby",
  "synagogue nearby",
  "temple nearby",
  "walking distance to church",
  "diverse area",
  "not diverse",
  "young professionals",
  "mature community",
  "retired community",
  "singles area",
  "no children",
  "quiet community",
  // Legal overreach
  "i guarantee",
  "we guarantee",
  "guaranteed",
  "you will definitely",
  "for sure will",
  "absolutely will",
  "i promise",
  "we promise",
  "legally",
  "in my legal opinion",
  "this is legal advice",
  "tax advice",
  "you should sue",
  // Tone violations
  "lol",
  "omg",
  "haha",
  "!!",
  "???",
  "tbh",
  "ngl",
  "lmao",
  "bruh",
] as const;

/* ── Protected class references — Fair Housing Act ── */
export const PROTECTED_CLASS_TERMS = [
  "race",
  "racial",
  "color",
  "religion",
  "religious",
  "sex",
  "sexual orientation",
  "gender identity",
  "national origin",
  "nationality",
  "familial status",
  "disability",
  "disabled",
  "handicap",
  "handicapped",
  "pregnant",
  "children",
  "kids",
  "elderly",
  "senior citizen",
  "immigrant",
  "undocumented",
  "veteran status",
  "marital status",
  "married",
  "single",
  "divorced",
] as const;

/* ── Escalation trigger keywords ── */
export const ESCALATION_TRIGGERS = [
  "make an offer",
  "submit an offer",
  "write an offer",
  "negotiate",
  "negotiation",
  "counteroffer",
  "counter offer",
  "contingency",
  "contingencies",
  "earnest money",
  "inspection",
  "appraisal",
  "contract",
  "sign the contract",
  "sign paperwork",
  "closing date",
  "closing costs",
  "title",
  "escrow",
  "attorney",
  "lawyer",
  "sue",
  "lawsuit",
  "disclosure",
  "as-is",
  "repair request",
  "amendment",
  "addendum",
  "how much should i offer",
  "what should i offer",
  "is this a good price",
  "is this overpriced",
  "will they accept",
  "can you reduce",
  "lower the price",
] as const;

/* ── Conversion closing lines — appended when forward motion is missing ── */
export const CONVERSION_CLOSERS = [
  "What time works best for a quick call?",
  "Would you like me to have your agent reach out?",
  "Want me to set that up for you?",
  "When works best to connect?",
  "Should I have someone follow up with you on that?",
] as const;

/* ── Safe fallback responses ── */
export const FALLBACKS = {
  compliance:
    "That's a great question — your agent will be the best person to guide you on that.",
  escalation:
    "I'll have your agent reach out right away to help you with that.",
  uncertain:
    "I want to make sure you get the most accurate information. Let me confirm that for you.",
  error:
    "Got your message. Let me connect you with someone who can help right away.",
} as const;

/* ── Response format structure ── */
export const RESPONSE_STRUCTURE = {
  steps: ["acknowledge", "provide_value", "move_forward"] as const,
  description:
    "Every response must: (1) Acknowledge what the user said, (2) Provide a clear value statement, (3) Move toward a next step.",
} as const;
