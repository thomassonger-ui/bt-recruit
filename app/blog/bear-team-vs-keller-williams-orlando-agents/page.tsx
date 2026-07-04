import type { Metadata } from "next";
import Shell from "@/components/seo/Shell";
import { ArticleHead, Body, Lead, H2, P, UL, Note, CTA, articleSchema, Link } from "../ui";

const SLUG = "bear-team-vs-keller-williams-orlando-agents";
const TITLE = "Bear Team vs Keller Williams: an honest comparison for Orlando agents";
const DESC = "KW's 64/36 split, $22K–$35K cap, and 6% franchise royalty versus Bear Team's 60/40-to-90/10 ladder, $16,000 cap, and $0 monthly fees — compared honestly for Orlando agents.";

export const metadata: Metadata = {
  title: "Bear Team vs Keller Williams — Honest Comparison for Orlando Agents",
  description: DESC,
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: { type: "article", url: `https://www.joinbearteam.com/blog/${SLUG}`, title: TITLE, description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

const FAQ = [
  {
    q: "What is Keller Williams' commission split and cap?",
    a: "KW agents keep 64% of each commission, with 36% going to their market center until they hit an annual cap — typically $22,000 to $35,000, set by each market center. After capping, agents keep 100% minus KW's 6% franchise royalty, which is capped around $3,000 per year and applies whether or not you've capped. Public guides also list a $50–$80 monthly technology fee and agent-paid E&O.",
  },
  {
    q: "How is Bear Team's model different from Keller Williams'?",
    a: "Bear Team's ladder starts at 60/40 — close to KW's 64/36 — but the cap is $16,000, roughly half to a third of a typical KW cap, and there's no franchise royalty layered on top. Bear Team charges zero monthly fees, a flat $150 per closing, and covers E&O. As you produce, the split graduates to 70/30, 80/20, then 90/10.",
  },
  {
    q: "Is Keller Williams' profit share the same as revenue share?",
    a: "Similar idea, different funding. KW distributes a portion of each market center's monthly profit to agents who recruited producing agents, seven levels deep. It's real income for active recruiters, but most agents earn little from it because they don't recruit. If you don't plan to build a downline, compare the brokerages on splits, caps, and fees alone.",
  },
  {
    q: "Who should choose KW over a boutique like Bear Team?",
    a: "Agents who want a large-office environment — big training classes, structured programs like Ignite, and the energy of a hundred-agent market center — get real value at KW. Agents who want the ceiling on brokerage costs as low as possible, no monthly overhead, and a broker who knows their files personally tend to fit the boutique model better.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const ROWS: [string, string, string][] = [
  ["Commission split", "64/36 flat until cap", "60/40 graduating to 90/10"],
  ["Company-dollar cap", "$22,000–$35,000, set by market center", "$16,000, then you advance a tier"],
  ["Franchise royalty", "6% per deal, capped ~$3,000/yr — survives capping", "None"],
  ["Monthly fees", "$50–$80/month technology fee", "$0 — no desk, tech, or monthly fees"],
  ["Per-transaction costs", "Royalty + market-center fees", "$150 flat per closing"],
  ["E&O insurance", "Billed to the agent", "Covered by the brokerage"],
  ["Recruiting income", "Profit share, 7 levels", "None — value is in the ladder and support"],
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
          Keller Williams is the biggest name in agent count in American real estate, and its Orlando market centers
          recruit constantly. The KW model has real strengths — and a fee structure with more layers than the pitch
          usually mentions. Here's the honest side-by-side, using publicly documented numbers.
        </Lead>

        <H2>The splits are close. The caps are not.</H2>
        <P>
          KW's 64/36 and Bear Team's starting 60/40 are nearly the same handshake. The difference is what it takes to
          stop paying. A typical KW market center caps company dollar somewhere between $22,000 and $35,000 a year —
          each office sets its own number, so always ask for it in writing. Bear Team's cap is $16,000, and instead of
          resetting you to the same split next year, hitting it advances you up the ladder toward 90/10.
        </P>

        <H2>Side by side</H2>
        <UL>
          {ROWS.map(([label, kw, bt]) => (
            <li key={label}>
              <strong>{label}:</strong> KW — {kw}. Bear Team — {bt}.
            </li>
          ))}
        </UL>

        <H2>The royalty nobody mentions at the recruiting lunch</H2>
        <P>
          KW corporate takes a 6% franchise royalty on every transaction, capped around $3,000 a year — and it keeps
          coming <em>after</em> you cap. So "100% after cap" at KW is really 100% minus the royalty until that's paid
          too. Add the $50–$80 monthly technology fee and agent-billed E&O, and independent guides put a KW agent's
          fixed overhead at roughly $100–$300 a month before closing anything. Bear Team has no royalty, no monthly
          fees, and E&O is covered — the complete fee schedule is{" "}
          <Link href="/no-fee-brokerage" style={{ color: "#2F5C8F", fontWeight: 700 }}>$150 flat per closing</Link>.
        </P>

        <H2>Where KW genuinely wins</H2>
        <P>
          Credit where due: KW's training infrastructure is the best-known in the industry. Ignite for new agents,
          MAPS coaching, big market centers with classes running constantly — for a brand-new agent who wants
          structure and a crowd, that environment works. The profit share program is real money for agents who love
          recruiting and stay long enough to build seven levels. And a big brand on the sign matters to some sellers.
          If those are your priorities, KW earns its 36%.
        </P>

        <H2>Where the boutique math wins</H2>
        <P>
          Training doesn't have to come with a $25,000+ cap and a royalty. BearTeam Academy is free, the broker
          reviewing your contracts knows your name, and the money you'd spend on KW's overhead stays in your pocket
          during slow months. For Orlando agents producing 3–20 deals a year — the agents least likely to ever touch
          a $30,000 cap — the lower ceiling and zero fixed costs usually net out ahead. Our{" "}
          <Link href="/blog/how-much-do-orlando-real-estate-agents-make" style={{ color: "#2F5C8F", fontWeight: 700 }}>Orlando income breakdown</Link>{" "}
          shows how fixed fees eat a mid-production year.
        </P>

        <H2>How to actually decide</H2>
        <P>
          Get your market center's exact cap and fee sheet in writing, then run your last 12 months through both
          structures — the <Link href="/your-numbers" style={{ color: "#2F5C8F", fontWeight: 700 }}>calculator</Link>{" "}
          handles the Bear Team side, and the full ladder is on the{" "}
          <Link href="/commission-splits" style={{ color: "#2F5C8F", fontWeight: 700 }}>commission page</Link>. Already
          decided to move? The{" "}
          <Link href="/blog/how-to-switch-real-estate-brokerages-in-florida" style={{ color: "#2F5C8F", fontWeight: 700 }}>Florida switching guide</Link>{" "}
          walks through every step, and comparing against a flat-fee shop too? Read{" "}
          <Link href="/blog/100-commission-brokerage-orlando-real-math" style={{ color: "#2F5C8F", fontWeight: 700 }}>the 100% commission math</Link>.
        </P>

        <H2>Frequently asked questions</H2>
        {FAQ.map((f) => (
          <div key={f.q}>
            <P><strong>{f.q}</strong></P>
            <P>{f.a}</P>
          </div>
        ))}

        <Note>
          KW figures are from public sources and independent brokerage guides as of July 2026; caps and fees are set
          by individual market centers and change — confirm current terms with the market center directly. Bear Team
          figures are our actual plan. Keller Williams is a registered trademark of its owner; this independent
          comparison is not affiliated with or endorsed by Keller Williams. Not financial advice.
        </Note>
      </Body>
      <CTA heading="Run both models on your production" sub="Your last 12 months through KW's structure and Bear Team's ladder, side by side — then talk it through with Tom. No pressure, just the math." />
    </Shell>
  );
}
