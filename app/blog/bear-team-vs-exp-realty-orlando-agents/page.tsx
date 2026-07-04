import type { Metadata } from "next";
import Shell from "@/components/seo/Shell";
import { ArticleHead, Body, Lead, H2, P, UL, Note, CTA, articleSchema, Link } from "../ui";

const SLUG = "bear-team-vs-exp-realty-orlando-agents";
const TITLE = "Bear Team vs eXp Realty: an honest comparison for Orlando agents";
const DESC = "Same $16,000 cap, very different models. eXp's 80/20 split, $85/month fee, stock and revenue share versus Bear Team's graduating split, $0 monthly fees, and in-person Orlando support — compared honestly.";

export const metadata: Metadata = {
  title: "Bear Team vs eXp Realty — Honest Comparison for Orlando Agents",
  description: DESC,
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: { type: "article", url: `https://www.joinbearteam.com/blog/${SLUG}`, title: TITLE, description: DESC, images: [{ url: `/api/og?title=${encodeURIComponent(TITLE)}`, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: [`/api/og?title=${encodeURIComponent(TITLE)}`] },
};

const FAQ = [
  {
    q: "What is eXp Realty's commission split and cap?",
    a: "eXp agents keep 80% of each commission with 20% going to the brokerage until they've paid $16,000 in company dollar for their anniversary year. After capping, agents keep 100% minus a post-cap transaction fee (around $250 per deal, reducing after $5,000 paid). Public sources also list an $85 monthly technology fee and a $25 per-transaction broker review fee.",
  },
  {
    q: "How is Bear Team's model different from eXp's?",
    a: "Both cap company dollar at $16,000, but the shape differs. eXp is a flat 80/20 with a monthly fee, fully virtual. Bear Team starts at 60/40 and graduates to 90/10 as you produce, charges zero monthly fees and a flat $150 per closing, covers E&O, and operates as a boutique Orlando office with in-person broker access, training, and leads.",
  },
  {
    q: "Who nets more — an agent at eXp or Bear Team?",
    a: "Early in the ladder eXp's 80/20 keeps more per deal; Bear Team's model spends that difference on support — training, leads, mentorship, and covered E&O — and eliminates the roughly $1,020 a year in monthly fees. Which nets more depends on your volume and how much the support grows your production. Run your own last 12 months through both structures before deciding.",
  },
  {
    q: "Is eXp's revenue share worth it?",
    a: "Revenue share pays you from eXp's company dollar when agents you sponsor close deals. It's real income for agents who actively recruit and build a downline — and close to zero for agents who don't. If you have no interest in recruiting, weigh the two brokerages on splits, fees, and support alone.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const ROWS: [string, string, string][] = [
  ["Commission split", "80/20 flat, every agent", "60/40 graduating to 90/10"],
  ["Company-dollar cap", "$16,000 (anniversary year)", "$16,000 (then you advance a tier)"],
  ["Monthly fees", "$85/month technology fee", "$0 — no desk, tech, or monthly fees"],
  ["Per-transaction costs", "$25 broker review; ~$250/deal after capping", "$150 flat per closing"],
  ["E&O insurance", "Agent-paid fees apply", "Covered by the brokerage"],
  ["Office & support", "Fully virtual (eXp World)", "Boutique Orlando office, in-person broker & training"],
  ["Equity / passive income", "EXPI stock awards + 5-tier revenue share", "None — the value is in the split ladder and support"],
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
          eXp Realty is one of the largest brokerages in the world, and if you're an Orlando agent, someone has
          probably tried to recruit you there. It's a legitimately strong model — and it's built for a specific kind
          of agent. Here's the honest side-by-side, using eXp's publicly documented numbers, so you can decide which
          kind you are.
        </Lead>

        <H2>The strange coincidence: both caps are $16,000</H2>
        <P>
          eXp agents pay 20% of every commission until they've contributed $16,000 in an anniversary year, then keep
          100% minus a post-cap fee. Bear Team agents pay company dollar until they've contributed $16,000, then
          advance to the next tier of the ladder — 60/40 to 70/30 to 80/20 to 90/10. The ceiling on what the
          brokerage collects is the same number. What's different is everything around it.
        </P>

        <H2>Side by side</H2>
        <UL>
          {ROWS.map(([label, exp, bt]) => (
            <li key={label}>
              <strong>{label}:</strong> eXp — {exp}. Bear Team — {bt}.
            </li>
          ))}
        </UL>

        <H2>Where eXp genuinely wins</H2>
        <P>
          Honesty first: eXp's flat 80/20 beats Bear Team's starting 60/40 on a per-deal basis early in the ladder.
          If you're a high-volume, fully self-sufficient agent — your own lead flow, your own systems, no need for an
          office or hands-on broker support — eXp's math is strong, and the stock awards and five-tier revenue share
          add upside no boutique can offer. Agents who love recruiting can build real passive income there. If that's
          you, eXp deserves your consideration.
        </P>

        <H2>Where the eXp math gets quieter</H2>
        <P>
          The $85 monthly technology fee is $1,020 a year, owed in the months you close nothing. The $25 broker
          review fee rides on every transaction, and after you cap, roughly $250 per deal keeps coming off the top.
          None of that is hidden — eXp is transparent about it — but the recruiting pitch leads with "80/20 and
          stock," not with the fixed overhead. As our <Link href="/blog/real-estate-brokerage-fees-explained" style={{ color: "#2F5C8F", fontWeight: 700 }}>fee guide</Link>{" "}
          shows, fixed costs hit hardest at moderate production — which is exactly where most Orlando agents live.
        </P>

        <H2>The support question nobody puts in a spreadsheet</H2>
        <P>
          eXp is fully virtual. Training happens in eXp World — extensive, but on a screen, and even reviewers who
          like the model note that new and mid-production agents can find it isolating. Bear Team is the opposite
          bet: a boutique Orlando office where the broker knows your files, training is in person through BearTeam
          Academy, leads are part of the deal, and E&O is covered rather than billed back. Our starting split is
          lower <em>because</em> that support costs money. The question isn't which model is cheaper on deal one —
          it's which one has you closing more deals by this time next year. Agents producing 3–20 deals a year
          usually grow faster with real support; agents at 50 deals usually don't need it.
        </P>

        <H2>Revenue share and stock, honestly</H2>
        <P>
          eXp's revenue share pays from company dollar when agents you sponsor close deals, five tiers deep, and
          EXPI stock awards land at milestones like your first closing and capping. For builders, it's real. But it
          only pays if you actively recruit, and stock value carries market risk. If you'd rather sell homes than
          build a downline, value those programs at close to zero and compare the brokerages on splits, fees, and
          support — the things that pay you on every closing either way.
        </P>

        <H2>How to actually decide</H2>
        <P>
          Take your last 12 months of production and run it through both structures — eXp's 80/20 with the monthly
          and per-deal fees, and Bear Team's ladder with $0 monthly and $150 per closing. The{" "}
          <Link href="/your-numbers" style={{ color: "#2F5C8F", fontWeight: 700 }}>calculator</Link> does the Bear
          Team side in five minutes, and the full split structure is on the{" "}
          <Link href="/commission-splits" style={{ color: "#2F5C8F", fontWeight: 700 }}>commission page</Link>. If
          you're mid-move, our <Link href="/blog/how-to-switch-real-estate-brokerages-in-florida" style={{ color: "#2F5C8F", fontWeight: 700 }}>Florida switching guide</Link>{" "}
          covers the mechanics step by step.
        </P>

        <H2>Frequently asked questions</H2>
        {FAQ.map((f) => (
          <div key={f.q}>
            <P><strong>{f.q}</strong></P>
            <P>{f.a}</P>
          </div>
        ))}

        <Note>
          eXp figures are from public sources (exprealty.com and independent brokerage guides) as of July 2026 and
          can change — confirm current terms with eXp directly. Bear Team figures are our actual plan. eXp Realty is
          a registered trademark of its owner; this independent comparison is not affiliated with or endorsed by eXp.
          Not financial advice.
        </Note>
      </Body>
      <CTA heading="Run both models on your production" sub="Your last 12 months through eXp's structure and Bear Team's ladder, side by side — then talk it through with Tom. No pressure, just the math." />
    </Shell>
  );
}
