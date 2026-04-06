"use client";

import Script from "next/script";

export default function SchedulePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f0f3f8", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, color: "#0b1d3a", marginBottom: "8px", textAlign: "center" }}>
        Schedule a Discovery Call
      </h1>
      <p style={{ fontSize: "1rem", color: "#6b7280", marginBottom: "32px", textAlign: "center", maxWidth: "480px" }}>
        Pick a time that works for you. No pressure, no commitment — just a conversation.
      </p>
      <div
        className="calendly-inline-widget"
        data-url="https://calendly.com/thomas-songer/bear-team-meet"
        style={{ minWidth: "320px", width: "100%", maxWidth: "700px", height: "700px" }}
      />
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
