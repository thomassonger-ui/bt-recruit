"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────
interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

interface HeroFadeProps {
  children: React.ReactNode;
  delay?: number;
}

interface ScoutCTAProps {
  size?: "sm" | "lg";
  label?: string;
}

// ─── Scroll-reveal hook ──────────────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Reveal wrapper ──────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Hero fade-in ────────────────────────────────────────────────────────────
function HeroFade({ children, delay = 0 }: HeroFadeProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}
    >
      {children}
    </div>
  );
}

// ─── Scout CTA button ────────────────────────────────────────────────────────
function ScoutCTA({ size = "lg", label = "Start with Scout" }: ScoutCTAProps) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]";
  const sz = size === "lg" ? "px-8 py-4 text-base" : "px-6 py-3 text-sm";
  return (
    <Link
      href="/chat"
      className={`${base} ${sz}`}
      style={{
        background: "var(--color-primary)",
        color: "#fff",
        boxShadow: "0 4px 14px rgba(59,90,130,0.35)",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        textDecoration: "none",
      }}
    >
      {label}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M3 8h10M9 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(17,19,24,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <div
            style={{
              width: 36, height: 36,
              border: "2px solid rgba(255,255,255,0.8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 4,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.5px" }}>BT</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Bear Team</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <a href="#system" style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, textDecoration: "none" }} className="transition-colors hover:text-white">
            The System
          </a>
          <a href="#proof" style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, textDecoration: "none" }} className="transition-colors hover:text-white">
            Track Record
          </a>
          <ScoutCTA size="sm" />
        </div>
      </div>
    </nav>
  );
}

// ─── Homepage ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const problems = [
    "You're not sure what to do next.",
    "Every deal feels different.",
    "You're figuring it out as you go.",
  ];

  const systemSteps = [
    { num: "01", label: "Learn", sub: "Bear Academy — structured training for every stage" },
    { num: "02", label: "Get Guidance", sub: "Scout — your AI that tells you exactly what to do next" },
    { num: "03", label: "Execute", sub: "BearTeamOS — checklists and workflows for every deal" },
    { num: "04", label: "Join", sub: "Work inside the system from day one" },
  ];

  const dayItems = [
    { trigger: "New listing", action: "Scout guides your next step — pricing strategy, workflow, and marketing sequence." },
    { trigger: "Writing an offer", action: "Follow the structured workflow — every term reviewed, nothing missed." },
    { trigger: "Client changes terms", action: "Confirm in writing immediately — Scout flags exactly what needs to be documented." },
    { trigger: "Closing", action: "Checklist-driven execution — final walkthrough, wire verification, CDA submitted." },
  ];

  const metrics = [
    { stat: "40+", label: "Years Experience" },
    { stat: "$4B+", label: "Volume Closed" },
    { stat: "7,000+", label: "Homes Sold" },
  ];

  const traditional = ["Guessing what to do next", "Inconsistent support", "High splits, unclear value"];
  const bearTeam = ["Structured system — always know the next step", "Real-time guidance from Scout", "Clear execution, measurable production"];

  const objections = [
    { icon: "◈", text: "A structured brokerage system designed for execution, not theory." },
    { icon: "◉", text: "You keep full control of your business and your clients." },
    { icon: "◎", text: "The system supports your execution — it doesn't replace you." },
  ];

  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "var(--color-background)", color: "var(--color-foreground)", overflowX: "hidden" }}>
      <Nav />

      {/* 1. HERO */}
      <section
        style={{
          minHeight: "100vh",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "linear-gradient(160deg, #0d1b2e 0%, #111318 55%, #162030 100%)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(59,90,130,0.2) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,90,130,0.12) 0%, transparent 50%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 680, margin: "0 auto", padding: "140px 32px 100px", textAlign: "center", width: "100%" }}>
          <HeroFade delay={0}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 100, padding: "6px 16px", marginBottom: 32 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
              <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, letterSpacing: "0.04em" }}>40+ Years · $4B+ Volume · 7,000+ Homes</span>
            </div>
          </HeroFade>
          <HeroFade delay={120}>
            <h1 style={{ fontSize: "clamp(2.3rem, 5vw + 0.5rem, 3.8rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 24 }}>
              A Real Estate System That Tells You What To Do Next
            </h1>
          </HeroFade>
          <HeroFade delay={240}>
            <p style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 480, margin: "0 auto 40px" }}>
              Most agents guess. This system removes that.
            </p>
          </HeroFade>
          <HeroFade delay={360}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <ScoutCTA size="lg" />
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginTop: 4 }}>
                Start with Scout → get guided → see how the system works → then decide.
              </p>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
                No commitment. You&rsquo;re not joining today — you&rsquo;re exploring.
              </p>
            </div>
          </HeroFade>
        </div>
        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.3 }}>
          <span style={{ color: "#fff", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>Scroll</span>
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.4)" }} />
        </div>
      </section>

      {/* 2. PATTERN INTERRUPT */}
      <section style={{ minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111318" }}>
        <div style={{ maxWidth: 780, padding: "60px 32px", textAlign: "center" }}>
          <Reveal>
            <p style={{ fontSize: "clamp(1.7rem, 3.5vw + 0.5rem, 2.9rem)", fontWeight: 700, color: "rgba(255,255,255,0.85)", lineHeight: 1.25, letterSpacing: "-0.02em", marginBottom: 12 }}>
              Most agents don&rsquo;t fail because they lack effort.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <p style={{ fontSize: "clamp(1.7rem, 3.5vw + 0.5rem, 2.9rem)", fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.02em", color: "var(--color-primary-light)" }}>
              They fail because they don&rsquo;t have a system.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3. PROBLEM */}
      <section style={{ minHeight: "70vh", display: "flex", alignItems: "center", background: "var(--color-background)", padding: "100px 32px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", width: "100%" }}>
          <Reveal>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-muted)", marginBottom: 52 }}>
              Sound familiar?
            </p>
          </Reveal>
          {problems.map((text, i) => (
            <Reveal key={i} delay={i * 160}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 36 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-primary)", marginTop: 12, flexShrink: 0 }} />
                <p style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 600, color: "var(--color-foreground)", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
                  {text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 4. SOLUTION */}
      <section id="system" style={{ minHeight: "75vh", display: "flex", alignItems: "center", background: "#111318", padding: "100px 32px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", width: "100%" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 56 }}>
              Bear Team gives you a system.
            </h2>
          </Reveal>
          {systemSteps.map((item, i) => (
            <Reveal key={i} delay={i * 120}>
              <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-primary-light)", letterSpacing: "0.1em", minWidth: 24 }}>{item.num}</span>
                <div>
                  <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginBottom: 3 }}>{item.label}</p>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>{item.sub}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 5. SCOUT ENTRY */}
      <section style={{ background: "var(--color-panel-blue)", padding: "120px 32px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
              The entry point
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 20 }}>
              Everything starts with Scout.
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.55)", marginBottom: 52, lineHeight: 1.65 }}>
              Ask a question → get the next step → stay in the system.
            </p>
          </Reveal>
          <Reveal delay={280}>
            <div style={{ background: "rgba(13,27,46,0.75)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "28px", maxWidth: 500, margin: "0 auto 48px", textAlign: "left", backdropFilter: "blur(12px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>S</span>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>Scout</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0 }}>Bear Team AI</p>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Online</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                <div style={{ background: "var(--color-primary)", borderRadius: "12px 12px 2px 12px", padding: "10px 14px", maxWidth: "78%" }}>
                  <p style={{ fontSize: 14, color: "#fff", lineHeight: 1.5, margin: 0 }}>I just accepted an offer — what do I do first?</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(59,90,130,0.35)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>S</span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "12px 12px 12px 2px", padding: "12px 14px", flex: 1 }}>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.82)", lineHeight: 1.6, margin: "0 0 8px" }}>
                    Open escrow within 24 hours — confirm the EMD is received and documented. Then notify the lender and send the full contract package to your TC.
                  </p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>Which stage are you in right now?</p>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <ScoutCTA size="lg" />
          </Reveal>
        </div>
      </section>

      {/* 6. DAY TO DAY */}
      <section style={{ background: "var(--color-background)", padding: "120px 32px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <Reveal>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-muted)", marginBottom: 16 }}>Day to day</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, color: "var(--color-foreground)", letterSpacing: "-0.02em", marginBottom: 56 }}>
              What This Looks Like
            </h2>
          </Reveal>
          {dayItems.map((item, i) => (
            <Reveal key={i} delay={i * 100}>
              <div style={{ display: "flex", gap: 20, padding: "28px 0", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ paddingTop: 2, flexShrink: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(59,90,130,0.09)", border: "1px solid rgba(59,90,130,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary)" }}>{i + 1}</span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: 6 }}>{item.trigger}</p>
                  <p style={{ fontSize: "1rem", color: "var(--color-foreground)", lineHeight: 1.65 }}>{item.action}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 7. PROOF */}
      <section id="proof" style={{ background: "var(--color-card)", padding: "100px 32px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, marginBottom: 64 }}>
            {metrics.map((m, i) => (
              <Reveal key={i} delay={i * 120}>
                <div style={{ padding: "32px 16px", textAlign: "center" }}>
                  <p style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 800, color: "var(--color-primary)", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 8 }}>{m.stat}</p>
                  <p style={{ fontSize: 13, color: "var(--color-muted)", fontWeight: 500 }}>{m.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: 16, padding: "40px 44px", maxWidth: 600, margin: "0 auto" }}>
              <svg width="28" height="22" viewBox="0 0 28 22" fill="none" style={{ marginBottom: 20, opacity: 0.15 }}>
                <path d="M0 22V13C0 5.82 4.48 1.23 13.43 0l1.07 2.13C9.96 3.02 7.73 5.2 7.2 8.8H12V22H0zm16 0V13C16 5.82 20.48 1.23 29.43 0l1.07 2.13C25.96 3.02 23.73 5.2 23.2 8.8H28V22H16z" fill="currentColor" />
              </svg>
              <p style={{ fontSize: "1.15rem", color: "var(--color-foreground)", lineHeight: 1.7, fontStyle: "italic", marginBottom: 24 }}>
                &ldquo;This is the first time I&rsquo;ve had a system that actually tells me what to do next.&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>BA</span>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-foreground)", margin: 0 }}>Bear Team Agent</p>
                  <p style={{ fontSize: 12, color: "var(--color-muted)", margin: 0 }}>Orlando, FL</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 8. DIFFERENTIATION */}
      <section style={{ background: "var(--color-background)", padding: "100px 32px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, color: "var(--color-foreground)", letterSpacing: "-0.02em", marginBottom: 56, textAlign: "center" }}>
              Why This Works
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Reveal>
              <div style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 16, padding: "36px 32px", height: "100%" }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-muted)", marginBottom: 24 }}>
                  Traditional Brokerage
                </p>
                {traditional.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
                    <span style={{ color: "#ef4444", fontSize: 15, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>✕</span>
                    <p style={{ fontSize: 15, color: "var(--color-muted)", lineHeight: 1.5, margin: 0 }}>{item}</p>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={160}>
              <div style={{ background: "var(--color-panel-dark)", border: "1px solid rgba(63,95,138,0.5)", borderRadius: 16, padding: "36px 32px", height: "100%" }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-primary-light)", marginBottom: 24 }}>
                  Bear Team
                </p>
                {bearTeam.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
                    <span style={{ color: "#4ade80", fontSize: 15, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>✓</span>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", lineHeight: 1.5, margin: 0 }}>{item}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 9. OBJECTION HANDLING */}
      <section style={{ background: "var(--color-card)", padding: "100px 32px" }}>
        <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, color: "var(--color-foreground)", letterSpacing: "-0.02em", marginBottom: 12 }}>
              What This Actually Is
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p style={{ fontSize: "1rem", color: "var(--color-muted)", marginBottom: 48, lineHeight: 1.65 }}>
              Not a franchise. Not a training program. A structured brokerage system built for execution.
            </p>
          </Reveal>
          {objections.map((item, i) => (
            <Reveal key={i} delay={i * 130}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 24, textAlign: "left" }}>
                <span style={{ fontSize: 20, color: "var(--color-primary)", flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                <p style={{ fontSize: "1rem", color: "var(--color-foreground)", lineHeight: 1.65, margin: 0 }}>{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 10. URGENCY */}
      <section style={{ background: "linear-gradient(160deg, #0d1b2e 0%, #111318 100%)", padding: "130px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <Reveal>
            <p style={{ fontSize: "clamp(1.5rem, 2.5vw + 0.5rem, 2.2rem)", fontWeight: 700, color: "rgba(255,255,255,0.9)", lineHeight: 1.35, letterSpacing: "-0.02em", marginBottom: 16 }}>
              Agents using structured systems are pulling ahead fast.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.4)", marginBottom: 48, lineHeight: 1.65 }}>
              The longer you operate without one, the harder it is to catch up.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <ScoutCTA size="lg" />
          </Reveal>
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section style={{ background: "var(--color-background)", padding: "140px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(2.2rem, 4vw + 0.5rem, 3.2rem)", fontWeight: 800, color: "var(--color-foreground)", letterSpacing: "-0.03em", marginBottom: 16 }}>
              Stop Guessing. Start Producing.
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p style={{ fontSize: "1rem", color: "var(--color-muted)", marginBottom: 40, lineHeight: 1.65 }}>
              You&rsquo;re not joining today — you&rsquo;re seeing how the system works first.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <ScoutCTA size="lg" label="See How It Works" />
          </Reveal>
        </div>
      </section>

      {/* 12. FOOTER */}
      <footer style={{ background: "#111318", padding: "48px 32px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, border: "2px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.6)", letterSpacing: "-0.5px" }}>BT</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>Bear Team Real Estate</span>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>Central Florida</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.18)", maxWidth: 380, lineHeight: 1.5 }}>
            Structured systems. Real execution. Measurable production.
          </p>
        </div>
      </footer>
    </div>
  );
}
