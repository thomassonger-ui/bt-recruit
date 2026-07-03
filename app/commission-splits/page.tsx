import type { Metadata } from "next";
import Link from "next/link";
import Shell, { tokens } from "@/components/seo/Shell";

const { INK, BODY, BORDER, ACCENT, NAVY, MAXW } = tokens;
const SITE = "https://www.joinbearteam.com";

export const metadata: Metadata = {
  title: "Real Estate Commission Splits in Orlando — 60/40 to 90/10",
  description:
    "How Bear Team's progressive commission splits work for Orlando agents: start at 60/40 and graduate to 90/10 after a single $16,000 cap, with $0 monthly fees and a flat $150 per closing.",
  alternates: { canonical: "/commission-splits" },
  openGraph: {
    type: "article",
    url: `${SITE}/commission-splits`,
    title: "Commission Splits at Bear Team — 60/40 to 90/10 (Orlando)",
    description: "Progressive splits, one $16K cap, $0 monthly fees, $150 flat per closing.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

const TIERS = [
  { tier: "Tier 1 · Start", when: "Day one — your first deals", split: "60 / 40" },
  { tier: "Tier 2", when: "After Bear Team collects $16K", split: "70 / 30" },
  { tier: "Tier 3", when: "Keep producing", split: "80 / 20" },
  { tier: "Team Lead", when: "Top tier", split: "90 / 10" },
];

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE },
    { "@type": "ListItem", position: 2, name: "Commission Splits", item: `${SITE}/commission-splits` },
  ],
};

const FAQ = [
  {
    q: "How does the 60/40 to 90/10 split progression work?",
    a: "You start at 60/40 on day one. There's a single $16,000 company-dollar cap — once Bear Team has collected $16,000 from your closings, you advance to the next tier automatically: 70/30, then 80/20, then 90/10. Your split climbs as you produce.",
  },
  {
    q: "Are there monthly or desk fees on top of the split?",
    a: "No. Bear Team charges zero monthly fees — no desk fee, no technology fee, no royalty fee. The only cost to agents is a flat $150 per closing, and E&O insurance is covered by the brokerage.",
  },
  {
    q: "What split do new agents start at?",
    a: "New agents start at 60/40, with free training through BearTeam Academy included. The same $16,000 cap and tier progression applies from your first closing.",
  },
  {
    q: "How does this compare to a 100% commission model?",
    a: "A 100% model repackages brokerage costs as monthly and per-file fees you pay whether you close or not. Bear Team's costs scale with closings only. For most agents doing 3–20 deals a year, $0 monthly fees plus a graduating split nets more — run your own numbers to compare.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function CommissionSplits() {
  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "clamp(48px,7vw,84px) 24px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT }}>
          Commission Model
        </div>
        <h1 style={{ fontSize: "clamp(2rem,4.5vw,3.1rem)", fontWeight: 800, color: INK, margin: "12px 0 16px", lineHeight: 1.08 }}>
          You earn your split. You don't wait for it.
        </h1>
        <p style={{ fontSize: 18, color: BODY, maxWidth: 740, lineHeight: 1.6 }}>
          Most Orlando brokerages lock you at one split or bury it under monthly fees. Bear Team uses a progressive
          model — you start at 60/40 and graduate to 90/10 as you produce, through a single company-dollar cap.
        </p>
      </section>

      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "16px 24px 8px" }}>
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
          {TIERS.map((t, i) => (
            <div
              key={t.tier}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                padding: "18px 22px",
                borderTop: i === 0 ? "none" : `1px solid ${BORDER}`,
                background: i === TIERS.length - 1 ? "#F7F8FA" : "#fff",
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: INK, fontSize: 16 }}>{t.tier}</div>
                <div style={{ color: BODY, fontSize: 14, marginTop: 2 }}>{t.when}</div>
              </div>
              <div style={{ fontWeight: 800, color: NAVY, fontSize: 22, fontVariantNumeric: "tabular-nums" }}>{t.split}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "24px 24px 8px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: "0 0 10px" }}>One $16,000 cap — then you advance</h2>
        <p style={{ fontSize: 16, color: BODY, lineHeight: 1.65, maxWidth: 760 }}>
          There's a single $16,000 company-dollar cap. Once Bear Team has collected $16,000 from your closings, you move
          to the next tier automatically. You don't reset every year, and you never pay into a cap you can't reach. As your
          volume climbs, more of every commission stays with you — with the same zero monthly fees and the same flat
          $150 per closing the whole way up.
        </p>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginTop: 22 }}>
          {[["$0", "Monthly cost to you"], ["$150", "Flat fee per closing"], ["$16K", "Cap, then you advance"]].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: 30, fontWeight: 800, color: NAVY, fontVariantNumeric: "tabular-nums" }}>{n}</div>
              <div style={{ fontSize: 14, color: BODY }}>{l}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 15, color: BODY, marginTop: 22 }}>
          See also: <Link href="/no-fee-brokerage" style={{ color: ACCENT, fontWeight: 700 }}>the no-fee fee structure</Link>,{" "}
          the <Link href="/blog/100-commission-brokerage-orlando-real-math" style={{ color: ACCENT, fontWeight: 700 }}>real math on 100% commission models</Link>,{" "}
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
            What would you net at Bear Team?
          </h2>
          <p style={{ color: "#9DB4D0", fontSize: 17, maxWidth: 620, margin: "0 auto 26px", lineHeight: 1.6 }}>
            Run your real take-home against your current brokerage with Scout, or book a call with Tom Songer.
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
