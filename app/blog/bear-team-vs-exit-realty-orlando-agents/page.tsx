import type { Metadata } from "next";
import Shell from "@/components/seo/Shell";
import { ArticleHead, Body, Lead, H2, P, UL, Note, CTA, articleSchema, Link } from "../ui";

const SLUG = "bear-team-vs-exit-realty-orlando-agents";
const TITLE = "Bear Team vs EXIT Realty: an honest comparison for Orlando agents";
const DESC = "EXIT's 70/30-to-90/10 franchise model and sponsoring residuals versus Bear Team's graduating split, defined $16,000 cap, $0 monthly fees, and covered E&O — compared honestly.";

export const metadata: Metadata = {
  title: "Bear Team vs EXIT Realty — Honest Comparison for Orlando Agents",
  description: DESC,
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: { type: "article", url: `https://www.joinbearteam.com/blog/${SLUG}`, title: TITLE, description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

const FAQ = [
  {
    q: "What is EXIT Realty's commission split?",
    a: "EXIT franchise offices publicly advertise splits starting at a minimum of 70/30 with the potential to reach 90/10. EXIT is a franchise system, so the exact split path, caps, and fees are set by each local office — two EXIT offices in the same metro can have different terms, so always get the specific office's schedule in writing.",
  },
  {
    q: "What is the EXIT Formula (sponsoring residuals)?",
    a: "EXIT's signature program pays an agent a bonus equal to 10% of the gross commissions earned by each agent they sponsor into the company, paid by EXIT's corporate office rather than deducted from the recruit. EXIT also promotes reduced residuals that continue into retirement and to a beneficiary. Like all recruiting-based income, it pays meaningfully only if you actively sponsor producing agents.",
  },
  {
    q: "How is Bear Team's model different from EXIT's?",
    a: "Bear Team is a single boutique brokerage, not a franchise — one published fee schedule, no office-to-office variation, and no franchise economics in the background. The ladder runs 60/40 to 90/10 with a defined $16,000 company-dollar cap per tier, zero monthly fees, a flat $150 per closing, and E&O covered by the brokerage.",
  },
  {
    q: "Who should choose EXIT over Bear Team?",
    a: "Agents who value EXIT's sponsoring residuals and plan to actively recruit, or who have a specific EXIT office nearby with strong local leadership and terms they like, can do well there. Agents who want fully transparent, uniform terms with no franchise layer and the lowest fixed overhead tend to fit the boutique model better.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const ROWS: [string, string, string][] = [
  ["Commission split", "Starts at minimum 70/30, potential to 90/10 — terms set per franchise office", "60/40 graduating to 90/10 on a published ladder"],
  ["Cap", "Varies by franchise office — ask for it in writing", "$16,000 company dollar, then you advance a tier"],
  ["Monthly fees", "Vary by office; some advertise none", "$0 — uniform, published"],
  ["Per-transaction costs", "Set by each office", "$150 flat per closing"],
  ["E&O insurance", "Varies by office", "Covered by the brokerage"],
  ["Structure", "Franchise network — local owner sets terms", "Single boutique Orlando brokerage"],
  ["Recruiting income", "10% sponsoring residual paid by corporate, plus retirement/beneficiary residuals", "None — value is in the ladder and support"],
];

export default function Page() {
  return (
    <Shell>
      {articleSchema(SLUG, TITLE, DESC).map((o, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o) }} />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ArticleHead eyebrow="Brokerage comparisons" title={TITLE} read="7 min read" />
      <Body>
        <Lead>
          EXIT Realty built its brand on a genuinely original idea — sponsoring residuals that pay agents for growing
          the company. If an EXIT office is recruiting you in Orlando, here's the honest comparison, with one caveat
          that matters more at EXIT than anywhere else: it's a franchise, so the office you'd actually join sets the
          real numbers.
        </Lead>

        <H2>The franchise caveat, up front</H2>
        <P>
          EXIT corporate advertises splits starting at a minimum of 70/30 with a path to 90/10 — a genuinely
          competitive range. But each EXIT office is independently owned, and the split path, cap, monthly fees, and
          transaction fees are set locally. That's not a criticism; it's how franchising works. It just means the
          recruiting brochure isn't the contract. Whatever an EXIT recruiter tells you, get that office's complete
          fee schedule in writing — the same advice we give in our{" "}
          <Link href="/blog/questions-to-ask-before-joining-a-brokerage" style={{ color: "#2F5C8F", fontWeight: 700 }}>12 questions to ask any brokerage</Link>.
        </P>

        <H2>Side by side</H2>
        <UL>
          {ROWS.map(([label, exit, bt]) => (
            <li key={label}>
              <strong>{label}:</strong> EXIT — {exit}. Bear Team — {bt}.
            </li>
          ))}
        </UL>

        <H2>Where EXIT genuinely wins</H2>
        <P>
          The EXIT Formula is real and unusual: sponsor a producing agent and corporate pays you a bonus equal to 10%
          of their gross commissions — off the top, not out of the recruit's pocket — with reduced residuals that
          EXIT promotes as continuing into retirement and even to a beneficiary. For agents who love recruiting,
          that's a durable income stream few brands match. A 70/30 starting split also beats our 60/40 on day one,
          and a strong local EXIT office with good leadership is a perfectly good home.
        </P>

        <H2>Where Bear Team wins</H2>
        <P>
          Uniformity and floor costs. Bear Team has one published structure for every agent: the 60/40-to-90/10
          ladder with a defined $16,000 cap per tier, zero monthly fees, $150 flat per closing, and E&O covered — no
          franchise layer, no office-by-office variation, nothing to negotiate or discover later. If you're not
          planning to recruit, EXIT's residuals are worth close to zero to you, and the comparison becomes fee
          schedule versus fee schedule — which is exactly the comparison our{" "}
          <Link href="/no-fee-brokerage" style={{ color: "#2F5C8F", fontWeight: 700 }}>$0-fee structure</Link> is
          built to win. And the in-person support is the same story as everywhere: a boutique broker who knows your
          files versus whatever your particular franchise office staffs.
        </P>

        <H2>How to actually decide</H2>
        <P>
          Get the specific EXIT office's fee schedule in writing, then run your last 12 months through it and through
          Bear Team's ladder on the <Link href="/your-numbers" style={{ color: "#2F5C8F", fontWeight: 700 }}>calculator</Link>.
          The full Bear Team structure is on the{" "}
          <Link href="/commission-splits" style={{ color: "#2F5C8F", fontWeight: 700 }}>commission page</Link>, and if
          you decide to move — to us or anyone — the{" "}
          <Link href="/blog/how-to-switch-real-estate-brokerages-in-florida" style={{ color: "#2F5C8F", fontWeight: 700 }}>Florida switching guide</Link>{" "}
          makes it a two-week process, not an ordeal.
        </P>

        <H2>Frequently asked questions</H2>
        {FAQ.map((f) => (
          <div key={f.q}>
            <P><strong>{f.q}</strong></P>
            <P>{f.a}</P>
          </div>
        ))}

        <Note>
          EXIT figures are from EXIT's public materials and franchise career pages as of July 2026; because EXIT is a
          franchise system, actual terms are set by each office and vary — confirm with the specific office. Bear
          Team figures are our actual plan. EXIT Realty is a registered trademark of its owner; this independent
          comparison is not affiliated with or endorsed by EXIT Realty. Not financial advice.
        </Note>
      </Body>
      <CTA heading="Run both models on your production" sub="The EXIT office's fee sheet and Bear Team's ladder, side by side — then talk it through with Tom. No pressure, just the math." />
    </Shell>
  );
}
