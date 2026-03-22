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

/* ── Calendly booking link ── */
export const CALENDLY_LINK = "https://calendly.com/thomas-songer/bear-team-meet";

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
  // Scheduling violations — Scout must never claim a meeting is confirmed
  // unless a Calendly link has been clicked and booking completed.
  "we'll schedule",
  "we will schedule",
  "i'll schedule",
  "i will schedule",
  "you're booked",
  "you are booked",
  "you're all set",
  "you are all set",
  "expect to hear from us",
  "someone will call you",
  "we'll arrange",
  "we will arrange",
  "i'll arrange",
  "i will arrange",
  "i'll have someone reach out",
  "i will have someone reach out",
  "we'll have someone",
  "we will have someone",
  "i'll set that up",
  "i will set that up",
  "let me set that up",
] as const;

/* ── Scheduling forbidden phrases — exact patterns that falsely confirm a meeting.
 * These are checked BEFORE the LLM response is returned.
 * Any match → response is replaced with a Calendly push.
 */
export const SCHEDULING_FORBIDDEN_PATTERNS: ReadonlyArray<{
  pattern: RegExp;
  label: string;
}> = [
  { pattern: /we'?ll schedule/i, label: "false_schedule_confirm" },
  { pattern: /i'?ll schedule/i, label: "false_schedule_confirm" },
  { pattern: /you'?re (?:all set|booked)/i, label: "false_booking_confirm" },
  { pattern: /expect to hear from us/i, label: "false_followup_promise" },
  { pattern: /someone will (?:call|reach out|contact)/i, label: "false_followup_promise" },
  { pattern: /we'?ll (?:arrange|have someone)/i, label: "false_arrange_confirm" },
  { pattern: /i'?ll (?:arrange|have someone|set that up)/i, label: "false_arrange_confirm" },
  { pattern: /let me (?:arrange|set that up)/i, label: "false_arrange_confirm" },
  { pattern: /call (?:is |has been )?(?:scheduled|confirmed|set)/i, label: "false_booking_confirm" },
  { pattern: /meeting (?:is |has been )?(?:scheduled|confirmed|set)/i, label: "false_booking_confirm" },
] as const;

/* ── Protected class references — Fair Housing Act ──
 * These are tested with word-boundary regex (\b), not substring matching,
 * to avoid false positives on common real estate language like
 * "single family home", "color of the cabinets", "disabled parking".
 */
export const PROTECTED_CLASS_PATTERNS: ReadonlyArray<{
  pattern: RegExp;
  label: string;
}> = [
  { pattern: /\brace\b(?! (condition|to))/i, label: "race" },
  { pattern: /\bracial\b/i, label: "racial" },
  { pattern: /\bskin color\b/i, label: "skin_color" },
  { pattern: /\breligion\b/i, label: "religion" },
  { pattern: /\breligious\b(?! (holiday|observance))/i, label: "religious" },
  { pattern: /\bsexual orientation\b/i, label: "sexual_orientation" },
  { pattern: /\bgender identity\b/i, label: "gender_identity" },
  { pattern: /\bnational origin\b/i, label: "national_origin" },
  { pattern: /\bnationality\b/i, label: "nationality" },
  { pattern: /\bfamilial status\b/i, label: "familial_status" },
  { pattern: /\bdisabilit(?:y|ies)\b/i, label: "disability" },
  { pattern: /\bhandicap(?:ped)?\b/i, label: "handicap" },
  { pattern: /\bpregnant\b/i, label: "pregnant" },
  { pattern: /\belderly\b/i, label: "elderly" },
  { pattern: /\bsenior citizen/i, label: "senior_citizen" },
  { pattern: /\bimmigrant\b/i, label: "immigrant" },
  { pattern: /\bundocumented\b/i, label: "undocumented" },
  { pattern: /\bveteran status\b/i, label: "veteran_status" },
  { pattern: /\bmarital status\b/i, label: "marital_status" },
] as const;

/* ── Escalation trigger keywords ──
 * Checked with word-boundary regex to prevent false positives.
 * "sue" was matching inside "issue"/"pursue". "title" was too generic.
 * Now uses \b boundaries and contextual phrases.
 */
export const ESCALATION_TRIGGER_PATTERNS: ReadonlyArray<{
  pattern: RegExp;
  label: string;
}> = [
  { pattern: /\bmake an offer\b/i, label: "make_an_offer" },
  { pattern: /\bsubmit an offer\b/i, label: "submit_an_offer" },
  { pattern: /\bwrite an offer\b/i, label: "write_an_offer" },
  { pattern: /\bnegotiat(?:e|ion|ing)\b/i, label: "negotiate" },
  { pattern: /\bcounteroffer\b/i, label: "counteroffer" },
  { pattern: /\bcounter offer\b/i, label: "counter_offer" },
  { pattern: /\bcontingenc(?:y|ies)\b/i, label: "contingency" },
  { pattern: /\bearnest money\b/i, label: "earnest_money" },
  { pattern: /\bhome inspection\b/i, label: "inspection" },
  { pattern: /\binspection (?:period|report|results|contingency)\b/i, label: "inspection_detail" },
  { pattern: /\bappraisal\b/i, label: "appraisal" },
  { pattern: /\b(?:the |this |my |a )contract\b/i, label: "contract" },
  { pattern: /\bsign (?:the |a |this )?(?:contract|paperwork|agreement)\b/i, label: "sign_contract" },
  { pattern: /\bclosing (?:date|costs|day|process)\b/i, label: "closing" },
  { pattern: /\btitle (?:company|search|insurance|report)\b/i, label: "title" },
  { pattern: /\bescrow\b/i, label: "escrow" },
  { pattern: /\battorney\b/i, label: "attorney" },
  { pattern: /\blawyer\b/i, label: "lawyer" },
  { pattern: /\b(?:sue|lawsuit|suing)\b/i, label: "lawsuit" },
  { pattern: /\bdisclosure(?:s)?\b/i, label: "disclosure" },
  { pattern: /\bas-is\b/i, label: "as_is" },
  { pattern: /\brepair request\b/i, label: "repair_request" },
  { pattern: /\bamendment\b/i, label: "amendment" },
  { pattern: /\baddendum\b/i, label: "addendum" },
  { pattern: /how much should (?:i|we) offer/i, label: "offer_advice" },
  { pattern: /what should (?:i|we) offer/i, label: "offer_advice" },
  { pattern: /is this a good price/i, label: "price_advice" },
  { pattern: /is this overpriced/i, label: "price_advice" },
  { pattern: /will they accept/i, label: "negotiation_advice" },
  { pattern: /can you reduce/i, label: "price_reduction" },
  { pattern: /lower the price/i, label: "price_reduction" },
] as const;

/* ── Conversion closing lines — Calendly-first.
 * These are appended when a response lacks forward motion.
 * Path A (preferred): push to Calendly directly.
 * Path B (fallback): collect contact info if user resists link.
 * NEVER confirm a booking without a completed Calendly event.
 */
export const CONVERSION_CLOSERS = [
  `Perfect — grab that time here so it's locked in: ${CALENDLY_LINK} Takes 10 seconds.`,
  `Go ahead and lock it in here: ${CALENDLY_LINK} — takes 10 seconds.`,
  `Here's the link to confirm it: ${CALENDLY_LINK}`,
  "What's the best number or email to send the invite to?",
  `Grab a slot that works here: ${CALENDLY_LINK}`,
] as const;

/* ── Steering phrases — phrase-level detection ──
 * These are the exact phrases that must trigger a hard block.
 * Checked case-insensitively with word-boundary regex.
 * Any match = severity "block" + response replaced with neighborhood rewrite.
 */
export const STEERING_PHRASES = [
  "family-friendly",
  "family friendly",
  "great for families",
  "good for families",
  "perfect for families",
  "ideal for families",
  "safe neighborhood",
  "safe area",
  "safe community",
  "safe place",
  "community feel",
  "community vibe",
  "good area for kids",
  "great area for kids",
  "nice area for kids",
  "kid-friendly",
  "kid friendly",
] as const;

/* ── Safe fallback responses ── */
export const FALLBACKS = {
  compliance:
    "That's a great question — your agent will be the best person to guide you on that.",
  /** Specific rewrite for neighborhood/family/steering questions.
   *  Neutral, helpful, includes property details offer + agent handoff. */
  neighborhood:
    "That's a great question. I can share details about the property and nearby features like schools, parks, and local amenities. Your agent can also help guide you based on what matters most to you.",
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
