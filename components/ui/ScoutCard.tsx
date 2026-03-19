"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const conversations = [
  {
    question: "I'm at KW and I never hit my cap. Is that normal?",
    answer:
      "Very normal. Most KW agents doing 6–14 deals per year never cap. You pay the full split all year, reset, and pay it again. Bear Team's $16K cap is a graduation trigger — hit it and your split improves automatically.",
  },
  {
    question: "What would I net at Bear Team vs KW at 8 deals?",
    answer:
      "At 8 deals and $415K average: Bear Team nets ~$66,975 after splits and $150 flat fee. KW nets ~$64,000 after the 70/30 split, 6% royalty, and monthly fees. Bear Team wins year 1 — and year 2 you start at Tier 2.",
  },
  {
    question: "What are my monthly costs at Bear Team?",
    answer:
      "$0/month. No desk fees, no tech fees, no royalty. E&O insurance is covered by Bear Team. Your only cost is $150 flat per closing — the same whether the deal is $200K or $2M.",
  },
  {
    question: "How long does it take to switch brokerages in Florida?",
    answer:
      "One FREC license transfer form. Typically 3–5 business days. You can keep working your active deals the entire time. There's no gap in your license and no interruption to your pipeline.",
  },
  {
    question: "What does the 90/10 tier look like?",
    answer:
      "Tier 4 — Team Lead level — is 90/10. You hit it at Deal 16 and beyond. The brokerage always earns at every tier, but at 90/10 you're keeping the maximum. No other fees on top.",
  },
];

export default function ScoutCard({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [phase, setPhase] = useState<"typing" | "showing" | "fading">("typing");

  const current = conversations[index];

  // Typing effect
  useEffect(() => {
    if (phase !== "typing") return;

    let i = 0;
    setTypedAnswer("");

    const interval = setInterval(() => {
      i++;
      setTypedAnswer(current.answer.slice(0, i));
      if (i >= current.answer.length) {
        clearInterval(interval);
        setPhase("showing");
      }
    }, 18);

    return () => clearInterval(interval);
  }, [index, phase, current.answer]);

  // Pause then advance
  useEffect(() => {
    if (phase !== "showing") return;

    const timer = setTimeout(() => {
      setPhase("fading");
    }, 3000);

    return () => clearTimeout(timer);
  }, [phase]);

  const handleExitComplete = useCallback(() => {
    if (phase === "fading") {
      setIndex((prev) => (prev + 1) % conversations.length);
      setPhase("typing");
    }
  }, [phase]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className={`surface-card p-6 sm:p-8 ${className}`}
    >
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          S
        </div>
        <div>
          <p
            className="text-sm font-semibold text-foreground"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Scout
          </p>
          <p className="text-xs text-muted">BearTeam AI Assistant</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-muted">Online</span>
        </div>
      </div>

      {/* Conversation — animated */}
      <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          {/* Agent question */}
          <div
            className="rounded-xl px-4 py-3 text-sm leading-relaxed text-muted"
            style={{
              background: "var(--color-background)",
              border: "1px solid var(--color-border-light)",
            }}
          >
            {current.question}
          </div>

          {/* Scout answer — typing */}
          <div
            className="rounded-xl px-4 py-3 text-sm leading-relaxed"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-text-light)",
              opacity: 0.95,
              minHeight: "4.5rem",
            }}
          >
            {typedAnswer}
            {phase === "typing" && (
              <motion.span
                className="ml-0.5 inline-block h-3.5 w-[2px] align-text-bottom bg-white/70"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
