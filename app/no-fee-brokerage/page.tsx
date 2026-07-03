import type { Metadata } from "next";
import Link from "next/link";
import Shell, { tokens } from "@/components/seo/Shell";

const { INK, BODY, BORDER, ACCENT, NAVY, MAXW } = tokens;
const SITE = "https://www.joinbearteam.com";

export const metadata: Metadata = {
  title: "No Monthly Fee Real Estate Brokerage in Orlando — $0 Desk Fees",
  description:
    "Bear Team is an Orlando brokerage with zero monthly fees — no desk fee, no tech fee, no royalty fee. Just a flat $150 per closing, with E&O insurance covered by the brokerage.",
  alternates: { canonical: "/no-fee-brokerage" },
  openGraph: {
    type: "article",
    url: `${SITE}/no-fee-brokerage`,
    title: "No-Fee Real Estate Brokerage in Orlando — Bear Team",
    description: "$0 monthly fees, $150 flat per closing, E&O covered.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE },
    { "@type": "ListItem", position: 2, name: "No-Fee Brokerage", item: `${SITE}/no-fee-brokerage` },
  ],
};

const FAQ = [
  {
    q: "What does a no-monthly-fee brokerage actually mean?",
    a: "At Bear Team it means zero recurring charges: no desk fee, no technology fee, no royalty fee, no monthly membership. Nothing is owed in a month you don't close.",
  },
  {
    q: "What is the only fee agents pay at Bear Team?",
    a: "A flat $150 transaction fee per closing. That's the complete fee schedule — there are no sign-up, monthly, annual, or per-file E&O charges.",
  },
  {
    q: "Who pays for E&O insurance?",
    a: "The brokerage. Errors & omissions coverage is fully covered by Bear Team, not billed to agents monthly or per file as at many brokerages.",
  },
  {
    q: "How does Bear Team make money with no monthly fees?",
    a: "Through the commission split. Agents start at 60/40 and graduate to 90/10 through a single $16,000 company-dollar cap — so the brokerage earns when agents close, not by charging overhead whether they produce or not.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const COMPARE = [
  ["Monthly desk / tech / royalty fees", "$100–$300+ / month", "$0 / month — always"],
  ["Cost per closing", "Varies + franchise fees", "Flat $150"],
  ["E&O insurance", "Often billed to the agent", "Covered by Bear Team"],
  ["Commission split", "Usually fixed", "60/40 → 90/10, graduates"],
];

export default function NoFeeBrokerage() {
  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "clamp(48px,7vw,84px) 24px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT }}>
          Fee Structure
        </div>
        <h1 style={{ fontSize: "clamp(2rem,4.5vw,3.1rem)", fontWeight: 800, color: INK, margin: "12px 0 16px", lineHeight: 1.08 }}>
          A no-fee Orlando brokerage. Keep what you earn.
        </h1>
        <p style={{ fontSize: 18, color: BODY, maxWidth: 740, lineHeight: 1.6 }}>
          Monthly fees quietly eat your income whether you close or not. Bear Team charges zero monthly fees —
          no desk fee, no technology fee, no royalty fee. Your only cost is a flat $150 per closing, and your E&amp;O
          insurance is covered by the brokerage.
        </p>
      </section>

      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "16px 24px 8px" }}>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          {[["$0", "Per month — always"], ["$150", "Flat fee per closing"], ["Covered", "E&O insurance"]].map(([n, l]) => (
            <div key={l} style={{ flex: "1 1 180px", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "22px" }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: NAVY, fontVariantNumeric: "tabular-nums" }}>{n}</div>
              <div style={{ fontSize: 14, color: BODY, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "28px 24px 8px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: "0 0 14px" }}>Where the money goes — side by side</h2>
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
          {COMPARE.map((row, i) => (
            <div key={row[0]} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
              <div style={{ padding: "14px 18px", fontWeight: 700, color: INK, fontSize: 14.5 }}>{row[0]}</div>
              <div style={{ padding: "14px 18px", color: BODY, fontSize: 14.5, borderLeft: `1px solid ${BORDER}` }}>{row[1]}</div>
              <div style={{ padding: "14px 18px", color: NAVY, fontWeight: 700, fontSize: 14.5, borderLeft: `1px solid ${BORDER}`, background: "#F7F8FA" }}>{row[2]}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13.5, color: BODY, marginTop: 10, opacity: 0.85 }}>
          Typical-fee figures are general market ranges and vary by brokerage.
        </p>
        <p style={{ fontSize: 15, color: BODY, marginTop: 16 }}>
          See also: <Link href="/commission-splits" style={{ color: ACCENT, fontWeight: 700 }}>how the splits graduate</Link>,{" "}
          our <Link href="/blog/real-estate-brokerage-fees-explained" style={{ color: ACCENT, fontWeight: 700 }}>guide to brokerage fees</Link>,{" "}
          and the <Link href="/faq" style={{ color: ACCENT, fontWeight: 700 }}>full FAQ</Link>.
        </p>
      </section>

      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "28px 24px 8px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: "0 0 14px" }}>Frequently asked questions</h2>
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
          {FAQ.map((f, i) => (
            <div key={f.q} style={{ padding: "18px 22px", borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
              <div style={{ fontWeight: 800, color: INK, fontSize: 16 }}>{f.q}</div>
              <p style={{ color: BODY, fontSize: 14.5, margin: "6px 0 0", lineHeight: 1.6 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: NAVY, padding: "clamp(48px,7vw,72px) 24px", marginTop: 32 }}>
        <div style={{ maxWidth: MAXW, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800, margin: "0 0 12px" }}>
            Add up what fees are costing you.
          </h2>
          <p style={{ color: "#9DB4D0", fontSize: 17, maxWidth: 620, margin: "0 auto 26px", lineHeight: 1.6 }}>
            Scout will show your take-home with zero monthly fees versus where you are now. Or book a call with Tom Songer.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={tokens.CALENDLY} style={{ background: "#fff", color: NAVY, padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>Book a Call →</a>
            <Link href="/chat" style={{ background: "transparent", color: "#fff", padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.35)" }}>Run my numbers with Scout</Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
