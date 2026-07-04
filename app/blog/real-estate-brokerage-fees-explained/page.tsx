import type { Metadata } from "next";
import Shell from "@/components/seo/Shell";
import { ArticleHead, Body, Lead, H2, P, UL, Note, CTA, articleSchema, Link } from "../ui";

const SLUG = "real-estate-brokerage-fees-explained";
const TITLE = "Real estate brokerage fees explained: desk, tech, royalty & E&O";
const DESC = "A plain-English guide to real estate brokerage fees — desk fees, technology fees, royalty/franchise fees, transaction fees, caps, and E&O — and which ones quietly eat your income.";

export const metadata: Metadata = {
  title: "Real Estate Brokerage Fees Explained (Desk, Tech, Royalty, E&O)",
  description: DESC,
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: { type: "article", url: `https://www.joinbearteam.com/blog/${SLUG}`, title: TITLE, description: DESC, images: [{ url: `/api/og?title=${encodeURIComponent(TITLE)}`, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: [`/api/og?title=${encodeURIComponent(TITLE)}`] },
};

export default function Page() {
  return (
    <Shell>
      {articleSchema(SLUG, TITLE, DESC).map((o, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o) }} />
      ))}
      <ArticleHead eyebrow="Brokerage costs" title={TITLE} read="5 min read" />
      <Body>
        <Lead>Two brokerages can advertise the same commission split and leave you with completely different take-home — because the split is only one line on the bill. Here are the fees agents actually pay, and how to compare them honestly.</Lead>

        <H2>The split (company dollar)</H2>
        <P>Your split is the share of each commission the brokerage keeps — the 30 in a 70/30, for example. Some brokerages keep this flat forever; others use a <Link href="/commission-splits" style={{ color: "#2F5C8F", fontWeight: 700 }}>graduating split</Link> that improves as you produce. The portion the brokerage collects is often called "company dollar."</P>

        <H2>Monthly desk &amp; technology fees</H2>
        <P>Desk fees and technology fees are flat monthly charges for your spot and the brokerage's tools. The catch: they're due <em>whether or not you close a deal that month</em>. At $100–$300+ a month, they're a fixed drag that hits hardest in slow seasons and for agents doing a moderate number of deals.</P>

        <H2>Royalty / franchise fees</H2>
        <P>National franchises often add a royalty fee — a percentage of your commission that goes to the brand on top of your split. It's easy to miss because it's bundled into the commission math rather than billed separately.</P>

        <H2>Per-transaction fees</H2>
        <P>Many brokerages charge a flat fee per closing for processing and compliance. This one is at least predictable — it only applies when you actually get paid. At Bear Team this is a flat <strong>$150 per closing</strong>, with no monthly fees attached.</P>

        <H2>E&amp;O insurance</H2>
        <P>Errors &amp; omissions insurance protects you and the brokerage if a transaction goes sideways. Some brokerages bill it to the agent per file; others cover it. It's worth asking directly, because per-file E&amp;O charges add up across a busy year.</P>

        <H2>The cap</H2>
        <P>A cap limits how much company dollar the brokerage collects before your split improves. A clear, reachable cap is good; a cap you'll never hit at your volume is just marketing. Ask what the cap is and how many deals it typically takes to reach it.</P>

        <H2>How to compare brokerages honestly</H2>
        <UL>
          <li>Add up the <strong>fixed</strong> costs first — monthly desk + tech + franchise fees × 12. That's what you pay before you sell anything.</li>
          <li>Then layer in the split and per-transaction fees on your real number of deals.</li>
          <li>Confirm who pays E&amp;O.</li>
          <li>Compare total cost, not the headline split.</li>
        </UL>
        <P>For most agents doing 3–20 deals a year, eliminating monthly fees often matters more than a slightly better split. See how a <Link href="/no-fee-brokerage" style={{ color: "#2F5C8F", fontWeight: 700 }}>$0-monthly-fee structure</Link> compares, read <Link href="/blog/100-commission-brokerage-orlando-real-math" style={{ color: "#2F5C8F", fontWeight: 700 }}>the real math on 100% commission models</Link>, or run the numbers on the <Link href="/your-numbers" style={{ color: "#2F5C8F", fontWeight: 700 }}>calculator</Link>.</P>

        <Note>Fee ranges here are general market figures and vary by brokerage. Always confirm current terms in writing before you sign.</Note>
      </Body>
      <CTA heading="Add up what fees are costing you." sub="Compare your current monthly fees and split against Bear Team's $0/month and flat $150/close." />
    </Shell>
  );
}
