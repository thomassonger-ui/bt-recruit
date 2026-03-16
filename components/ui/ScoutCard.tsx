"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ScoutCard({ className = "" }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className={`surface-card p-6 sm:p-8 ${className}`}
    >
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
      </div>

      <div className="space-y-3">
        <div
          className="rounded-xl px-4 py-3 text-sm leading-relaxed text-muted"
          style={{
            background: "var(--color-background)",
            border: "1px solid var(--color-border-light)",
          }}
        >
          How is my pipeline performing this quarter?
        </div>
        <div
          className="rounded-xl px-4 py-3 text-sm leading-relaxed text-foreground"
          style={{
            background: "var(--color-primary)",
            color: "var(--color-text-light)",
            opacity: 0.95,
          }}
        >
          You have 8 active deals worth $2.4M. Your conversion rate is up 12%
          from last quarter. Two listings need price adjustments based on
          current market data.
        </div>
      </div>
    </motion.div>
  );
}
