import Link from "next/link";
import type { ReactNode } from "react";
import { tokens } from "@/components/seo/Shell";

const { INK, BODY, BORDER, ACCENT, NAVY, MAXW } = tokens;

export const ARTWRAP: React.CSSProperties = { maxWidth: 760, margin: "0 auto", padding: "0 24px" };

export function ArticleHead({ eyebrow, title, read }: { eyebrow: string; title: string; read: string }) {
  return (
    <div style={{ ...ARTWRAP, paddingTop: "clamp(40px,6vw,72px)" }}>
      <Link href="/blog" style={{ color: ACCENT, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>← Bear Team Blog</Link>
      <div style={{ fontSize: 12.5, color: BODY, opacity: 0.8, marginTop: 14 }}>{eyebrow} · {read}</div>
      <h1 style={{ fontSize: "clamp(1.9rem,4vw,2.8rem)", fontWeight: 800, color: INK, margin: "8px 0 18px", lineHeight: 1.12 }}>{title}</h1>
    </div>
  );
}

export function Body({ children }: { children: ReactNode }) {
  return <div style={{ ...ARTWRAP, paddingBottom: 24 }}>{children}</div>;
}
export function Lead({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 19, color: BODY, lineHeight: 1.6, margin: "0 0 18px" }}>{children}</p>;
}
export function H2({ children }: { children: ReactNode }) {
  return <h2 style={{ fontSize: 23, fontWeight: 800, color: INK, margin: "34px 0 12px", lineHeight: 1.2 }}>{children}</h2>;
}
export function P({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 17, color: BODY, lineHeight: 1.7, margin: "0 0 16px" }}>{children}</p>;
}
export function UL({ children }: { children: ReactNode }) {
  return <ul style={{ margin: "0 0 16px", paddingLeft: 22, color: BODY, fontSize: 17, lineHeight: 1.7 }}>{children}</ul>;
}
export function Note({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 14, color: BODY, opacity: 0.85, lineHeight: 1.6, margin: "20px 0 0", borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>{children}</p>;
}

export function CTA({ heading, sub }: { heading: string; sub: string }) {
  return (
    <section style={{ background: NAVY, padding: "clamp(44px,6vw,64px) 24px", marginTop: 40 }}>
      <div style={{ maxWidth: MAXW, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ color: "#fff", fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, margin: "0 0 12px" }}>{heading}</h2>
        <p style={{ color: "#9DB4D0", fontSize: 17, maxWidth: 600, margin: "0 auto 24px", lineHeight: 1.6 }}>{sub}</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/your-numbers" style={{ background: "#fff", color: NAVY, padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>Run my numbers →</Link>
          <a href={tokens.CALENDLY} style={{ background: "transparent", color: "#fff", padding: "14px 26px", borderRadius: 10, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.35)" }}>Book a Call</a>
        </div>
      </div>
    </section>
  );
}

export function articleSchema(slug: string, title: string, description: string) {
  const SITE = "https://www.joinbearteam.com";
  return [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
      { "@type": "ListItem", position: 3, name: title, item: `${SITE}/blog/${slug}` },
    ] },
    { "@context": "https://schema.org", "@type": "Article", headline: title, description,
      image: `${SITE}/og.png`,
      author: { "@type": "Organization", name: "Bear Team Real Estate", url: SITE },
      publisher: { "@type": "Organization", name: "Bear Team Real Estate", logo: { "@type": "ImageObject", url: `${SITE}/bt-logo-mark.svg` } },
      mainEntityOfPage: `${SITE}/blog/${slug}` },
  ];
}

export { Link };
