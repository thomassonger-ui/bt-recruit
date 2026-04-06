"use client"

export default function Footer() {
  return (
    <footer style={{ background: "#060e1c", padding: "clamp(40px,8vw,60px) clamp(16px,5vw,40px)", textAlign: "center" }}>
      <div style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff", marginBottom: "8px", letterSpacing: "0.04em" }}>Bear Team Real Estate</div>
      <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", marginBottom: "24px", lineHeight: 1.6 }}>Orlando, FL · Independent Licensed Brokerage · Bethanne Baer, Broker</div>
      <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap", marginBottom: "28px" }}>
        <a href="/chat" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "4px 0" }}>Talk to Scout</a>
        <span style={{ color: "rgba(255,255,255,0.15)" }} aria-hidden="true">·</span>
        <a href="/scout" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "4px 0" }}>The System</a>
        <span style={{ color: "rgba(255,255,255,0.15)" }} aria-hidden="true">·</span>
        <a href="/academy" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "4px 0" }}>Academy</a>
        <span style={{ color: "rgba(255,255,255,0.15)" }} aria-hidden="true">·</span>
        <a href="/privacy" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "4px 0" }}>Privacy Policy</a>
      </div>
      <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.2)" }}>&copy; 2026 Bear Real Estate Team. All rights reserved.</div>
    </footer>
  )
}
