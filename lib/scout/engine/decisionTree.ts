/**
 * Decision Tree — Classify inbound messages and map to response strategy.
 *
 * Every inbound message is classified into a category that determines:
 * 1. Which response strategy to use
 * 2. What guardrail enforcement level to apply
 * 3. Whether escalation is needed
 *
 * Categories are mutually exclusive. First match wins.
 */

export type MessageCategory =
  | "new_lead"
  | "property_inquiry"
  | "objection"
  | "high_intent"
  | "escalation_required"
  | "compliance_risk"
  | "general_question"
  | "unknown";

export type GuardrailLevel = "standard" | "elevated" | "maximum";

export interface Classification {
  category: MessageCategory;
  guardrailLevel: GuardrailLevel;
  responseStrategy: string;
  requiresEscalation: boolean;
}

/**
 * Pattern groups for message classification.
 * Order matters — checked top to bottom, first match wins.
 */
const CLASSIFICATION_RULES: Array<{
  category: MessageCategory;
  patterns: RegExp[];
  guardrailLevel: GuardrailLevel;
  responseStrategy: string;
  requiresEscalation: boolean;
}> = [
  // Compliance risk — must be checked first
  {
    category: "compliance_risk",
    patterns: [
      /(?:safe|safety|crime|dangerous) (?:area|neighborhood|street)/i,
      /(?:what (?:kind|type) of people|who lives|demographics)/i,
      /(?:good|best) (?:schools|school district)/i,
      /(?:family|families|kids|children) (?:friendly|area|neighborhood)/i,
    ],
    guardrailLevel: "maximum",
    responseStrategy:
      "Deflect to agent immediately. Do not address the topic. Use compliance fallback.",
    requiresEscalation: false,
  },

  // Escalation required — contracts, offers, legal
  {
    category: "escalation_required",
    patterns: [
      /(?:make|submit|write|draft) (?:an |the )?offer/i,
      /(?:negotiate|counter|counteroffer)/i,
      /(?:contract|agreement|disclosure|contingency|escrow|closing)/i,
      /(?:legal|attorney|lawyer|sue|lawsuit)/i,
      /(?:should i|can i) (?:sign|back out|cancel|withdraw)/i,
      /(?:how much|what) should (?:i|we) offer/i,
    ],
    guardrailLevel: "maximum",
    responseStrategy:
      "Immediately defer to agent. Do not attempt to answer. Use escalation fallback.",
    requiresEscalation: true,
  },

  // High intent — ready to act
  {
    category: "high_intent",
    patterns: [
      /(?:i want to|ready to|looking to|need to) (?:buy|sell|list|move)/i,
      /(?:pre-?approved|pre-?qualified|got approved|got funding)/i,
      /(?:schedule|book|set up) (?:a |the )?(?:showing|tour|visit|call)/i,
      /(?:can (?:i|we)|how do i) (?:see|visit|tour|view) (?:the|this|a)/i,
      /(?:i found|i saw|i love) (?:a |the |this )?(?:house|home|property|listing)/i,
      /(?:just sold|just listed|under contract|pending)/i,
    ],
    guardrailLevel: "elevated",
    responseStrategy:
      "Acknowledge intent. Provide immediate value. Push directly to agent connection or showing.",
    requiresEscalation: false,
  },

  // Property inquiry — asking about a specific property
  {
    category: "property_inquiry",
    patterns: [
      /(?:how (?:much|many)|what (?:is|are) the) (?:price|bed|bath|sqft|square|lot|year)/i,
      /(?:is .+ still|still available|still on the market)/i,
      /(?:tell me about|more info|details on|information about)/i,
      /(?:open house|showing times|when can i see)/i,
      /(?:hoa|taxes|property tax|homeowner)/i,
      /(?:garage|pool|yard|basement|kitchen|bathroom)/i,
    ],
    guardrailLevel: "standard",
    responseStrategy:
      "Provide what you can. Deflect specifics to agent. Always offer to schedule a showing or call.",
    requiresEscalation: false,
  },

  // Objection — hesitation or pushback
  {
    category: "objection",
    patterns: [
      /(?:not sure|not ready|not interested|no thanks|maybe later)/i,
      /(?:too (?:busy|expensive|soon|early)|can't afford)/i,
      /(?:already have|already working with|have an agent)/i,
      /(?:just looking|just browsing|no rush|not in a hurry)/i,
      /(?:think about it|need time|need to discuss|talk to (?:my|the))/i,
    ],
    guardrailLevel: "standard",
    responseStrategy:
      "Acknowledge without pressure. Provide a low-commitment next step. Keep the door open.",
    requiresEscalation: false,
  },

  // New lead — first contact or greeting
  {
    category: "new_lead",
    patterns: [
      /^(?:hi|hello|hey|good (?:morning|afternoon|evening)|what's up)/i,
      /(?:i'm interested|tell me more|how does (?:this|it|scout) work)/i,
      /(?:saw your|found your|got your|someone (?:told|referred|sent))/i,
      /(?:what (?:do you|can you)|how can you) (?:do|help|offer)/i,
    ],
    guardrailLevel: "standard",
    responseStrategy:
      "Welcome warmly. Ask a qualifying question about their real estate needs. Keep it to one question.",
    requiresEscalation: false,
  },

  // General question — catch-all for real estate questions
  {
    category: "general_question",
    patterns: [
      /(?:what|how|when|where|why|can|do|does|is|are)/i,
      /\?$/,
    ],
    guardrailLevel: "standard",
    responseStrategy:
      "Answer concisely if within scope. Deflect to agent for anything requiring expertise. Include a next step.",
    requiresEscalation: false,
  },
];

/**
 * Classify an inbound message.
 * Returns the category, guardrail level, response strategy, and escalation flag.
 */
export function classifyMessage(message: string): Classification {
  const trimmed = message.trim();

  for (const rule of CLASSIFICATION_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(trimmed)) {
        return {
          category: rule.category,
          guardrailLevel: rule.guardrailLevel,
          responseStrategy: rule.responseStrategy,
          requiresEscalation: rule.requiresEscalation,
        };
      }
    }
  }

  // Default — unknown intent, elevated guardrails
  return {
    category: "unknown",
    guardrailLevel: "elevated",
    responseStrategy:
      "Do not guess. Ask a clarifying question to understand their needs. Keep it professional.",
    requiresEscalation: false,
  };
}
