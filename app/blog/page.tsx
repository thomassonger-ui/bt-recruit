import type { Metadata } from "next";
import Link from "next/link";
import Shell, { tokens } from "@/components/seo/Shell";
import { POSTS } from "./posts";

const { INK, BODY, BORDER, ACCENT, NAVY, MAXW } = tokens;
const SITE = "https://www.joinbearteam.com";

export const metadata: Metadata = {
  title: "Bear Team Blog — Real Estate Career & Brokerage Guides (Orlando)",
  description:
    "Straight answers for Orlando real estate agents: income math, brokerage fees, commission splits, switching brokers, and how to choose where to hang your license.",
  alternates: { canonical: "/blog" },
  openGraph: { type: "website", url: `${SITE}/blog`, title: "Bear Team Blog — Real Estate Guides for Orlando Agents", description: "Income math, fees, splits, and switching — answered.", images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: "Home", item: SITE }, { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` } ] };

const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Bear Team Blog",
  url: `${SITE}/blog`,
  publisher: { "@type": "Organization", name: "Bear Team Real Estate", url: SITE },
  blogPost: POSTS.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${SITE}/blog/${p.slug}` })),
};

export default function BlogIndex() {
  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "clamp(48px,7vw,84px) 24px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT }}>Bear Team Blog</div>
        <h1 style={{ fontSize: "clamp(2rem,4.5vw,3rem)", fontWeight: 800, color: INK, margin: "12px 0 14px", lineHeight: 1.08 }}>Real estate career &amp; brokerage guides for Orlando agents.</h1>
        <p style={{ fontSize: 18, color: BODY, maxWidth: 720, lineHeight: 1.6 }}>No fluff — just the math and the answers agents actually search for when deciding where to build their business.</p>
      </section>
      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "16px 24px 56px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
          {POSTS.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} style={{ textDecoration: "none", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px", display: "flex", flexDirection: "column", gap: 10, background: "#fff" }}>
              <div style={{ fontSize: 12.5, color: tokens.BODY, opacity: 0.8 }}>{p.read}</div>
              <div style={{ fontSize: 19, fontWeight: 800, color: INK, lineHeight: 1.25 }}>{p.title}</div>
              <div style={{ fontSize: 14.5, color: BODY, lineHeight: 1.55 }}>{p.excerpt}</div>
              <div style={{ color: ACCENT, fontWeight: 700, fontSize: 14, marginTop: 4 }}>Read article →</div>
            </Link>
          ))}
        </div>
      </section>
    </Shell>
  );
}
