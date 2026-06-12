import type { Metadata } from "next";
import Link from "next/link";
import Shell, { tokens } from "@/components/seo/Shell";
const { INK, BODY, BORDER, ACCENT, NAVY, MAXW } = tokens;
const SITE = "https://www.joinbearteam.com";

export const metadata: Metadata = {
  title: "Place or Hang Your Real Estate License in Orlando | Bear Team",
  description:
    "Need a sponsoring broker in Orlando to keep your Florida real estate license active? Bear Team offers fast DBPR onboarding, $0 monthly fees, E&O covered, and real support — whether you're producing or keeping your license active.",
  alternates: { canonical: "/place-your-license" },
  openGraph: { type: "article", url: `${SITE}/place-your-license`, title: "Hang Your Florida Real Estate License with Bear Team", description: "A sponsoring Orlando broker with fast onboarding, $0 monthly fees, and real support.", images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};
const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: "Home", item: SITE }, { "@type": "ListItem", position: 2, name: "Place Your License", item: `${SITE}/place-your-license` } ] };

const CARDS = [
  ["A sponsoring broker, fast", "In Florida your license has to sit with an active broker. Bear Team handles the DBPR transfer quickly so there's no gap."],
  ["$0 monthly to hold and grow", "No monthly desk or tech fees means it doesn't cost you every month to keep your license active — only a flat $150 when you close."],
  ["E&O covered", "Errors & omissions insurance is covered by the brokerage, not billed to you per file."],
  ["Support when you're ready to produce", "Whether you're keeping your license active or planning to ramp up, the systems and training are here when you want them."],
];

export default function PlaceYourLicense() {
  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "clamp(48px,7vw,84px) 24px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT }}>Sponsoring Broker</div>
        <h1 style={{ fontSize: "clamp(2rem,4.5vw,3.1rem)", fontWeight: 800, color: INK, margin: "12px 0 16px", lineHeight: 1.08 }}>Hang your Florida license with a broker that supports it.</h1>
        <p style={{ fontSize: 18, color: BODY, maxWidth: 740, lineHeight: 1.6 }}>To keep a Florida real estate license active you need a sponsoring broker. Bear Team is a boutique Orlando brokerage where placing your license is simple, affordable to hold, and backed by real support whenever you decide to produce.</p>
      </section>
      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "16px 24px 8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {CARDS.map(([t, d]) => (
            <div key={t} style={{ border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontWeight: 800, color: INK, fontSize: 17 }}>{t}</div>
              <div style={{ color: BODY, fontSize: 14.5, marginTop: 6, lineHeight: 1.55 }}>{d}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 15, color: BODY, marginTop: 18 }}>Switching from another broker? See the <Link href="/switch-brokerages-florida" style={{ color: ACCENT, fontWeight: 700 }}>Florida transfer guide</Link>. Arrangements vary — <Link href="/chat" style={{ color: ACCENT, fontWeight: 700 }}>ask Scout</Link> or book a call for specifics.</p>
      </section>
      <section style={{ background: NAVY, padding: "clamp(48px,7vw,72px) 24px", marginTop: 32 }}>
        <div style={{ maxWidth: MAXW, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800, margin: "0 0 12px" }}>Ready to place your license?</h2>
          <p style={{ color: "#9DB4D0", fontSize: 17, maxWidth: 620, margin: "0 auto 26px", lineHeight: 1.6 }}>Talk to Tom Songer, Team Lead, about hanging your Florida license with Bear Team.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={tokens.CALENDLY} style={{ background: "#fff", color: NAVY, padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>Book a Call →</a>
            <Link href="/chat" style={{ background: "transparent", color: "#fff", padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.35)" }}>Talk to Scout</Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
