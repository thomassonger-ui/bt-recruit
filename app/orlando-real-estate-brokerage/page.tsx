import type { Metadata } from "next";
import Link from "next/link";
import Shell, { tokens } from "@/components/seo/Shell";

const { INK, BODY, BORDER, ACCENT, NAVY, MAXW } = tokens;
const SITE = "https://www.joinbearteam.com";

export const metadata: Metadata = {
  title: "Best Real Estate Brokerage to Work For in Orlando | Bear Team",
  description:
    "Looking for the best real estate brokerage to join in Orlando? Bear Team is a boutique brokerage built for agents — progressive 60/40 to 90/10 splits, $0 monthly fees, $150 per closing, E&O covered, training, and Scout AI.",
  alternates: { canonical: "/orlando-real-estate-brokerage" },
  openGraph: {
    type: "website",
    url: `${SITE}/orlando-real-estate-brokerage`,
    title: "Best Real Estate Brokerage to Work For in Orlando — Bear Team",
    description: "A boutique Orlando brokerage built for agents: graduating splits, $0 fees, real support.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE },
    { "@type": "ListItem", position: 2, name: "Orlando Real Estate Brokerage", item: `${SITE}/orlando-real-estate-brokerage` },
  ],
};

const POINTS = [
  ["Graduating commission splits", "Start at 60/40 and move to 90/10 as you produce — not one flat rate forever.", "/commission-splits"],
  ["Zero monthly fees", "No desk, tech, or royalty fees. Just a flat $150 per closing, E&O covered.", "/no-fee-brokerage"],
  ["A real switching plan", "Move your license, clients, and pending deals without losing momentum.", "/switch-brokerages-florida"],
  ["Straight answers", "Splits, fees, the cap, support — answered in real numbers.", "/faq"],
];

export default function OrlandoBrokerageHub() {
  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "clamp(48px,7vw,84px) 24px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT }}>
          Orlando, Florida
        </div>
        <h1 style={{ fontSize: "clamp(2rem,4.5vw,3.2rem)", fontWeight: 800, color: INK, margin: "12px 0 16px", lineHeight: 1.07 }}>
          The boutique Orlando brokerage built for agents.
        </h1>
        <p style={{ fontSize: 18, color: BODY, maxWidth: 760, lineHeight: 1.6 }}>
          If you're weighing the best real estate brokerage to work for in Orlando, the questions that matter are simple:
          what's the split, what does it cost, and who's actually in your corner. Bear Team is a boutique brokerage that
          answers all three with real numbers — progressive 60/40 to 90/10 splits, $0 monthly fees, a flat $150 per
          closing, E&amp;O covered, training through BearTeam Academy, and Scout AI to run your pipeline.
        </p>
      </section>

      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "20px 24px 8px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: "0 0 6px" }}>Boutique vs. big-box franchise</h2>
        <p style={{ fontSize: 16, color: BODY, lineHeight: 1.65, maxWidth: 760 }}>
          A large franchise gives you a logo; a boutique brokerage gives you attention. At Bear Team you get personal
          support from the people running it, a real culture instead of a phone tree, and a model designed to reward
          production rather than collect fees. You walk into a system on day one — you don't build it alone.
        </p>
      </section>

      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "24px 24px 8px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: "0 0 16px" }}>Start where it matters</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {POINTS.map(([title, desc, href]) => (
            <Link key={href} href={href} style={{ textDecoration: "none", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 22px", display: "block", background: "#fff" }}>
              <div style={{ fontWeight: 800, color: INK, fontSize: 17 }}>{title}</div>
              <div style={{ color: BODY, fontSize: 14.5, marginTop: 6, lineHeight: 1.55 }}>{desc}</div>
              <div style={{ color: ACCENT, fontWeight: 700, fontSize: 14, marginTop: 10 }}>Learn more →</div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ background: NAVY, padding: "clamp(48px,7vw,72px) 24px", marginTop: 36 }}>
        <div style={{ maxWidth: MAXW, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800, margin: "0 0 12px" }}>
            See your real numbers before you switch.
          </h2>
          <p style={{ color: "#9DB4D0", fontSize: 17, maxWidth: 640, margin: "0 auto 26px", lineHeight: 1.6 }}>
            Serving greater Orlando and Central Florida from 2300 S Crystal Lake Dr. Book a call with Tom Songer,
            Team Lead, or run your take-home with Scout.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={tokens.CALENDLY} style={{ background: "#fff", color: NAVY, padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>Book a Call →</a>
            <Link href="/chat" style={{ background: "transparent", color: "#fff", padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.35)" }}>Talk to Scout</Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
