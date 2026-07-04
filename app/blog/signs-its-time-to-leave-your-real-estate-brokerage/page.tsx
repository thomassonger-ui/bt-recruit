import type { Metadata } from "next";
import Shell from "@/components/seo/Shell";
import { ArticleHead, Body, Lead, H2, P, Note, CTA, articleSchema, Link } from "../ui";

const SLUG = "signs-its-time-to-leave-your-real-estate-brokerage";
const TITLE = "7 signs it's time to leave your real estate brokerage";
const DESC = "Should you leave your brokerage? Seven honest signs — from fee creep and no leads to a broker who doesn't know your name — plus what to check before you make the move.";

export const metadata: Metadata = {
  title: "7 Signs It's Time to Leave Your Real Estate Brokerage",
  description: DESC,
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: { type: "article", url: `https://www.joinbearteam.com/blog/${SLUG}`, title: TITLE, description: DESC, images: [{ url: `/api/og?title=${encodeURIComponent(TITLE)}`, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: [`/api/og?title=${encodeURIComponent(TITLE)}`] },
};

const FAQ = [
  {
    q: "Should I leave my real estate brokerage?",
    a: "Leave when the math and the support both point away: you're paying fees for things you don't receive, your production has plateaued while your questions go unanswered, and the brokerage's growth plan for you doesn't exist. Stay and renegotiate if the relationship is good but one term is wrong — brokers can adjust more than most agents ask for.",
  },
  {
    q: "Will switching brokerages hurt my business?",
    a: "Done properly, no. Pending deals close under the old brokerage per your agreement, the Florida license transfer is an administrative step, and your sphere follows you, not your sign. The announcement of a move is one of the highest-response marketing moments an agent gets.",
  },
  {
    q: "How do I know if the problem is my brokerage or me?",
    a: "Ask what specifically the brokerage has done for your business in the last 90 days — leads passed, files reviewed, training delivered, calls returned. If the honest answer is nothing, the environment is the problem. If you're not using real resources that exist, changing brokerages won't fix that — but very few agents who feel stuck are actually being supported.",
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
      <ArticleHead eyebrow="Switching brokerages" title={TITLE} read="6 min read" />
      <Body>
        <Lead>
          Nobody types "should I leave my brokerage" into Google on a good day. If you're here, something already
          feels off — and you're trying to figure out whether it's a rough patch or a real problem. Here are the seven
          signs that reliably separate the two, from someone who talks to switching agents every week.
        </Lead>

        <H2>1. You're paying for support you never receive</H2>
        <P>
          Monthly fees, desk fees, tech fees, royalty — every one of them is supposed to buy something. If you're
          paying $200+ a month and can't name what you got for it last month, that's not a brokerage relationship,
          it's a subscription you forgot to cancel. Add up a year of it with our{" "}
          <Link href="/blog/real-estate-brokerage-fees-explained" style={{ color: "#2F5C8F", fontWeight: 700 }}>fee breakdown</Link>{" "}
          — the number usually settles the question.
        </P>

        <H2>2. Your broker doesn't know your name — or your files</H2>
        <P>
          When a deal wobbles at 9pm, the question is whether someone who knows your transaction picks up the phone.
          At mega-offices with hundreds of agents, broker access means a compliance hotline. If you've had a real
          problem and gotten a portal ticket number instead of a conversation, you've learned what you're actually
          paying 30–40% for.
        </P>

        <H2>3. The leads went to someone else. Again.</H2>
        <P>
          Plenty of brokerages advertise leads and deliver them to the top team or the broker's favorites. If lead
          distribution is a mystery at your office — no published system, no rotation you can see — assume you're the
          product, not the customer. (We wrote a whole piece on{" "}
          <Link href="/blog/my-brokerage-doesnt-give-me-leads" style={{ color: "#2F5C8F", fontWeight: 700 }}>what to do when your brokerage gives you no leads</Link>.)
        </P>

        <H2>4. Training stopped after orientation</H2>
        <P>
          If the last training you attended was your onboarding, and "coaching" means an upsell to a paid program,
          you're at a brokerage built for agents who don't need one. That's fine for a 30-deal veteran. It's fatal
          for an agent trying to get from 5 deals to 12 — the growth years where real mentorship pays for itself many
          times over.
        </P>

        <H2>5. Your split hasn't moved in years — and never will</H2>
        <P>
          A flat split with no cap, or a cap you'll never reach at your volume, means the brokerage earns the same
          share of deal one and deal fifty. Structures that reward production exist — graduated ladders, reachable
          caps — and if yours doesn't, you're subsidizing agents who negotiated better. Compare structures on the{" "}
          <Link href="/commission-splits" style={{ color: "#2F5C8F", fontWeight: 700 }}>Bear Team ladder</Link> to see
          what a production-rewarding model looks like.
        </P>

        <H2>6. You dread the office (or there isn't one)</H2>
        <P>
          Culture sounds soft until you notice its absence: no one to celebrate a closing with, no one to sanity-check
          a weird inspection report, nobody who'd notice if you quit. Fully virtual can work for self-contained
          veterans, and toxic-but-physical is worse than remote — but "I haven't spoken to a colleague in a month" is
          a sign, not a lifestyle.
        </P>

        <H2>7. You've stopped believing it will get better</H2>
        <P>
          The most reliable sign is the quietest one. If you've raised the problem — about leads, training, fees, or
          support — and heard promises with no follow-through more than twice, you already know. Agents rarely regret
          switching too early; they regret the year they spent hoping.
        </P>

        <H2>Before you decide anything</H2>
        <P>
          Do three things in order. Read your independent contractor agreement so you know your exit terms. Run your
          last 12 months through the <Link href="/your-numbers" style={{ color: "#2F5C8F", fontWeight: 700 }}>take-home calculator</Link>{" "}
          so the decision is math, not mood. Then read the{" "}
          <Link href="/blog/how-to-switch-real-estate-brokerages-in-florida" style={{ color: "#2F5C8F", fontWeight: 700 }}>step-by-step Florida switching guide</Link>{" "}
          — the move itself takes about two weeks, and the license transfer is the easy part. If fewer than three of
          the seven signs hit home, consider a direct conversation with your broker first. If five or more did,
          you're not deciding anymore — you're planning.
        </P>

        <H2>Frequently asked questions</H2>
        {FAQ.map((f) => (
          <div key={f.q}>
            <P><strong>{f.q}</strong></P>
            <P>{f.a}</P>
          </div>
        ))}

        <Note>
          General guidance, not legal advice. Review your independent contractor agreement and confirm transfer steps
          with the Florida DBPR.
        </Note>
      </Body>
      <CTA heading="Sound familiar?" sub="Run your numbers, then have a no-pressure conversation with Tom about what a supported year would look like." />
    </Shell>
  );
}
