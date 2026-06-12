import type { Metadata } from "next";
import Shell from "@/components/seo/Shell";
import { ArticleHead, Body, Lead, H2, P, Note, CTA, articleSchema, Link } from "../ui";

const SLUG = "best-time-to-switch-real-estate-brokerages";
const TITLE = "When is the best time to switch real estate brokerages?";
const DESC = "There's no perfect date to change brokerages — but there is a smart way to time it around your pipeline, your cap, and your contract. Here's how to decide.";

export const metadata: Metadata = {
  title: "When Is the Best Time to Switch Real Estate Brokerages?",
  description: DESC,
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: { type: "article", url: `https://www.joinbearteam.com/blog/${SLUG}`, title: TITLE, description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function Page() {
  return (
    <Shell>
      {articleSchema(SLUG, TITLE, DESC).map((o, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o) }} />
      ))}
      <ArticleHead eyebrow="Switching brokerages" title={TITLE} read="5 min read" />
      <Body>
        <Lead>Agents wait far too long to switch because they're waiting for a "perfect" moment that never comes. There isn't one — but there are a handful of factors that tell you when a move is smart and clean instead of disruptive.</Lead>

        <H2>Look at your pipeline first</H2>
        <P>The biggest consideration is your pending and active deals. Pending transactions typically close under the brokerage where they started, so many agents time a move for a lull between closings or once a cluster of deals has funded. You don't have to wait until you're at zero — just plan around what's in flight.</P>

        <H2>Mind your cap and anniversary</H2>
        <P>If your current brokerage has a cap that resets on your anniversary, switching right after you've paid a full year of company dollar means you'd start over twice. Check where you are in that cycle. A graduating model with a single, clear cap — like Bear Team's — avoids that reset trap entirely (here's <Link href="/commission-splits" style={{ color: "#2F5C8F", fontWeight: 700 }}>how the splits and cap work</Link>).</P>

        <H2>Read your agreement</H2>
        <P>Your independent-contractor agreement may specify notice periods or how fees and pending files are handled when you leave. Knowing those terms tells you the cleanest exit window.</P>

        <H2>Don't over-index on "the season"</H2>
        <P>Agents tell themselves they'll switch "after the spring market" or "after the holidays." Meanwhile they pay monthly fees and a worse split the entire time. If the math clearly favors a move, the cost of waiting is real money. Run the comparison on the <Link href="/your-numbers" style={{ color: "#2F5C8F", fontWeight: 700 }}>calculator</Link> and see what staying actually costs.</P>

        <H2>The honest answer</H2>
        <P>The best time to switch is when the math and the support clearly favor it, your pipeline is in a manageable spot, and you've checked your cap and contract. Once those line up, moving is straightforward — see the step-by-step <Link href="/switch-brokerages-florida" style={{ color: "#2F5C8F", fontWeight: 700 }}>Florida switching guide</Link>.</P>

        <Note>General guidance only, not legal advice. Review your brokerage agreement and confirm Florida transfer steps with the DBPR.</Note>
      </Body>
      <CTA heading="Wondering if now's the time?" sub="Run your numbers, then talk it through with Tom — no pressure, just the math." />
    </Shell>
  );
}
