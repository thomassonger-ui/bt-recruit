"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

const LAYERS = [
  {
    id: "systems",
    label: "Systems",
    tag: "FOUNDATION",
    description:
      "Structured workflows for listings, marketing, and transactions.",
    proof: "Removes guesswork",
  },
  {
    id: "education",
    label: "Education",
    tag: "INTELLIGENCE",
    description:
      "Training designed for real-world production and fast execution.",
    proof: "Shortens time to first deal",
  },
  {
    id: "support",
    label: "Support",
    tag: "EXECUTION",
    description:
      "Operational systems that handle coordination, compliance, and marketing.",
    proof: "Protects every transaction",
  },
];

export default function SystemStack() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  // Auto rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % LAYERS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Scroll progress (Apple style)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 20%"],
  });

  const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={ref} className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
      {/* Header */}
      <div className="mb-16 text-center">
        <p
          className="text-xs uppercase tracking-[0.3em] text-muted"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          What You Get
        </p>
        <h2
          className="mt-4 text-heading text-foreground"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Everything an agent needs to compete
        </h2>
      </div>

      {/* Stack */}
      <div className="flex flex-col items-center gap-6">
        {LAYERS.map((layer, index) => {
          const isActive = index === active;

          return (
            <motion.div
              key={layer.id}
              animate={{
                opacity: isActive ? 1 : 0.5,
                scale: isActive ? 1 : 0.97,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn(
                "w-full max-w-2xl rounded-2xl border p-6 transition-shadow duration-500",
                isActive
                  ? "border-border bg-card shadow-[var(--shadow-card-hover)]"
                  : "border-border-light bg-card/60"
              )}
              onMouseEnter={() => setActive(index)}
            >
              <div
                className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {layer.tag}
              </div>

              <div
                className="mb-2 text-xl font-semibold text-foreground"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {layer.label}
              </div>

              <div className="mb-4 text-sm leading-relaxed text-muted">
                {layer.description}
              </div>

              {/* Micro UI — contextual visualization */}
              <div
                className="mb-4 rounded-lg p-3 text-xs"
                style={{
                  background: "var(--color-background)",
                  border: "1px solid var(--color-border-light)",
                }}
              >
                {layer.id === "systems" && (
                  <div className="flex items-center gap-2 text-muted">
                    <span>Listing</span>
                    <span className="text-border">→</span>
                    <span>Marketing</span>
                    <span className="text-border">→</span>
                    <span>Contract</span>
                    <span className="text-border">→</span>
                    <span className="font-medium text-foreground">
                      Closing
                    </span>
                  </div>
                )}

                {layer.id === "education" && (
                  <div>
                    <span className="text-muted">Module Complete ✔</span>
                    <div
                      className="mt-2 h-1 w-full overflow-hidden rounded"
                      style={{ background: "var(--color-border-light)" }}
                    >
                      <motion.div
                        className="h-full rounded"
                        style={{ background: "var(--color-primary)" }}
                        initial={{ width: "0%" }}
                        animate={{ width: isActive ? "75%" : "0%" }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}

                {layer.id === "support" && (
                  <div className="flex flex-col gap-1 text-muted">
                    <span>✔ Coordinator Assigned</span>
                    <span>✔ Compliance Reviewed</span>
                    <span>✔ Marketing Scheduled</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted/60">{layer.proof}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Apple-style progress line */}
      <div className="relative mx-auto mt-20 w-full max-w-3xl">
        {/* Base line */}
        <div
          className="absolute left-0 top-1/2 h-[2px] w-full"
          style={{ background: "var(--color-border-light)" }}
        />

        {/* Progress line */}
        <motion.div
          style={{ width: lineWidth, background: "var(--color-primary)" }}
          className="absolute left-0 top-1/2 h-[2px]"
        />

        {/* Nodes */}
        <div
          className="relative flex justify-between pt-4 text-xs text-muted"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          <span>Systems</span>
          <span>Education</span>
          <span>Support</span>
          <span className="font-semibold text-foreground">Production</span>
        </div>
      </div>
    </div>
  );
}
