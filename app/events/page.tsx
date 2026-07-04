import type { Metadata } from "next";
import Shell, { tokens } from "@/components/seo/Shell";
import RsvpClient from "./RsvpClient";

const { INK, BODY, BORDER, ACCENT, NAVY, MAXW } = tokens;
const SITE = "https://www.joinbearteam.com";

export const metadata: Metadata = {
  title: "Free Real Estate Workshops for Orlando Agents",
  description:
    "Free monthly workshops for Orlando real estate agents, hosted by Tom Songer and Bethanne Baer — 40+ years each, 7,000+ homes sold. Learn the system, then RSVP.",
  alternates: { canonical: "/events" },
  openGraph: {
    type: "website",
    url: `${SITE}/events`,
    title: "Free Workshops for Orlando Agents — Bear Team Real Estate",
    description: "Two monthly workshops at the Bear Team office. Real strategy from veterans who've sold 7,000+ homes. Seats are limited.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE },
    { "@type": "ListItem", position: 2, name: "Events", item: `${SITE}/events` },
  ],
};

const VENUE = {
  "@type": "Place",
  name: "Bear Team Real Estate",
  address: {
    "@type": "PostalAddress",
    streetAddress: "2300 S Crystal Lake Dr",
    addressLocality: "Orlando",
    addressRegion: "FL",
    postalCode: "32806",
    addressCountry: "US",
  },
};

const eventSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Event",
      name: "From 6 Deals to 60 — Orlando Growth Workshop",
      description:
        "Free in-person workshop for Orlando real estate agents: the system veterans use to break past a handful of deals a year — lead flow, listings, and the daily plan that scales.",
      startDate: "2026-07-09T17:30:00-04:00",
      endDate: "2026-07-09T19:00:00-04:00",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: VENUE,
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock", url: `${SITE}/events`, validFrom: "2026-06-01" },
      organizer: { "@type": "Organization", name: "Bear Team Real Estate", url: SITE },
      performer: [
        { "@type": "Person", name: "Tom Songer" },
        { "@type": "Person", name: "Bethanne Baer" },
      ],
      image: [`${SITE}/og.png`],
    },
    {
      "@type": "Event",
      name: "The REO Playbook — Where the Hidden Inventory Is in 2026",
      description:
        "Free in-person workshop for Orlando real estate agents: how the market is shifting, where distressed and REO opportunity is opening up, and how top agents position to win it.",
      startDate: "2026-07-23T17:30:00-04:00",
      endDate: "2026-07-23T19:00:00-04:00",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: VENUE,
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock", url: `${SITE}/events`, validFrom: "2026-06-01" },
      organizer: { "@type": "Organization", name: "Bear Team Real Estate", url: SITE },
      performer: [
        { "@type": "Person", name: "Tom Songer" },
        { "@type": "Person", name: "Bethanne Baer" },
      ],
      image: [`${SITE}/og.png`],
    },
  ],
};

const WORKSHOPS = [
  {
    badge: "Growth · 2nd Thursdays",
    title: "From 6 Deals to 60",
    date: "Next: Thursday, July 9 · 5:30–7:00 PM",
    desc: "The Orlando Growth Workshop. If you're stuck at a handful of deals a year, this is the system veterans use to break through — lead flow, listings, and the daily plan that actually scales.",
  },
  {
    badge: "Market Edge · 4th Thursdays",
    title: "The REO Playbook",
    date: "Next: Thursday, July 23 · 5:30–7:00 PM",
    desc: "Where the Hidden Inventory Is in 2026. How the market is shifting, where distressed and REO opportunity is opening up, and how top agents position to win it before everyone else.",
  },
];

const HOSTS = [
  {
    img: "/tom-songer.webp",
    name: "Tom Songer",
    role: "Team Lead · REO & Production Expert",
    bullets: [
      "7-time WSJ / RealTrends Top 100 agent",
      "Top .01% of Coldwell Banker agents worldwide, 10+ years",
      "Led the #1 Coldwell Banker office (2010)",
      "120+ homes a month through the 2006–2010 foreclosure market",
      "7,000+ homes sold; billions in volume",
    ],
  },
  {
    img: "/bethanne.webp",
    name: "Bethanne Baer",
    role: "Broker / Owner · Local-Market Expert",
    bullets: [
      "40+ years in Orlando real estate & lending",
      "Built across Coldwell Banker, Keller Williams & Bear Team",
      "Orlando Weekly \"Best Real Estate Agent,\" 2021",
      "Certified HAFA Professional — short sales & distressed",
      "Former HUD & VA experience",
    ],
  },
];

const eyebrow = { fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: ACCENT };

export default function Events() {
  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />
      <style>{`
        .ev-hero{display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center}
        .ev-cards{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        .ev-hosts{display:grid;grid-template-columns:1fr 1fr;gap:34px}
        .ev-rsvp-head{display:flex;gap:28px;align-items:flex-start;justify-content:space-between}
        @media (max-width:820px){
          .ev-hero{grid-template-columns:1fr;gap:26px}
          .ev-cards{grid-template-columns:1fr}
          .ev-hosts{grid-template-columns:1fr;gap:26px}
          .ev-qr{display:none}
        }
      `}</style>

      {/* HERO */}
      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "clamp(44px,7vw,80px) 24px 16px" }}>
        <div className="ev-hero">
          <div>
            <div style={eyebrow}>Free Workshops · Orlando, FL</div>
            <h1 style={{ fontSize: "clamp(2rem,4.5vw,3.1rem)", fontWeight: 800, color: INK, margin: "12px 0 16px", lineHeight: 1.08 }}>Learn the Orlando market from agents who&apos;ve sold 7,000+ homes.</h1>
            <p style={{ fontSize: 18, color: BODY, maxWidth: 640, lineHeight: 1.6 }}>Free, in-person workshops for Orlando real estate agents — hosted by Tom Songer and Bethanne Baer, 40+ years each in this market. No pitch. Real strategy you can use Monday morning.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26 }}>
              <a href="#rsvp" style={{ background: NAVY, color: "#fff", padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>Save my seat →</a>
              <a href="#workshops" style={{ background: "transparent", color: NAVY, padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none", border: `1px solid ${BORDER}` }}>See the workshops</a>
            </div>
          </div>
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 18, padding: 24, boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: BODY, marginBottom: 14 }}>Upcoming at the Bear Team office</div>
            {([["From 6 Deals to 60", "Jul 9 · 5:30 PM"], ["The REO Playbook", "Jul 23 · 5:30 PM"], ["Light food & drinks · Free", "Seats limited"]] as [string, string][]).map(([a, b], i) => (
              <div key={a} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "13px 0", borderBottom: i < 2 ? `1px solid ${BORDER}` : "none", fontSize: 15 }}>
                <span style={{ fontWeight: 700, color: INK }}>{a}</span>
                <span style={{ color: BODY, fontSize: 13, whiteSpace: "nowrap" }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKSHOPS */}
      <section id="workshops" style={{ maxWidth: MAXW, margin: "0 auto", padding: "24px 24px 8px" }}>
        <div style={eyebrow}>Two Monthly Workshops</div>
        <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.3rem)", fontWeight: 800, color: INK, margin: "10px 0 20px" }}>Pick your night. Bring your questions.</h2>
        <div className="ev-cards">
          {WORKSHOPS.map((w) => (
            <div key={w.title} style={{ border: `1px solid ${BORDER}`, borderRadius: 16, padding: "26px 24px", display: "flex", flexDirection: "column" }}>
              <span style={{ alignSelf: "flex-start", background: "#EAF0F8", color: "#2F4768", fontSize: 12, fontWeight: 700, padding: "6px 13px", borderRadius: 9999, marginBottom: 14 }}>{w.badge}</span>
              <div style={{ fontWeight: 800, color: INK, fontSize: 22 }}>{w.title}</div>
              <div style={{ color: NAVY, fontWeight: 700, fontSize: 14, marginTop: 12 }}>{w.date}</div>
              <div style={{ color: BODY, fontSize: 14 }}>2300 S Crystal Lake Dr, Orlando, FL 32806</div>
              <p style={{ color: BODY, fontSize: 14.5, margin: "14px 0 22px", lineHeight: 1.55, flex: 1 }}>{w.desc}</p>
              <a href="#rsvp" style={{ alignSelf: "flex-start", background: NAVY, color: "#fff", padding: "12px 22px", borderRadius: 10, fontWeight: 700, textDecoration: "none", fontSize: 14 }}>RSVP for this workshop</a>
            </div>
          ))}
        </div>
      </section>

      {/* HOSTS */}
      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "clamp(40px,6vw,64px) 24px 24px" }}>
        <div style={eyebrow}>Your Hosts</div>
        <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.3rem)", fontWeight: 800, color: INK, margin: "10px 0 24px" }}>40+ years each. 7,000+ homes. One room.</h2>
        <div className="ev-hosts">
          {HOSTS.map((h) => (
            <div key={h.name}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={h.img} alt={h.name} width={84} height={84} style={{ width: 84, height: 84, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", border: `1px solid ${BORDER}`, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800, color: INK, fontSize: 21 }}>{h.name}</div>
                  <div style={{ color: ACCENT, fontWeight: 700, fontSize: 14 }}>{h.role}</div>
                </div>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {h.bullets.map((b) => (
                  <li key={b} style={{ position: "relative", paddingLeft: 20, color: "#33373E", fontSize: 15, lineHeight: 1.5 }}>
                    <span style={{ position: "absolute", left: 0, top: 8, width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />{b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", color: BODY, fontSize: 16, marginTop: 34 }}>We teach the <em>what</em> and the <em>why</em>. The rest you learn on the team.</p>
      </section>

      {/* RSVP */}
      <section id="rsvp" style={{ padding: "clamp(40px,7vw,72px) 24px" }}>
        <div style={{ maxWidth: 940, margin: "0 auto", background: NAVY, borderRadius: 22, padding: "clamp(28px,4vw,48px)" }}>
          <div className="ev-rsvp-head">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...eyebrow, color: "#9DB4D6" }}>Save Your Seat</div>
              <h2 style={{ color: "#fff", fontSize: "clamp(1.6rem,3vw,2.3rem)", fontWeight: 800, margin: "10px 0 8px" }}>Reserve a spot at the next workshop.</h2>
              <p style={{ color: "#C3CDDA", fontSize: 16, maxWidth: 540, lineHeight: 1.55 }}>Seats are limited and fill fast. Tell us which workshop and we&apos;ll send the details.</p>
            </div>
            <div className="ev-qr" style={{ background: "#fff", borderRadius: 14, padding: 14, textAlign: "center", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/events-qr.png" alt="Scan to RSVP" width={132} height={132} style={{ width: 132, height: 132, display: "block" }} />
              <div style={{ marginTop: 8, fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: NAVY }}>Scan to RSVP</div>
            </div>
          </div>
          <RsvpClient />
        </div>
      </section>
    </Shell>
  );
}
