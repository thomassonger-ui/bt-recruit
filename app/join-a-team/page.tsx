import type { Metadata } from "next";
import Link from "next/link";
import Shell, { tokens } from "@/components/seo/Shell";
const { INK, BODY, BORDER, ACCENT, NAVY, MAXW } = tokens;
const SITE = "https://www.joinbearteam.com";

export const metadata: Metadata = {
  title: "Join a Real Estate Team in Orlando | Bear Team",
  description:
    "Looking to join a real estate team in Orlando? Bear Team pairs you with support, systems, and a real culture — boutique attention, graduating splits, and $0 monthly fees.",
  alternates: { canonical: "/join-a-team" },
  openGraph: { type: "article", url: `${SITE}/join-a-team`, title: "Join a Real Estate Team in Orlando — Bear Team", description: "Support, systems, and culture — boutique attention, not a phone tree.", images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};
const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: "Home", item: SITE }, { "@type": "ListItem", position: 2, name: "Join a Team", item: `${SITE}/join-a-team` } ] };

const CARDS = [
  ["Support, not silence", "When you have a question, you reach a person who knows you — not a help desk. Boutique means you're not a number."],
  ["A system that runs your pipeline", "Scout and BearTeamOS keep your deals, next steps, and follow-ups organized so nothing slips."],
  ["A model that rewards production", "Graduating 60/40 to 90/10 splits, $0 monthly fees, $150 per closing, E&O covered — built to pay you more as you grow."],
  ["Real culture", "A team that wants you to win and shows up like it — in Orlando, in person, not just on a logo."],
];

export default function JoinATeam() {
  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "clamp(48px,7vw,84px) 24px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT }}>Join the Team</div>
        <h1 style={{ fontSize: "clamp(2rem,4.5vw,3.1rem)", fontWeight: 800, color: INK, margin: "12px 0 16px", lineHeight: 1.08 }}>Join a team that actually has your back.</h1>
        <p style={{ fontSize: 18, color: BODY, maxWidth: 740, lineHeight: 1.6 }}>Plenty of brokerages will take your name. Bear Team gives you a team — support you can reach, systems that do the busywork, and a model designed to reward your production instead of collecting fees.</p>
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
        <p style={{ fontSize: 15, color: BODY, marginTop: 18 }}>See also: <Link href="/orlando-real-estate-brokerage" style={{ color: ACCENT, fontWeight: 700 }}>why a boutique brokerage</Link> and <Link href="/commission-splits" style={{ color: ACCENT, fontWeight: 700 }}>the commission model</Link>.</p>
      </section>
      <section style={{ background: NAVY, padding: "clamp(48px,7vw,72px) 24px", marginTop: 32 }}>
        <div style={{ maxWidth: MAXW, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800, margin: "0 0 12px" }}>Let's talk about the fit.</h2>
          <p style={{ color: "#9DB4D0", fontSize: 17, maxWidth: 620, margin: "0 auto 26px", lineHeight: 1.6 }}>Book a no-pressure call with Tom Songer, Team Lead at Bear Team, or run your numbers with Scout first.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={tokens.CALENDLY} style={{ background: "#fff", color: NAVY, padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>Book a Call →</a>
            <Link href="/chat" style={{ background: "transparent", color: "#fff", padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.35)" }}>Talk to Scout</Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
