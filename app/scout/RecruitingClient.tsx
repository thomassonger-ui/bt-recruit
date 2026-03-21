"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import ScoutCard from "@/components/ui/ScoutCard";
import ScoutDemo from "@/components/ui/ScoutDemo";
import BlueprintHeroGrid from "@/components/ui/BlueprintHeroGrid";
import BlueprintLineLayer from "@/components/ui/BlueprintLineLayer";
import BlueprintFloatingElements from "@/components/ui/BlueprintFloatingElements";
import FloatingShapes from "@/components/ui/FloatingShapes";
import ParallaxLayer from "@/components/ui/ParallaxLayer";
import { ContentDepth } from "@/components/ui/DepthLayer";
import BearAnimation from "@/components/ui/BearAnimation";
import HeroPromptInput from "@/components/ui/HeroPromptInput";
import TryScout from "@/components/ui/TryScout";
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

const painPoints = [
  {
    problem: "Follow-up slips through the cracks",
    solution:
      "Scout automatically follows up with every lead so no opportunity is missed",
  },
  {
    problem: "Listings take too long to prepare",
    solution:
      "Scout generates listing content and messaging instantly to speed up go-to-market time",
  },
  {
    problem: "Client communication breaks down",
    solution:
      "Scout maintains consistent, professional communication across every client interaction",
  },
  {
    problem: "Transactions get messy and disorganized",
    solution:
      "Scout keeps every step structured so transactions stay on track from start to close",
  },
];

const builtForItems = [
  "Built for real transactions — not theory",
  "Designed for production — not recruiting",
  "Structured workflows — not guesswork",
];

const SMS_BODY = encodeURIComponent(
  "Hi, I just tried Scout on the site. Can you help me set it up for my listings?"
);

/* ═══════════════════════════════════════════════════════════════
   SECTION 1 — HERO: 5-layer 3D depth parallax
   ═══════════════════════════════════════════════════════════════ */
function HeroParallaxContent() {
  const heroRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 40, stiffness: 90, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const cursorGridX = useTransform(smoothX, [-1, 1], [12, -12]);
  const cursorGridY = useTransform(smoothY, [-1, 1], [8, -8]);
  const cursorEnvX = useTransform(smoothX, [-1, 1], [8, -8]);
  const cursorEnvY = useTransform(smoothY, [-1, 1], [6, -6]);
  const cursorAccentX = useTransform(smoothX, [-1, 1], [15, -15]);
  const cursorAccentY = useTransform(smoothY, [-1, 1], [10, -10]);

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (isMobile) return;
      const rect = e.currentTarget.getBoundingClientRect();
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

  const gridY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const lineLayerY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const floatingShapesY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const subtitleY = useTransform(scrollYProgress, [0, 1], [0, 22]);
  const ctaY = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const scoutCardY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const accentTopY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const accentBottomY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const envOpacity = useTransform(
    scrollYProgress,
    [0, 0.6, 1],
    [1, 0.7, 0.3]
  );
  const accentOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.08, 0.12, 0.04]
  );

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Layer 1: Blueprint grid */}
      <motion.div
        className="pointer-events-none absolute inset-[-20px]"
        style={{
          y: gridY,
          x: cursorGridX,
          translateY: cursorGridY,
          willChange: "transform",
        }}
      >
        <BlueprintHeroGrid />
      </motion.div>

      {/* Layer 2: Architectural lines */}
      <motion.div
        className="pointer-events-none absolute inset-[-16px]"
        style={{
          y: lineLayerY,
          x: cursorEnvX,
          translateY: cursorEnvY,
          opacity: envOpacity,
          willChange: "transform",
        }}
      >
        <BlueprintLineLayer containerRef={heroRef} />
      </motion.div>

      {/* Layer 2b: Floating shapes */}
      <motion.div
        className="pointer-events-none absolute inset-[-16px] h-[calc(100%+32px)] w-[calc(100%+32px)]"
        style={{
          y: floatingShapesY,
          x: cursorEnvX,
          translateY: cursorEnvY,
          opacity: envOpacity,
          willChange: "transform",
        }}
      >
        <FloatingShapes className="z-[1]" />
      </motion.div>

      {/* Layer 2c: Blueprint floating elements */}
      <motion.div
        className="pointer-events-none absolute inset-[-16px]"
        style={{
          y: lineLayerY,
          x: cursorEnvX,
          translateY: cursorEnvY,
          opacity: envOpacity,
          willChange: "transform",
        }}
      >
        <BlueprintFloatingElements containerRef={heroRef} />
      </motion.div>

      {/* Layer 5: Foreground accents */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          x: cursorAccentX,
          translateY: cursorAccentY,
          willChange: "transform",
        }}
        aria-hidden="true"
      >
        <motion.div
          className="absolute left-[6%] top-[14%]"
          style={{
            y: accentTopY,
            opacity: accentOpacity,
            willChange: "transform",
          }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path
              d="M2 24V2H24"
              stroke="var(--color-muted)"
              strokeWidth="0.75"
            />
          </svg>
        </motion.div>
        <motion.div
          className="absolute right-[8%] top-[10%]"
          style={{
            y: accentTopY,
            opacity: accentOpacity,
            willChange: "transform",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M34 12V2H24"
              stroke="var(--color-muted)"
              strokeWidth="0.75"
            />
          </svg>
        </motion.div>
        <motion.div
          className="absolute bottom-[12%] left-[10%]"
          style={{
            y: accentBottomY,
            opacity: accentOpacity,
            willChange: "transform",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M2 12V30H20"
              stroke="var(--color-muted)"
              strokeWidth="0.75"
            />
          </svg>
        </motion.div>
        <motion.div
          className="absolute bottom-[18%] right-[6%]"
          style={{
            y: accentBottomY,
            opacity: accentOpacity,
            willChange: "transform",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line
              x1="12"
              y1="0"
              x2="12"
              y2="24"
              stroke="var(--color-muted)"
              strokeWidth="0.5"
            />
            <line
              x1="0"
              y1="12"
              x2="24"
              y2="12"
              stroke="var(--color-muted)"
              strokeWidth="0.5"
            />
          </svg>
        </motion.div>
        <motion.div
          className="absolute left-[4%] top-[35%]"
          style={{
            y: accentTopY,
            opacity: accentOpacity,
            willChange: "transform",
          }}
        >
          <svg width="8" height="120" viewBox="0 0 8 120" fill="none">
            <line
              x1="4"
              y1="0"
              x2="4"
              y2="120"
              stroke="var(--color-muted)"
              strokeWidth="0.5"
            />
            <line
              x1="0"
              y1="0"
              x2="8"
              y2="0"
              stroke="var(--color-muted)"
              strokeWidth="0.5"
            />
            <line
              x1="0"
              y1="120"
              x2="8"
              y2="120"
              stroke="var(--color-muted)"
              strokeWidth="0.5"
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Navbar */}
      <div className="relative z-10">
        <Navbar>
          <a
            href="#why"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Why Scout
          </a>
          <a
            href="#scout"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            See Scout
          </a>
          <a
            href="#try"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Try It
          </a>
          <a
            href={`sms:+18444072587?body=${SMS_BODY}`}
          >
            <Button variant="primary" className="!py-2 !px-4 !text-sm">
              Text Me Scout
            </Button>
          </a>
        </Navbar>
      </div>

      {/* Hero content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl py-24 sm:py-32 lg:py-40">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left */}
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="flex flex-col gap-6"
            >
              {/* Headline */}
              <motion.div
                variants={childFade}
                transition={{ duration: 0.6 }}
                style={{ y: headlineY, willChange: "transform" }}
              >
                <p
                  className="mb-3 text-xs font-semibold uppercase tracking-[0.25em]"
                  style={{ fontFamily: "Inter, sans-serif", color: "var(--color-primary)" }}
                >
                  Scout
                </p>
                <h1
                  className="text-display text-foreground"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Find What&apos;s Missing
                </h1>
                <p
                  className="mt-3 text-lg font-medium text-muted sm:text-xl"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Most agents aren&apos;t falling behind because of effort.
                  <br />
                  They&apos;re missing structure, systems, and consistency.
                </p>
              </motion.div>

              {/* Hook line */}
              <motion.p
                variants={childFade}
                transition={{ duration: 0.6 }}
                className="max-w-lg text-lg leading-relaxed text-muted"
                style={{ y: subtitleY, willChange: "transform" }}
              >
                Scout helps you identify exactly where things are breaking
                down — so you know what to fix, what to build, and what to
                stop doing.
              </motion.p>

              {/* Prompt input */}
              <motion.div
                variants={childFade}
                transition={{ duration: 0.5 }}
                style={{ y: ctaY, willChange: "transform" }}
                className="pt-2"
              >
                <HeroPromptInput />
              </motion.div>
            </motion.div>

            {/* Right — ScoutCard */}
            <motion.div
              className="hidden lg:block"
              style={{ y: scoutCardY, willChange: "transform" }}
            >
              <ScoutCard />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bear animation (desktop) */}
      <div className="hidden md:block">
        <BearAnimation />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE — 8-Section Conversion Structure
   ═══════════════════════════════════════════════════════════════ */
export default function RecruitingClient() {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* ═══════════════════════════════════════════════════════
          SECTION 1 — INTRODUCING SCOUT (Hero)
      ═══════════════════════════════════════════════════════ */}
      <HeroParallaxContent />

      {/* ═══════════════════════════════════════════════════════
          SECTION 2 — WHY THIS MATTERS
      ═══════════════════════════════════════════════════════ */}
      <section id="why" className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl py-24 sm:py-32">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p
              className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-muted"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              The Real Problem
            </p>
            <h2
              className="text-heading text-foreground"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Why Agents Fall Behind
            </h2>
          </motion.div>

          <div className="mt-12 flex flex-col gap-4 sm:mt-16">
            {painPoints.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group rounded-xl px-5 py-4 md:py-4"
                style={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border-light)",
                  transition:
                    "transform 180ms ease, box-shadow 180ms ease, background 180ms ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "translateY(-2px)";
                  el.style.boxShadow =
                    "0 4px 24px rgba(0,0,0,0.08)";
                  el.style.background = "var(--color-card-hover, var(--color-card))";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                  el.style.background = "var(--color-card)";
                }}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{ background: "var(--color-primary)" }}
                  />
                  <p
                    className="text-sm font-medium leading-relaxed text-foreground/80 sm:text-base"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {point.problem}
                  </p>
                </div>
                {/* Solution — visible on mobile, hover-reveal on desktop */}
                <p
                  className="mt-2 pl-[22px] text-xs leading-relaxed text-muted sm:text-sm md:mt-0 md:max-h-0 md:overflow-hidden md:opacity-0 md:group-hover:mt-2 md:group-hover:max-h-20 md:group-hover:opacity-100"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    transition:
                      "opacity 180ms ease, max-height 180ms ease, margin-top 180ms ease",
                  }}
                >
                  {point.solution}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 text-center text-lg font-medium text-foreground sm:mt-12"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            The problem isn&apos;t effort.{" "}
            <span className="text-muted">It&apos;s the lack of a system.</span>
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3 — SCOUT IN ACTION (Interactive Demo)
      ═══════════════════════════════════════════════════════ */}
      <div id="scout">
        <ParallaxLayer depth={0.15}>
          <ScoutDemo className="bg-card" />
        </ParallaxLayer>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4 — BUILT FOR REAL ESTATE AGENTS
      ═══════════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl py-20 sm:py-28">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p
              className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-muted"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Purpose-Built
            </p>
            <h2
              className="text-heading text-foreground"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Built for Real Estate Agents
            </h2>
            <p
              className="mt-4 text-lg leading-relaxed text-muted"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Scout helps agents complete everyday real estate tasks faster by
              assisting with marketing, communication, and business workflow.
            </p>
          </motion.div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:mt-12">
            {builtForItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.12 }}
                className="flex items-center gap-3"
              >
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ background: "var(--color-primary)" }}
                />
                <span
                  className="text-sm font-medium text-foreground/80 sm:text-base"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {item}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 5 — TRY SCOUT (Interactive → Messenger/SMS)
      ═══════════════════════════════════════════════════════ */}
      <section
        id="try"
        className="px-4 sm:px-6 lg:px-8"
        style={{ background: "var(--color-card)" }}
      >
        <div className="mx-auto max-w-4xl py-24 sm:py-32">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center sm:mb-16"
          >
            <p
              className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-muted"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Try It Now
            </p>
            <h2
              className="text-heading text-foreground"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              See What Scout Can Do
            </h2>
            <p
              className="mt-4 text-base leading-relaxed text-muted"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Click generate and watch Scout write a listing description in
              seconds.
            </p>
          </motion.div>

          <TryScout />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 6 — TRUST + PROOF
      ═══════════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl py-16 sm:py-20">
          {/* Stats */}
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

          {/* Trust statements */}
          <div className="mx-auto mt-20 flex max-w-3xl flex-col items-center gap-5 text-center sm:mt-28">
            {[
              "Built inside Bear Academy",
              "Designed for real transactions",
              "Supports active production workflows",
            ].map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="flex items-center gap-3"
              >
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ background: "var(--color-primary)" }}
                />
                <p
                  className="text-base font-medium text-foreground sm:text-lg"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 7 — CLOSING CTA
      ═══════════════════════════════════════════════════════ */}
      <section
        className="px-4 sm:px-6 lg:px-8"
        style={{
          borderTop: "1px solid var(--color-border-light)",
          background: "var(--color-card)",
        }}
      >
        <div className="mx-auto max-w-3xl py-24 sm:py-32">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-8 text-center"
          >
            <ContentDepth>
              <p
                className="text-lg leading-relaxed text-foreground/80 sm:text-xl"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                The agents who adapt will gain leverage.
                <br />
                <span className="font-semibold text-foreground">
                  The ones who don&apos;t will fall behind.
                </span>
              </p>
            </ContentDepth>

            <p
              className="text-xl font-semibold leading-relaxed text-foreground sm:text-2xl"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Everything is already built for you.
              <br />
              <span className="text-muted">
                Just plug in and start producing with Bear Team.
              </span>
            </p>

            <div className="pt-4">
              <a href="https://www.joinbearteam.com/chat">
                <Button variant="primary" className="!px-8 !py-4 !text-base">
                  Start Using Scout
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
