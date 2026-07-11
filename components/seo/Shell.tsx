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

const NAV: [string, string][] = [
  ["/orlando-real-estate-brokerage", "Why Switch"],
  ["/commission-splits", "Splits"],
  ["/your-numbers", "Calculator"],
  ["/faq", "FAQ"],
  ["/blog", "Blog"],
  ["/events", "Events"],
];

function Header() {
  const link: React.CSSProperties = { color: BODY, textDecoration: "none", fontSize: 14, fontWeight: 600 };
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
      <style>{`
        .bt-nav-burger{display:none;}
        .bt-nav-burger summary{list-style:none;}
        .bt-nav-burger summary::-webkit-details-marker{display:none;}
        @media (max-width: 880px){
          .bt-nav-desktop{display:none !important;}
          .bt-nav-burger{display:block !important;}
        }
      `}</style>
      <div
        style={{
          maxWidth: MAXW,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bt-logo-mark.svg" alt="Bear Team" width={28} height={28} style={{ display: "block" }} />
          <span style={{ color: INK, fontWeight: 700, fontSize: 16, fontFamily: FONT }}>Bear Team</span>
        </Link>

        {/* Desktop nav */}
        <nav className="bt-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 20, fontFamily: FONT }}>
          {NAV.map(([h, l]) => (
            <Link key={h} href={h} style={link}>{l}</Link>
          ))}
          <Link href="/chat" style={{ ...link, color: NAVY, fontWeight: 700 }}>Talk to Scout</Link>
          <a href={CALENDLY} style={{ background: NAVY, color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
            Book a Call
          </a>
        </nav>

        {/* Mobile menu (CSS-only, no JS) */}
        <details className="bt-nav-burger" style={{ position: "relative" }}>
          <summary
            aria-label="Menu"
            style={{ width: 44, height: 44, border: `1px solid ${BORDER}`, borderRadius: 10, background: "#fff", color: INK, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            ☰
          </summary>
          <div
            style={{ position: "absolute", right: 0, top: 52, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, boxShadow: "0 12px 40px rgba(0,0,0,0.12)", padding: "8px 16px 14px", display: "flex", flexDirection: "column", gap: 2, minWidth: 210, zIndex: 60, fontFamily: FONT }}
          >
            {NAV.map(([h, l]) => (
              <Link key={h} href={h} style={{ color: INK, textDecoration: "none", fontSize: 16, fontWeight: 600, padding: "10px 0" }}>{l}</Link>
            ))}
            <Link href="/chat" style={{ color: INK, textDecoration: "none", fontSize: 16, fontWeight: 600, padding: "10px 0" }}>Talk to Scout</Link>
            <a href={CALENDLY} style={{ background: NAVY, color: "#fff", padding: "12px 16px", borderRadius: 10, fontWeight: 700, textDecoration: "none", textAlign: "center", marginTop: 6 }}>Book a Call</a>
          </div>
        </details>
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
          <Link href="/your-numbers" style={footLink}>Calculator</Link>
          <Link href="/switch-brokerages-florida" style={footLink}>Switch in FL</Link>
          <Link href="/faq" style={footLink}>FAQ</Link>
          <Link href="/blog" style={footLink}>Blog</Link>
          <Link href="/events" style={footLink}>Events</Link>
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
        <div style={{ marginBottom: 10, lineHeight: 1.6 }}>
          E&amp;O insurance is provided under Bear Team Real Estate&apos;s office policy. Agents specializing in commercial
          or vacant-land transactions are required to carry individual E&amp;O coverage for those transactions. Coverage
          is subject to policy terms, limits, and exclusions.
        </div>
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
