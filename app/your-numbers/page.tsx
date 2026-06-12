import type { Metadata } from "next";
import Link from "next/link";
import Shell, { tokens } from "@/components/seo/Shell";
import Calculator from "./Calculator";

const { INK, BODY, ACCENT, NAVY, MAXW } = tokens;
const SITE = "https://www.joinbearteam.com";

export const metadata: Metadata = {
  title: "Real Estate Take-Home Calculator — What You'd Net at Bear Team",
  description:
    "See what brokerage fees are costing you. This free calculator compares your current monthly fees and split against Bear Team's $0 monthly fees and flat $150 per closing in Orlando.",
  alternates: { canonical: "/your-numbers" },
  openGraph: { type: "website", url: `${SITE}/your-numbers`, title: "Real Estate Take-Home Calculator — Bear Team Orlando", description: "Compare your current brokerage costs against Bear Team's $0 monthly fees.", images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: "Home", item: SITE }, { "@type": "ListItem", position: 2, name: "Your Numbers", item: `${SITE}/your-numbers` } ] };

export default function YourNumbers() {
  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "clamp(48px,7vw,80px) 24px 8px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT }}>Take-Home Calculator</div>
        <h1 style={{ fontSize: "clamp(2rem,4.5vw,3rem)", fontWeight: 800, color: INK, margin: "12px 0 14px", lineHeight: 1.08 }}>See what fees are really costing you.</h1>
        <p style={{ fontSize: 18, color: BODY, maxWidth: 740, lineHeight: 1.6 }}>Move the sliders to match your year. We'll show what your current brokerage keeps versus Bear Team's $0 monthly fees and flat $150 per closing — then Scout runs your exact split.</p>
      </section>
      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "20px 24px 16px" }}>
        <Calculator />
      </section>
      <section style={{ background: NAVY, padding: "clamp(48px,7vw,72px) 24px", marginTop: 24 }}>
        <div style={{ maxWidth: MAXW, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800, margin: "0 0 12px" }}>Get your exact take-home.</h2>
          <p style={{ color: "#9DB4D0", fontSize: 17, maxWidth: 620, margin: "0 auto 26px", lineHeight: 1.6 }}>Scout calculates your real Bear Team net across the tier ladder. Or book a call with Tom Songer, Team Lead.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/chat" style={{ background: "#fff", color: NAVY, padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>Run my numbers with Scout →</Link>
            <a href={tokens.CALENDLY} style={{ background: "transparent", color: "#fff", padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.35)" }}>Book a Call</a>
          </div>
        </div>
      </section>
    </Shell>
  );
}
