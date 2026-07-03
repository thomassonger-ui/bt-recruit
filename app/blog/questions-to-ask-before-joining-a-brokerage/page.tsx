import type { Metadata } from "next";
import Shell from "@/components/seo/Shell";
import { ArticleHead, Body, Lead, H2, P, Note, CTA, articleSchema, Link } from "../ui";

const SLUG = "questions-to-ask-before-joining-a-brokerage";
const TITLE = "12 questions to ask before you join a real estate brokerage";
const DESC = "Before you sign with any real estate brokerage, get clear answers to these 12 questions on commission splits, fees, support, training, and what happens to your deals if you ever leave.";

export const metadata: Metadata = {
  title: "12 Questions to Ask Before Joining a Real Estate Brokerage",
  description: DESC,
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: { type: "article", url: `https://www.joinbearteam.com/blog/${SLUG}`, title: TITLE, description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

const Q = ({ n, q, children }: { n: number; q: string; children: React.ReactNode }) => (
  <div style={{ margin: "0 0 18px" }}>
    <h2 style={{ fontSize: 19, fontWeight: 800, color: "#0B1B33", margin: "26px 0 6px" }}>{n}. {q}</h2>
    <p style={{ fontSize: 17, color: "#5B6675", lineHeight: 1.7, margin: 0 }}>{children}</p>
  </div>
);

export default function Page() {
  return (
    <Shell>
      {articleSchema(SLUG, TITLE, DESC).map((o, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o) }} />
      ))}
      <ArticleHead eyebrow="Choosing a brokerage" title={TITLE} read="5 min read" />
      <Body>
        <Lead>Picking a brokerage is one of the biggest decisions in your real estate career, and the brochure rarely tells the whole story. Bring these 12 questions to every interview — the answers tell you more than any pitch.</Lead>

        <Q n={1} q="What's the commission split, and does it improve?">Ask whether it's flat or graduating, and what it takes to move up. A split that grows with production rewards your effort; a flat one caps it.</Q>
        <Q n={2} q="What are ALL the fees?">Monthly desk fees, technology fees, royalty/franchise fees, per-transaction fees. Add up the fixed monthly cost first — that's what you pay before you sell anything.</Q>
        <Q n={3} q="Is there a cap, and how many deals does it take to reach it?">A reachable cap is a real benefit. A cap you'll never hit at your volume is just marketing.</Q>
        <Q n={4} q="Who pays for E&O insurance?">Find out if it's covered by the brokerage or billed to you per file. Per-file charges add up over a busy year.</Q>
        <Q n={5} q="How do I actually get paid, and how fast?">Understand the disbursement process and timing so commission checks don't get stuck.</Q>
        <Q n={6} q="What training and onboarding do you provide?">Especially if you're newer — ask about a structured plan, scripts, and who you can call when you're stuck.</Q>
        <Q n={7} q="What systems and technology come with it?">A CRM, pipeline tools, and a clear next-step system save hours. Ask what's included versus what you'd pay extra for.</Q>
        <Q n={8} q="How are leads handled?">Be precise: are leads provided, shared, or all self-generated? What strings are attached?</Q>
        <Q n={9} q="What does support actually look like day to day?">In a boutique you reach a person who knows you; in a large shop you may reach a help desk. Decide which you want.</Q>
        <Q n={10} q="What's the culture really like?">Ask to talk to current agents. Culture is hard to fake when you speak to the people living it.</Q>
        <Q n={11} q="What are the contract terms and any commitments?">Length, exclusivity, and how notice works. Read it before you sign.</Q>
        <Q n={12} q="What happens to my clients and pending deals if I ever leave?">This is the one people forget. Confirm how listings transfer and that pending deals get paid per your agreement. (Here's <Link href="/switch-brokerages-florida" style={{ color: "#2F5C8F", fontWeight: 700 }}>how that works in Florida</Link>, and the full <Link href="/blog/how-to-switch-real-estate-brokerages-in-florida" style={{ color: "#2F5C8F", fontWeight: 700 }}>step-by-step switching guide</Link>.)</Q>

        <H2>What good answers sound like</H2>
        <P>The best brokerages answer all twelve plainly and in writing — no dancing around the fees, no vague promises about leads. If a recruiter won't give you a straight number, treat that as your answer. You can see how Bear Team answers most of these on the <Link href="/faq" style={{ color: "#2F5C8F", fontWeight: 700 }}>FAQ</Link> and the <Link href="/orlando-real-estate-brokerage" style={{ color: "#2F5C8F", fontWeight: 700 }}>Orlando brokerage overview</Link>.</P>

        <Note>This is general guidance for evaluating brokerages, not legal advice. Always review agreements carefully before signing.</Note>
      </Body>
      <CTA heading="Get straight answers from Bear Team." sub="No pitch — bring your questions and run your real numbers first." />
    </Shell>
  );
}
