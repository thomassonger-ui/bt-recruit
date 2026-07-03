import type { Metadata } from "next";
import Shell from "@/components/seo/Shell";
import { ArticleHead, Body, Lead, H2, P, UL, Note, CTA, articleSchema, Link } from "../ui";

const SLUG = "how-to-switch-real-estate-brokerages-in-florida";
const TITLE = "How to switch real estate brokerages in Florida — step by step";
const DESC = "The complete Florida brokerage switch: reading your ICA, protecting pending deals, the DBPR license transfer, MLS and lockbox moves, and a clean two-week timeline.";

export const metadata: Metadata = {
  title: "How to Switch Real Estate Brokerages in Florida (Step-by-Step)",
  description: DESC,
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: { type: "article", url: `https://www.joinbearteam.com/blog/${SLUG}`, title: TITLE, description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

const FAQ = [
  {
    q: "Do I lose my pending deals when I switch brokerages in Florida?",
    a: "Usually pending transactions close under the brokerage where the contract was written, and how your commission on them is handled is governed by your independent contractor agreement. Most agents time a move around what's in flight rather than walking away from pendings — read your ICA first and plan the switch for a manageable spot in your pipeline.",
  },
  {
    q: "How do I transfer my Florida real estate license to a new broker?",
    a: "You update your license association through your MyFloridaLicense (DBPR) account — the new brokerage initiates or confirms the change, and your license shows the new broker once processed. It's an administrative step, not a new application, and it's typically processed quickly.",
  },
  {
    q: "Can my current broker stop me from leaving?",
    a: "No. Florida agents are independent contractors and can move their license at any time. Your agreement may set notice expectations and spell out how pending files and fees are handled, but the license itself is yours to move.",
  },
  {
    q: "Do I have to tell my clients I switched?",
    a: "Active clients under contract with your old brokerage remain its customers on those transactions, so coordinate through both brokers. For your sphere and future business, announce the move — it's one of the best marketing moments you get, and your new brokerage should help you repaper signs, business cards, and ads to stay FREC-compliant.",
  },
  {
    q: "What does it cost to switch brokerages?",
    a: "The license transfer itself is administrative. Real costs come from your two brokerages: check your current ICA for exit-related fees, and ask the new one about startup fees. At Bear Team there are no signup, monthly, desk, or technology fees — the only cost agents pay is a $150 flat fee per closing.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Page() {
  return (
    <Shell>
      {articleSchema(SLUG, TITLE, DESC).map((o, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o) }} />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ArticleHead eyebrow="Switching brokerages" title={TITLE} read="9 min read" />
      <Body>
        <Lead>
          Switching brokerages in Florida is far simpler than most agents assume — the license transfer itself is an
          administrative step, not an ordeal. What separates a clean move from a messy one is the order you do things in.
          Here is the whole process, start to finish, in the order that protects your deals and your income.
        </Lead>

        <H2>Step 1: Run the math before anything else</H2>
        <P>
          A brokerage switch should be a financial decision before it's an emotional one. Put your last twelve months of
          production against both fee structures: your current split, cap, monthly fees, transaction fees, royalty, and
          E&O charges versus the new brokerage's numbers. Agents are routinely surprised by what the "small" fees add up
          to — a $85 monthly tech fee alone is over $1,000 a year before you close anything. Five minutes on the{" "}
          <Link href="/your-numbers" style={{ color: "#2F5C8F", fontWeight: 700 }}>Bear Team calculator</Link> gives you
          the side-by-side, and our guide to{" "}
          <Link href="/blog/real-estate-brokerage-fees-explained" style={{ color: "#2F5C8F", fontWeight: 700 }}>brokerage fees</Link>{" "}
          decodes each line item.
        </P>

        <H2>Step 2: Read your independent contractor agreement</H2>
        <P>
          Before you say a word to anyone, pull out the ICA you signed with your current brokerage. You're looking for
          four things: any notice expectations, how <strong>pending transactions</strong> are paid out after you leave, who keeps
          your <strong>listings</strong>, and any fees tied to departure. None of these stop you from moving — Florida agents are
          independent contractors and the license is yours — but knowing the terms tells you the cleanest exit window
          and what to negotiate.
        </P>

        <H2>Step 3: Plan around your pipeline</H2>
        <P>
          Pending deals typically close under the brokerage where they went under contract, at your old split. Listings
          are usually property of the brokerage, though brokers often release them — especially when the relationship
          ends professionally. The practical play: list what's pending, what's listed, and what's about to go under
          contract, then pick a window where the least is in flight. Don't wait for zero — that day never comes.
          We wrote more on picking the moment in{" "}
          <Link href="/blog/best-time-to-switch-real-estate-brokerages" style={{ color: "#2F5C8F", fontWeight: 700 }}>
            when to switch brokerages
          </Link>.
        </P>

        <H2>Step 4: Choose the new brokerage — properly</H2>
        <P>
          Interview brokerages the way you'd want a buyer to interview a lender: in writing, with specifics. Splits and
          caps, every recurring fee, who pays E&O, what training actually looks like, what happens to your deals if you
          ever leave <em>them</em>. Our list of{" "}
          <Link href="/blog/questions-to-ask-before-joining-a-brokerage" style={{ color: "#2F5C8F", fontWeight: 700 }}>
            12 questions to ask before joining a brokerage
          </Link>{" "}
          covers the ones agents forget. Get answers in writing before you resign anywhere.
        </P>

        <H2>Step 5: The DBPR license transfer</H2>
        <P>
          This is the part agents dread and it's the easiest step. Your license association updates through your{" "}
          <strong>MyFloridaLicense (DBPR) account</strong> — the new brokerage initiates or confirms the change of employer, and
          your license shows the new broker once it's processed. You're not reapplying for anything; your license
          number, education history, and renewal date all stay the same. At Bear Team this is part of day-one
          onboarding — we walk you through it, and the full checklist lives in our{" "}
          <Link href="/switch-brokerages-florida" style={{ color: "#2F5C8F", fontWeight: 700 }}>Florida switching guide</Link>.
        </P>

        <H2>Step 6: Board, MLS, and lockbox</H2>
        <P>Three memberships move with you, and they're separate from the DBPR step:</P>
        <UL>
          <li><strong>Realtor association</strong> — transfer your membership to your new brokerage's board (in Orlando, typically ORRA), usually a short form.</li>
          <li><strong>MLS</strong> — your Stellar MLS access re-associates under the new office so your listings, searches, and contacts follow you.</li>
          <li><strong>Lockbox access</strong> — Supra or SentriLock re-registers under the new brokerage; plan for a day or two of overlap so you never lose showing access.</li>
        </UL>

        <H2>Step 7: Tell your broker like a professional</H2>
        <P>
          Resign directly, briefly, and in writing after your new brokerage is confirmed. Thank them, state the date,
          and offer to make the handoff of files clean. Orlando is a small market — the broker you leave today may be
          on the other side of your biggest closing next year. Burn nothing.
        </P>

        <H2>Step 8: Announce it — this is a marketing moment</H2>
        <P>
          The announcement is one of the highest-response messages you'll ever send: your sphere gets a reason to hear
          from you that isn't asking for business. New signs, cards, email signature, and social banners come first —
          Florida advertising rules require your ads to carry your new brokerage's name, so repaper everything before
          the announcement goes wide. A good brokerage does the heavy lifting here; at Bear Team the rebrand kit and
          announcement templates are part of onboarding.
        </P>

        <H2>What a clean switch looks like on a calendar</H2>
        <UL>
          <li><strong>Days 1–3</strong> — run the math, read your ICA, shortlist and interview brokerages.</li>
          <li><strong>Days 4–7</strong> — sign with the new brokerage, resign in writing, DBPR association updates.</li>
          <li><strong>Days 7–10</strong> — board, MLS, and lockbox transfers; repaper marketing.</li>
          <li><strong>Days 10–14</strong> — announcement to your sphere, first prospecting under the new flag.</li>
        </UL>
        <P>
          Two weeks, most of it waiting on memberships. The average agent spends more time dreading the switch than the
          switch actually takes — while paying fees and a split they've outgrown the entire time.
        </P>

        <H2>Frequently asked questions</H2>
        {FAQ.map((f) => (
          <div key={f.q}>
            <P><strong>{f.q}</strong></P>
            <P>{f.a}</P>
          </div>
        ))}

        <Note>
          General guidance only, not legal advice. Review your independent contractor agreement and confirm current
          transfer steps with the Florida DBPR and your local Realtor association.
        </Note>
      </Body>
      <CTA heading="Thinking about the switch?" sub="Run your last 12 months against Bear Team's splits and $16k cap — then talk it through with Tom. No pressure, just the math." />
    </Shell>
  );
}
