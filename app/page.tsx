"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ─── Brand constants ──────────────────────────────────────────────────────────
const CALENDLY = "https://calendly.com/thomas-songer/bear-team-meet";
const CHAT = "/chat";

const INK = "#0B1B33";
const BODY = "#5B6675";
const MUTED = "#8A94A6";
const BORDER = "#E6E8EC";
const SOFT = "#F7F8FA";
const NAVY = "#0B1D3A";
const ACCENT = "#2F5C8F";
const FONT = "var(--font-geist-sans), Inter, system-ui, sans-serif";
const MAXW = 1080;

// ─── Motion system (one vocabulary, reused on every section) ───
const EASE = "cubic-bezier(.22,.61,.36,1)";
const DUR = 0.6;   // entrance duration (s)
const STEP = 0.09; // stagger between siblings (s)
const DIST = 22;   // entrance travel (px)

// ─── Reveal on scroll (fade-up) ───────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  from = "up",
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  from?: "up" | "left" | "right";
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown
          ? "translate(0,0)"
          : from === "left"
          ? `translateX(-${DIST}px)`
          : from === "right"
          ? `translateX(${DIST}px)`
          : `translateY(${DIST}px)`,
        transition: `opacity ${DUR}s ${EASE} ${delay}s, transform ${DUR}s ${EASE} ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Parallax({
  children,
  strength = 26,
}: {
  children: React.ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [y, setY] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const center = r.top + r.height / 2;
      const prog = (center - vh / 2) / (vh / 2 + r.height / 2);
      setY(Math.max(-1, Math.min(1, prog)) * -strength);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength]);
  return (
    <div ref={ref} style={{ transform: `translate3d(0, ${y}px, 0)`, willChange: "transform" }}>
      {children}
    </div>
  );
}

function CountUp({
  to,
  prefix = "",
  suffix = "",
  durationMs = 1100,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs);
          const eased = 1 - Math.pow(1 - t, 3);
          setVal(Math.round(to * eased));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, durationMs]);
  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: ACCENT,
      }}
    >
      {children}
    </span>
  );
}

// ─── Buttons ──────────────────────────────────────────────────────────────────
function PrimaryBtn({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const props = external
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { href };
  return (
    <a
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        background: NAVY,
        color: "#fff",
        fontSize: 15,
        fontWeight: 600,
        padding: "14px 26px",
        borderRadius: 10,
        textDecoration: "none",
        boxShadow: "0 1px 2px rgba(11,29,58,0.18)",
        transition: "background .2s ease, transform .2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#15315a")}
      onMouseLeave={(e) => (e.currentTarget.style.background = NAVY)}
    >
      {children}
    </a>
  );
}

function GhostBtn({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color: INK,
        fontSize: 15,
        fontWeight: 600,
        padding: "14px 20px",
        borderRadius: 10,
        textDecoration: "none",
        border: `1px solid ${BORDER}`,
        background: "#fff",
        transition: "border-color .2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#C7CCD4")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
    >
      {children}
    </a>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "saturate(180%) blur(12px)",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <nav
        style={{
          maxWidth: MAXW,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href="#top"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bt-logo-mark.svg"
            alt="Bear Team"
            width={30}
            height={30}
            style={{ display: "block" }}
          />
          <span style={{ color: INK, fontWeight: 700, fontSize: 16 }}>
            Bear Team
          </span>
        </a>

        <div
          className="nav-links"
          style={{ display: "flex", alignItems: "center", gap: 28 }}
        >
          <Link href="/orlando-real-estate-brokerage" style={navLink}>
            Why Switch
          </Link>
          <Link href="/commission-splits" style={navLink}>
            Splits
          </Link>
          <Link href="/your-numbers" style={navLink}>
            Calculator
          </Link>
          <Link href="/faq" style={navLink}>
            FAQ
          </Link>
          <Link href="/blog" style={navLink}>
            Blog
          </Link>
          <GhostBtn href={CHAT}>Talk to Scout</GhostBtn>
          <PrimaryBtn href={CALENDLY} external>
            Book a Call
          </PrimaryBtn>
        </div>

        <button
          className="nav-burger"
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
          style={{
            display: "none",
            width: 44,
            height: 44,
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            background: "#fff",
            color: INK,
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {open && (
        <div
          className="nav-mobile"
          style={{
            display: "none",
            flexDirection: "column",
            gap: 4,
            padding: "8px 24px 18px",
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          <Link href="/orlando-real-estate-brokerage" style={navLinkMobile} onClick={() => setOpen(false)}>
            Why Switch
          </Link>
          <Link href="/commission-splits" style={navLinkMobile} onClick={() => setOpen(false)}>
            Splits
          </Link>
          <Link href="/your-numbers" style={navLinkMobile} onClick={() => setOpen(false)}>
            Calculator
          </Link>
          <Link href="/faq" style={navLinkMobile} onClick={() => setOpen(false)}>
            FAQ
          </Link>
          <Link href="/blog" style={navLinkMobile} onClick={() => setOpen(false)}>
            Blog
          </Link>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <GhostBtn href={CHAT}>Talk to Scout</GhostBtn>
            <PrimaryBtn href={CALENDLY} external>
              Book a Call
            </PrimaryBtn>
          </div>
        </div>
      )}
    </header>
  );
}
const navLink: React.CSSProperties = {
  color: BODY,
  fontSize: 14.5,
  fontWeight: 500,
  textDecoration: "none",
};
const navLinkMobile: React.CSSProperties = {
  color: INK,
  fontSize: 16,
  fontWeight: 600,
  textDecoration: "none",
  padding: "10px 0",
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      style={{
        background: "#fff",
        padding: "clamp(56px,9vw,104px) 24px clamp(40px,6vw,64px)",
      }}
    >
      <div style={{ maxWidth: MAXW, margin: "0 auto" }}>
        <div
          className="hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
            gap: "clamp(28px,5vw,56px)",
            alignItems: "center",
          }}
        >
        <div>
        <Reveal from="left">
          <Eyebrow>Boutique residential real estate brokerage · Orlando, FL</Eyebrow>
        </Reveal>
        <Reveal from="left" delay={STEP}>
          <h1
            style={{
              fontSize: "clamp(38px,6vw,62px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              fontWeight: 700,
              color: INK,
              margin: "18px 0 0",
              maxWidth: 820,
            }}
          >
            Stop paying into a cap{" "}
            <span style={{ color: ACCENT }}>you never hit.</span>
          </h1>
        </Reveal>
        <Reveal delay={2 * STEP}>
          <h2
            style={{
              fontSize: "clamp(18px,2.6vw,24px)",
              lineHeight: 1.3,
              fontWeight: 600,
              color: BODY,
              margin: "14px 0 0",
              maxWidth: 700,
            }}
          >
            Built for Orlando agents who are done overpaying.
          </h2>
        </Reveal>
        <Reveal delay={3 * STEP}>
          <p
            style={{
              fontSize: "clamp(17px,2.2vw,20px)",
              lineHeight: 1.6,
              color: BODY,
              margin: "22px 0 0",
              maxWidth: 620,
            }}
          >
            Bear Team gives you progressive splits from 60/40 to 90/10, zero
            monthly fees, and an AI assistant that runs your pipeline. See your
            real numbers before you switch.
          </p>
        </Reveal>
        <Reveal delay={4 * STEP}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              marginTop: 32,
              alignItems: "center",
            }}
          >
            <PrimaryBtn href={CALENDLY} external>
              Book a Call →
            </PrimaryBtn>
            <a
              href={CHAT}
              style={{
                color: INK,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                borderBottom: `2px solid ${BORDER}`,
                paddingBottom: 2,
              }}
            >
              Run my numbers with Scout
            </a>
          </div>
        </Reveal>
        </div>
        <Reveal from="right" delay={2 * STEP}>
          <Parallax strength={16}>
            <div
              className="hero-photo"
              style={{
                borderRadius: 20,
                overflow: "hidden",
                aspectRatio: "4 / 5",
                boxShadow: "0 30px 70px -34px rgba(11,27,51,0.45)",
                border: `1px solid ${BORDER}`,
                background: SOFT,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/bethanne.webp"
                alt="Bethanne Baer, Broker and Owner of Bear Team Real Estate, in an Orlando kitchen"
                width={1200}
                height={1500}
                fetchPriority="high"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          </Parallax>
        </Reveal>
        </div>

        <Reveal delay={3 * STEP} style={{ marginTop: "clamp(40px,6vw,64px)" }}>
          <Parallax strength={30}>
            <DashboardMock />
          </Parallax>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Single product screenshot: BearTeamOS dashboard ──────────────────────────
function DashboardMock() {
  const kpis = [
    { label: "Starting Split", value: "60/40", delta: "up to 90/10" },
    { label: "Monthly Fees", value: "$0", delta: "always" },
    { label: "Per Closing", value: <CountUp to={150} prefix="$" />, delta: "flat fee" },
    { label: "E&O Insurance", value: "Covered", delta: "by Bear Team" },
  ];
  const rows = [
    ["Tier 1 · Start", "Day one — your first deals", "60/40"],
    ["Tier 2", "After Bear Team collects $16K", "70/30"],
    ["Tier 3", "Keep producing", "80/20"],
    ["Team Lead", "16+ deals", "90/10"],
  ];
  return (
    <div
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 24px 60px -28px rgba(11,27,51,0.28)",
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          borderBottom: `1px solid ${BORDER}`,
          background: SOFT,
        }}
      >
        <span style={dot("#E0564E")} />
        <span style={dot("#E7B14C")} />
        <span style={dot("#4FAE63")} />
        <span
          style={{
            marginLeft: 12,
            fontSize: 12.5,
            color: MUTED,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          app.bearteamos.com/dashboard
        </span>
      </div>
      <div style={{ padding: "clamp(18px,3vw,28px)" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 18,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <strong style={{ color: INK, fontSize: 15 }}>
            Your Bear Team numbers
          </strong>
          <span style={{ fontSize: 12, color: "#4FAE63", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span className="bt-live-dot" /> ONLINE
          </span>
        </div>
        <div
          className="kpi-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 12,
            marginBottom: 18,
          }}
        >
          {kpis.map((k) => (
            <div
              key={k.label}
              style={{
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: "14px 16px",
                background: "#fff",
              }}
            >
              <div style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>
                {k.label}
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: INK,
                  letterSpacing: "-0.02em",
                }}
              >
                {k.value}
              </div>
              <div style={{ fontSize: 11.5, color: ACCENT, marginTop: 4 }}>
                {k.delta}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.8fr 0.8fr",
              padding: "10px 16px",
              background: SOFT,
              fontSize: 12,
              color: MUTED,
              fontWeight: 600,
            }}
          >
            <span>Tier</span>
            <span>When you reach it</span>
            <span style={{ textAlign: "right" }}>Split</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={r[0]}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.8fr 0.8fr",
                padding: "12px 16px",
                borderTop: `1px solid ${BORDER}`,
                fontSize: 14,
                color: INK,
                background: i === 0 ? "#F4F7FB" : "#fff",
              }}
            >
              <span style={{ fontWeight: 600 }}>{r[0]}</span>
              <span style={{ color: BODY }}>{r[1]}</span>
              <span style={{ fontWeight: 700, color: ACCENT, textAlign: "right" }}>{r[2]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
const dot = (c: string): React.CSSProperties => ({
  width: 11,
  height: 11,
  borderRadius: "50%",
  background: c,
  display: "inline-block",
});

// ─── "Why agents stay stuck" carousel (Atticus-style 01/06 slider) ────────────
const STUCK = [
  {
    cat: "No system of record",
    problem: "You're making it up deal by deal.",
    fix: "BearTeamOS is your single source of truth — pipeline, commissions, and next move in one place. You walk into the system on day one. You don't build it.",
  },
  {
    cat: "Fees with nothing behind them",
    problem: "You're paying $100–$300 a month to your brokerage.",
    fix: "$0 per month at Bear Team. No desk fee, no tech fee, no royalty. Your only cost is a $150 flat fee per closing — and E&O is covered.",
  },
  {
    cat: "A flat split with no path",
    problem: "Your split never improves, no matter how much you produce.",
    fix: "Progressive splits: 60/40 → 70/30 → 80/20 → 90/10. Once Bear Team collects $16K from your deals, you graduate automatically — no conversation required.",
  },
  {
    cat: "Sink-or-swim onboarding",
    problem: "You were handed a login and wished good luck.",
    fix: "A structured 30-60-90 day plan through BearTeam Academy — free from day one. Real mentorship, real sequence, no guesswork.",
  },
  {
    cat: "You manage your own pipeline",
    problem: "No visibility, no structure, no obvious next step.",
    fix: "Scout, your AI assistant, surfaces the next best action on every lead and runs follow-up in the background — so nothing decays and nothing falls through.",
  },
  {
    cat: "You're a number",
    problem: "You're one of thousands in a national franchise.",
    fix: "Boutique by design. You know Beth and Tom, they know your deals, and support comes from real people who answer the phone.",
  },
];

function VideoEmbed({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false);
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "16 / 9",
        borderRadius: 18,
        overflow: "hidden",
        background: "#000",
        border: `1px solid ${BORDER}`,
        boxShadow: "0 26px 64px -34px rgba(11,27,51,0.4)",
      }}
    >
      {play ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
        />
      ) : (
        <button
          onClick={() => setPlay(true)}
          aria-label="Play video"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, padding: 0, cursor: "pointer", background: "transparent" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
            onError={(e) => {
              e.currentTarget.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
            }}
            alt={title}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(11,27,51,0.28)" }}>
            <span style={{ width: 76, height: 76, borderRadius: "50%", background: "rgba(255,255,255,0.96)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 34px rgba(0,0,0,0.32)" }}>
              <span style={{ marginLeft: 6, width: 0, height: 0, borderStyle: "solid", borderWidth: "12px 0 12px 20px", borderColor: `transparent transparent transparent ${NAVY}` }} />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

function VideoSection() {
  return (
    <section style={{ background: "#fff", padding: "clamp(32px,4vw,52px) 24px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
        <Reveal>
          <Eyebrow>Watch the overview</Eyebrow>
          <h2 style={{ ...h2Style, margin: "14px auto 0", maxWidth: 640 }}>
            See how Bear Team works.
          </h2>
          <p style={{ ...leadStyle, margin: "16px auto 0", maxWidth: 560 }}>
            A quick look at the model, the system, and what it means for your
            business as an agent.
          </p>
        </Reveal>
        <Reveal delay={STEP} style={{ marginTop: 20 }}>
          <VideoEmbed id="lDSsdOcHxjg" title="See how Bear Team works" />
        </Reveal>
      </div>
    </section>
  );
}

function WhyStuck() {
  const [i, setI] = useState(0);
  const n = STUCK.length;
  const item = STUCK[i];
  return (
    <section
      id="why"
      style={{ background: SOFT, padding: "clamp(40px,5vw,68px) 24px" }}
    >
      <div style={{ maxWidth: MAXW, margin: "0 auto" }}>
        <Reveal from="left">
          <Eyebrow>Why good agents stay stuck</Eyebrow>
          <h2 style={h2Style}>
            It&apos;s rarely talent.<br />It&apos;s the absence of a system.
          </h2>
          <p style={{ ...leadStyle, maxWidth: 560 }}>
            Six things that hold producers back — and what closes each one.
          </p>
        </Reveal>

        <Reveal delay={STEP}>
          <div
            style={{
              marginTop: 36,
              border: `1px solid ${BORDER}`,
              borderRadius: 18,
              background: "#fff",
              overflow: "hidden",
              boxShadow: "0 18px 48px -30px rgba(11,27,51,0.22)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 22px",
                borderBottom: `1px solid ${BORDER}`,
                background: SOFT,
              }}
            >
              <span
                style={{
                  fontFamily: "ui-monospace, monospace",
                  fontSize: 13,
                  color: MUTED,
                  letterSpacing: "0.05em",
                }}
              >
                {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  aria-label="Previous"
                  onClick={() => setI((p) => (p - 1 + n) % n)}
                  style={arrowBtn}
                >
                  ←
                </button>
                <button
                  aria-label="Next"
                  onClick={() => setI((p) => (p + 1) % n)}
                  style={arrowBtn}
                >
                  →
                </button>
              </div>
            </div>

            <div
              key={i}
              className="stuck-body stuck-swap"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                minHeight: 240,
              }}
            >
              <div
                style={{
                  padding: "clamp(26px,4vw,44px)",
                  borderRight: `1px solid ${BORDER}`,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: MUTED,
                    marginBottom: 16,
                  }}
                >
                  {item.cat}
                </div>
                <div
                  style={{
                    fontSize: "clamp(22px,3vw,30px)",
                    fontWeight: 700,
                    color: INK,
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {item.problem}
                </div>
              </div>
              <div
                style={{
                  padding: "clamp(26px,4vw,44px)",
                  background: NAVY,
                  color: "#E7ECF3",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#7FA8D4",
                    marginBottom: 16,
                  }}
                >
                  The fix
                </div>
                <div style={{ fontSize: 16.5, lineHeight: 1.6 }}>
                  {item.fix}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                padding: "16px 22px",
                borderTop: `1px solid ${BORDER}`,
                flexWrap: "wrap",
              }}
            >
              {STUCK.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Slide ${idx + 1}`}
                  onClick={() => setI(idx)}
                  style={{
                    height: 6,
                    flex: 1,
                    minWidth: 24,
                    borderRadius: 99,
                    border: "none",
                    cursor: "pointer",
                    background: idx === i ? ACCENT : BORDER,
                    transition: "background .2s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
const arrowBtn: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 9,
  border: `1px solid ${BORDER}`,
  background: "#fff",
  color: INK,
  fontSize: 16,
  cursor: "pointer",
};

// ─── Commission ladder (Atticus "access tiers" — tap to reveal) ───────────────
const TIERS = [
  {
    split: "60 / 40",
    name: "Tier 1 · Entry",
    when: "Where you start — day one.",
    body: "Zero monthly fees, full Scout and BearTeam Academy access, and a structured 30-60-90 plan. Low volume doesn't mean low support.",
  },
  {
    split: "70 / 30",
    name: "Tier 2",
    when: "After Bear Team collects $16K from your deals.",
    body: "You graduate automatically — no negotiation, no waiting period. The cap model rewards what you produce, not how long you've been here.",
  },
  {
    split: "80 / 20",
    name: "Tier 3",
    when: "Keep producing past the next threshold.",
    body: "More of every commission stays with you as your volume climbs. Same zero fees, same flat $150 per close.",
  },
  {
    split: "90 / 10",
    name: "Team Lead",
    when: "16+ deals.",
    body: "Top tier. You keep 90% of every commission — with the full system, training, and E&O still covered by the brokerage.",
  },
];

function TierLadder() {
  const [a, setA] = useState(2);
  const t = TIERS[a];
  return (
    <section
      id="math"
      style={{ background: "#fff", padding: "clamp(40px,5vw,68px) 24px" }}
    >
      <div style={{ maxWidth: MAXW, margin: "0 auto" }}>
        <Reveal from="left">
          <Eyebrow>The commission model</Eyebrow>
          <h2 style={h2Style}>You earn your split.<br />You don&apos;t wait for it.</h2>
          <p style={{ ...leadStyle, maxWidth: 560 }}>
            One $16,000 company-dollar cap, then you advance to the next tier
            automatically. Tap a tier to see when you reach it.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div
            className="tier-row"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 12,
              marginTop: 36,
            }}
          >
            {TIERS.map((tier, idx) => {
              const active = idx === a;
              return (
                <button
                  key={tier.split}
                  onClick={() => setA(idx)}
                  style={{
                    textAlign: "left",
                    cursor: "pointer",
                    borderRadius: 14,
                    padding: "20px 18px",
                    border: `1.5px solid ${active ? NAVY : BORDER}`,
                    background: active ? NAVY : "#fff",
                    color: active ? "#fff" : INK,
                    transition: "all .2s ease",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: active ? "#7FA8D4" : MUTED,
                      marginBottom: 10,
                    }}
                  >
                    {tier.name}
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {tier.split}
                  </div>
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div
            style={{
              marginTop: 14,
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              padding: "clamp(22px,3vw,32px)",
              background: SOFT,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: ACCENT,
                marginBottom: 8,
              }}
            >
              {t.when}
            </div>
            <div style={{ fontSize: 17, lineHeight: 1.6, color: BODY }}>
              {t.body}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div
            className="stat-row"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 12,
              marginTop: 32,
            }}
          >
            {[
              { v: <>$0</>, l: "Monthly cost to you" },
              { v: <CountUp to={150} prefix="$" />, l: "Flat fee per closing" },
              { v: <CountUp to={16} prefix="$" suffix="K" />, l: "Cap, then you advance" },
            ].map(({ v, l }) => (
              <div
                key={l}
                style={{
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                  padding: "24px 18px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: INK,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {v}
                </div>
                <div style={{ fontSize: 13.5, color: MUTED, marginTop: 6 }}>
                  {l}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Comparison ───────────────────────────────────────────────────────────────
function Comparison() {
  const rows: [string, string][] = [
    ["Flat split — no graduation path", "60/40 → 70/30 → 80/20 → 90/10"],
    ["$100–$300 / month in fees", "$0 / month — always"],
    ["Sink-or-swim onboarding", "30-60-90 day structured plan"],
    ["You figure out your own pipeline", "Scout AI surfaces your next step"],
    ["E&O comes out of your pocket", "E&O paid by Bear Team"],
  ];
  return (
    <section style={{ background: SOFT, padding: "clamp(32px,4vw,52px) 24px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <Reveal from="left">
          <Eyebrow>Side by side</Eyebrow>
          <h2 style={h2Style}>Traditional brokerage vs. Bear Team</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <div
            className="cmp-grid"
            style={{
              marginTop: 32,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <div style={{ borderRight: `1px solid ${BORDER}` }}>
              <div style={cmpHead("#fff", MUTED)}>Traditional brokerage</div>
              {rows.map((r) => (
                <div key={r[0]} style={cmpCell}>
                  <span style={{ color: "#C0492F", fontWeight: 700 }}>✕</span>
                  <span style={{ color: BODY }}>{r[0]}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#FAFCFE" }}>
              <div style={cmpHead(NAVY, "#fff")}>Bear Team</div>
              {rows.map((r) => (
                <div key={r[1]} style={cmpCell}>
                  <span style={{ color: "#2E8B57", fontWeight: 700 }}>✓</span>
                  <span style={{ color: INK, fontWeight: 500 }}>{r[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
const cmpHead = (bg: string, color: string): React.CSSProperties => ({
  background: bg,
  color,
  padding: "14px 20px",
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
});
const cmpCell: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
  padding: "16px 20px",
  borderTop: `1px solid ${BORDER}`,
  fontSize: 15,
  lineHeight: 1.5,
};

// ─── Scout (single demo) ──────────────────────────────────────────────────────
function ScoutDemo() {
  return (
    <section
      id="scout"
      style={{ background: "#fff", padding: "clamp(40px,5vw,68px) 24px" }}
    >
      <div
        className="scout-grid"
        style={{
          maxWidth: MAXW,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "clamp(32px,5vw,64px)",
          alignItems: "center",
        }}
      >
        <Reveal from="left">
          <Eyebrow>Meet Scout</Eyebrow>
          <h2 style={{ ...h2Style, marginTop: 14 }}>
            Your AI assistant. Available 24/7. Just answers.
          </h2>
          <p style={leadStyle}>
            Ask Scout about splits, fees, the cap model, or exactly what
            you&apos;d net at Bear Team versus where you are now. Real math, no
            sales pressure — built around the Orlando market and Bear Team
            systems, not a generic template.
          </p>
          <div style={{ marginTop: 28 }}>
            <PrimaryBtn href={CHAT}>Talk to Scout →</PrimaryBtn>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 22px 56px -30px rgba(11,27,51,0.28)",
              background: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 18px",
                borderBottom: `1px solid ${BORDER}`,
                background: SOFT,
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: NAVY,
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                S
              </span>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>
                  Scout
                </div>
                <div style={{ fontSize: 11.5, color: "#2E8B57", display: "inline-flex", alignItems: "center", gap: 6 }}><span className="bt-live-dot" /> Online</div>
              </div>
            </div>
            <div
              style={{
                padding: "20px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <Bubble who="user">
                I&apos;m at KW doing about 8 deals a year. What would I net at
                Bear Team?
              </Bubble>
              <Bubble who="scout">
                At 8 deals on a $415K average, you&apos;d net roughly $87K — with
                zero fees coming out. That&apos;s before your monthly savings.
                Year 2 you start at Tier 2 automatically.
              </Bubble>
              <Bubble who="user">What are my monthly costs?</Bubble>
              <Bubble who="scout">
                $0 / month. No desk, tech, or royalty fees. Your only cost is
                $150 flat per closing, and E&amp;O is covered.
              </Bubble>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 14px",
                borderTop: `1px solid ${BORDER}`,
              }}
            >
              <div
                style={{
                  flex: 1,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 13.5,
                  color: MUTED,
                }}
              >
                Ask Scout anything…
              </div>
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: NAVY,
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ➤
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
function Bubble({
  who,
  children,
}: {
  who: "user" | "scout";
  children: React.ReactNode;
}) {
  const isUser = who === "user";
  return (
    <div
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "86%",
        background: isUser ? NAVY : SOFT,
        color: isUser ? "#fff" : INK,
        border: isUser ? "none" : `1px solid ${BORDER}`,
        borderRadius: 14,
        padding: "11px 15px",
        fontSize: 14.5,
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  );
}

// ─── Proof: testimonials + founder ────────────────────────────────────────────
function AgentTools() {
  const tools: [string, string][] = [
    [
      "BoldTrail (kvCORE) IDX website",
      "Your own home-search website that captures buyer and seller leads — you don't need listings of your own to start bringing in business.",
    ],
    [
      "Built-in CRM",
      "Every lead organized in one place with automated follow-up, so nothing slips while you're still learning the ropes.",
    ],
    [
      "BearTeamOS + Scout AI",
      "Your pipeline, commissions, and next best action in one system. Scout tells you exactly what to do next on every lead, 24/7.",
    ],
    [
      "Training to actually use it",
      "BearTeam Academy walks you through the whole stack — you're never handed a login and wished good luck.",
    ],
  ];
  return (
    <section id="tools" style={{ background: SOFT, padding: "clamp(40px,5vw,68px) 24px" }}>
      <div
        className="tools-grid"
        style={{
          maxWidth: MAXW,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.4fr 0.9fr",
          gap: "clamp(32px,5vw,64px)",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Reveal from="left">
            <Parallax strength={20}>
              <VideoEmbed id="pCQD2speGDA" title="The Bear Team agent tools, in action" />
            </Parallax>
          </Reveal>
          <Reveal from="left" delay={STEP}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: ACCENT, marginBottom: 8 }}>
              Bear Team Academy
            </div>
            <VideoEmbed id="ytb1sZyHk-Y" title="Bear Team Academy — training that gets you producing" />
          </Reveal>
        </div>
        <div>
          <Reveal from="right">
            <Eyebrow>Included at no cost</Eyebrow>
            <h2 style={h2Style}>Your lead-gen website + CRM — running on day one.</h2>
            <p style={{ ...leadStyle, maxWidth: 520 }}>
              A new agent&apos;s biggest fear is no leads and no system to work
              them. At Bear Team you walk in with the whole stack — no cobbling
              tools together, no $200–300 a month platform bill.
            </p>
          </Reveal>
          <div style={{ marginTop: 22 }}>
            {tools.map(([t, d], i) => (
              <Reveal key={t} delay={STEP * (i + 1)}>
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "14px 0",
                    borderTop: `1px solid ${BORDER}`,
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      background: NAVY,
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      marginTop: 2,
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, color: INK, fontSize: 16 }}>{t}</div>
                    <div style={{ color: BODY, fontSize: 14.5, lineHeight: 1.55, marginTop: 2 }}>{d}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={STEP * 5}>
            <p style={{ marginTop: 18, fontSize: 14.5, color: BODY }}>
              All of it <strong style={{ color: INK }}>included at $0</strong> — part of the
              no-monthly-fee model.{" "}
              <Link href="/no-fee-brokerage" style={{ color: ACCENT, fontWeight: 700 }}>
                See the fee structure →
              </Link>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Proof() {
  const cards = [
    {
      tag: "Stuck mid-level → breakthrough",
      quote:
        "I was hovering at 6 deals a year with no real direction. Once I followed the system, I hit 12 without working more hours.",
      who: "Lauren S.",
      from: "RE/MAX → Bear Team",
    },
    {
      tag: "Burned out → reset",
      quote:
        "I was doing everything manually and it was exhausting. This simplified all of it. I'm working less and closing more.",
      who: "Stephanie L.",
      from: "eXp Realty → Bear Team",
    },
    {
      tag: "System over hustle",
      quote:
        "I thought I needed to work harder. Turns out I needed a system. The daily plan and scripts changed everything.",
      who: "Chris D.",
      from: "Coldwell Banker → Bear Team",
    },
  ];
  return (
    <section style={{ background: SOFT, padding: "clamp(40px,5vw,68px) 24px" }}>
      <div style={{ maxWidth: MAXW, margin: "0 auto" }}>
        <Reveal from="left">
          <Eyebrow>Agent results</Eyebrow>
          <h2 style={h2Style}>What agents say after they make the move.</h2>
        </Reveal>
        <div
          className="proof-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
            marginTop: 36,
          }}
        >
          {cards.map((c, idx) => (
            <Reveal key={c.who} delay={0.05 * idx}>
              <div
                style={{
                  background: "#fff",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 16,
                  padding: 24,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: ACCENT,
                    marginBottom: 14,
                  }}
                >
                  {c.tag}
                </div>
                <p
                  style={{
                    fontSize: 15.5,
                    lineHeight: 1.6,
                    color: INK,
                    flex: 1,
                    margin: 0,
                  }}
                >
                  &ldquo;{c.quote}&rdquo;
                </p>
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontWeight: 700, color: INK, fontSize: 14.5 }}>
                    {c.who}
                  </div>
                  <div style={{ fontSize: 13, color: MUTED }}>{c.from}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div
            className="founder-card"
            style={{
              marginTop: 40,
              background: NAVY,
              borderRadius: 18,
              overflow: "hidden",
              color: "#E7ECF3",
              display: "flex",
              alignItems: "stretch",
            }}
          >
            <div
              className="founder-photo"
              style={{
                flex: "0 0 clamp(220px, 34%, 360px)",
                position: "relative",
                minHeight: 320,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/tom-songer.webp"
                alt="Tom Songer, Team Lead at Bear Team Real Estate"
                width={720}
                height={720}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center 28%",
                  display: "block",
                }}
              />
            </div>
            <div
              style={{
                flex: 1,
                padding: "clamp(28px,4vw,48px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <p
                style={{
                  fontSize: "clamp(18px,2.4vw,23px)",
                  lineHeight: 1.55,
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                &ldquo;I built this model because I was tired of watching good
                agents pay into a cap they never hit. I&apos;ve been on both
                sides of this. The structure works because I designed it to
                reward production.&rdquo;
              </p>
              <div style={{ marginTop: 22 }}>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: 16 }}>
                  Tom Songer
                </div>
                <div style={{ fontSize: 13, color: "#9DB4D0" }}>
                  Team Lead · Bear Team Real Estate
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section
      id="contact"
      style={{ background: "#fff", padding: "clamp(64px,10vw,120px) 24px" }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <Reveal from="left">
          <Eyebrow>Get started</Eyebrow>
          <h2
            style={{
              ...h2Style,
              fontSize: "clamp(30px,4.4vw,46px)",
              maxWidth: 600,
              margin: "14px auto 0",
            }}
          >
            See your real numbers before you switch.
          </h2>
          <p style={{ ...leadStyle, margin: "18px auto 0", maxWidth: 520 }}>
            You&apos;re not joining today — you&apos;re starting a conversation
            with a system that has answers. Book a call with Tom, or run your
            numbers with Scout right now.
          </p>
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: 32,
            }}
          >
            <PrimaryBtn href={CALENDLY} external>
              Book a Discovery Call →
            </PrimaryBtn>
            <GhostBtn href={CHAT}>Talk to Scout</GhostBtn>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      style={{
        background: NAVY,
        color: "#9DB4D0",
        padding: "clamp(40px,7vw,60px) 24px",
      }}
    >
      <div
        style={{
          maxWidth: MAXW,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/bt-logo-white.svg"
              alt="Bear Team"
              width={26}
              height={26}
              style={{ display: "block" }}
            />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
              Bear Team Real Estate
            </span>
          </div>
          <div style={{ fontSize: 13, marginTop: 6 }}>
            Orlando, FL · Independent Licensed Brokerage · Bethanne Baer, Broker
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 22,
            flexWrap: "wrap",
            fontSize: 14,
          }}
        >
          <Link href={CHAT} style={footLink}>
            Talk to Scout
          </Link>
          <Link href="/scout" style={footLink}>
            The System
          </Link>
          <Link href="/orlando-real-estate-brokerage" style={footLink}>
            Orlando Brokerage
          </Link>
          <Link href="/commission-splits" style={footLink}>
            Splits
          </Link>
          <Link href="/your-numbers" style={footLink}>
            Calculator
          </Link>
          <Link href="/switch-brokerages-florida" style={footLink}>
            Switch in FL
          </Link>
          <Link href="/faq" style={footLink}>
            FAQ
          </Link>
          <Link href="/blog" style={footLink}>
            Blog
          </Link>
          <Link href="/academy" style={footLink}>
            Academy
          </Link>
          <Link href="/privacy" style={footLink}>
            Privacy
          </Link>
        </div>
      </div>
      <div
        style={{
          maxWidth: MAXW,
          margin: "28px auto 0",
          paddingTop: 20,
          borderTop: "1px solid #1c3a63",
          fontSize: 12.5,
          color: "#6E89AD",
        }}
      >
        <div>Made exclusively for · © 2026 Bear Team Real Estate · Bethanne Baer, Broker</div>
        <div style={{ marginTop: 4 }}>Design &amp; development · © 2026 Atticus&trade; · WorldTeachPathways dba WorldTeachESL LLC · All IP rights reserved</div>
      </div>
    </footer>
  );
}
const footLink: React.CSSProperties = {
  color: "#9DB4D0",
  textDecoration: "none",
};

// ─── Shared text styles ───────────────────────────────────────────────────────
const h2Style: React.CSSProperties = {
  fontSize: "clamp(28px,4vw,42px)",
  lineHeight: 1.12,
  letterSpacing: "-0.025em",
  fontWeight: 700,
  color: INK,
  margin: "14px 0 0",
  maxWidth: 720,
};
const leadStyle: React.CSSProperties = {
  fontSize: "clamp(16px,2vw,18px)",
  lineHeight: 1.6,
  color: BODY,
  margin: "16px 0 0",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main id="top" style={{ fontFamily: FONT, background: "#fff", color: INK }}>
      <style>{`
        html { scroll-behavior: smooth; }
        main { overflow-x: hidden; }
        :target { scroll-margin-top: 80px; }
        @keyframes btLive {
          0%, 100% { box-shadow: 0 0 0 0 rgba(63,174,99,0.5); opacity: 1; }
          50% { box-shadow: 0 0 0 5px rgba(63,174,99,0); opacity: 0.55; }
        }
        .bt-live-dot { width: 8px; height: 8px; border-radius: 50%; background: #3FAE63; display: inline-block; animation: btLive 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .bt-live-dot { animation: none; } }
        @keyframes stuckSwap { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .stuck-swap { animation: stuckSwap ${DUR}s ${EASE}; }
        @media (prefers-reduced-motion: reduce) { .stuck-swap { animation: none; } }
        @media (max-width: 860px) {
          .nav-links { display: none !important; }
          .nav-burger { display: inline-flex !important; }
          .nav-mobile { display: flex !important; }
          .kpi-grid { grid-template-columns: repeat(2,1fr) !important; }
          .stuck-body { grid-template-columns: 1fr !important; }
          .stuck-body > div:first-child { border-right: none !important; border-bottom: 1px solid ${BORDER} !important; }
          .tier-row { grid-template-columns: repeat(2,1fr) !important; }
          .scout-grid { grid-template-columns: 1fr !important; }
          .tools-grid { grid-template-columns: 1fr !important; }
          .proof-grid { grid-template-columns: 1fr !important; }
          .stat-row { grid-template-columns: 1fr !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-photo { max-width: 360px; margin: 8px auto 0; }
          .founder-card { flex-direction: column !important; }
          .founder-photo { flex: none !important; height: 340px; min-height: 0 !important; }
        }
        @media (max-width: 560px) {
          .cmp-grid { grid-template-columns: 1fr !important; }
          .cmp-grid > div:first-child { border-right: none !important; border-bottom: 1px solid ${BORDER} !important; }
        }
        input, textarea, select { font-size: 16px; }
      `}</style>
      <Nav />
      <Hero />
      <WhyStuck />
      <TierLadder />
      <Comparison />
      <VideoSection />
      <ScoutDemo />
      <AgentTools />
      <Proof />
      <FinalCTA />
      <Footer />
    </main>
  );
}
