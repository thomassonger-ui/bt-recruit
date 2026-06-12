import type { Metadata } from "next";
import Shell from "@/components/seo/Shell";
import { ArticleHead, Body, Lead, H2, P, UL, Note, CTA, articleSchema, Link } from "../ui";

const SLUG = "how-much-do-orlando-real-estate-agents-make";
const TITLE = "How much do real estate agents make in Orlando?";
const DESC = "The honest math behind an Orlando real estate agent's income — how deals, sale price, commission rate, your split, and brokerage fees decide what you actually take home.";

export const metadata: Metadata = {
  title: "How Much Do Real Estate Agents Make in Orlando? (The Real Math)",
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
      <ArticleHead eyebrow="Agent income" title={TITLE} read="6 min read" />
      <Body>
        <Lead>There's no single salary for a real estate agent in Orlando — your income is a formula, not a paycheck. Once you understand the four levers that drive it, you can estimate your own number and see exactly where money leaks out.</Lead>

        <H2>The formula every agent should know</H2>
        <P>Your gross commission income (GCI) comes from three things: how many homes you close, the average sale price, and your commission rate per side. Then your <em>take-home</em> is what's left after your brokerage split and your fees.</P>
        <P><strong>GCI = closings × average price × commission rate.</strong> Take-home = GCI − (the share your brokerage keeps) − (monthly and per-transaction fees).</P>

        <H2>A worked example</H2>
        <P>Say you close 8 homes a year at a $415,000 average, earning 3% per side. That's 8 × $415,000 × 3% = <strong>$99,600 in GCI</strong>. What you keep depends entirely on your brokerage's split and fees:</P>
        <UL>
          <li>On a 70/30 split you'd give up about $29,880 of that GCI to the brokerage.</li>
          <li>If you also pay $100/month in desk and tech fees, that's another $1,200 a year — whether you close or not.</li>
          <li>Add per-transaction fees and E&amp;O charges and the gap widens.</li>
        </UL>
        <P>The same 8 deals can net wildly different take-home depending on the brokerage. That's why "what's the commission split?" is only half the question — the other half is "what are the fees?"</P>

        <H2>The four levers you actually control</H2>
        <UL>
          <li><strong>Volume.</strong> More closings is the biggest lever — and the one a system, training, and follow-up help most.</li>
          <li><strong>Price point.</strong> Working a higher average price raises GCI per deal.</li>
          <li><strong>Your split.</strong> A flat split caps you; a <Link href="/commission-splits" style={{ color: "#2F5C8F", fontWeight: 700 }}>graduating split</Link> pays you more as you produce.</li>
          <li><strong>Fees.</strong> Monthly fees are pure drag — they hit in slow months too. A <Link href="/no-fee-brokerage" style={{ color: "#2F5C8F", fontWeight: 700 }}>no-monthly-fee brokerage</Link> changes the math.</li>
        </UL>

        <H2>How to estimate your Orlando number</H2>
        <P>Plug your own deals, price, and rate into the formula above, then subtract your current split and fees. Want it done for you? The <Link href="/your-numbers" style={{ color: "#2F5C8F", fontWeight: 700 }}>take-home calculator</Link> compares what your current brokerage keeps against Bear Team's $0 monthly fees and flat $150 per closing — and Scout can run your exact split across the tiers.</P>

        <Note>These figures are illustrations to show how the math works, not guarantees of income. Your actual results depend on your market activity, pricing, and the agreements you sign.</Note>
      </Body>
      <CTA heading="See what you'd net in Orlando." sub="Run your real take-home in about a minute — your deals, your numbers." />
    </Shell>
  );
}
