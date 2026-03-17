"use client";

import React, { useState, useRef, useEffect } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    id: "systems",
    title: "Systems",
    subtitle: "Foundation",
    description:
      "Structured workflows for listings, marketing, and transactions. No guesswork — just repeatable processes that close deals.",
  },
  {
    id: "education",
    title: "Education",
    subtitle: "Intelligence",
    description:
      "Training designed for real-world production. Live coaching, self-paced modules, and a mentor from day one.",
  },
  {
    id: "support",
    title: "Support",
    subtitle: "Execution",
    description:
      "Operational systems that handle coordination, compliance, and marketing — so you focus on clients.",
  },
];

export function SystemAccordion() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const progress = useTransform(
    scrollYProgress,
    [0, 1],
    [0, ITEMS.length - 1]
  );

  // Progress line width — must be called at top level, not inside JSX
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const unsubscribe = progress.on("change", (v) => {
      setActiveIndex(Math.round(v));
    });
    return () => unsubscribe();
  }, [progress]);

  return (
    <section ref={containerRef} className="relative h-[300vh]">
      {/* Sticky container */}
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 text-center sm:mb-16">
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

        {/* Accordion panels — desktop: horizontal expanding, mobile: vertical stack */}

        {/* Desktop */}
        <div className="hidden gap-4 md:flex">
          {ITEMS.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <motion.div
                key={item.id}
                animate={{ width: isActive ? 400 : 88 }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className={cn(
                  "relative flex h-[420px] cursor-pointer items-end overflow-hidden rounded-2xl",
                  isActive
                    ? "bg-[#1E2530] text-white"
                    : "bg-[#2C3440] text-white/60"
                )}
                onClick={() => setActiveIndex(index)}
              >
                {/* Collapsed label — rotated */}
                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="whitespace-nowrap text-sm font-semibold tracking-wide"
                      style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {item.title}
                    </span>
                  </div>
                )}

                {/* Expanded content */}
                {isActive && (
                  <motion.div
                    className="w-full p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <div
                      className="mb-2 text-[10px] uppercase tracking-[0.25em] text-white/40"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {item.subtitle}
                    </div>

                    <div
                      className="mb-2 text-xl font-semibold text-white"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {item.title}
                    </div>

                    <div className="mb-4 text-sm leading-relaxed text-white/60">
                      {item.description}
                    </div>

                    {/* Micro UI */}
                    <div className="rounded-lg bg-white/[0.06] p-3 text-xs">
                      {item.id === "systems" && (
                        <div className="flex items-center gap-2 text-white/50">
                          <span>Listing</span>
                          <span className="text-white/20">→</span>
                          <span>Marketing</span>
                          <span className="text-white/20">→</span>
                          <span>Contract</span>
                          <span className="text-white/20">→</span>
                          <span className="font-medium text-white">
                            Closing
                          </span>
                        </div>
                      )}

                      {item.id === "education" && (
                        <div>
                          <span className="text-white/50">
                            Module Complete ✔
                          </span>
                          <div className="mt-2 h-1 w-full overflow-hidden rounded bg-white/10">
                            <motion.div
                              className="h-full rounded"
                              style={{ background: "var(--color-primary-light)" }}
                              initial={{ width: "0%" }}
                              animate={{ width: "75%" }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      )}

                      {item.id === "support" && (
                        <div className="flex flex-col gap-1 text-white/50">
                          <span>✔ Coordinator Assigned</span>
                          <span>✔ Compliance Reviewed</span>
                          <span>✔ Marketing Scheduled</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Mobile — vertical stack */}
        <div className="flex w-full max-w-sm flex-col gap-3 md:hidden">
          {ITEMS.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <motion.div
                key={item.id}
                animate={{
                  height: isActive ? 220 : 56,
                }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className={cn(
                  "overflow-hidden rounded-xl px-5",
                  isActive
                    ? "bg-[#1E2530] text-white"
                    : "bg-[#2C3440] text-white/60"
                )}
                onClick={() => setActiveIndex(index)}
              >
                <div className="flex h-14 items-center justify-between">
                  <span
                    className="text-sm font-semibold"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {item.title}
                  </span>
                  <motion.span
                    animate={{ rotate: isActive ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs text-white/30"
                  >
                    ▼
                  </motion.span>
                </div>

                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="pb-5"
                  >
                    <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/40">
                      {item.subtitle}
                    </div>
                    <div className="mb-3 text-xs leading-relaxed text-white/60">
                      {item.description}
                    </div>
                    <div className="rounded-lg bg-white/[0.06] p-3 text-xs">
                      {item.id === "systems" && (
                        <div className="text-white/50">
                          Listing → Marketing → Contract → Closing
                        </div>
                      )}
                      {item.id === "education" && (
                        <div>
                          <span className="text-white/50">Module Complete ✔</span>
                          <div className="mt-2 h-1 rounded bg-white/10">
                            <div
                              className="h-1 w-3/4 rounded"
                              style={{ background: "var(--color-primary-light)" }}
                            />
                          </div>
                        </div>
                      )}
                      {item.id === "support" && (
                        <div className="flex flex-col gap-1 text-white/50">
                          <span>✔ Coordinator Assigned</span>
                          <span>✔ Compliance Reviewed</span>
                          <span>✔ Marketing Scheduled</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Progress line */}
        <div className="relative mx-auto mt-12 w-full max-w-3xl px-4 sm:mt-20">
          <div
            className="absolute left-4 right-4 top-1/2 h-[2px]"
            style={{ background: "var(--color-border)" }}
          />
          <motion.div
            style={{ width: progressWidth }}
            className="absolute left-4 top-1/2 h-[2px]"
            style-background="true"
          >
            <div
              className="h-full"
              style={{ background: "var(--color-primary)" }}
            />
          </motion.div>

          <div
            className="relative flex justify-between pt-4 text-xs text-muted"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {ITEMS.map((item, i) => (
              <span
                key={item.id}
                className={cn(
                  "transition-colors duration-300",
                  i <= activeIndex ? "font-medium text-foreground" : ""
                )}
              >
                {item.title}
              </span>
            ))}
            <span
              className={cn(
                "font-semibold transition-colors duration-300",
                activeIndex === ITEMS.length - 1
                  ? "text-foreground"
                  : "text-muted"
              )}
            >
              Production
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
