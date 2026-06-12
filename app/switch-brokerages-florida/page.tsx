import type { Metadata } from "next";
import Link from "next/link";
import Shell, { tokens } from "@/components/seo/Shell";

const { INK, BODY, BORDER, ACCENT, NAVY, MAXW } = tokens;
const SITE = "https://www.joinbearteam.com";

export const metadata: Metadata = {
  title: "How to Switch Real Estate Brokerages in Florida (Step-by-Step)",
  description:
    "A step-by-step guide for Florida agents: transfer your real estate license through the DBPR, keep your clients and pending deals, and time your move — without losing momentum.",
  alternates: { canonical: "/switch-brokerages-florida" },
  openGraph: {
    type: "article",
    url: `${SITE}/switch-brokerages-florida`,
    title: "How to Switch Real Estate Brokerages in Florida",
    description:
      "Transfer your Florida real estate license through the DBPR, protect your clients and pending deals, and time the move right.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

const STEPS: { title: string; body: string }[] = [
  {
    title: "Review your current agreements and pipeline",
    body:
      "Before you do anything, read your independent-contractor agreement, your active listing agreements, and any policy on pending transactions or fees owed. Note your in-progress deals and when they're expected to close — this drives your timing.",
  },
  {
    title: "Choose your new brokerage",
    body:
      "Compare what actually moves your income: commission split structure, monthly and desk fees, who pays E&O, and the training and systems behind you. Get the numbers in writing so you're comparing real take-home, not headlines.",
  },
  {
    title: "Get released by your current broker",
    body:
      "Your current broker deactivates your license from their brokerage in the state system. Give professional notice, settle anything owed, and confirm how your pending files and any shared listings will be handled.",
  },
  {
    title: "Transfer your license through the DBPR",
    body:
      "In Florida your sponsoring-broker change is processed through the Department of Business and Professional Regulation (DBPR) at myfloridalicense.com. Your new broker activates your real estate license under their brokerage so you can work without a gap. Your new brokerage typically helps you complete this.",
  },
  {
    title: "Move your sphere, listings, and pending files",
    body:
      "Your contacts and relationships come with you. Active listings belong to the brokerage they were listed under, so transfers are coordinated between brokers per your listing agreements. Pending deals are usually completed under the originating brokerage, with commissions paid per your existing agreement.",
  },
  {
    title: "Update your marketing, MLS, and profiles",
    body:
      "Switch your brokerage on your MLS office, business cards, yard signs, email signature, website, and online profiles so everything points to your new brokerage and stays compliant with Florida advertising rules.",
  },
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE },
    { "@type": "ListItem", position: 2, name: "Switch Brokerages in Florida", item: `${SITE}/switch-brokerages-florida` },
  ],
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Switch Real Estate Brokerages in Florida",
  description:
    "A step-by-step guide for Florida agents on transferring a real estate license through the DBPR, keeping clients and pending deals, and timing the move.",
  image: `${SITE}/og.png`,
  author: { "@type": "Organization", name: "Bear Team Real Estate", url: SITE },
  publisher: {
    "@type": "Organization",
    name: "Bear Team Real Estate",
    logo: { "@type": "ImageObject", url: `${SITE}/bt-logo-mark.svg` },
  },
  mainEntityOfPage: `${SITE}/switch-brokerages-florida`,
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to switch real estate brokerages in Florida",
  description:
    "Steps for a Florida real estate agent to change sponsoring brokers through the DBPR while protecting clients and pending deals.",
  step: STEPS.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.body,
  })),
};

export default function SwitchBrokeragesFlorida() {
  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />

      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "clamp(48px,7vw,84px) 24px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT }}>
          Florida Agent Guide
        </div>
        <h1 style={{ fontSize: "clamp(2rem,4.5vw,3.1rem)", fontWeight: 800, color: INK, margin: "12px 0 16px", lineHeight: 1.08 }}>
          How to switch real estate brokerages in Florida
        </h1>
        <p style={{ fontSize: 18, color: BODY, maxWidth: 740, lineHeight: 1.6 }}>
          Changing brokerages feels bigger than it is. In Florida it comes down to a license transfer through the DBPR plus a
          little planning around your clients and pending deals. Here's the full process — and how to do it without losing momentum.
        </p>
      </section>

      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "16px 24px 24px" }}>
        <ol style={{ listStyle: "none", padding: 0, margin: 0, counterReset: "step" }}>
          {STEPS.map((s, i) => (
            <li key={s.title} style={{ display: "flex", gap: 20, padding: "22px 0", borderTop: `1px solid ${BORDER}` }}>
              <div
                style={{
                  flexShrink: 0,
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  background: NAVY,
                  color: "#fff",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: INK, margin: "4px 0 8px" }}>{s.title}</h2>
                <p style={{ fontSize: 16, color: BODY, lineHeight: 1.65, maxWidth: 760, margin: 0 }}>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "8px 24px 48px" }}>
        <div style={{ background: "#F7F8FA", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "22px 24px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: INK, margin: "0 0 10px" }}>Common questions when switching</h2>
          <p style={{ fontSize: 15.5, color: BODY, lineHeight: 1.65, margin: "0 0 8px" }}>
            <strong style={{ color: INK }}>Will I lose my pending deals?</strong> No — pending transactions are typically completed
            under the brokerage where they originated, paid per your existing agreement.
          </p>
          <p style={{ fontSize: 15.5, color: BODY, lineHeight: 1.65, margin: "0 0 8px" }}>
            <strong style={{ color: INK }}>Can I take my clients?</strong> Your sphere moves with you; active listings transfer
            between brokers per your listing agreements.
          </p>
          <p style={{ fontSize: 15.5, color: BODY, lineHeight: 1.65, margin: "0 0 8px" }}>
            <strong style={{ color: INK }}>When's the best time?</strong> Often between closings or at a lull, after reviewing your
            pipeline and any obligations to your current broker.
          </p>
          <p style={{ fontSize: 14, color: tokens.BODY, lineHeight: 1.6, margin: "12px 0 0", opacity: 0.85 }}>
            This is general information, not legal advice. Confirm specifics with the Florida DBPR and your broker.
            More answers on the <Link href="/faq" style={{ color: ACCENT, fontWeight: 700 }}>Bear Team FAQ</Link>.
          </p>
        </div>
      </section>

      <section style={{ background: NAVY, padding: "clamp(48px,7vw,72px) 24px" }}>
        <div style={{ maxWidth: MAXW, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800, margin: "0 0 12px" }}>
            Thinking about a move? Run the numbers first.
          </h2>
          <p style={{ color: "#9DB4D0", fontSize: 17, maxWidth: 640, margin: "0 auto 26px", lineHeight: 1.6 }}>
            Bear Team is a boutique Orlando brokerage — 60/40 to 90/10 splits, $0 monthly fees, $150 per closing, E&amp;O covered,
            and a system that runs your pipeline. See what you'd net before you switch.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={tokens.CALENDLY} style={{ background: "#fff", color: NAVY, padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>
              Book a Call →
            </a>
            <Link href="/chat" style={{ background: "transparent", color: "#fff", padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.35)" }}>
              Run my numbers with Scout
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
