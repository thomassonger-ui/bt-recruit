import type { Metadata } from "next";
import Link from "next/link";
import Shell, { tokens } from "@/components/seo/Shell";
import EODisclaimer from "@/components/seo/EODisclaimer";
const { INK, BODY, BORDER, ACCENT, NAVY, MAXW } = tokens;
const SITE = "https://www.joinbearteam.com";

export const metadata: Metadata = {
  title: "100% Commission Brokerage in Orlando? Read This First",
  description:
    "Chasing a 100% commission real estate brokerage in Orlando? See how a true 100% model's monthly desk fees compare to Bear Team's graduating 60/40 to 90/10 split with $0 monthly fees and E&O covered.",
  alternates: { canonical: "/100-percent-commission" },
  openGraph: { type: "article", url: `${SITE}/100-percent-commission`, title: "100% Commission vs. Bear Team — Orlando", description: "Why '100% commission' isn't always more money. Run the real comparison.", images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};
const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: "Home", item: SITE }, { "@type": "ListItem", position: 2, name: "100% Commission", item: `${SITE}/100-percent-commission` } ] };

const FAQ = [
  {
    q: "Is a 100% commission brokerage really free?",
    a: "No brokerage keeps zero of your money. In a 100% model the brokerage's costs are repackaged as monthly desk fees, per-transaction fees, and often per-file E&O charges — owed whether you close or not. The honest comparison is your total annual cost at your production level, not the headline percentage.",
  },
  {
    q: "Who actually nets more on a 100% commission model?",
    a: "Very high-volume, fully self-sufficient agents can come out ahead on a flat-fee model. For most agents doing roughly 3–20 deals a year, zero monthly fees plus a graduating split often nets more, because you're not paying fixed overhead in the months you don't close.",
  },
  {
    q: "Does Bear Team offer 100% commission?",
    a: "No — Bear Team uses a graduating split from 60/40 up to 90/10 through a $16,000 company-dollar cap that runs on your anniversary year, with $0 monthly fees, a flat $150 per closing, and E&O covered by the brokerage. Costs scale with closings instead of arriving every month.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function HundredPercent() {
  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "clamp(48px,7vw,84px) 24px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT }}>The Real Math</div>
        <h1 style={{ fontSize: "clamp(2rem,4.5vw,3.1rem)", fontWeight: 800, color: INK, margin: "12px 0 16px", lineHeight: 1.08 }}>&ldquo;100% commission&rdquo; isn't always more money.</h1>
        <p style={{ fontSize: 18, color: BODY, maxWidth: 760, lineHeight: 1.6 }}>A 100% commission model can be the right fit — but the headline hides the fees. The honest comparison is what you actually keep after costs, not the split on the brochure.</p>
      </section>
      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "16px 24px 8px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: "0 0 10px" }}>How a 100% model usually works</h2>
        <p style={{ fontSize: 16, color: BODY, lineHeight: 1.65, maxWidth: 760 }}>You keep 100% of your commission, but you typically pay a monthly desk fee, a per-transaction fee, and often your own E&amp;O — whether you close one deal that month or none. Those fixed costs hit hardest in slow months and for agents doing a moderate number of deals.</p>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: "26px 0 10px" }}>How Bear Team works</h2>
        <p style={{ fontSize: 16, color: BODY, lineHeight: 1.65, maxWidth: 760 }}>Bear Team uses a graduating split — 60/40 up to 90/10 as you produce — with $0 monthly fees, a flat $150 per closing, and E&amp;O covered by the brokerage. Your costs scale with your closings instead of arriving every month regardless of production.</p>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: "26px 0 10px" }}>So which keeps more?</h2>
        <p style={{ fontSize: 16, color: BODY, lineHeight: 1.65, maxWidth: 760 }}>It depends on your volume. Very high-volume agents can come out ahead on a pure 100% model. For most agents doing roughly 3–20 deals a year, $0 monthly fees plus a graduating split often nets more — because you're not paying fixed overhead in the months you don't close. The only way to know is to run your own numbers.</p>
        <p style={{ fontSize: 15, color: BODY, marginTop: 18 }}>Run it: <Link href="/your-numbers" style={{ color: ACCENT, fontWeight: 700 }}>the take-home calculator</Link> · <Link href="/commission-splits" style={{ color: ACCENT, fontWeight: 700 }}>how splits graduate</Link> · <Link href="/no-fee-brokerage" style={{ color: ACCENT, fontWeight: 700 }}>the $0-fee structure</Link> · <Link href="/blog/100-commission-brokerage-orlando-real-math" style={{ color: ACCENT, fontWeight: 700 }}>worked examples at 6, 12, and 20 deals</Link>.</p>
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
        <EODisclaimer />
      </section>
      <section style={{ background: NAVY, padding: "clamp(48px,7vw,72px) 24px", marginTop: 32 }}>
        <div style={{ maxWidth: MAXW, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800, margin: "0 0 12px" }}>Compare your real take-home.</h2>
          <p style={{ color: "#9DB4D0", fontSize: 17, maxWidth: 620, margin: "0 auto 26px", lineHeight: 1.6 }}>Scout will run your numbers at Bear Team versus a 100% model with monthly fees. Or book a call with Tom Songer.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={tokens.CALENDLY} style={{ background: "#fff", color: NAVY, padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>Book a Call →</a>
            <Link href="/chat" style={{ background: "transparent", color: "#fff", padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.35)" }}>Run my numbers with Scout</Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
