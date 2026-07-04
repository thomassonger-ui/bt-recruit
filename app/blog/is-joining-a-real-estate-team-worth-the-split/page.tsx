import type { Metadata } from "next";
import Shell from "@/components/seo/Shell";
import { ArticleHead, Body, Lead, H2, P, UL, Note, CTA, articleSchema, Link } from "../ui";

const SLUG = "is-joining-a-real-estate-team-worth-the-split";
const TITLE = "Is joining a real estate team worth the split? The honest math";
const DESC = "Teams take 30–50% of your commission and hand you leads, systems, and mentorship. When that trade wins, when it doesn't, and the worked math at 6, 12, and 24 deals.";

export const metadata: Metadata = {
  title: "Is Joining a Real Estate Team Worth the Split? The Honest Math",
  description: DESC,
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: { type: "article", url: `https://www.joinbearteam.com/blog/${SLUG}`, title: TITLE, description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

const FAQ = [
  {
    q: "What is a typical real estate team split?",
    a: "Team splits commonly run 50/50 on team-provided leads and 60/40 to 70/30 on business the agent self-generates, on top of (or inclusive of) the brokerage's split. Structures vary widely — always establish which deals count as team leads and what happens to your sphere business.",
  },
  {
    q: "When is a team worth 50% of your commission?",
    a: "When the team delivers deals you would not have closed alone. Half of a closing you'd never have had is infinitely better than all of a closing that never happened. The trade stops making sense when your own pipeline is producing most of your business and the team share applies to deals you generated yourself.",
  },
  {
    q: "What's the difference between a team and a supportive boutique brokerage?",
    a: "A team typically takes a large split in exchange for leads and systems inside someone else's business. A supportive boutique brokerage — Bear Team's model — provides leads, training, and mentorship at the brokerage level while you build your own business, on a split ladder that improves with production rather than a permanent team share.",
  },
  {
    q: "Should a new agent join a team?",
    a: "Often yes, for the first year or two — the daily accountability and deal flow compress the learning curve. The key is joining with an exit understanding: know what happens to your pipeline and sphere when you go independent, and avoid teams whose agreements claim your contacts forever.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function Page() {
  return (
    <Shell>
      {articleSchema(SLUG, TITLE, DESC).map((o, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o) }} />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ArticleHead eyebrow="Teams & splits" title={TITLE} read="7 min read" />
      <Body>
        <Lead>
          "Is a team worth the split?" is really three questions wearing one coat: where do your deals come from, what
          would you close without the team, and what does the agreement say about leaving? Answer those and the math
          answers itself. Here it is honestly — including the cases where the team wins.
        </Lead>

        <H2>The trade, stated plainly</H2>
        <P>
          A team hands you leads, systems, listings coverage, and daily accountability. In exchange it keeps a large
          share — commonly 50% on team-provided leads, often 60/40 or 70/30 on your self-generated business, layered
          with whatever the brokerage takes. You're trading margin for volume and mentorship. Sometimes that's the
          best deal in real estate. Sometimes it's a tax on business that was already yours.
        </P>

        <H2>The math at three production levels</H2>
        <UL>
          <li>
            <strong>6 deals, mostly team leads:</strong> Say $54,000 GCI. Keeping ~50% nets around $27,000 — but the
            honest comparison isn't 100% of $54,000, it's 100% of the one or two deals you'd have closed alone. The
            team wins this level, usually decisively.
          </li>
          <li>
            <strong>12 deals, half self-generated:</strong> Now the question sharpens. You're paying team share on six
            deals the team sourced (fair) and on six deals from your own sphere (worth questioning). This is the level
            where agents start doing spreadsheets at midnight — and where the structure of the agreement matters more
            than the headline split.
          </li>
          <li>
            <strong>24 deals, mostly self-generated:</strong> A 50% share of a $200,000+ GCI business is a six-figure
            price for systems you could now rent or build. Producers at this level either renegotiate to a small flat
            override, take a leadership share of the team, or go independent.
          </li>
        </UL>

        <H2>What decides it isn't the split — it's three clauses</H2>
        <P>
          First: <strong>which deals count.</strong> If your childhood friend buys a house, does the team share apply?
          Second: <strong>what happens when you leave.</strong> Some agreements claim your pipeline and even your
          sphere contacts. Third: <strong>what the team actually delivers monthly</strong> — leads passed, not leads
          promised. Get all three in writing before the split percentage even enters the conversation. Our{" "}
          <Link href="/blog/questions-to-ask-before-joining-a-brokerage" style={{ color: "#2F5C8F", fontWeight: 700 }}>12 questions</Link>{" "}
          apply to teams double.
        </P>

        <H2>The third option nobody mentions</H2>
        <P>
          The team-versus-solo framing skips the middle path: a brokerage that provides leads, training, and real
          mentorship at the <em>brokerage</em> level, without a permanent team share on top. That's Bear Team's
          model — company leads through a visible pipeline system, free training through BearTeam Academy, an
          in-person broker, and a split that <Link href="/commission-splits" style={{ color: "#2F5C8F", fontWeight: 700 }}>graduates from 60/40 to 90/10</Link>{" "}
          as you produce, with <Link href="/no-fee-brokerage" style={{ color: "#2F5C8F", fontWeight: 700 }}>zero monthly fees</Link>{" "}
          and $150 flat per closing. You get most of what a team provides, and your split improves with production
          instead of staying parked at 50/50 forever.
        </P>

        <H2>How to actually decide</H2>
        <P>
          List your last 12 months of closings and mark each one: would I have had this deal without the team (or
          could a supported brokerage have gotten me there)? Run the totals through the{" "}
          <Link href="/your-numbers" style={{ color: "#2F5C8F", fontWeight: 700 }}>calculator</Link> under each
          structure. If the team share applies mostly to deals the team sourced, stay and say thank you. If it
          applies mostly to deals you sourced, it's time for a renegotiation — or a look at the{" "}
          <Link href="/blog/how-to-switch-real-estate-brokerages-in-florida" style={{ color: "#2F5C8F", fontWeight: 700 }}>switching guide</Link>.
        </P>

        <H2>Frequently asked questions</H2>
        {FAQ.map((f) => (
          <div key={f.q}>
            <P><strong>{f.q}</strong></P>
            <P>{f.a}</P>
          </div>
        ))}

        <Note>
          Team structures vary enormously; figures above are common market structures for illustration, not any
          specific team's terms. Review any team agreement carefully — ideally with counsel — before signing. Not
          legal or financial advice.
        </Note>
      </Body>
      <CTA heading="Run the team math on your production" sub="Your actual deals under a team split versus Bear Team's ladder — five minutes, then talk it through with Tom. No pressure, just the math." />
    </Shell>
  );
}
