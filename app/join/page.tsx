/**
 * /join — Bear Team Agent Landing Page
 * Single viewport, no scroll.
 * Uses the real Navbar component — matches all other pages.
 */

"use client";

import Navbar from "@/components/layout/Navbar";

const PAIN_POINTS = [
  "Pipeline runs dry between deals",
  "Paying fees whether you close or not",
  "Cap you'll never actually hit",
  "No one at the brokerage knows your name",
];

export default function JoinPage() {
  return (
    <div style={{
      height: "100dvh",
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(160deg, #1a2233 0%, #1e2d40 45%, #162030 100%)",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      color: "#fff",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* Grid texture */}
      <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />
      {/* Blue glow */}
      <div aria-hidden style={{ position: "absolute", top: "-20%", left: "-5%", width: "55%", height: "70%", background: "radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* ── Real site Navbar ── */}
      <Navbar variant="light">
        <a
          href="sms:+14075551234?body=Hi%20Scout%2C%20tell%20me%20about%20Bear%20Team"
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          Text Me Scout
        </a>
      </Navbar>

      {/* ── Main ── */}
      <main style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", minHeight: 0, padding: "20px 28px 16px", gap: "24px", alignItems: "center" }}>

        {/* ── Left: headline + big CTA ── */}
        <div style={{ flex: "1.1", display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 }}>
          <div style={{ background: "rgba(20,32,52,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "32px 32px 28px", backdropFilter: "blur(12px)" }}>
            <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: "800", lineHeight: "1.08", margin: "0 0 8px", letterSpacing: "-0.025em" }}>
              Introducing Scout
            </h1>
            <p style={{ fontSize: "1rem", fontWeight: "700", color: "#4a90d9", margin: "0 0 16px", letterSpacing: "-0.01em" }}>
              Find What&apos;s Missing
            </p>
            <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.68)", lineHeight: "1.65", margin: "0 0 28px" }}>
              Most agents aren&apos;t falling behind because of effort. They&apos;re missing structure, systems, and consistency. Scout finds the gap — then books you with Tom.
            </p>

            <a
              href="https://www.joinbearteam.com/chat"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                background: "#4a90d9",
                color: "#fff",
                padding: "18px 28px",
                borderRadius: "10px",
                fontWeight: "800",
                fontSize: "1.05rem",
                textDecoration: "none",
                letterSpacing: "-0.01em",
                boxShadow: "0 4px 24px rgba(74,144,217,0.5)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Start with Scout™ | AI Powered →
            </a>
          </div>

          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.22)", textAlign: "center" }}>
            © 2026 WorldTeachPathways | Bear Real Estate Team
          </div>
        </div>

        {/* ── Right: pain points ── */}
        <div style={{ flex: "0.9", display: "flex", flexDirection: "column", justifyContent: "center", gap: "12px", minWidth: 0 }}>
          {PAIN_POINTS.map((point, i) => (
            <div
              key={point}
              style={{
                alignSelf: i % 2 === 0 ? "flex-end" : "flex-start",
                background: "rgba(18,28,46,0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "11px 18px",
                maxWidth: "82%",
                fontWeight: "600",
                fontSize: "0.85rem",
                color: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
              }}
            >
              {point}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
