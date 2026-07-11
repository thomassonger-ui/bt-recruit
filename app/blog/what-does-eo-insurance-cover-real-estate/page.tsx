import type { Metadata } from "next";
import Shell from "@/components/seo/Shell";
import { ArticleHead, Body, Lead, H2, P, UL, Note, CTA, articleSchema, Link } from "../ui";

const SLUG = "what-does-eo-insurance-cover-real-estate";
const TITLE = "What does E&O insurance cover for real estate agents?";
const DESC = "Errors & omissions insurance protects real estate agents when a deal goes wrong. Here's what E&O covers, what it doesn't, and why who pays for it matters to your bottom line.";

export const metadata: Metadata = {
  title: "What Does E&O Insurance Cover for Real Estate Agents?",
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
      <ArticleHead eyebrow="Agent protection" title={TITLE} read="4 min read" />
      <Body>
        <Lead>Errors &amp; omissions (E&amp;O) insurance is the safety net that protects real estate professionals when a client claims a mistake cost them money. Most agents never think about it — until they need it.</Lead>

        <H2>What E&amp;O typically covers</H2>
        <UL>
          <li><strong>Negligence claims</strong> — allegations that you failed to exercise reasonable care in a transaction.</li>
          <li><strong>Misrepresentation</strong> — a buyer or seller claims you provided inaccurate information.</li>
          <li><strong>Failure to disclose</strong> — disputes over property condition or material facts.</li>
          <li><strong>Paperwork and process errors</strong> — mistakes in contracts, deadlines, or documentation.</li>
          <li><strong>Legal defense costs</strong> — E&amp;O often pays for your defense even when a claim is unfounded, which can be the most valuable part.</li>
        </UL>

        <H2>What E&amp;O usually does NOT cover</H2>
        <UL>
          <li>Intentional wrongdoing or fraud.</li>
          <li>Criminal acts.</li>
          <li>Discrimination or fair-housing violations (often excluded or handled separately).</li>
          <li>Claims outside your licensed real estate activities.</li>
        </UL>
        <P>Policies vary, so the exact coverage and exclusions depend on your brokerage's plan. The takeaway: E&amp;O protects you from honest mistakes, not from cutting corners.</P>

        <H2>Why who pays for it matters</H2>
        <P>Some brokerages bill E&amp;O to the agent — a monthly charge or a per-transaction fee on every closing. Across a busy year, that adds up. Others cover it as part of the brokerage. At Bear Team, E&amp;O is covered by the brokerage, not deducted from your commission per file (here's the full <Link href="/no-fee-brokerage" style={{ color: "#2F5C8F", fontWeight: 700 }}>fee picture</Link>). Per-file E&amp;O charges are also a hidden cost of many <Link href="/blog/100-commission-brokerage-orlando-real-math" style={{ color: "#2F5C8F", fontWeight: 700 }}>100% commission models</Link>.</P>

        <Note>This is a general overview, not insurance or legal advice. Coverage, limits, and exclusions differ by policy — review your brokerage's specific E&amp;O coverage.</Note>
        <Note>E&amp;O insurance is provided under Bear Team Real Estate&apos;s office policy. Agents specializing in commercial or vacant-land transactions are required to carry individual E&amp;O coverage for those transactions. Coverage is subject to policy terms, limits, and exclusions.</Note>
      </Body>
      <CTA heading="Want a brokerage that covers E&O?" sub="See exactly what Bear Team covers — and what it doesn't charge you for." />
    </Shell>
  );
}
