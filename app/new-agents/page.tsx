import type { Metadata } from "next";
import Link from "next/link";
import Shell, { tokens } from "@/components/seo/Shell";
const { INK, BODY, BORDER, ACCENT, NAVY, MAXW } = tokens;
const SITE = "https://www.joinbearteam.com";

export const metadata: Metadata = {
  title: "Best Real Estate Brokerage for New Agents in Orlando",
  description:
    "New to real estate in Orlando? Bear Team gives new agents structured training through BearTeam Academy, a 30-60-90 day plan, mentorship, and Scout AI — so you start with a system instead of figuring it out alone.",
  alternates: { canonical: "/new-agents" },
  openGraph: { type: "article", url: `${SITE}/new-agents`, title: "Best Brokerage for New Real Estate Agents in Orlando", description: "Training, a 30-60-90 plan, mentorship, and $0 monthly fees while you ramp.", images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};
const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: "Home", item: SITE }, { "@type": "ListItem", position: 2, name: "New Agents", item: `${SITE}/new-agents` } ] };

const CARDS = [
  ["BearTeam Academy", "Structured training that teaches what to say and do — scripts, process, and the Orlando market — not just a license-renewal checklist."],
  ["A 30-60-90 day plan", "You walk into a defined plan for your first 90 days, so momentum is built in instead of left to chance."],
  ["Mentorship + Scout AI", "Real people in your corner, plus Scout to tell you the next step on every deal, 24/7."],
  ["Low overhead while you ramp", "$0 monthly fees and E&O covered means your costs don't pile up before your first closing — only a flat $150 when you close."],
];

export default function NewAgents() {
  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "clamp(48px,7vw,84px) 24px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT }}>For New Agents</div>
        <h1 style={{ fontSize: "clamp(2rem,4.5vw,3.1rem)", fontWeight: 800, color: INK, margin: "12px 0 16px", lineHeight: 1.08 }}>Your first year shouldn't be sink-or-swim.</h1>
        <p style={{ fontSize: 18, color: BODY, maxWidth: 740, lineHeight: 1.6 }}>Most new agents don't stall on talent — they stall because no one handed them a system. Bear Team is a boutique Orlando brokerage built to get new agents producing: training, a real plan, mentorship, and tools that tell you the next move.</p>
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
        <p style={{ fontSize: 15, color: BODY, marginTop: 18 }}>See also: <Link href="/commission-splits" style={{ color: ACCENT, fontWeight: 700 }}>how splits graduate</Link> and the <Link href="/faq" style={{ color: ACCENT, fontWeight: 700 }}>full FAQ</Link>.</p>
      </section>
      <section style={{ background: NAVY, padding: "clamp(48px,7vw,72px) 24px", marginTop: 32 }}>
        <div style={{ maxWidth: MAXW, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800, margin: "0 0 12px" }}>Start your real estate career with a system.</h2>
          <p style={{ color: "#9DB4D0", fontSize: 17, maxWidth: 620, margin: "0 auto 26px", lineHeight: 1.6 }}>Book a call with Tom Songer, Team Lead, or ask Scout how onboarding works for new agents.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={tokens.CALENDLY} style={{ background: "#fff", color: NAVY, padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>Book a Call →</a>
            <Link href="/chat" style={{ background: "transparent", color: "#fff", padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.35)" }}>Talk to Scout</Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
