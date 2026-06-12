import type { Metadata } from "next";
import Shell from "@/components/seo/Shell";
import { ArticleHead, Body, Lead, H2, P, UL, Note, CTA, articleSchema, Link } from "../ui";

const SLUG = "real-estate-sphere-of-influence-orlando";
const TITLE = "How to build a real estate sphere of influence in Orlando";
const DESC = "Your sphere of influence is the most reliable source of business in real estate. Here's how Orlando agents build, organize, and work a sphere without feeling salesy.";

export const metadata: Metadata = {
  title: "How to Build a Real Estate Sphere of Influence in Orlando",
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
      <ArticleHead eyebrow="Lead generation" title={TITLE} read="6 min read" />
      <Body>
        <Lead>Paid leads come and go, but your sphere of influence — the people who already know and trust you — is the steadiest source of business in real estate. Here's how to build one in the Orlando market without turning every conversation into a pitch.</Lead>

        <H2>What a sphere of influence actually is</H2>
        <P>Your sphere is everyone who knows you: past clients, friends, family, neighbors, former coworkers, the people at your gym and your kids' school. These relationships convert far better than cold leads because the trust is already there. The job isn't to sell them — it's to stay top-of-mind so you're the obvious choice when real estate comes up.</P>

        <H2>Step 1: Build the database</H2>
        <P>Get every contact into one place — a real CRM, not your phone's contacts app. Capture name, how you know them, and any life details worth remembering. A system that organizes this and reminds you who to follow up with is half the battle (it's exactly what a <Link href="/join-a-team" style={{ color: "#2F5C8F", fontWeight: 700 }}>team with real systems</Link> gives you).</P>

        <H2>Step 2: Touch your sphere consistently — with value</H2>
        <UL>
          <li>Share genuinely useful Orlando market updates, not just "thinking of selling?" blasts.</li>
          <li>Celebrate the people in your sphere — congratulate, refer business to them, show up.</li>
          <li>Mix the channels: a quick text, a handwritten note, the occasional call. Personal beats automated.</li>
          <li>Be consistent. A few touches a year keeps you forgettable; a steady rhythm keeps you top-of-mind.</li>
        </UL>

        <H2>Step 3: Work the Orlando angle</H2>
        <P>Local relevance compounds trust. Know your neighborhoods, show up at community events, and become the person who actually knows what's happening in Central Florida real estate. People refer the agent who feels like the local expert.</P>

        <H2>Step 4: Ask for referrals the right way</H2>
        <P>You don't have to be pushy. When you've delivered for someone, it's natural to say you're never too busy for the people they care about. Make referring you easy and low-pressure, and do it consistently.</P>

        <P>A sphere takes a system and a rhythm to maintain — which is far easier with tools and support behind you than going it alone. That's the difference a real team makes.</P>

        <Note>General business-development guidance for agents. Always follow applicable advertising, do-not-call, and fair-housing rules when contacting your database.</Note>
      </Body>
      <CTA heading="Want systems that work your sphere?" sub="See how Bear Team's tools and support help Orlando agents turn relationships into closings." />
    </Shell>
  );
}
