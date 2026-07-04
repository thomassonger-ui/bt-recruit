import type { Metadata } from "next";
import Shell from "@/components/seo/Shell";
import { ArticleHead, Body, Lead, H2, P, UL, Note, CTA, articleSchema, Link } from "../ui";

const SLUG = "my-brokerage-doesnt-give-me-leads";
const TITLE = "My brokerage doesn't give me leads — now what?";
const DESC = "Your brokerage gives you no leads. Here's what to do this month: what brokerages actually owe you, three lead sources you control, and how to evaluate a team or brokerage that really provides them.";

export const metadata: Metadata = {
  title: "My Brokerage Doesn't Give Me Leads — Now What?",
  description: DESC,
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: { type: "article", url: `https://www.joinbearteam.com/blog/${SLUG}`, title: TITLE, description: DESC, images: [{ url: `/api/og?title=${encodeURIComponent(TITLE)}`, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: [`/api/og?title=${encodeURIComponent(TITLE)}`] },
};

const FAQ = [
  {
    q: "Are brokerages supposed to provide leads?",
    a: "No — most traditional brokerages provide license supervision, compliance, and a brand, not leads. That's not a scam; it's the standard model. The problem is recruiters who imply leads are included and offices where they only flow to the top team. If leads matter to you, ask exactly how they're generated, how they're distributed, and what they cost — in writing.",
  },
  {
    q: "What should I ask a brokerage that says it provides leads?",
    a: "Four questions: Where do the leads come from? Who gets them and in what order? What referral fee or split applies to closed lead business? And how many leads did the average non-top-producer agent receive last month? Vague answers to the last one tell you everything.",
  },
  {
    q: "Does Bear Team provide leads to agents?",
    a: "Yes — company-generated leads are distributed to agents through the Bear Team pipeline system, alongside training on converting them and building your own sphere so you're never dependent on any single source. Ask Tom how distribution works; the answer is specific, not vague.",
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
      <ArticleHead eyebrow="Leads & growth" title={TITLE} read="6 min read" />
      <Body>
        <Lead>
          First, the uncomfortable truth: most brokerages never promised you leads — they promised you a license
          home, and the recruiter let you hear whatever you wanted. Second, the useful truth: you can fix your lead
          problem this quarter, whether or not you stay. Here's how to think about it clearly.
        </Lead>

        <H2>What your brokerage actually owes you</H2>
        <P>
          The standard brokerage deal is supervision, compliance, E&O structure, and a brand on your sign — leads are
          not part of it. So if you signed at a traditional office expecting a pipeline, you're not entitled to be
          angry, but you are entitled to reprice: if leads aren't included, what exactly is that 30–40% split and
          $100–$300 a month buying? That's a fair question to put to your broker directly, and our{" "}
          <Link href="/blog/real-estate-brokerage-fees-explained" style={{ color: "#2F5C8F", fontWeight: 700 }}>fee guide</Link>{" "}
          helps you do the math.
        </P>

        <H2>The lead sources you control — start this week</H2>
        <UL>
          <li>
            <strong>Your sphere, systematized.</strong> The highest-converting lead source in real estate is people
            who already know you — but only if you work it like a system, not a hope. Our{" "}
            <Link href="/blog/real-estate-sphere-of-influence-orlando" style={{ color: "#2F5C8F", fontWeight: 700 }}>sphere-of-influence playbook</Link>{" "}
            is the starting point.
          </li>
          <li>
            <strong>Open houses — other agents' listings.</strong> Busy listing agents will hand you weekend open
            houses. Every one is a room full of unrepresented buyers. Two a month, done well, is a deal a quarter.
          </li>
          <li>
            <strong>One channel, done daily.</strong> Pick a single prospecting channel — expireds, a farm
            neighborhood, a content channel — and do it every working day for 90 days. Agents fail at lead generation
            by rotating channels weekly, not by picking the wrong one.
          </li>
        </UL>

        <H2>When the answer is a brokerage or team that provides leads</H2>
        <P>
          Self-generation works, but it's slower without support — and some brokerages and teams really do feed
          agents. The catch is that "we provide leads" ranges from a genuine distribution system to a Zillow account
          the broker's spouse works first. Before you move anywhere for leads, get the four answers in the FAQ below
          in writing, and understand the economics: lead business usually carries a referral fee or a bigger split,
          which can still be a great trade — a percentage of closings you wouldn't have had beats all of nothing.
          Our post on <Link href="/blog/questions-to-ask-before-joining-a-brokerage" style={{ color: "#2F5C8F", fontWeight: 700 }}>the 12 questions to ask any brokerage</Link>{" "}
          covers the rest of the interview.
        </P>

        <H2>How Bear Team handles it</H2>
        <P>
          We're a boutique Orlando brokerage, so the honest version is specific: company-generated leads flow to
          agents through a pipeline system with visible distribution — you can see what you've been passed and where
          it stands — paired with BearTeam Academy training on converting them, because a lead without conversion
          skills is just a phone number. And the fee structure means the leads aren't clawed back through overhead:{" "}
          <Link href="/no-fee-brokerage" style={{ color: "#2F5C8F", fontWeight: 700 }}>zero monthly fees</Link>, $150
          flat per closing, splits that{" "}
          <Link href="/commission-splits" style={{ color: "#2F5C8F", fontWeight: 700 }}>graduate as you produce</Link>.
        </P>

        <H2>The 30-day decision</H2>
        <P>
          Give it one month, two tracks. Track one: work your sphere and one channel daily, and ask your current
          broker point-blank what lead support exists. Track two: interview one brokerage or team that claims to
          provide leads and make them answer the four questions. At the end of the month you'll have data instead of
          frustration — and if the answer is a move, the{" "}
          <Link href="/blog/how-to-switch-real-estate-brokerages-in-florida" style={{ color: "#2F5C8F", fontWeight: 700 }}>Florida switching guide</Link>{" "}
          makes it a two-week process.
        </P>

        <H2>Frequently asked questions</H2>
        {FAQ.map((f) => (
          <div key={f.q}>
            <P><strong>{f.q}</strong></P>
            <P>{f.a}</P>
          </div>
        ))}

        <Note>General guidance, not legal or financial advice. Lead programs and their economics vary — get any brokerage's specifics in writing.</Note>
      </Body>
      <CTA heading="Want the specific answer?" sub="Ask Tom exactly how Bear Team's lead distribution works — sources, order, and economics. Specific questions get specific answers." />
    </Shell>
  );
}
