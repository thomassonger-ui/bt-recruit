/**
 * /join — Bear Team Agent Landing Page
 *
 * Clean static page matching the Scout design:
 * dark navy/slate background, BT logo, "Bear Real Estate Team" header.
 *
 * Scout flow: 3 qualifier questions → schedule appointment with Tom.
 * Scout is the portal — all CTAs funnel through Scout to book.
 */

"use client";

import { useState } from "react";
import Link from "next/link";

// ── Scout 3-question flow ─────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: "brokerage",
    text: "Where are you currently licensed?",
    options: [
      "Keller Williams",
      "eXp Realty",
      "Compass",
      "Realty One Group",
      "Independent / Other",
      "Just got my license",
    ],
  },
  {
    id: "volume",
    text: "How many deals did you close last year?",
    options: ["0–2", "3–5", "6–10", "11–20", "20+"],
  },
  {
    id: "pain",
    text: "What's your biggest frustration right now?",
    options: [
      "Fees eating my commission",
      "No training or support",
      "Pipeline runs dry between deals",
      "Feel invisible at my brokerage",
      "I want better systems & tech",
    ],
  },
];

const SAMPLE_QUESTIONS = [
  "What would I net at Bear Team vs where I am now?",
  "I'm at KW and I never hit my cap — is that normal?",
  "What does it actually cost to join Bear Team?",
  "How does the $16K cap work?",
];

const PAIN_POINTS = [
  "Pipeline runs dry between transactions",
  "Paying fees whether you close or not",
  "Cap you'll never actually hit",
  "No one at the brokerage knows your name",
];

// ── Scout widget ──────────────────────────────────────────────────────────────

function ScoutWidget() {
  const [step, setStep] = useState<"idle" | "q1" | "q2" | "q3" | "done">("idle");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);

  const stepIndex = step === "q1" ? 0 : step === "q2" ? 1 : step === "q3" ? 2 : -1;
  const currentQ = stepIndex >= 0 ? QUESTIONS[stepIndex] : null;

  function handleStart() {
    setStep("q1");
    setSelected(null);
  }

  function handleSelect(option: string) {
    setSelected(option);
  }

  function handleNext() {
    if (!selected) return;
    const q = QUESTIONS[stepIndex];
    const newAnswers = { ...answers, [q.id]: selected };
    setAnswers(newAnswers);
    setSelected(null);

    if (step === "q1") setStep("q2");
    else if (step === "q2") setStep("q3");
    else if (step === "q3") setStep("done");
  }

  // Build Calendly URL with prefilled notes
  function getCalendlyUrl() {
    const notes = [
      answers.brokerage ? `Brokerage: ${answers.brokerage}` : "",
      answers.volume ? `Deals/year: ${answers.volume}` : "",
      answers.pain ? `Top challenge: ${answers.pain}` : "",
    ]
      .filter(Boolean)
      .join(" | ");
    return `https://calendly.com/bearteam/scout?notes=${encodeURIComponent(notes)}`;
  }

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "#1e3a5f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "700",
              fontSize: "15px",
            }}
          >
            S
          </div>
          <div>
            <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>
              Scout
            </div>
            <div style={{ fontSize: "12px", color: "#888" }}>BearTeam AI Assistant</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#22c55e",
            }}
          />
          <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: "600" }}>
            Online
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "20px", minHeight: "200px" }}>
        {step === "idle" && (
          <>
            {/* Sample exchange */}
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  background: "#f3f4f6",
                  borderRadius: "12px 12px 4px 12px",
                  padding: "11px 15px",
                  fontSize: "14px",
                  color: "#1a1a1a",
                  marginBottom: "10px",
                  maxWidth: "85%",
                  marginLeft: "auto",
                }}
              >
                I&apos;m at KW and I never hit my cap. Is that normal?
              </div>
              <div
                style={{
                  background: "#1e3a5f",
                  borderRadius: "12px 12px 12px 4px",
                  padding: "13px 15px",
                  fontSize: "14px",
                  color: "#ffffff",
                  lineHeight: "1.55",
                  maxWidth: "92%",
                }}
              >
                Very normal. Most KW agents doing 6–14 deals/year never cap. You pay full split all year, reset, pay it again. Bear Team&apos;s $16K cap is a graduation trigger — hit it and your split improves automatically.
              </div>
            </div>

            <button
              onClick={handleStart}
              style={{
                display: "block",
                width: "100%",
                background: "#1e3a5f",
                color: "#ffffff",
                padding: "13px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
                letterSpacing: "-0.01em",
              }}
            >
              Talk to Scout — 3 quick questions →
            </button>
          </>
        )}

        {currentQ && (
          <>
            <div
              style={{
                fontSize: "13px",
                color: "#888",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Question {stepIndex + 1} of 3
            </div>
            <p
              style={{
                fontWeight: "700",
                fontSize: "15px",
                color: "#1a1a1a",
                margin: "0 0 14px",
                lineHeight: "1.4",
              }}
            >
              {currentQ.text}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {currentQ.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: `2px solid ${selected === opt ? "#1e3a5f" : "#e5e7eb"}`,
                    background: selected === opt ? "rgba(30,58,95,0.06)" : "#fff",
                    color: "#1a1a1a",
                    fontSize: "13.5px",
                    fontWeight: selected === opt ? "600" : "400",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
            <button
              onClick={handleNext}
              disabled={!selected}
              style={{
                display: "block",
                width: "100%",
                background: selected ? "#1e3a5f" : "#d1d5db",
                color: "#ffffff",
                padding: "12px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "14px",
                border: "none",
                cursor: selected ? "pointer" : "not-allowed",
                transition: "background 0.2s",
              }}
            >
              {stepIndex === 2 ? "See my options →" : "Next →"}
            </button>
          </>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#22c55e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
                fontSize: "22px",
              }}
            >
              ✓
            </div>
            <p
              style={{
                fontWeight: "700",
                fontSize: "16px",
                color: "#1a1a1a",
                margin: "0 0 8px",
              }}
            >
              Thanks — you&apos;re a great fit.
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#555",
                margin: "0 0 20px",
                lineHeight: "1.5",
              }}
            >
              Based on your answers, Bear Team could put significantly more money in your pocket. Let&apos;s schedule 15 minutes with Tom.
            </p>
            <a
              href={getCalendlyUrl()}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                background: "#1e3a5f",
                color: "#ffffff",
                padding: "13px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "15px",
                textDecoration: "none",
                marginBottom: "10px",
              }}
            >
              Schedule with Tom →
            </a>
            <button
              onClick={() => { setStep("idle"); setAnswers({}); setSelected(null); }}
              style={{
                background: "none",
                border: "none",
                color: "#888",
                fontSize: "13px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function JoinPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #1a2233 0%, #1e2d40 45%, #162030 100%)",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        color: "#ffffff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle grid texture */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />

      {/* Blue glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-15%",
          left: "-5%",
          width: "60%",
          height: "65%",
          background: "radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Navbar ── */}
      <nav
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          height: "64px",
          background: "rgba(255,255,255,0.97)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                border: "2px solid #1a2233",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "13px",
                color: "#1a2233",
                letterSpacing: "0.05em",
              }}
            >
              BT
            </div>
            <span
              style={{
                color: "#1a2233",
                fontWeight: "600",
                fontSize: "15px",
                letterSpacing: "-0.01em",
              }}
            >
              Bear Real Estate Team
            </span>
          </div>
        </Link>

        <a
          href="sms:+1-407-000-0000?body=Hi%20Scout%2C%20I%20want%20to%20learn%20more%20about%20Bear%20Team"
          style={{
            background: "#1e3a5f",
            color: "#ffffff",
            padding: "10px 20px",
            borderRadius: "6px",
            fontWeight: "600",
            fontSize: "14px",
            textDecoration: "none",
            letterSpacing: "0.01em",
          }}
        >
          Text Me Scout
        </a>
      </nav>

      {/* ── Hero ── */}
      <main
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "56px 32px 80px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
            gap: "48px",
            alignItems: "start",
          }}
        >
          {/* ── Left: intro card ── */}
          <div
            style={{
              background: "rgba(20, 32, 52, 0.85)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "40px 40px 36px",
              backdropFilter: "blur(12px)",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(2rem, 3.8vw, 2.9rem)",
                fontWeight: "800",
                lineHeight: "1.08",
                margin: "0 0 10px",
                letterSpacing: "-0.025em",
                color: "#ffffff",
              }}
            >
              Introducing Scout
            </h1>
            <p
              style={{
                fontSize: "1.2rem",
                fontWeight: "700",
                color: "#4a90d9",
                margin: "0 0 22px",
                letterSpacing: "-0.01em",
              }}
            >
              Find What&apos;s Missing
            </p>
            <p
              style={{
                fontSize: "1rem",
                color: "rgba(255,255,255,0.72)",
                lineHeight: "1.65",
                margin: "0 0 16px",
              }}
            >
              Most agents aren&apos;t falling behind because of effort.
              They&apos;re missing structure, systems, and consistency.
            </p>
            <p
              style={{
                fontSize: "1rem",
                color: "rgba(255,255,255,0.72)",
                lineHeight: "1.65",
                margin: "0 0 32px",
              }}
            >
              Scout helps you identify exactly where things are breaking down
              — so you know what to fix, what to build, and what to stop doing.
            </p>

            {/* Prompt input (decorative) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.13)",
                borderRadius: "8px",
                padding: "13px 16px",
                marginBottom: "14px",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.88rem" }}>
                Ask Scout about splits, fees, or joining Bear Team...
              </span>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  background: "#4a90d9",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Quick questions */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {SAMPLE_QUESTIONS.map((q) => (
                <span
                  key={q}
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.13)",
                    borderRadius: "20px",
                    padding: "7px 13px",
                    fontSize: "0.77rem",
                    color: "rgba(255,255,255,0.68)",
                    cursor: "default",
                  }}
                >
                  {q}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right: pain points + Scout widget ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "16px" }}>
            {/* Pain point callouts */}
            {PAIN_POINTS.map((point, i) => (
              <div
                key={point}
                style={{
                  alignSelf: i % 2 === 0 ? "flex-end" : "flex-start",
                  background: "rgba(18, 28, 46, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "12px 18px",
                  maxWidth: "290px",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  color: "rgba(255,255,255,0.88)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                }}
              >
                {point}
              </div>
            ))}

            {/* Scout interactive widget */}
            <ScoutWidget />
          </div>
        </div>

        {/* ── Value props row ── */}
        <div
          style={{
            marginTop: "64px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          {[
            {
              label: "Zero Fees",
              desc: "No monthly, desk, or tech fees. Only $150 flat per closing.",
            },
            {
              label: "60/40 → 90/10",
              desc: "Progressive splits. Hit the $16K cap and automatically advance.",
            },
            {
              label: "E&O Covered",
              desc: "Brokerage covers Errors & Omissions insurance — agents pay nothing.",
            },
          ].map(({ label, desc }) => (
            <div
              key={label}
              style={{
                background: "rgba(20, 32, 52, 0.7)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "24px",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                style={{
                  fontWeight: "800",
                  fontSize: "1rem",
                  color: "#4a90d9",
                  marginBottom: "8px",
                  letterSpacing: "-0.01em",
                }}
              >
                {label}
              </div>
              <p
                style={{
                  fontSize: "0.88rem",
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <div
          style={{
            marginTop: "40px",
            textAlign: "center",
            padding: "40px 32px",
            background: "rgba(20, 32, 52, 0.6)",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p
            style={{
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.45)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              margin: "0 0 10px",
              fontWeight: "600",
            }}
          >
            Bear Team Real Estate · Orlando, FL
          </p>
          <h2
            style={{
              fontSize: "clamp(1.4rem, 2.8vw, 2rem)",
              fontWeight: "800",
              margin: "0 0 14px",
              letterSpacing: "-0.02em",
            }}
          >
            Ready to see what you&apos;re leaving on the table?
          </h2>
          <p
            style={{
              fontSize: "0.95rem",
              color: "rgba(255,255,255,0.6)",
              margin: "0 0 24px",
              maxWidth: "480px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: "1.6",
            }}
          >
            Scout runs the math, answers your questions, and schedules a
            conversation with Tom — three questions and you&apos;re in.
          </p>
          <a
            href="#scout-widget"
            style={{
              display: "inline-block",
              background: "#4a90d9",
              color: "#ffffff",
              padding: "14px 32px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "1rem",
              textDecoration: "none",
              letterSpacing: "-0.01em",
              boxShadow: "0 4px 20px rgba(74,144,217,0.4)",
            }}
          >
            Start with Scout™ | AI Powered →
          </a>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          padding: "28px 32px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.3)",
          fontSize: "13px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            marginBottom: "10px",
          }}
        >
          <a href="https://www.joinbearteam.com" style={{ color: "rgba(255,255,255,0.38)", textDecoration: "none" }}>
            joinbearteam.com
          </a>
          <a href="https://www.linkedin.com/showcase/join-bear-team" style={{ color: "rgba(255,255,255,0.38)", textDecoration: "none" }}>
            LinkedIn
          </a>
        </div>
        © {new Date().getFullYear()} Bear Team Real Estate · Bethanne Baer, Broker/Owner
      </footer>
    </div>
  );
}
