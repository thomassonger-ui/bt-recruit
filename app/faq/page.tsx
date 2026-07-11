import type { Metadata } from "next";
import Link from "next/link";
import Shell, { tokens } from "@/components/seo/Shell";

const { INK, BODY, BORDER, ACCENT, NAVY, MAXW } = tokens;
const SITE = "https://www.joinbearteam.com";

export const metadata: Metadata = {
  title: "Real Estate Brokerage FAQ — Splits, Fees & Switching (Orlando)",
  description:
    "Answers for Orlando agents weighing a brokerage move: commission splits, the $16K cap, monthly fees, E&O, taking clients and pending deals, and how to transfer your Florida real estate license.",
  alternates: { canonical: "/faq" },
  openGraph: {
    type: "article",
    url: `${SITE}/faq`,
    title: "Bear Team FAQ — Splits, Fees & Switching Brokerages in Orlando",
    description:
      "Straight answers on commission splits, fees, E&O, and switching brokerages in Florida — in Bear Team's real numbers.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

type QA = { q: string; a: string };
type Group = { cat: string; items: QA[] };

const GROUPS: Group[] = [
  {
    cat: "Commission & take-home",
    items: [
      {
        q: "What's a good commission split for a real estate agent in Orlando?",
        a: "A good split rewards production instead of locking you at one rate. At Bear Team you start at 60/40 and graduate automatically — 60/40, 70/30, 80/20, 90/10 — as you produce. Because there are no monthly fees, more of your split actually reaches you. The right number depends on your volume, and Scout can run your exact take-home in about a minute.",
      },
      {
        q: "How does Bear Team's commission cap work?",
        a: "The cap is $16,000 in company dollar, and it runs on your personal anniversary year — the 12 months from the day you join, not the calendar year. Once Bear Team has collected $16,000 from your closings in that year, every closing after it is 100% yours minus the $150 flat fee, and you start your next anniversary year one tier up: 70/30, then 80/20, then 90/10. Because the clock is yours, switching mid-year never means paying toward two caps.",
      },
      {
        q: "How much will I actually take home at Bear Team?",
        a: "It depends on your number of closings and average price. As an illustration, an agent doing 8 deals at a $415K average would net roughly $87K with zero monthly fees coming out, and would start the next year at a higher tier. Use Scout to run your real numbers against where you are now. This is an illustration only; individual results vary.",
      },
    ],
  },
  {
    cat: "Fees & costs",
    items: [
      {
        q: "What fees does Bear Team charge agents?",
        a: "Zero monthly fees — no desk fee, no technology fee, no royalty fee. Your only cost is a flat $150 transaction fee per closing. That's it.",
      },
      {
        q: "Are there desk fees or monthly costs?",
        a: "No. It is $0 per month, always. The flat $150 per closing is the only cost to you.",
      },
      {
        q: "Who pays for E&O insurance — the agent or the broker?",
        a: "Bear Team covers errors & omissions (E&O) insurance for its agents. It is not deducted from your commission per transaction. E&O insurance is provided under Bear Team Real Estate's office policy. Agents specializing in commercial or vacant-land transactions are required to carry individual E&O coverage for those transactions. Coverage is subject to policy terms, limits, and exclusions.",
      },
    ],
  },
  {
    cat: "Switching brokerages in Florida",
    items: [
      {
        q: "How do I switch real estate brokerages in Florida?",
        a: "In Florida you change your sponsoring broker through the DBPR. Your current broker releases you and your new broker activates your license under them. Bear Team walks you through the DBPR transfer and handles onboarding so there is no gap in your ability to work. See our full Florida switching guide for the step-by-step.",
      },
      {
        q: "Can I bring my clients and listings when I switch?",
        a: "Your sphere and relationships move with you. Active listings belong to the brokerage they were listed under, so listing transfers are handled between brokers according to your listing agreements — Bear Team helps you navigate that cleanly so clients aren't caught in the middle.",
      },
      {
        q: "Will I lose my pending deals if I change brokerages?",
        a: "Pending transactions are typically completed under the brokerage where they originated, with commissions paid per your existing agreement. Many agents time a move around their pipeline, and Bear Team helps you plan the switch so nothing in progress is disrupted.",
      },
      {
        q: "When is the best time to switch brokerages?",
        a: "Often between closings or during a natural lull, after you've reviewed your pending pipeline and any obligations with your current broker. There's no single right time — the best time is when the math and the support clearly favor the move.",
      },
    ],
  },
  {
    cat: "New agents & support",
    items: [
      {
        q: "Is Bear Team a good brokerage for new agents?",
        a: "Yes. New agents get BearTeam Academy training, a structured 30-60-90 day plan, and Scout AI to surface the next step — so you walk into a system instead of building one. You're supported rather than left sink-or-swim.",
      },
      {
        q: "Does Bear Team provide training and a system for leads?",
        a: "Bear Team provides training through BearTeam Academy and a system — Scout plus BearTeamOS — that organizes your pipeline and your next actions. Talk to Scout or book a call to see exactly how coaching and lead support work for your situation.",
      },
      {
        q: "What is Scout?",
        a: "Scout is Bear Team's AI assistant. It answers questions about splits, fees, and the cap, and runs your real take-home math against your current brokerage — built around the Orlando market and available 24/7.",
      },
      {
        q: "Where is Bear Team Real Estate located?",
        a: "Bear Team Real Estate is a boutique brokerage at 2300 S Crystal Lake Dr, Orlando, FL 32806, serving greater Orlando and Central Florida. Bethanne Baer is the Broker/Owner.",
      },
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: GROUPS.flatMap((g) =>
    g.items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    }))
  ),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE },
    { "@type": "ListItem", position: 2, name: "FAQ", item: `${SITE}/faq` },
  ],
};

export default function FAQPage() {
  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "clamp(48px,7vw,84px) 24px 24px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT }}>
          Bear Team FAQ
        </div>
        <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, color: INK, margin: "12px 0 14px", lineHeight: 1.1 }}>
          Switching brokerages in Orlando? Start with the real answers.
        </h1>
        <p style={{ fontSize: 18, color: BODY, maxWidth: 720, lineHeight: 1.6 }}>
          The questions Orlando agents actually ask before they move — commission splits, the cap, monthly fees, E&amp;O,
          keeping clients and pending deals, and transferring your Florida license. Answered in Bear Team's real numbers,
          no sales pressure.
        </p>
      </section>

      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "8px 24px 64px" }}>
        {GROUPS.map((g) => (
          <div key={g.cat} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ACCENT, marginBottom: 12 }}>
              {g.cat}
            </h2>
            <div style={{ borderTop: `1px solid ${BORDER}` }}>
              {g.items.map((it) => (
                <details key={it.q} style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <summary
                    style={{
                      listStyle: "none",
                      cursor: "pointer",
                      padding: "18px 0",
                      fontSize: 17,
                      fontWeight: 700,
                      color: INK,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                    }}
                  >
                    {it.q}
                    <span style={{ color: ACCENT, flexShrink: 0 }}>+</span>
                  </summary>
                  <p style={{ margin: "0 0 20px", fontSize: 16, color: BODY, lineHeight: 1.65, maxWidth: 760 }}>{it.a}</p>
                </details>
              ))}
            </div>
            {g.cat.startsWith("Switching") && (
              <p style={{ marginTop: 14, fontSize: 15 }}>
                <Link href="/switch-brokerages-florida" style={{ color: ACCENT, fontWeight: 700 }}>
                  Read the full guide: How to switch real estate brokerages in Florida →
                </Link>
              </p>
            )}
          </div>
        ))}
      </section>

      <section style={{ background: NAVY, padding: "clamp(48px,7vw,72px) 24px" }}>
        <div style={{ maxWidth: MAXW, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800, margin: "0 0 12px" }}>
            See your real numbers before you switch.
          </h2>
          <p style={{ color: "#9DB4D0", fontSize: 17, maxWidth: 620, margin: "0 auto 26px", lineHeight: 1.6 }}>
            Run your take-home with Scout, or book a no-pressure call with Tom Songer, Team Lead at Bear Team.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={tokens.CALENDLY} style={{ background: "#fff", color: NAVY, padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>
              Book a Call →
            </a>
            <Link href="/chat" style={{ background: "transparent", color: "#fff", padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.35)" }}>
              Talk to Scout
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
