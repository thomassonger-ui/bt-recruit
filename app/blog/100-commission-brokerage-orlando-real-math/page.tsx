import type { Metadata } from "next";
import Shell from "@/components/seo/Shell";
import { ArticleHead, Body, Lead, H2, P, UL, Note, CTA, articleSchema, Link } from "../ui";

const SLUG = "100-commission-brokerage-orlando-real-math";
const TITLE = "100% commission brokerages in Orlando: the real math";
const DESC = "100% commission is a pricing model, not free. How flat-fee brokerages actually charge, worked examples at 6, 12, and 20 deals, and when a capped split beats 100%.";

export const metadata: Metadata = {
  title: "100% Commission Brokerages in Orlando: The Real Math",
  description: DESC,
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: { type: "article", url: `https://www.joinbearteam.com/blog/${SLUG}`, title: TITLE, description: DESC, images: [{ url: `/api/og?title=${encodeURIComponent(TITLE)}`, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: [`/api/og?title=${encodeURIComponent(TITLE)}`] },
};

const FAQ = [
  {
    q: "Is 100% commission really 100%?",
    a: "No brokerage keeps zero of your money — 100% commission is a pricing model where you keep the full split but pay flat fees instead: typically a per-transaction fee, often a monthly or annual fee, and frequently separate E&O or compliance charges per file. The honest comparison is total annual cost at your production level, not the headline percentage.",
  },
  {
    q: "What fees do 100% commission brokerages usually charge?",
    a: "Models vary, but the common structure combines a per-closing flat fee (often a few hundred dollars), a monthly or annual membership fee, and per-file E&O or risk-management charges. Some also charge for technology, sign-up, or paperwork review. Always request the complete fee schedule in writing.",
  },
  {
    q: "Is Bear Team a 100% commission brokerage?",
    a: "No — Bear Team uses a graduated split that starts at 60/40 and climbs to 90/10, with a $16,000 company-dollar cap, a $150 flat fee per closing, zero monthly fees, and E&O covered by the brokerage. The trade is real support, training, and leads while you build — and a split that rises as you produce.",
  },
  {
    q: "Who should choose a 100% commission model?",
    a: "High-volume, fully self-sufficient agents who generate their own business, need no training or leads, and treat the brokerage purely as license placement can do well on flat-fee models. Newer and mid-production agents usually net less once fees and the absence of support are priced in.",
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

export default function Page() {
  return (
    <Shell>
      {articleSchema(SLUG, TITLE, DESC).map((o, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o) }} />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ArticleHead eyebrow="Commission models" title={TITLE} read="8 min read" />
      <Body>
        <Lead>
          "Keep 100% of your commission" is the loudest pitch in Orlando real estate recruiting — and it's neither a
          scam nor a gift. It's a pricing model. Whether it beats a traditional or capped split depends entirely on
          your production, your fees, and how much support you actually use. Here's the math nobody puts on the
          billboard.
        </Lead>

        <H2>How 100% commission models actually charge</H2>
        <P>
          A brokerage has bills — office, broker supervision, compliance, E&O, software. A 100% model doesn't remove
          those costs; it repackages them as flat fees. The typical structure combines several of the following:
        </P>
        <UL>
          <li><strong>Per-transaction fee</strong> — commonly a few hundred dollars per closing.</li>
          <li><strong>Monthly or annual fee</strong> — membership-style, owed whether you close or not.</li>
          <li><strong>E&O / risk fee per file</strong> — errors & omissions charged deal by deal (our <Link href="/blog/what-does-eo-insurance-cover-real-estate" style={{ color: "#2F5C8F", fontWeight: 700 }}>E&O guide</Link> explains why who pays this matters).</li>
          <li><strong>Extras</strong> — sign-up fees, technology fees, paperwork-review fees, and "premium support" tiers.</li>
        </UL>
        <P>
          None of that makes the model dishonest — but it makes "100%" the wrong number to compare. The right number is
          your <strong>total annual brokerage cost</strong> at your volume, which is exactly what our{" "}
          <Link href="/blog/real-estate-brokerage-fees-explained" style={{ color: "#2F5C8F", fontWeight: 700 }}>fee breakdown</Link>{" "}
          and the <Link href="/your-numbers" style={{ color: "#2F5C8F", fontWeight: 700 }}>calculator</Link> are built to show.
        </P>

        <H2>An honest worked example</H2>
        <P>
          Take an illustrative flat-fee plan: $500 per closing, $100 per month, and a $60 E&O charge per file. Against
          it, Bear Team's model: a split that starts at 60/40 and graduates to 90/10 as you pay in company dollar,
          capped at $16,000 per year, with a $150 flat fee per closing, no monthly fees, and E&O covered.
        </P>

        <H2>At 6 deals a year</H2>
        <P>
          On the flat-fee plan: 6 × $500 + 12 × $100 + 6 × $60 = <strong>about $4,560 in fees</strong> — plus you're on
          your own for training, leads, and support, which for most 6-deal agents is the difference between staying at
          6 deals and growing. On Bear Team's model an agent at this volume pays company dollar on the 60/40 split plus
          $900 in flat fees — more in dollars, but it buys BearTeam Academy, leads, a CRM, and a team that answers the
          phone. The real question at this level isn't which is cheaper this year; it's which one gets you to 12 deals.
        </P>

        <H2>At 12–20 deals a year</H2>
        <P>
          This is where the models genuinely converge. On Bear Team's ladder, production moves you to 70/30, 80/20,
          then 90/10 — and once you've paid $16,000 of company dollar in a year, you're effectively done contributing
          until it resets. A 20-deal agent spends most of the year at or near the top split. The flat-fee agent at 20
          deals pays roughly $10,000 + $1,200 + $1,200 = <strong>around $12,400</strong> on our illustrative plan — while
          still self-funding training, leads, marketing tools, and E&O gaps. The gap between "100%" and a capped
          graduated split is much smaller than the billboard suggests, and what fills that gap is everything the
          flat-fee model doesn't include.
        </P>

        <H2>When 100% commission genuinely wins</H2>
        <P>
          Fairness matters: flat-fee models are the right call for some agents. If you're a high-volume veteran with a
          self-sustaining sphere, your own marketing engine, no need for training or floor support, and the discipline
          to run fully solo — a cheap license-placement model maximizes your net (our{" "}
          <Link href="/place-your-license" style={{ color: "#2F5C8F", fontWeight: 700 }}>place-your-license</Link> page
          is the honest comparison for that scenario). The agents who get hurt are the ones in the middle: producing
          6–15 deals, still growing, who traded away support to chase a percentage and stalled.
        </P>

        <H2>The question that actually decides it</H2>
        <P>
          Don't ask "what percentage do I keep?" Ask: <strong>at my volume, what do I pay in total, and what do I get for
          it?</strong> Two Orlando agents closing the same 12 deals can have wildly different nets — and the one with the
          better net is usually the one whose brokerage helped them get deals 9 through 12 in the first place. Put your
          own numbers side by side on <Link href="/your-numbers" style={{ color: "#2F5C8F", fontWeight: 700 }}>the calculator</Link>,
          or see the full <Link href="/commission-splits" style={{ color: "#2F5C8F", fontWeight: 700 }}>Bear Team split structure</Link> and{" "}
          <Link href="/100-percent-commission" style={{ color: "#2F5C8F", fontWeight: 700 }}>our take on 100% models</Link>.
        </P>

        <H2>Frequently asked questions</H2>
        {FAQ.map((f) => (
          <div key={f.q}>
            <P><strong>{f.q}</strong></P>
            <P>{f.a}</P>
          </div>
        ))}

        <Note>
          Flat-fee figures above are illustrative of common market structures, not any specific brokerage's pricing —
          always request a complete written fee schedule. Bear Team figures are our actual plan. Not financial advice.
        </Note>
      </Body>
      <CTA heading="Run the 100% math on your production" sub="Your last 12 months, both models, side by side — takes five minutes and the calculator doesn't flatter anyone." />
    </Shell>
  );
}
