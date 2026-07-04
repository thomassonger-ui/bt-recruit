import type { Metadata } from "next";
import Shell from "@/components/seo/Shell";
import { ArticleHead, Body, Lead, H2, P, UL, Note, CTA, articleSchema, Link } from "../ui";

const SLUG = "bear-team-vs-lpt-realty-orlando-agents";
const TITLE = "Bear Team vs LPT Realty: an honest comparison for Orlando agents";
const DESC = "LPT's Blueprint (80/20, $15K cap) and Brokerage Builder ($500/deal, $5K cap) plans versus Bear Team's graduating split, $0 monthly fees, and in-person Orlando support — compared honestly.";

export const metadata: Metadata = {
  title: "Bear Team vs LPT Realty — Honest Comparison for Orlando Agents",
  description: DESC,
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: { type: "article", url: `https://www.joinbearteam.com/blog/${SLUG}`, title: TITLE, description: DESC, images: [{ url: `/api/og?title=${encodeURIComponent(TITLE)}`, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: [`/api/og?title=${encodeURIComponent(TITLE)}`] },
};

const FAQ = [
  {
    q: "What are LPT Realty's commission plans?",
    a: "LPT offers two plans. Blueprint: an 80/20 split until you've paid $15,000 to the brokerage, then $195 per transaction, with an $89 monthly fee. Brokerage Builder: a flat $500 per transaction until you've paid $5,000, then $195 per transaction, with a $149 monthly fee. Both plans carry a $500 annual fee, include E&O, and have no franchise or royalty fees, per public comparisons current to mid-2026.",
  },
  {
    q: "How is Bear Team's model different from LPT's?",
    a: "Both are Florida-friendly, no-royalty models with capped brokerage costs and covered E&O — the philosophical overlap is real. The differences: Bear Team charges zero monthly and zero annual fees (LPT's fixed costs run roughly $1,568–$2,288 a year across its plans), a flat $150 per closing versus LPT's $195-plus-plan fees, and Bear Team is a boutique Orlando office with in-person broker access rather than a cloud brokerage.",
  },
  {
    q: "What is LPT's revenue share program?",
    a: "LPT distributes 50% of company dollars through a seven-tier revenue share program tied to agents you attract, plus stock awards in the privately held company. Like all recruiting-based income, it pays meaningfully only if you actively build a downline. If you'd rather sell than recruit, compare the brokerages on splits, fees, and support alone.",
  },
  {
    q: "Who should choose LPT over Bear Team?",
    a: "Agents who want a national cloud brokerage, plan to recruit a downline for revenue share, or want the Brokerage Builder flat-fee plan at high volume are a good fit for LPT. Agents who want zero fixed overhead, a lower flat transaction fee, and a local office where the broker knows their business tend to fit Bear Team better.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const ROWS: [string, string, string][] = [
  ["Commission structure", "Blueprint: 80/20 to $15K cap · Builder: $500/deal to $5K cap", "60/40 graduating to 90/10, $16K cap per tier"],
  ["Monthly fees", "$89/mo (Blueprint) or $149/mo (Builder)", "$0"],
  ["Annual fee", "$500/year", "$0"],
  ["Per-transaction costs", "$195 per transaction (and post-cap)", "$150 flat per closing"],
  ["E&O insurance", "Included", "Covered by the brokerage"],
  ["Franchise/royalty fees", "None", "None"],
  ["Office & support", "Cloud-based, virtual support", "Boutique Orlando office, in-person broker & training"],
  ["Recruiting income", "7-tier revenue share (50% of company dollar) + stock awards", "None — value is in the ladder and support"],
];

export default function Page() {
  return (
    <Shell>
      {articleSchema(SLUG, TITLE, DESC).map((o, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o) }} />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ArticleHead eyebrow="Brokerage comparisons" title={TITLE} read="8 min read" />
      <Body>
        <Lead>
          LPT Realty is the fastest-growing recruiter in Florida real estate, and of all the big names, its model is
          the closest cousin to ours — capped costs, no royalties, E&O included. That makes this the comparison where
          the details matter most. Here it is honestly, using LPT's publicly documented plans.
        </Lead>

        <H2>Two philosophies that agree on a lot</H2>
        <P>
          Both brokerages reject the things that quietly drain agents: franchise royalties, uncapped splits, and
          agent-billed E&O. Where we diverge is fixed overhead and geography. LPT is a national cloud brokerage whose
          plans carry monthly and annual fees; Bear Team is a boutique Orlando office with zero fixed fees of any
          kind. Your decision mostly comes down to which trade you want.
        </P>

        <H2>Side by side</H2>
        <UL>
          {ROWS.map(([label, lpt, bt]) => (
            <li key={label}>
              <strong>{label}:</strong> LPT — {lpt}. Bear Team — {bt}.
            </li>
          ))}
        </UL>

        <H2>The fixed-cost math</H2>
        <P>
          LPT's plans are transparent, and the fixed costs are modest by industry standards — but they're not zero.
          Blueprint runs $89 a month plus $500 a year, about $1,568 annually; Brokerage Builder runs $149 a month plus
          $500 a year, about $2,288 — owed whether you close or not, on top of $195 per transaction. Bear Team's fixed
          overhead is $0, and the per-closing fee is $150. At low and moderate volume, that gap is the whole
          difference; our <Link href="/blog/real-estate-brokerage-fees-explained" style={{ color: "#2F5C8F", fontWeight: 700 }}>fee guide</Link>{" "}
          shows why fixed costs matter most exactly there.
        </P>

        <H2>Where LPT genuinely wins</H2>
        <P>
          At high volume on the Brokerage Builder plan, LPT's math is legitimately strong — a 25-deal agent pays a
          smaller share of GCI than at almost any traditional brokerage. The seven-tier revenue share (50% of company
          dollar) and stock awards are real wealth-building tools for agents who recruit, and the marketing tech is
          well regarded. If you're high-volume, self-sufficient, and building a downline, LPT deserves your
          consideration — that's the honest read.
        </P>

        <H2>Where Bear Team wins</H2>
        <P>
          If you're not recruiting a downline, revenue share is worth close to zero — and then the comparison is just
          costs and support. Zero fixed fees beats $1,568–$2,288 a year; $150 beats $195 per file; and a cloud
          brokerage can't sit across the table from you when a deal wobbles. Bear Team's ladder also rewards
          production with a permanently better split — 70/30, 80/20, 90/10 — rather than resetting you to the same
          plan every year. For Orlando agents at 3–20 deals who want to grow with real support,{" "}
          <Link href="/orlando-real-estate-brokerage" style={{ color: "#2F5C8F", fontWeight: 700 }}>local beats virtual</Link>.
        </P>

        <H2>How to actually decide</H2>
        <P>
          Run your last 12 months through LPT's plan sheet and Bear Team's ladder. The{" "}
          <Link href="/your-numbers" style={{ color: "#2F5C8F", fontWeight: 700 }}>calculator</Link> does our side in
          five minutes; the full structure is on the{" "}
          <Link href="/commission-splits" style={{ color: "#2F5C8F", fontWeight: 700 }}>commission page</Link>. If
          you're mid-decision, the{" "}
          <Link href="/blog/questions-to-ask-before-joining-a-brokerage" style={{ color: "#2F5C8F", fontWeight: 700 }}>12 questions to ask any brokerage</Link>{" "}
          apply to both of us — and the{" "}
          <Link href="/blog/how-to-switch-real-estate-brokerages-in-florida" style={{ color: "#2F5C8F", fontWeight: 700 }}>Florida switching guide</Link>{" "}
          covers the move itself.
        </P>

        <H2>Frequently asked questions</H2>
        {FAQ.map((f) => (
          <div key={f.q}>
            <P><strong>{f.q}</strong></P>
            <P>{f.a}</P>
          </div>
        ))}

        <Note>
          LPT figures are from public plan comparisons current to mid-2026 and can change — confirm current terms
          with LPT directly. Bear Team figures are our actual plan. LPT Realty is a registered trademark of its
          owner; this independent comparison is not affiliated with or endorsed by LPT Realty. Not financial advice.
        </Note>
      </Body>
      <CTA heading="Run both models on your production" sub="Your last 12 months through LPT's plans and Bear Team's ladder, side by side — then talk it through with Tom. No pressure, just the math." />
    </Shell>
  );
}
