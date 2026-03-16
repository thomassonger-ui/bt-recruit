"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const conversations = [
  {
    question: "Write a listing description for my Winter Park home.",
    answer:
      "Elegant 3-bedroom residence in the heart of Winter Park featuring updated interiors, natural light throughout, and a spacious backyard ideal for entertaining.",
  },
  {
    question: "What should I price my listing at?",
    answer:
      "Based on 14 comparable sales within 0.8 miles, a competitive range is $410,000–$425,000. Median price per sqft is $192.",
  },
  {
    question: "Draft a follow-up message to my buyer.",
    answer:
      "Hi Sarah, thank you for visiting the property yesterday. The seller is motivated and I'd love to help you put together a competitive offer.",
  },
  {
    question: "Create a social media post for my new listing.",
    answer:
      "Just listed! Beautiful home with modern finishes and a private backyard. Priced to move. Message me for details or to schedule a showing.",
  },
  {
    question: "How is my pipeline performing this quarter?",
    answer:
      "You have 8 active deals worth $2.4M. Your conversion rate is up 12% from last quarter. Two listings need price adjustments.",
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
