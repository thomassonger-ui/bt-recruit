"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  useScroll,
  useTransform,
  useSpring,
  useVelocity,
  motion,
  AnimatePresence,
} from "framer-motion";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */
const PANELS = [
  {
    id: "systems",
    title: "Systems",
    subtitle: "Foundation",
    tagline: "Scout Workflow Engine",
    microcopy: "Structure replaces guesswork",
    description:
      "Structured workflows for listings, marketing, and transactions.",
  },
  {
    id: "education",
    title: "Education",
    subtitle: "Intelligence",
    tagline: "Scout Learning System",
    microcopy: "Clarity accelerates production",
    description:
      "Training designed for real-world production and fast execution.",
  },
  {
    id: "support",
    title: "Support",
    subtitle: "Execution",
    tagline: "Transaction Command Center",
    microcopy: "Execution removes risk",
    description:
      "Operational systems that handle coordination, compliance, and marketing.",
  },
];

/* ═══════════════════════════════════════════════════════════════
   PANEL 1 — SYSTEMS: Pipeline Board
   ═══════════════════════════════════════════════════════════════ */
function SystemsScene({ isActive }: { isActive: boolean }) {
  const [activeStage, setActiveStage] = useState(0);
  const stages = ["Lead", "Showing", "Offer", "Contract", "Closing"];

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isActive, stages.length]);

  const deals = useMemo(
    () => [
      { client: "M. Rivera", property: "Lake Nona 3BR", status: "Active" },
      { client: "J. Chen", property: "Winter Park 4BR", status: "Pending" },
      { client: "S. Williams", property: "Baldwin Park 2BR", status: "New" },
    ],
    []
  );

  const activities = useMemo(
    () => [
      { text: "Showing confirmed for 2:30 PM", time: "12s ago" },
      { text: "Offer submitted — $425,000", time: "3m ago" },
      { text: "New lead assigned to pipeline", time: "8m ago" },
      { text: "Contract moved to closing", time: "14m ago" },
    ],
    []
  );

  return (
    <div className="grid h-full grid-cols-1 gap-3 md:grid-cols-[140px_1fr_160px]">
      {/* Left — Pipeline navigation */}
      <div className="hidden flex-col gap-1 md:flex">
        <div className="mb-2 text-[9px] uppercase tracking-[0.2em] text-white/30">
          Pipeline
        </div>
        {stages.map((stage, i) => (
          <div
            key={stage}
            className={cn(
              "rounded-md px-3 py-2 text-xs transition-all duration-300",
              i === activeStage
                ? "bg-white/10 font-medium text-white"
                : "text-white/30"
            )}
          >
            <span className="flex items-center gap-2">
              {i < activeStage && (
                <span className="text-emerald-400">✓</span>
              )}
              {i === activeStage && (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              )}
              {stage}
            </span>
          </div>
        ))}
      </div>

      {/* Center — Deal cards */}
      <div className="flex flex-col gap-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-[0.2em] text-white/30">
            Active Deals
          </span>
          <span className="flex items-center gap-1.5 text-[9px] text-emerald-400/70">
            <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
            Live
          </span>
        </div>
        {deals.map((deal, i) => (
          <motion.div
            key={deal.client}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -12 }}
            transition={{ duration: 0.4, delay: i * 0.12 }}
            className="rounded-lg bg-white/[0.04] p-3"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white/80">
                {deal.client}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[9px]",
                  deal.status === "Active"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : deal.status === "Pending"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-blue-500/20 text-blue-400"
                )}
              >
                {deal.status}
              </span>
            </div>
            <div className="mt-1 text-[10px] text-white/30">
              {deal.property}
            </div>
          </motion.div>
        ))}
        {/* Flow line */}
        <div className="mt-2 flex items-center gap-1">
          {stages.map((_, i) => (
            <React.Fragment key={i}>
              <div
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-500",
                  i <= activeStage ? "bg-emerald-400/60" : "bg-white/[0.06]"
                )}
              />
              {i < stages.length - 1 && (
                <div className="h-px w-2 bg-white/10" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right — Activity feed */}
      <div className="hidden flex-col gap-1.5 md:flex">
        <div className="mb-1 text-[9px] uppercase tracking-[0.2em] text-white/30">
          Activity
        </div>
        {activities.map((act, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: isActive ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
            className="text-[10px] leading-relaxed text-white/40"
          >
            <div className="text-white/50">{act.text}</div>
            <div className="text-white/20">{act.time}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL 2 — EDUCATION: Learning System
   ═══════════════════════════════════════════════════════════════ */
function EducationScene({ isActive }: { isActive: boolean }) {
  const [typedText, setTypedText] = useState("");
  const fullText =
    "Hi Sarah, thank you for visiting the Lake Nona property. Based on your criteria, I've prepared three comparable homes in the area...";
  const [checklistProgress, setChecklistProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setTypedText("");
      setChecklistProgress(0);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setChecklistProgress((prev) => (prev < 4 ? prev + 1 : prev));
    }, 800);
    return () => clearInterval(interval);
  }, [isActive]);

  const modules = [
    { name: "Lead Generation", complete: true },
    { name: "Listing Presentations", complete: true },
    { name: "Buyer Consultations", active: true },
    { name: "Negotiation", complete: false },
  ];

  const checklist = [
    "Review CMA framework",
    "Practice objection handling",
    "Complete roleplay session",
    "Submit assessment",
  ];

  return (
    <div className="grid h-full grid-cols-1 gap-3 md:grid-cols-[140px_1fr_180px]">
      {/* Left — Module list */}
      <div className="hidden flex-col gap-1 md:flex">
        <div className="mb-2 text-[9px] uppercase tracking-[0.2em] text-white/30">
          Modules
        </div>
        {modules.map((mod) => (
          <div
            key={mod.name}
            className={cn(
              "rounded-md px-3 py-2 text-[11px] transition-all",
              mod.active
                ? "bg-white/10 font-medium text-white"
                : mod.complete
                  ? "text-white/40"
                  : "text-white/20"
            )}
          >
            <span className="flex items-center gap-2">
              {mod.complete && <span className="text-emerald-400">✓</span>}
              {mod.active && (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
              )}
              {mod.name}
            </span>
          </div>
        ))}
      </div>

      {/* Center — Active lesson */}
      <div className="flex flex-col gap-3">
        <div className="text-[9px] uppercase tracking-[0.2em] text-white/30">
          Active Lesson — Buyer Consultations
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--color-primary-light)" }}
            initial={{ width: "0%" }}
            animate={{ width: isActive ? "68%" : "0%" }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
        </div>
        <div className="text-[10px] text-white/30">68% complete</div>

        {/* Checklist */}
        <div className="flex flex-col gap-1.5">
          {checklist.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{
                opacity: isActive ? 1 : 0,
                x: isActive ? 0 : -8,
              }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.12 }}
              className="flex items-center gap-2 text-[11px]"
            >
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded border text-[8px] transition-all duration-300",
                  i < checklistProgress
                    ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                    : "border-white/10 text-white/10"
                )}
              >
                {i < checklistProgress ? "✓" : ""}
              </span>
              <span
                className={cn(
                  "transition-colors duration-300",
                  i < checklistProgress ? "text-white/60" : "text-white/30"
                )}
              >
                {item}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right — Live application preview */}
      <div className="hidden flex-col gap-2 md:flex">
        <div className="mb-1 text-[9px] uppercase tracking-[0.2em] text-white/30">
          Live Application
        </div>
        <div
          className="rounded-lg bg-white/[0.04] p-3"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="mb-2 flex items-center gap-1.5">
            <span className="h-1 w-1 animate-pulse rounded-full bg-blue-400" />
            <span className="text-[9px] text-blue-400/70">
              Scout generating...
            </span>
          </div>
          <div className="text-[10px] leading-relaxed text-white/50">
            {typedText}
            <span className="inline-block h-2.5 w-0.5 animate-pulse bg-white/40" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL 3 — SUPPORT: Transaction Command Center
   ═══════════════════════════════════════════════════════════════ */
function SupportScene({ isActive }: { isActive: boolean }) {
  const [completedItems, setCompletedItems] = useState(0);
  const [showReply, setShowReply] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setCompletedItems(0);
      setShowReply(false);
      return;
    }
    const interval = setInterval(() => {
      setCompletedItems((prev) => (prev < 5 ? prev + 1 : prev));
    }, 600);
    const replyTimeout = setTimeout(() => setShowReply(true), 2000);
    return () => {
      clearInterval(interval);
      clearTimeout(replyTimeout);
    };
  }, [isActive]);

  const checklistItems = [
    "Title search complete",
    "Inspection report received",
    "Appraisal ordered",
    "HOA documents reviewed",
    "Closing date confirmed",
  ];

  const statusItems = [
    { label: "Compliance", status: "Clear", color: "emerald" },
    { label: "Documents", status: "4/5", color: "amber" },
    { label: "Risk", status: "Low", color: "emerald" },
  ];

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Top — Status bar */}
      <div className="flex items-center gap-4">
        {statusItems.map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: isActive ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 rounded-md bg-white/[0.04] px-3 py-1.5"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                item.color === "emerald"
                  ? "bg-emerald-400"
                  : "animate-pulse bg-amber-400"
              )}
            />
            <span className="text-[10px] text-white/40">{item.label}</span>
            <span
              className={cn(
                "text-[10px] font-medium",
                item.color === "emerald"
                  ? "text-emerald-400"
                  : "text-amber-400"
              )}
            >
              {item.status}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-[1fr_200px]">
        {/* Center — Checklist */}
        <div className="flex flex-col gap-1.5">
          <div className="mb-1 text-[9px] uppercase tracking-[0.2em] text-white/30">
            Transaction Checklist
          </div>
          {checklistItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{
                opacity: isActive ? 1 : 0,
                x: isActive ? 0 : -8,
              }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="flex items-center gap-2.5"
            >
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded border text-[8px] transition-all duration-500",
                  i < completedItems
                    ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                    : i === completedItems
                      ? "animate-pulse border-white/20"
                      : "border-white/10"
                )}
              >
                {i < completedItems ? "✓" : ""}
              </span>
              <span
                className={cn(
                  "text-[11px] transition-colors duration-300",
                  i < completedItems
                    ? "text-white/60"
                    : i === completedItems
                      ? "text-white/50"
                      : "text-white/20"
                )}
              >
                {item}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Right — Chat panel */}
        <div className="hidden flex-col gap-2 md:flex">
          <div className="mb-1 text-[9px] uppercase tracking-[0.2em] text-white/30">
            Scout Assistant
          </div>
          <div
            className="flex flex-col gap-2 rounded-lg bg-white/[0.04] p-3"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="rounded-md bg-white/[0.06] p-2 text-[10px] text-white/50">
              What&apos;s the status on the Rivera closing?
            </div>
            {showReply ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-md p-2 text-[10px] text-white/70"
                style={{ background: "rgba(59,90,130,0.3)" }}
              >
                Title search is clear, appraisal ordered. Closing confirmed for
                March 28. All docs on track.
              </motion.div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-2">
                <span
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/30"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/30"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/30"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BACKGROUND ENVIRONMENT — Subtle shift per panel
   ═══════════════════════════════════════════════════════════════ */
const ENVIRONMENTS = [
  // Systems — structured grid
  "radial-gradient(ellipse at 30% 40%, rgba(59,90,130,0.08) 0%, transparent 60%)",
  // Education — soft gradient
  "radial-gradient(ellipse at 60% 50%, rgba(59,90,130,0.06) 0%, transparent 50%)",
  // Support — focused dark
  "radial-gradient(ellipse at 50% 60%, rgba(30,37,48,0.15) 0%, transparent 55%)",
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function SystemAccordion() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showProduction, setShowProduction] = useState(false);

  // Scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Velocity-aware smoothing
  const velocity = useVelocity(scrollYProgress);
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
  });

  // Map scroll to panel index
  const progress = useTransform(smoothProgress, [0, 0.85], [0, PANELS.length - 1]);
  const progressWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  // Progress line glow based on velocity
  const glowOpacity = useTransform(velocity, [-0.02, 0, 0.02], [0.8, 0.3, 0.8]);

  useEffect(() => {
    const unsubProgress = progress.on("change", (v) => {
      setActiveIndex(Math.round(Math.min(v, PANELS.length - 1)));
    });
    const unsubScroll = scrollYProgress.on("change", (v) => {
      setShowProduction(v > 0.85);
    });
    return () => {
      unsubProgress();
      unsubScroll();
    };
  }, [progress, scrollYProgress]);

  const scenes = [SystemsScene, EducationScene, SupportScene];

  return (
    <section ref={containerRef} className="relative h-[300vh]">
      {/* Sticky viewport */}
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* Background environment shift */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            className="pointer-events-none absolute inset-0"
            style={{ background: ENVIRONMENTS[activeIndex] }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        </AnimatePresence>

        {/* Subtle grid overlay for Systems panel */}
        {activeIndex === 0 && (
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.03 }}
            transition={{ duration: 0.6 }}
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        )}

        {/* Content area */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center sm:mb-12">
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

          {/* Panel container */}
          <div className="mx-auto w-full max-w-5xl">
            {/* Desktop — Horizontal accordion panels */}
            <div className="hidden gap-3 md:flex">
              {PANELS.map((panel, index) => {
                const isActive = index === activeIndex;
                const Scene = scenes[index];

                return (
                  <motion.div
                    key={panel.id}
                    animate={{
                      flex: isActive ? 5 : 1,
                      opacity: isActive ? 1 : 0.4,
                      filter: isActive ? "blur(0px)" : "blur(1px)",
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                    className={cn(
                      "relative h-[400px] cursor-pointer overflow-hidden rounded-2xl",
                      isActive ? "bg-[#1A2028]" : "bg-[#1E2530]"
                    )}
                    style={{
                      boxShadow: isActive
                        ? "0 8px 32px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.08)"
                        : "inset 0 0 0 1px rgba(255,255,255,0.04)",
                    }}
                    onClick={() => setActiveIndex(index)}
                  >
                    {/* Collapsed state */}
                    <AnimatePresence>
                      {!isActive && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span
                            className="whitespace-nowrap text-sm font-semibold tracking-wide text-white/40"
                            style={{
                              writingMode: "vertical-rl",
                              transform: "rotate(180deg)",
                              fontFamily: "Inter, sans-serif",
                            }}
                          >
                            {panel.title}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Expanded state */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="flex h-full flex-col p-5"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.4, delay: 0.15 }}
                        >
                          {/* Panel header */}
                          <div className="mb-3 flex items-center justify-between">
                            <div>
                              <div
                                className="text-[9px] uppercase tracking-[0.25em] text-white/25"
                                style={{ fontFamily: "Inter, sans-serif" }}
                              >
                                {panel.subtitle}
                              </div>
                              <div
                                className="mt-1 text-sm font-semibold text-white/90"
                                style={{ fontFamily: "Inter, sans-serif" }}
                              >
                                {panel.tagline}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                              <span className="text-[9px] text-emerald-400/60">
                                Active
                              </span>
                            </div>
                          </div>

                          {/* Scene content */}
                          <div className="flex-1 overflow-hidden">
                            <Scene isActive={isActive} />
                          </div>

                          {/* Microcopy */}
                          <motion.div
                            className="mt-3 text-[11px] italic text-white/25"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            style={{ fontFamily: "Inter, sans-serif" }}
                          >
                            {panel.microcopy}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Mobile — Vertical panels */}
            <div className="flex flex-col gap-3 md:hidden">
              {PANELS.map((panel, index) => {
                const isActive = index === activeIndex;
                const Scene = scenes[index];

                return (
                  <motion.div
                    key={panel.id}
                    animate={{
                      height: isActive ? 320 : 56,
                      opacity: isActive ? 1 : 0.5,
                    }}
                    transition={{
                      duration: 0.5,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                    className={cn(
                      "overflow-hidden rounded-xl",
                      isActive ? "bg-[#1A2028]" : "bg-[#1E2530]"
                    )}
                    style={{
                      boxShadow: isActive
                        ? "inset 0 0 0 1px rgba(255,255,255,0.08)"
                        : "inset 0 0 0 1px rgba(255,255,255,0.04)",
                    }}
                    onClick={() => setActiveIndex(index)}
                  >
                    <div className="flex h-14 items-center justify-between px-5">
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                        )}
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            isActive ? "text-white" : "text-white/40"
                          )}
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {panel.title}
                        </span>
                      </div>
                      <motion.span
                        animate={{ rotate: isActive ? 180 : 0 }}
                        className="text-[10px] text-white/20"
                      >
                        ▼
                      </motion.span>
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="px-5 pb-5"
                      >
                        <div className="mb-2 text-[9px] uppercase tracking-[0.2em] text-white/25">
                          {panel.tagline}
                        </div>
                        <div className="h-[220px] overflow-hidden">
                          <Scene isActive={isActive} />
                        </div>
                        <div className="mt-2 text-[10px] italic text-white/20">
                          {panel.microcopy}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Production moment — appears at ~85% scroll */}
          <AnimatePresence>
            {showProduction && (
              <motion.p
                className="mt-8 text-center text-sm font-medium text-foreground/60"
                style={{ fontFamily: "Inter, sans-serif" }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                This is how production actually happens.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom progress line */}
        <div className="relative mx-auto mb-8 w-full max-w-3xl px-6 sm:mb-12">
          {/* Base line */}
          <div
            className="absolute left-6 right-6 top-0 h-[1px]"
            style={{ background: "var(--color-border)" }}
          />

          {/* Active progress line with glow */}
          <motion.div
            className="absolute left-6 top-0 h-[1px]"
            style={{
              width: progressWidth,
              background: "var(--color-primary)",
            }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                background: "var(--color-primary-light)",
                opacity: glowOpacity,
                filter: "blur(4px)",
              }}
            />
          </motion.div>

          {/* Node labels */}
          <div
            className="relative flex justify-between pt-4 text-xs text-muted"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {PANELS.map((panel, i) => (
              <span
                key={panel.id}
                className={cn(
                  "transition-all duration-500",
                  i <= activeIndex
                    ? "font-medium text-foreground"
                    : "text-muted"
                )}
              >
                {panel.title}
              </span>
            ))}
            <span
              className={cn(
                "font-semibold transition-all duration-500",
                showProduction ? "text-foreground" : "text-muted"
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
