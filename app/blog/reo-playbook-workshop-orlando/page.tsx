import type { Metadata } from "next";
import Shell from "@/components/seo/Shell";
import { ArticleHead, Body, Lead, H2, P, UL, Note, CTA, articleSchema, Link } from "../ui";

const SLUG = "reo-playbook-workshop-orlando";
const TITLE = "The REO Playbook workshop comes to the Bear Team office July 23";
const DESC =
  "Foreclosure filings are climbing and Florida leads the nation. Join Tom Songer — 7-time WSJ/RealTrends Top 100 agent who ran 120+ REO closings a month through the last cycle — for a free workshop on what to look for, how to build your systems, and how to be ready before the wave arrives.";
const SITE = "https://www.joinbearteam.com";

export const metadata: Metadata = {
  title: "REO Playbook Workshop — Bear Team Office, Orlando (July 23)",
  description: DESC,
  alternates: { canonical: `/blog/${SLUG}` },
  openGraph: { type: "article", url: `${SITE}/blog/${SLUG}`, title: TITLE, description: DESC, images: [{ url: `/api/og?title=${encodeURIComponent(TITLE)}`, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: [`/api/og?title=${encodeURIComponent(TITLE)}`] },
};

const eventSchema = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "The REO Playbook — Where the Hidden Inventory Is in 2026",
  description: DESC,
  startDate: "2026-07-23T17:30:00-04:00",
  endDate: "2026-07-23T18:30:00-04:00",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: {
    "@type": "Place",
    name: "Bear Team Real Estate Office",
    address: { "@type": "PostalAddress", streetAddress: "2300 S Crystal Lake Dr", addressLocality: "Orlando", addressRegion: "FL", postalCode: "32806", addressCountry: "US" },
  },
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock", url: `${SITE}/events`, validFrom: "2026-07-11" },
  organizer: { "@type": "Organization", name: "Bear Team Real Estate", url: SITE },
  performer: [{ "@type": "Person", name: "Tom Songer" }],
  image: [`${SITE}/og.png`],
};

function Fig({ src, alt, credit }: { src: string; alt: string; credit: string }) {
  return (
    <figure style={{ margin: "26px 0" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" style={{ width: "100%", borderRadius: 14, display: "block" }} />
      <figcaption style={{ fontSize: 12.5, color: "#8A94A3", marginTop: 8, lineHeight: 1.5 }}>{alt} · Stock photo: {credit} / Pexels</figcaption>
    </figure>
  );
}

export default function Page() {
  return (
    <Shell>
      {articleSchema(SLUG, TITLE, DESC).map((o, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o) }} />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />
      <ArticleHead eyebrow="Office event · Market Edge" title={TITLE} read="8 min read" />
      <Body>
        <Lead>
          Foreclosure activity is rising again, Florida is at the front of it, and most Orlando agents have never worked a
          distressed file in their careers. On <strong>Wednesday, July 23 from 5:30–6:30 PM</strong>, the Bear Team office is
          hosting <strong>The REO Playbook</strong> — a free, in-person workshop led by Tom Songer on where the hidden
          inventory is in 2026 and how to position yourself before it becomes obvious to everyone else.
        </Lead>

        <Fig
          src="https://images.pexels.com/photos/7578855/pexels-photo-7578855.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="A suburban home with a for-sale sign out front — distressed listings increasingly look like ordinary inventory"
          credit="Kindel Media"
        />

        <H2>The numbers coming at Florida</H2>
        <P>
          This isn&apos;t hype — it&apos;s in the filings. ATTOM&apos;s Q1 2026 foreclosure market report counted{" "}
          <strong>118,727 U.S. properties with a foreclosure filing — up 26% from a year earlier</strong>. Foreclosure
          starts rose 20% to 82,631, and completed bank repossessions — actual REOs — jumped <strong>45% year over year</strong> to
          14,020 properties nationwide.
        </P>
        <P>
          Florida is carrying more than its share. The state posted <strong>13,683 filings in Q1 — one in every 750 housing
          units — the third-worst foreclosure rate in the country</strong>. And the REO pipeline specifically is what should
          get your attention: Florida lenders took back <strong>1,014 properties in Q1 2026, more than double the 487 from
          Q1 2025</strong>. By May, ATTOM had Florida with the <strong>worst foreclosure rate of any state</strong> — one
          filing for every 2,110 housing units, with 3,315 new foreclosure starts in that month alone.
        </P>
        <P>
          Orlando is not watching from a distance. In the May report our metro ranked <strong>fifth-worst among large U.S.
          metros</strong>, with one filing for every 2,034 housing units. To keep it honest: total volumes are still well
          below the 2008–2010 peaks, and nobody at this workshop will tell you a crash is scheduled. What the data shows is
          a steady, compounding climb — starts up, repossessions up sharply, Florida leading — and climbs like this reward
          the agents who built their systems <em>before</em> the inventory hit the market.
        </P>

        <H2>Why this wave looks different — and why Florida is first</H2>
        <P>
          If you worked (or watched) the 2008 cycle, resist the urge to pattern-match. That wave was built on bad loans;
          today&apos;s borrowers are, on average, better qualified and sitting on more equity. What&apos;s squeezing Florida
          homeowners in 2026 is the <em>cost of keeping</em> the home rather than the loan itself: property insurance
          premiums that have doubled or worse for many owners, HOA dues and condo special assessments climbing under the
          state&apos;s post-Surfside structural-reserve requirements, and property taxes riding years of price appreciation.
          Layer in investors who bought at 2021–2022 prices with short-term-rental income projections that never
          materialized, and you get a distinctly Florida-shaped pipeline of distress.
        </P>
        <P>
          The other difference is equity. Because many of these owners still have value in the property, a larger share of
          this cycle resolves <em>before</em> the courthouse steps — pre-foreclosure sales, short-notice traditional
          listings, investor purchases, subject-to arrangements. That is exactly why agents who understand the whole
          distressed timeline, not just the REO end of it, will capture business that never shows up on a foreclosure list
          at all. It&apos;s also why the skills are worth learning even if the wave crests smaller than the numbers suggest:
          every scenario above is still a client who needs a capable agent this year.
        </P>

        <Fig
          src="https://images.pexels.com/photos/10320596/pexels-photo-10320596.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Peeling paint and a deteriorating window — deferred maintenance is often the first visible sign of a distressed property"
          credit="Tom Fisk"
        />

        <H2>Why learn this from Tom Songer</H2>
        <P>
          REO is one of the few corners of real estate where scar tissue matters more than theory, and Tom Songer earned his
          through the biggest distressed cycle in modern history. Tom is a <strong>7-time WSJ / RealTrends Top 100
          agent</strong>, ranked in the <strong>top .01% of Coldwell Banker agents worldwide for more than a decade</strong>,
          and led the <strong>#1 Coldwell Banker office in 2010</strong> — the heart of the foreclosure era. Through the
          2006–2010 market he ran operations moving <strong>120+ homes a month</strong>, part of a career total of{" "}
          <strong>7,000+ homes sold and billions in volume</strong>. Today he serves as Team Lead at Bear Team Real Estate,
          where he runs agent development through BearTeam Academy.
        </P>
        <P>
          That matters because the REO business is won on process, not charm. Asset managers don&apos;t hire the agent with
          the best headshot; they hire the agent whose files close on time, whose reports come back accurate, and whose
          properties don&apos;t generate phone calls. Tom built and ran that machine at scale. This workshop is him showing
          Orlando agents what the machine looks like — and what it takes to be trusted with the inventory.
        </P>

        <H2>What we&apos;ll cover: what to look for</H2>
        <P>
          The first hour of opportunity in a distressed cycle happens before a property is ever branded &ldquo;REO.&rdquo;
          Tom will walk through the early signals agents should be reading right now:
        </P>
        <UL>
          <li><strong>The pre-foreclosure pipeline</strong> — how a file moves from missed payments to lis pendens to auction to bank ownership in Florida&apos;s judicial process, and where agents can add value at each stage.</li>
          <li><strong>Neighborhood-level signals</strong> — deferred maintenance, utility shutoffs, code violations, and vacancy patterns that show up months before a filing does.</li>
          <li><strong>Which product is actually coming</strong> — why this cycle&apos;s distressed inventory (insurance-cost casualties, over-leveraged investors, condo special assessments) looks different from 2008&apos;s, and what that means for where it will surface first.</li>
          <li><strong>Reading the data</strong> — which public numbers matter, which are noise, and how to track your own farm area instead of waiting for headlines.</li>
        </UL>

        <Fig
          src="https://images.pexels.com/photos/15824733/pexels-photo-15824733.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="A Florida home framed by palms — most distressed properties in this cycle will look like everyday Florida housing stock"
          credit="OGProductionZ"
        />

        <H2>How to implement — building the machine</H2>
        <P>
          Spotting distress is the easy half. The session&apos;s core is operational: what an agent&apos;s business has to
          look like before asset managers, servicers, and institutional sellers will hand them inventory. Tom will cover the
          categories — without giving away the whole playbook, which is what the in-person session is for:
        </P>
        <UL>
          <li><strong>Getting on the lists</strong> — the registration, certification, and relationship groundwork that determines who even gets considered for assignments.</li>
          <li><strong>BPO readiness</strong> — why broker price opinions are the front door to REO relationships and what separates a BPO that wins repeat business from one that gets you quietly dropped.</li>
          <li><strong>The operations bench</strong> — the contractor, preservation, and inspection relationships you need lined up before your first assignment, not after.</li>
          <li><strong>Compliance and file discipline</strong> — distressed transactions carry more moving parts and more liability; the agents who last are the ones whose paperwork is boring.</li>
        </UL>

        <H2>Technology spotlight: PropertyOnion</H2>
        <P>
          Strong systems need strong data, and the workshop includes a practical technology demonstration featuring{" "}
          <strong>PropertyOnion</strong>. PropertyOnion specializes in Florida foreclosure and tax-deed auction data,
          property research, title information, and due-diligence tools. For working agents, that means the ability to{" "}
          <strong>identify distressed inventory before it becomes a traditional REO listing</strong> — surfacing
          pre-foreclosure filings, auction calendars, and title red flags from your desk instead of the courthouse steps.
          You&apos;ll see how it fits into a daily prospecting workflow, not just a demo reel.
        </P>

        <H2>How to prepare for the wave</H2>
        <P>
          Even if you never list a bank-owned property, the skills transfer. Agents who understand distress win expired
          listings, help underwater sellers exit with dignity, guide investors credibly, and protect buyers walking into
          as-is purchases. Tom will close with a preparation checklist you can start on the next morning: the education worth
          paying for (and the certifications that aren&apos;t), how to build a cash-buyer bench, and how to position your
          existing sphere so that when a distressed situation touches someone they know, you&apos;re the call.
        </P>

        <Fig
          src="https://images.pexels.com/photos/30433180/pexels-photo-30433180.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="A Florida suburban neighborhood at sunset — the next wave of opportunity will be spread across ordinary streets like these"
          credit="Onbab"
        />

        <H2>Who should be in the room</H2>
        <P>
          This session was built for three kinds of agents. First, <strong>producers who remember the last cycle</strong>{" "}
          and want to dust off the machinery with current data, current vendors, and current asset-manager expectations —
          a lot has changed since 2010, starting with where the inventory gets sourced. Second,{" "}
          <strong>agents licensed after 2012</strong> who have never seen a distressed market and don&apos;t want their
          first REO education to happen mid-transaction with a client&apos;s money on the line. Third,{" "}
          <strong>investor-focused and team-building agents</strong> who see the same numbers everyone else does and want a
          disciplined, ethical way to act on them.
        </P>
        <P>
          It&apos;s worth saying plainly: working distress is a responsibility as much as an opportunity. Behind most of
          these files is a family under real pressure, and the agents who build lasting REO careers are the ones who treat
          occupants with dignity, follow fair-housing law to the letter, and give sellers honest options — including the
          ones that don&apos;t pay a commission. That standard is part of the playbook too, and it&apos;s non-negotiable at
          Bear Team.
        </P>
        <P>
          Bring questions. The format is deliberately small — a working session at our office on Crystal Lake Drive, not a
          hotel-ballroom pitch. You&apos;ll leave with notes you can act on Thursday morning, a clear picture of what the
          Florida numbers actually say, and a look at the tools — including the PropertyOnion demonstration — that turn
          headlines into a prospecting list.
        </P>

        <H2>Details and RSVP</H2>
        <UL>
          <li><strong>What:</strong> The REO Playbook — Where the Hidden Inventory Is in 2026</li>
          <li><strong>When:</strong> Wednesday, July 23 · 5:30–6:30 PM</li>
          <li><strong>Where:</strong> Bear Team Real Estate office, 2300 S Crystal Lake Dr, Orlando, FL 32806</li>
          <li><strong>Cost:</strong> Free · open to licensed agents at any brokerage</li>
          <li><strong>RSVP:</strong> Seats are limited — <a href="https://calendly.com/thomas-songer/bear-team-meet" style={{ color: "#2F5C8F", fontWeight: 700 }}>reserve your spot here</a> or see the <Link href="/events" style={{ color: "#2F5C8F", fontWeight: 700 }}>events page</Link>.</li>
        </UL>
        <P>
          You don&apos;t need to be a Bear Team agent to attend, and nobody will corner you about switching brokerages. Come
          for the market intelligence, meet the team, and leave with a clearer picture of the next eighteen months than most
          agents in this market will have.
        </P>

        <Note>
          Foreclosure statistics cited from ATTOM&apos;s Q1 2026 and May 2026 U.S. Foreclosure Market Reports. Market
          conditions change; figures reflect the most recent reports available at publication. This article is general
          market information, not legal, investment, or financial advice.
        </Note>
      </Body>
      <CTA heading="Want the playbook, not just the preview?" sub="RSVP for July 23, or book 15 minutes with Tom Songer to talk about where your business fits in the 2026 market." />
    </Shell>
  );
}
