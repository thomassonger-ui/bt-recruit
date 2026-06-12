import type { Metadata } from "next";
import Shell from "@/components/seo/Shell";
import { ArticleHead, Body, Lead, H2, P, Note, CTA, articleSchema, Link } from "../ui";

const SLUG = "how-to-become-a-real-estate-agent-in-florida";
const TITLE = "How to become a real estate agent in Florida";
const DESC = "The full path to your Florida real estate license: the pre-license course, the state exam, fingerprints and application, and finding a sponsoring broker to activate your license.";

export const metadata: Metadata = {
  title: "How to Become a Real Estate Agent in Florida (Step by Step)",
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
      <ArticleHead eyebrow="Getting licensed" title={TITLE} read="6 min read" />
      <Body>
        <Lead>Getting your Florida real estate license is a clear, five-step process. None of it is hard — it just takes following the steps in order. Here's the whole path, from your first course to your first day with a brokerage.</Lead>

        <H2>1. Complete the pre-license course</H2>
        <P>Florida requires a state-approved 63-hour pre-license course for sales associates. You can take it online or in a classroom. The course ends with a school exam you must pass before you're eligible to sit for the state exam. Choose a reputable, Florida-approved provider.</P>

        <H2>2. Submit your application and fingerprints</H2>
        <P>Apply for the sales associate license through the Florida Department of Business and Professional Regulation (DBPR) and get your fingerprints taken at an approved Livescan provider for the background check. Do this early — the background results can take a little time to process.</P>

        <H2>3. Pass the Florida state exam</H2>
        <P>Once you're approved, schedule the state exam through the testing vendor. It covers national real estate principles plus Florida-specific law and practice. Study the math and the state law sections especially — those trip up the most candidates. If you don't pass the first time, you can retake it.</P>

        <H2>4. Find a sponsoring broker</H2>
        <P>In Florida a new license is inactive until it's placed with a sponsoring broker. This is the most important decision of your early career — your broker shapes your training, your splits, your fees, and your support. Compare carefully (here are <Link href="/blog/questions-to-ask-before-joining-a-brokerage" style={{ color: "#2F5C8F", fontWeight: 700 }}>12 questions to ask</Link> before you choose).</P>

        <H2>5. Activate your license and start</H2>
        <P>Your broker activates your license under their brokerage, and you're official. From there, your first 90 days matter most — which is why a <Link href="/new-agents" style={{ color: "#2F5C8F", fontWeight: 700 }}>brokerage built for new agents</Link>, with real training and a structured plan, makes the difference between ramping up and floundering.</P>

        <H2>What it costs</H2>
        <P>Budget for the course, the exam fee, the application fee, and fingerprinting. Then factor ongoing costs once you're active — MLS and association dues, and your brokerage's fees. This is where a <Link href="/no-fee-brokerage" style={{ color: "#2F5C8F", fontWeight: 700 }}>no-monthly-fee brokerage</Link> keeps your overhead low while you build momentum.</P>

        <Note>Course hours and requirements are set by the Florida DBPR and can change — always confirm current steps, fees, and approved providers directly with the DBPR before enrolling. This is general guidance, not legal advice.</Note>
      </Body>
      <CTA heading="Starting your real estate career?" sub="Talk to Bear Team about training, onboarding, and getting your license active in Orlando." />
    </Shell>
  );
}
