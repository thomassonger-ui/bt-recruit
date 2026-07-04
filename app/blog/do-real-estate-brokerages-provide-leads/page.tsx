import type { Metadata } from "next";
import Shell from "@/components/seo/Shell";
import { ArticleHead, Body, Lead, H2, P, UL, Note, CTA, articleSchema, Link } from "../ui";

const SLUG = "do-real-estate-brokerages-provide-leads";
const TITLE = "Do real estate brokerages actually provide leads? What to expect (and ask)";
const DESC = "Some brokerages provide real leads; most provide a brand and a bill. The four lead-provision models, what each actually delivers, and the questions that expose a vague recruiting pitch.";

export const metadata: Metadata = {
  title: "Do Real Estate Brokerages Actually Provide Leads? What to Expect",
  description: DESC,
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: { type: "article", url: `https://www.joinbearteam.com/blog/${SLUG}`, title: TITLE, description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

const FAQ = [
  {
    q: "Do most real estate brokerages give agents leads?",
    a: "No. The standard brokerage model provides license supervision, compliance, E&O structure, and a brand — lead generation is the agent's job. Brokerages that genuinely provide leads are the exception, and they fund it through referral fees, team-style splits, or company economics like Bear Team's, so always ask how the program is paid for.",
  },
  {
    q: "What lead-provision models exist?",
    a: "Four common ones: portal-fed teams (Zillow Flex-style, heavy referral fees), broker-funded programs where company leads are distributed to agents, floor time and open-house opportunity models, and 'tools not leads' models where the brokerage sells you a CRM and calls it lead generation. Each is legitimate when described honestly — the problem is pitches that blur which one you're getting.",
  },
  {
    q: "What questions expose a vague lead promise?",
    a: "Ask: How many leads did the median agent — not the top team — receive last month? What's the source? What order and criteria decide who gets them? What referral fee or split applies when one closes? A brokerage with a real program answers in numbers. A brokerage without one changes the subject to 'tools.'",
  },
  {
    q: "How does Bear Team's lead program work?",
    a: "Company-generated leads are distributed to agents through a pipeline system with visible status — you see what you've been passed and where it stands — paired with free conversion training through BearTeam Academy. No monthly fees claw the value back: the only cost agents pay is a flat $150 per closing.",
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
      <ArticleHead eyebrow="Leads & growth" title={TITLE} read="7 min read" />
      <Body>
        <Lead>
          Every recruiter says some version of "we help our agents with leads." Occasionally it's true. This is the
          honest map of what "we provide leads" actually means at different brokerages — the four real models, what
          each costs you, and the questions that separate a program from a pitch.
        </Lead>

        <H2>The default: no leads, and that's normal</H2>
        <P>
          The traditional brokerage deal has never included leads. You get supervision, compliance, E&O structure,
          and a brand; you bring the business. Most big-box offices work this way regardless of what the recruiting
          lunch implied. That model is fine <em>if it's priced like it</em> — which is why agents paying 30–40%
          splits plus <Link href="/blog/real-estate-brokerage-fees-explained" style={{ color: "#2F5C8F", fontWeight: 700 }}>monthly fees</Link>{" "}
          for no leads and no training eventually start Googling at midnight.
        </P>

        <H2>The four models that do exist</H2>
        <UL>
          <li>
            <strong>Portal-fed teams.</strong> Zillow Flex-style arrangements route portal buyers to a team, which
            works them on 50/50-style splits after a heavy referral cut. Real volume, thin margins — good for new
            agents building reps, expensive for established ones (see{" "}
            <Link href="/blog/is-joining-a-real-estate-team-worth-the-split" style={{ color: "#2F5C8F", fontWeight: 700 }}>the team-split math</Link>).
          </li>
          <li>
            <strong>Broker-funded distribution.</strong> The brokerage generates leads with its own marketing and
            passes them to agents by rotation, performance, or fit. The honest version has visible rules; the
            dishonest version feeds the broker's favorites and calls it a program.
          </li>
          <li>
            <strong>Opportunity models.</strong> Floor time, open houses on office listings, sign calls. Not "leads"
            in the CRM sense, but real at-bats — often the most underrated deal flow for a hungry agent.
          </li>
          <li>
            <strong>Tools-not-leads.</strong> The brokerage provides a CRM, a website, maybe an AI assistant, and
            calls it lead generation. Useful tools — but if nobody hands you a name and a phone number, it's not a
            lead program, and it shouldn't be priced like one.
          </li>
        </UL>

        <H2>The questions that separate a program from a pitch</H2>
        <P>
          Four questions, asked in writing: How many leads did the <em>median</em> agent receive last month? Where do
          they come from? What rules decide distribution? What referral fee or split applies when one closes? A
          brokerage with a real program answers with numbers and a straight face. A brokerage without one pivots to
          culture and tools. Both answers are useful — one just isn't the answer to the question you asked. The rest
          of the interview is covered in{" "}
          <Link href="/blog/questions-to-ask-before-joining-a-brokerage" style={{ color: "#2F5C8F", fontWeight: 700 }}>the 12 questions to ask any brokerage</Link>.
        </P>

        <H2>How Bear Team answers its own questions</H2>
        <P>
          Broker-funded distribution, the visible kind: company-generated leads flow to agents through a pipeline
          system where you can see what you've been passed and its status, with free conversion training through
          BearTeam Academy — because a lead program without conversion training just generates voicemails. And the
          economics don't take it back: <Link href="/no-fee-brokerage" style={{ color: "#2F5C8F", fontWeight: 700 }}>zero monthly fees</Link>,
          a flat $150 per closing, and a split that{" "}
          <Link href="/commission-splits" style={{ color: "#2F5C8F", fontWeight: 700 }}>graduates to 90/10</Link> as
          you produce. If your current brokerage gives you nothing, our post on{" "}
          <Link href="/blog/my-brokerage-doesnt-give-me-leads" style={{ color: "#2F5C8F", fontWeight: 700 }}>what to do about a no-lead brokerage</Link>{" "}
          is the 30-day plan.
        </P>

        <H2>Frequently asked questions</H2>
        {FAQ.map((f) => (
          <div key={f.q}>
            <P><strong>{f.q}</strong></P>
            <P>{f.a}</P>
          </div>
        ))}

        <Note>
          Program structures and economics vary by brokerage and change over time — get any lead program's specifics
          in writing before you sign. Not legal or financial advice.
        </Note>
      </Body>
      <CTA heading="Ask us the four questions" sub="Tom will answer all four about Bear Team's lead program — with numbers. That's the point." />
    </Shell>
  );
}
