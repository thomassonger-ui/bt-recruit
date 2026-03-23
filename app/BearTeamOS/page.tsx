"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function BearTeamOSPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,90,130,0); }
          50%       { box-shadow: 0 0 32px 8px rgba(59,90,130,0.35); }
        }
        @keyframes floatDot {
          0%, 100% { transform: translateY(0px); opacity: 0.18; }
          50%       { transform: translateY(-18px); opacity: 0.32; }
        }
        .os-fade-1 { animation: fadeUp 0.75s cubic-bezier(0.32,0.72,0,1) 0.15s both; }
        .os-fade-2 { animation: fadeUp 0.75s cubic-bezier(0.32,0.72,0,1) 0.35s both; }
        .os-fade-3 { animation: fadeUp 0.75s cubic-bezier(0.32,0.72,0,1) 0.55s both; }
        .os-fade-4 { animation: fadeUp 0.75s cubic-bezier(0.32,0.72,0,1) 0.75s both; }
        .os-fade-5 { animation: fadeUp 0.75s cubic-bezier(0.32,0.72,0,1) 0.90s both; }
        .os-notify-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          font-family: Inter, sans-serif;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          background: linear-gradient(135deg, #1b365d 0%, #2d4a6b 100%);
          color: #ffffff;
          border: none;
          letter-spacing: 0.01em;
        }
        .os-notify-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .os-back-link {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.38);
          text-decoration: none;
          font-family: Inter, sans-serif;
          transition: color 0.2s;
          letter-spacing: 0.01em;
        }
        .os-back-link:hover { color: rgba(255,255,255,0.65); }
        .dot {
          position: absolute;
          border-radius: 50%;
          background: rgba(59,110,156,0.22);
        }
      `}</style>

      <main
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #060e1c 0%, #0b1d3a 45%, #0d2040 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          padding: "40px 24px",
        }}
      >
        {/* Ambient background dots */}
        {mounted && (
          <>
            <span className="dot" style={{ width: 340, height: 340, top: "-80px", right: "-60px", animationName: "floatDot", animationDuration: "7s", animationTimingFunction: "ease-in-out", animationIterationCount: "infinite" }} />
            <span className="dot" style={{ width: 220, height: 220, bottom: "60px", left: "-40px", animationName: "floatDot", animationDuration: "9s", animationTimingFunction: "ease-in-out", animationIterationCount: "infinite", animationDelay: "2s" }} />
            <span className="dot" style={{ width: 140, height: 140, top: "35%", left: "8%", animationName: "floatDot", animationDuration: "11s", animationTimingFunction: "ease-in-out", animationIterationCount: "infinite", animationDelay: "4s" }} />
          </>
        )}

        {/* Bear Team wordmark */}
        <div className="os-fade-1" style={{ marginBottom: "48px", textAlign: "center" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                fontFamily: "Inter, sans-serif",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.38)",
              }}
            >
              Bear Team Real Estate
            </span>
          </Link>
        </div>

        {/* Hero content */}
        <div style={{ textAlign: "center", maxWidth: 680, position: "relative", zIndex: 1 }}>

          {/* Badge */}
          <div className="os-fade-2" style={{ marginBottom: "28px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "6px 16px",
                borderRadius: "9999px",
                background: "rgba(59,90,130,0.22)",
                border: "1px solid rgba(59,90,130,0.40)",
                fontSize: "0.72rem",
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.60)",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4a8fff", display: "inline-block", boxShadow: "0 0 6px 2px rgba(74,143,255,0.55)" }} />
              In Development
            </span>
          </div>

          {/* Headline */}
          <h1
            className="os-fade-3"
            style={{
              fontSize: "clamp(2.8rem, 7vw, 5rem)",
              fontWeight: 800,
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
              color: "#ffffff",
              margin: "0 0 20px 0",
            }}
          >
            Bear Team
            <span
              style={{
                display: "block",
                background: "linear-gradient(90deg, #4a8fff 0%, #6eb0ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              OS
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="os-fade-4"
            style={{
              fontSize: "clamp(1rem, 2.2vw, 1.2rem)",
              fontFamily: "Inter, sans-serif",
              color: "rgba(255,255,255,0.52)",
              lineHeight: 1.65,
              margin: "0 auto 44px",
              maxWidth: 500,
              fontWeight: 400,
            }}
          >
            The operating system for Bear Team agents — deals, clients, and pipeline in one place.
            <br />
            Coming soon.
          </p>

          {/* CTA */}
          <div className="os-fade-5" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <a href="sms:+14077588102?body=I%20want%20early%20access%20to%20BearTeamOS">
              <button className="os-notify-btn">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                Get Early Access
              </button>
            </a>
            <Link href="/" className="os-back-link">← Back to Bear Team</Link>
          </div>
        </div>

        {/* Bottom brand mark */}
        <div
          style={{
            position: "absolute",
            bottom: "28px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "0.72rem",
            fontFamily: "Inter, sans-serif",
            color: "rgba(255,255,255,0.18)",
            letterSpacing: "0.08em",
            whiteSpace: "nowrap",
          }}
        >
          © 2026 WorldTeachPathways · Bear Team Real Estate
        </div>
      </main>
    </>
  );
}
