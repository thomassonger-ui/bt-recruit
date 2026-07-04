// app/api/og/route.tsx
//
// Dynamic Open Graph image generator. Every blog post links its social
// preview here (?title=...) so shares on LinkedIn/Facebook/X show a branded
// card with the actual headline instead of one generic image.

import { ImageResponse } from "next/og";

export const runtime = "edge";

const NAVY = "#0B1D3A";
const ACCENT = "#2F5C8F";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("title") || "Bear Team Real Estate";
  const title = raw.slice(0, 140);
  const fontSize = title.length > 90 ? 44 : title.length > 60 ? 52 : 60;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: NAVY,
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 12,
              background: "#ffffff",
              color: NAVY,
              fontSize: 26,
              fontWeight: 800,
            }}
          >
            BT
          </div>
          <div style={{ display: "flex", color: "#9DB4D0", fontSize: 26, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
            Bear Team Real Estate · Orlando
          </div>
        </div>

        <div
          style={{
            display: "flex",
            color: "#ffffff",
            fontSize,
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: 1040,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", color: "#C3CDDA", fontSize: 28, fontWeight: 700 }}>joinbearteam.com</div>
          <div style={{ display: "flex", background: ACCENT, color: "#ffffff", fontSize: 24, fontWeight: 700, padding: "12px 28px", borderRadius: 10 }}>
            $0 monthly fees · 60/40 → 90/10
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
