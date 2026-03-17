/**
 * Lightweight synchronous intent classifier.
 * Uses keyword detection for speed — no LLM call needed.
 */

import type { Intent } from "./state";

const PATTERNS: Array<{ intent: Intent; keywords: string[] }> = [
  {
    intent: "high_intent",
    keywords: [
      "ready",
      "sign up",
      "start",
      "join",
      "set up",
      "set it up",
      "let's go",
      "interested",
      "how do i get",
      "i want",
      "send me",
      "call me",
      "when can we",
      "schedule",
      "asap",
      "today",
      "now",
    ],
  },
  {
    intent: "pricing",
    keywords: [
      "cost",
      "price",
      "how much",
      "fee",
      "commission",
      "split",
      "cap",
      "desk fee",
      "monthly",
    ],
  },
  {
    intent: "buyers",
    keywords: [
      "buyer",
      "buyers",
      "showing",
      "looking to buy",
      "purchase",
      "offer",
      "pre-approved",
    ],
  },
  {
    intent: "listings",
    keywords: [
      "listing",
      "listings",
      "seller",
      "list a home",
      "mls",
      "cma",
      "market analysis",
    ],
  },
  {
    intent: "both",
    keywords: ["both", "buyers and sellers", "full service", "everything"],
  },
  {
    intent: "objection",
    keywords: [
      "not sure",
      "maybe later",
      "think about it",
      "not ready",
      "too busy",
      "already have",
      "no thanks",
      "not interested",
    ],
  },
];

export function classifyIntent(message: string): Intent {
  const lower = message.toLowerCase();

  for (const pattern of PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (lower.includes(keyword)) {
        return pattern.intent;
      }
    }
  }

  return "unknown";
}
