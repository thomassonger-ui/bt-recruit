"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import ScoutCard from "@/components/ui/ScoutCard";
import ScoutDemo from "@/components/ui/ScoutDemo";
import BlueprintHeroGrid from "@/components/ui/BlueprintHeroGrid";
import BlueprintLineLayer from "@/components/ui/BlueprintLineLayer";
import BlueprintFloatingElements from "@/components/ui/BlueprintFloatingElements";
import FloatingShapes from "@/components/ui/FloatingShapes";
import ParallaxLayer from "@/components/ui/ParallaxLayer";
import {
  ContentDepth,
} from "@/components/ui/DepthLayer";
import InteractiveCard from "@/components/ui/InteractiveCard";
import BearAnimation from "@/components/ui/BearAnimation";
import HeroPromptInput from "@/components/ui/HeroPromptInput";
import BearSystemReveal from "@/components/sections/BearSystemReveal";
import CinematicReveal from "@/components/sections/CinematicReveal";
import Button from "@/components/ui/Button";
import Footer from "@/components/ui/Footer";

/* ── Animation helpers ── */
const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
};

const stagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};

const childFade = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

/* ── Data ── */
const stats = [
  { value: "40+", label: "Years Experience" },
  { value: "7,000+", label: "Homes Sold" },
  { value: "$2B+", label: "Sales Volume" },
  { value: "15+", label: "Markets" },
];

const featureCards = [
  {
    title: "Systems",
    summary:
      "Structured workflows for listings, marketing, and transactions. No guesswork, no chaos — just repeatable processes that close deals.",
    detail:
      "Every agent gets access to BearTeam's proven operational playbook. CRM discipline, listing workflows, pricing frameworks, and marketing sequences — all systematized so you spend time selling, not scrambling.",
  },
  {
    title: "Education",
    summary:
      "BearTeam Academy training designed for real-world production. Live coaching, self-paced modules, and a mentor from day one.",
    detail:
      "BearTeam Academy is a structured 12-week program with live coaching sessions, self-paced skill modules, and a dedicated producing mentor. Built for agents who want to close deals, not just pass exams.",
  },
  {
    title: "Support",
    summary:
      "Operational systems that remove administrative friction. Transaction coordination, compliance, and marketing — all handled.",
    detail:
      "Dedicated transaction coordinators manage paperwork, compliance, and deadlines. Marketing systems produce listing materials, social content, and digital ads. You focus on clients — we handle the rest.",
  },
];

const milestones = [
  {
    day: "30",
    label: "Days",
    title: "Foundation",
    description:
      "Systems setup, CRM structure, training modules, and onboarding. You start with a clear playbook, not a blank page.",
  },
  {
    day: "60",
    label: "Days",
    title: "Pipeline",
    description:
      "Active pipeline development, first listings, marketing execution, and weekly mentor guidance. Momentum builds here.",
  },
  {
    day: "90",
    label: "Days",
    title: "Production",
    description:
      "Full production mode with consistent lead generation, transaction flow, and a repeatable business system in place.",
  },
];

const outcomes = [
  {
    title: "Higher earnings",
    description:
      "Keep more of your commission. No desk fees, no unnecessary brokerage overhead.",
  },
  {
    title: "Structured training",
    description:
      "12-week Academy program with live coaching, not a webinar library and a handshake.",
  },
  {
    title: "Lead generation",
    description:
      "Qualified leads delivered to your pipeline monthly. No cold calling required.",
  },
  {
    title: "Transaction support",
    description:
      "Dedicated coordination team handles paperwork, compliance, and deadlines.",
  },
  {
    title: "1-on-1 mentorship",
    description:
      "Paired with a producing agent who coaches you through deals and objections.",
  },
  {
    title: "Team infrastructure",
    description:
      "When you're ready to build your own team, we provide the playbook and support.",
  },
];

const scoutCapabilities = [
  {
    title: "Listing Assistant",
    description:
      "Creates MLS descriptions and property highlights.",
  },
  {
    title: "Client Communication",
    description:
      "Drafts emails and messages to buyers and sellers.",
  },
  {
    title: "Marketing Assistant",
    description:
      "Creates listing promotions and social media posts.",
  },
  {
    title: "Showing Assistant",
    description:
      "Generates talking points before property showings.",
  },
  {
    title: "Daily Workflow Assistant",
    description:
      "Helps agents organize prospecting and follow-up.",
  },
];

/* ═══════════════════════════════════════════════════════════════
   HERO — 5-layer 3D depth parallax environment

   Layer 1 (background)   — BlueprintHeroGrid canvas (0→40px)
   Layer 2 (environment)   — BlueprintLineLayer + FloatingShapes (0→80px)
   Layer 3 (content)       — Headline, subtitle (0→30px)
   Layer 4 (interactive)   — CTA buttons, ScoutCard (0→60px)
   Layer 5 (foreground)    — Decorative accents (0→100px)
   ═══════════════════════════════════════════════════════════════ */
function HeroParallaxContent() {
  const heroRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // ── Cursor-tracking parallax ──
  // Raw motion values for mouse position (-1 to 1, centered)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for fluid motion
  const springConfig = { damping: 40, stiffness: 90, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Different layers move at different speeds (deeper = less movement)
  // Layer 1 (grid): ±12px — deepest, slowest
  const cursorGridX = useTransform(smoothX, [-1, 1], [12, -12]);
  const cursorGridY = useTransform(smoothY, [-1, 1], [8, -8]);
  // Layer 2 (lines/shapes): ±8px
  const cursorEnvX = useTransform(smoothX, [-1, 1], [8, -8]);
  const cursorEnvY = useTransform(smoothY, [-1, 1], [6, -6]);
  // Layer 5 (accents): ±15px — foreground, fastest
  const cursorAccentX = useTransform(smoothX, [-1, 1], [15, -15]);
  const cursorAccentY = useTransform(smoothY, [-1, 1], [10, -10]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (isMobile) return;
      const rect = e.currentTarget.getBoundingClientRect();
      // Normalize to -1 → 1
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    },
    [isMobile, mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Depth tier speeds — mapped from the DepthLayer system
  // Layer 1: background (grid) — 0→40px
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  // Layer 2: environment (lines + shapes) — 0→80px
  const lineLayerY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const floatingShapesY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  // Layer 3: content (headline, subtitle) — 0→30px
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const subtitleY = useTransform(scrollYProgress, [0, 1], [0, 22]);
  // Layer 4: interactive (CTA, ScoutCard) — 0→60px
  const ctaY = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const scoutCardY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  // Layer 5: foreground accents — decorative corner marks
  const accentTopY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const accentBottomY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  // Opacity fades for environment layers
  const envOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.7, 0.3]);
  const accentOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.08, 0.12, 0.04]);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Layer 1: Background — Blueprint grid (slowest, deepest cursor shift) ── */}
      <motion.div
        className="pointer-events-none absolute inset-[-20px]"
        style={{ y: gridY, x: cursorGridX, translateY: cursorGridY, willChange: "transform" }}
      >
        <BlueprintHeroGrid />
      </motion.div>

      {/* ── Layer 2: Environment — Architectural lines (medium cursor shift) ── */}
      <motion.div
        className="pointer-events-none absolute inset-[-16px]"
        style={{ y: lineLayerY, x: cursorEnvX, translateY: cursorEnvY, opacity: envOpacity, willChange: "transform" }}
      >
        <BlueprintLineLayer containerRef={heroRef} />
      </motion.div>

      {/* ── Layer 2b: Environment — Floating shapes (medium cursor shift) ── */}
      <motion.div
        className="pointer-events-none absolute inset-[-16px] h-[calc(100%+32px)] w-[calc(100%+32px)]"
        style={{ y: floatingShapesY, x: cursorEnvX, translateY: cursorEnvY, opacity: envOpacity, willChange: "transform" }}
      >
        <FloatingShapes className="z-[1]" />
      </motion.div>

      {/* ── Layer 2c: Environment — Blueprint floating elements (medium cursor shift) ── */}
      <motion.div
        className="pointer-events-none absolute inset-[-16px]"
        style={{ y: lineLayerY, x: cursorEnvX, translateY: cursorEnvY, opacity: envOpacity, willChange: "transform" }}
      >
        <BlueprintFloatingElements containerRef={heroRef} />
      </motion.div>

      {/* ── Layer 5: Foreground accents — corner bracket marks (fastest cursor shift) ── */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{ x: cursorAccentX, translateY: cursorAccentY, willChange: "transform" }}
        aria-hidden="true"
      >
        {/* Top-left bracket */}
        <motion.div
          className="absolute left-[6%] top-[14%]"
          style={{ y: accentTopY, opacity: accentOpacity, willChange: "transform" }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M2 24V2H24" stroke="var(--color-muted)" strokeWidth="0.75" />
          </svg>
        </motion.div>

        {/* Top-right bracket */}
        <motion.div
          className="absolute right-[8%] top-[10%]"
          style={{ y: accentTopY, opacity: accentOpacity, willChange: "transform" }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M34 12V2H24" stroke="var(--color-muted)" strokeWidth="0.75" />
          </svg>
        </motion.div>

        {/* Bottom-left bracket */}
        <motion.div
          className="absolute bottom-[12%] left-[10%]"
          style={{ y: accentBottomY, opacity: accentOpacity, willChange: "transform" }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M2 12V30H20" stroke="var(--color-muted)" strokeWidth="0.75" />
          </svg>
        </motion.div>

        {/* Bottom-right crosshair */}
        <motion.div
          className="absolute bottom-[18%] right-[6%]"
          style={{ y: accentBottomY, opacity: accentOpacity, willChange: "transform" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="0" x2="12" y2="24" stroke="var(--color-muted)" strokeWidth="0.5" />
            <line x1="0" y1="12" x2="24" y2="12" stroke="var(--color-muted)" strokeWidth="0.5" />
          </svg>
        </motion.div>

        {/* Dimension line — left side */}
        <motion.div
          className="absolute left-[4%] top-[35%]"
          style={{ y: accentTopY, opacity: accentOpacity, willChange: "transform" }}
        >
          <svg width="8" height="120" viewBox="0 0 8 120" fill="none">
            <line x1="4" y1="0" x2="4" y2="120" stroke="var(--color-muted)" strokeWidth="0.5" />
            <line x1="0" y1="0" x2="8" y2="0" stroke="var(--color-muted)" strokeWidth="0.5" />
            <line x1="0" y1="120" x2="8" y2="120" stroke="var(--color-muted)" strokeWidth="0.5" />
          </svg>
        </motion.div>
      </motion.div>

      {/* ── Navbar — fixed z, no parallax ── */}
      <div className="relative z-10">
        <Navbar>
          <a
            href="#scout"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            See Scout
          </a>
          <a
            href="#how"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            30/60/90 Plan
          </a>
          <a
            href="#results"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Results
          </a>
          <a href="sms:4077588102?body=Hello%20Tom,%20I%20would%20like%20to%20learn%20more%20about%20joining%20BearTeam.">
            <Button variant="primary" className="!py-2 !px-4 !text-sm">
              Start a Conversation
            </Button>
          </a>
        </Navbar>
      </div>

      {/* ── Hero content — Layers 3 & 4 ── */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl py-24 sm:py-32 lg:py-40">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left — Layer 3 (content depth) + Layer 4 (prompt) */}
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="flex flex-col gap-6"
            >
              {/* Layer 3 — Headline */}
              <motion.div
                variants={childFade}
                transition={{ duration: 0.6 }}
                style={{ y: headlineY, willChange: "transform" }}
              >
                <p
                  className="mb-3 text-sm font-medium uppercase tracking-wider text-muted"
                  style={{ letterSpacing: "0.08em", fontFamily: "Inter, sans-serif" }}
                >
                  BearTeam AI Assistant
                </p>
                <h1
                  className="text-display text-foreground"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Scout
                </h1>
              </motion.div>

              {/* Layer 3 — Subtitle */}
              <motion.p
                variants={childFade}
                transition={{ duration: 0.6 }}
                className="max-w-lg text-lg leading-relaxed text-muted"
                style={{ y: subtitleY, willChange: "transform" }}
              >
                Scout helps agents analyze deals, prepare listings,
                communicate with clients, and move faster.
              </motion.p>

              {/* Layer 4 — OpenAI-style prompt input */}
              <motion.div
                variants={childFade}
                transition={{ duration: 0.5 }}
                style={{ y: ctaY, willChange: "transform" }}
                className="pt-2"
              >
                <HeroPromptInput />
              </motion.div>
            </motion.div>

            {/* Right — Layer 4: Simple ScoutCard intro */}
            <motion.div
              className="hidden lg:block"
              style={{ y: scoutCardY, willChange: "transform" }}
            >
              <ScoutCard />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Animated Bear (desktop only) ── */}
      <div className="hidden md:block">
        <BearAnimation />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function RecruitingClient() {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* ═══════════════════════════════════════════════════════
          HERO — 5-layer 3D depth parallax
      ═══════════════════════════════════════════════════════ */}
      <HeroParallaxContent />

      {/* ═══════════════════════════════════════════════════════
          SEE SCOUT IN ACTION — Full animated demo
      ═══════════════════════════════════════════════════════ */}
      <div id="scout">
        <ParallaxLayer depth={0.15}>
          <ScoutDemo className="bg-card" />
        </ParallaxLayer>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MEET SCOUT — 5 capability cards
      ═══════════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl py-24 sm:py-32">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-16 max-w-2xl text-center"
          >
            <ContentDepth>
              <p
                className="mb-4 text-sm font-medium uppercase tracking-wider text-muted"
                style={{ letterSpacing: "0.08em" }}
              >
                What Scout Can Do
              </p>
              <h2
                className="text-heading text-foreground"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Built for Real Estate Agents
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                Scout helps agents complete everyday real estate tasks faster
                by assisting with marketing, communication, and business
                workflow.
              </p>
            </ContentDepth>
          </motion.div>

          <ParallaxLayer depth={0.2}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {scoutCapabilities.map((cap, i) => (
                <motion.div
                  key={cap.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  whileHover={{
                    y: -4,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  }}
                  className="flex flex-col gap-3 rounded-2xl p-6 transition-shadow duration-300"
                  style={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border-light)",
                  }}
                >
                  <h3
                    className="text-sm font-semibold text-foreground"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {cap.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">
                    {cap.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </ParallaxLayer>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          BEAR SYSTEM REVEAL — 3D floating panels + scroll reveal
      ═══════════════════════════════════════════════════════ */}
      <BearSystemReveal />

      {/* ═══════════════════════════════════════════════════════
          CINEMATIC REVEAL — Apple-style product showcase
      ═══════════════════════════════════════════════════════ */}
      <CinematicReveal />

      {/* ═══════════════════════════════════════════════════════
          STATS — Tom Songer production metrics (Depth 3 content)
      ═══════════════════════════════════════════════════════ */}
      <section
        className="px-4 sm:px-6 lg:px-8"
        style={{
          borderTop: "1px solid var(--color-border-light)",
          borderBottom: "1px solid var(--color-border-light)",
        }}
      >
        <div className="mx-auto max-w-7xl py-16 sm:py-20">
          <ParallaxLayer depth={0.25}>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <span
                    className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
                    style={{ fontFamily: "Inter, sans-serif", lineHeight: 1 }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </ParallaxLayer>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          VALUE PILLARS — Depth 4 (interactive) cards
      ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl py-24 sm:py-32">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-16 max-w-2xl text-center"
          >
            <ContentDepth>
              <p
                className="mb-4 text-sm font-medium uppercase tracking-wider text-muted"
                style={{ letterSpacing: "0.08em" }}
              >
                What you get
              </p>
              <h2
                className="text-heading text-foreground"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Everything an agent needs to compete
              </h2>
            </ContentDepth>
          </motion.div>

          <ParallaxLayer depth={0.35}>
            <div className="grid gap-6 sm:grid-cols-3">
              {featureCards.map((card, i) => (
                <InteractiveCard
                  key={card.title}
                  title={card.title}
                  summary={card.summary}
                  detail={card.detail}
                  index={i}
                />
              ))}
            </div>
          </ParallaxLayer>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          30 / 60 / 90 DAY SUCCESS PLAN — Depth 3 + 4
      ═══════════════════════════════════════════════════════ */}
      <section
        id="how"
        className="relative overflow-hidden px-4 sm:px-6 lg:px-8"
        style={{ background: "var(--color-card)" }}
      >
        <div className="mx-auto max-w-7xl py-24 sm:py-32">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-16 max-w-2xl text-center"
          >
            <ContentDepth>
              <p
                className="mb-4 text-sm font-medium uppercase tracking-wider text-muted"
                style={{ letterSpacing: "0.08em" }}
              >
                The process
              </p>
              <h2
                className="text-heading text-foreground"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Your 30/60/90 Day Success Plan
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                A structured onboarding system that takes you from day one to
                full production with clear milestones and support at every stage.
              </p>
            </ContentDepth>
          </motion.div>

          <ParallaxLayer depth={0.3}>
            <div className="grid gap-8 sm:grid-cols-3">
              {milestones.map((step, i) => (
                <motion.div
                  key={step.day}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="relative flex flex-col gap-5"
                >
                  {/* Day number with label */}
                  <div className="flex items-end gap-2">
                    <span
                      className="text-5xl font-extrabold sm:text-6xl"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        lineHeight: 1,
                        color: "var(--color-primary)",
                        opacity: 0.15,
                      }}
                    >
                      {step.day}
                    </span>
                    <span
                      className="pb-1 text-sm font-medium uppercase tracking-wider text-muted"
                      style={{ letterSpacing: "0.08em" }}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="h-0.5 w-full"
                    style={{ background: "var(--color-border-light)" }}
                  >
                    <motion.div
                      className="h-full"
                      style={{ background: "var(--color-primary)" }}
                      initial={{ width: "0%" }}
                      whileInView={{
                        width: i === 0 ? "33%" : i === 1 ? "66%" : "100%",
                      }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.8,
                        delay: 0.3 + i * 0.15,
                        ease: "easeOut",
                      }}
                    />
                  </div>

                  <h3
                    className="text-lg font-semibold text-foreground"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </ParallaxLayer>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          AGENT OUTCOMES — Depth 4 (interactive) cards
      ═══════════════════════════════════════════════════════ */}
      <section
        id="results"
        className="relative overflow-hidden px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl py-24 sm:py-32">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-16 max-w-2xl text-center"
          >
            <ContentDepth>
              <p
                className="mb-4 text-sm font-medium uppercase tracking-wider text-muted"
                style={{ letterSpacing: "0.08em" }}
              >
                What agents get
              </p>
              <h2
                className="text-heading text-foreground"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Built for agents who want more
              </h2>
            </ContentDepth>
          </motion.div>

          <ParallaxLayer depth={0.2}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {outcomes.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                  className="flex flex-col gap-3 rounded-2xl p-6 transition-shadow duration-300"
                  style={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border-light)",
                  }}
                >
                  <h3
                    className="text-sm font-semibold text-foreground"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </ParallaxLayer>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA — Depth 3 heading
      ═══════════════════════════════════════════════════════ */}
      <section
        id="cta"
        className="px-4 sm:px-6 lg:px-8"
        style={{ background: "var(--color-card)" }}
      >
        <div className="mx-auto max-w-7xl py-24 sm:py-32">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center"
          >
            <ContentDepth>
              <h2
                className="text-heading text-foreground"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Ready to Grow With BearTeam?
              </h2>
            </ContentDepth>
            <p className="max-w-md text-lg leading-relaxed text-muted">
              No commitment, no pressure — just an honest conversation about
              what BearTeam can do for your business.
            </p>
            <a
              href="sms:4077588102?body=Hello%20Tom,%20I%20would%20like%20to%20learn%20more%20about%20joining%20BearTeam."
              className="pt-4"
            >
              <Button variant="primary" className="!px-8 !py-4 !text-base">
                Schedule a Confidential Conversation
              </Button>
            </a>
            <p className="hidden text-sm text-muted sm:block">
              Text Tom at 407-758-8102
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
