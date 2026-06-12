import Link from "next/link";
import React from "react";

const CALENDLY = "https://calendly.com/thomas-songer/bear-team-meet";
const INK = "#0B1B33";
const BODY = "#5B6675";
const BORDER = "#E6E8EC";
const NAVY = "#0B1D3A";
const ACCENT = "#2F5C8F";
const FONT = "var(--font-geist-sans), Inter, system-ui, sans-serif";
const MAXW = 1080;

export const tokens = { INK, BODY, BORDER, NAVY, ACCENT, FONT, MAXW, CALENDLY };

function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "saturate(180%) blur(8px)",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div
        style={{
          maxWidth: MAXW,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bt-logo-mark.svg" alt="Bear Team" width={28} height={28} style={{ display: "block" }} />
          <span style={{ color: INK, fontWeight: 700, fontSize: 16, fontFamily: FONT }}>Bear Team</span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: FONT }}>
          <Link href="/chat" style={{ color: BODY, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
            Talk to Scout
          </Link>
          <a
            href={CALENDLY}
            style={{ background: NAVY, color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}
          >
            Book a Call
          </a>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  const footLink: React.CSSProperties = { color: "#9DB4D0", textDecoration: "none", fontSize: 14 };
  return (
    <footer style={{ background: NAVY, color: "#9DB4D0", padding: "clamp(40px,7vw,60px) 24px", fontFamily: FONT }}>
      <div
        style={{
          maxWidth: MAXW,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/bt-logo-white.svg" alt="Bear Team" width={26} height={26} style={{ display: "block" }} />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Bear Team Real Estate</span>
          </div>
          <div style={{ fontSize: 13, marginTop: 6 }}>
            Orlando, FL &middot; Independent Licensed Brokerage &middot; Bethanne Baer, Broker
          </div>
        </div>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", fontSize: 14 }}>
          <Link href="/chat" style={footLink}>Talk to Scout</Link>
          <Link href="/scout" style={footLink}>The System</Link>
          <Link href="/orlando-real-estate-brokerage" style={footLink}>Orlando Brokerage</Link>
          <Link href="/commission-splits" style={footLink}>Splits</Link>
          <Link href="/switch-brokerages-florida" style={footLink}>Switch in FL</Link>
          <Link href="/faq" style={footLink}>FAQ</Link>
          <Link href="/academy" style={footLink}>Academy</Link>
          <Link href="/privacy" style={footLink}>Privacy</Link>
        </div>
      </div>
      <div
        style={{
          maxWidth: MAXW,
          margin: "28px auto 0",
          paddingTop: 20,
          borderTop: "1px solid #1c3a63",
          fontSize: 12.5,
          color: "#6E89AD",
        }}
      >
        <div>Made exclusively for &middot; &copy; 2026 Bear Team Real Estate &middot; Bethanne Baer, Broker</div>
        <div style={{ marginTop: 4 }}>Design &amp; development &middot; &copy; 2026 Atticus&trade; &middot; WorldTeachPathways dba WorldTeachESL LLC &middot; All IP rights reserved</div>
      </div>
    </footer>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: FONT }}>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
