"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}
interface HeroFadeProps {
  children: React.ReactNode;
  delay?: number;
}
interface ScoutCTAProps {
  size?: "sm" | "lg";
  label?: string;
}
interface ScreenCardProps {
  children: React.ReactNode;
  translate: MotionValue<number>;
}
interface SystemPanelProps {
  label: string;
  title: string;
  description: string;
  href: string;
  external?: boolean;
  videoModal?: string;
  visual: React.ReactNode;
  index: number;
}

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Reveal component ─────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── SlideSection — slides in from left or right on scroll ───────────────────

function SlideSection({ children, direction = "left", style = {} }: { children: React.ReactNode; direction?: "left" | "right"; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.25"] });
  const x = useTransform(scrollYProgress, [0, 1], [direction === "left" ? -80 : 80, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const xSpring = useSpring(x, { stiffness: 60, damping: 20 });
  const opacitySpring = useSpring(opacity, { stiffness: 60, damping: 20 });
  return (
    <motion.div ref={ref} style={{ x: xSpring, opacity: opacitySpring, ...style }}>
      {children}
    </motion.div>
  );
}

// ─── HeroFade ─────────────────────────────────────────────────────────────────

function HeroFade({ children, delay = 0 }: HeroFadeProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}
    >
      {children}
    </div>
  );
}

// ─── Scout CTA button ─────────────────────────────────────────────────────────

function ScoutCTA({ size = "lg", label = "Start with Scout" }: ScoutCTAProps) {
  const pad = size === "lg" ? "14px 32px" : "10px 22px";
  const fontSize = size === "lg" ? "1rem" : "0.875rem";
  return (
    <Link href="https://www.joinbearteam.com/academy" style={{ display: "inline-block", maxWidth: "100%" }}>
      <button
        className="scout-cta-btn"
        style={{
          padding: pad,
          fontSize,
          fontWeight: 600,
          letterSpacing: "0.02em",
          background: "linear-gradient(135deg, #3b5a82 0%, #2c4a72 100%)",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(59,90,130,0.45)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          minHeight: "44px",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(59,90,130,0.55)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(59,90,130,0.45)";
        }}
      >
        {label} →
      </button>
    </Link>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: "60px",
        background: "rgba(11,22,42,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(16px,4vw,40px)" }}>
        <a href="#top" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <svg width="32" height="32" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="32" height="32" rx="2" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6"/>
            <text x="17" y="22.5" textAnchor="middle" fontFamily="-apple-system,BlinkMacSystemFont,sans-serif" fontWeight="800" fontSize="12" fill="white">BT</text>
          </svg>
          <span style={{ color: "#ffffff", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "0.01em" }}>
            Bear Real Estate Team
          </span>
        </a>
        {/* Desktop links */}
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }} className="nav-desktop">
          <a href="/scout" style={{ color: "rgba(255,255,255,0.70)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>
            Why Scout
          </a>
          <a href="/chat" style={{ color: "rgba(255,255,255,0.70)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>
            Try Scout
          </a>
          <a
            href="sms:+14077588102"
            style={{
              background: "#3b6ea8",
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
              padding: "9px 20px",
              borderRadius: "8px",
              whiteSpace: "nowrap",
            }}
          >
            Text Me Scout
          </a>
        </div>
        {/* Mobile hamburger — 44×44 tap target */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{ display: "none", background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", padding: "10px", minWidth: "44px", minHeight: "44px", alignItems: "center", justifyContent: "center", borderRadius: "8px" }}
          className="nav-hamburger"
          aria-label="Menu"
        >
          <div style={{ width: 18, height: 1.5, background: "white", marginBottom: 4.5, transition: "all 0.2s", transform: menuOpen ? "rotate(45deg) translate(4px,4px)" : "none" }} />
          <div style={{ width: 18, height: 1.5, background: "white", marginBottom: 4.5, opacity: menuOpen ? 0 : 1, transition: "all 0.2s" }} />
          <div style={{ width: 18, height: 1.5, background: "white", transition: "all 0.2s", transform: menuOpen ? "rotate(-45deg) translate(4px,-4px)" : "none" }} />
        </button>
        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{ position: "absolute", top: "60px", left: 0, right: 0, background: "rgba(11,22,42,0.97)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "8px 16px 16px", display: "flex", flexDirection: "column", gap: "0", borderBottom: "1px solid rgba(255,255,255,0.08)", zIndex: 99 }}>
            <a href="/scout" onClick={() => setMenuOpen(false)} style={{ color: "rgba(255,255,255,0.80)", textDecoration: "none", fontSize: "0.95rem", fontWeight: 500, padding: "14px 8px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>Why Scout</a>
            <a href="/chat" onClick={() => setMenuOpen(false)} style={{ color: "rgba(255,255,255,0.80)", textDecoration: "none", fontSize: "0.95rem", fontWeight: 500, padding: "14px 8px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>Try Scout</a>
            <a href="sms:+14077588102" onClick={() => setMenuOpen(false)} style={{ marginTop: 8, background: "#3b6ea8", color: "#ffffff", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600, padding: "12px 16px", borderRadius: "8px", textAlign: "center" }}>Text Me Scout</a>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── Blueprint Grid (matches /scout background) ───────────────────────────────

function BlueprintGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const C = [107, 114, 128];
    let last = 0;
    const draw = (t: number) => {
      const dt = last ? (t - last) / 1000 : 0.016;
      last = t;
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);
      offsetRef.current.x = (offsetRef.current.x + 5 * dt * 0.6) % 56;
      offsetRef.current.y = (offsetRef.current.y + 5 * dt * 0.4) % 56;
      const ox = offsetRef.current.x;
      const oy = offsetRef.current.y;
      const cols = Math.ceil(w / 56) + 2;
      const rows = Math.ceil(h / 56) + 2;
      ctx.strokeStyle = `rgba(${C[0]},${C[1]},${C[2]},0.10)`;
      ctx.lineWidth = 0.5;
      for (let i = -1; i <= cols; i++) {
        const x = i * 56 + (ox % 56);
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let j = -1; j <= rows; j++) {
        const y = j * 56 + (oy % 56);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      for (let i = -1; i <= cols; i++) {
        for (let j = -1; j <= rows; j++) {
          const x = i * 56 + (ox % 56);
          const y = j * 56 + (oy % 56);
          ctx.fillStyle = `rgba(${C[0]},${C[1]},${C[2]},0.12)`;
          ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animRef.current); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} aria-hidden="true" />;
}

// ─── Screenshot Mockup Cards (6 unique) ───────────────────────────────────────

// Card 1: "How This Onboarding Works" — slide-style overview
function Card1_AcademyWelcome() {
  const items = [
    { label: "Program Structure", sub: "Sequential & locked sections" },
    { label: "Learning Activities", sub: "Simulations, scenarios, assessments" },
    { label: "Completion Standards", sub: "Passing scores, tracking & certification" },
    { label: "What to Expect", sub: "Active, deliberate, intentional" },
  ];
  return (
    <div style={{ width:"100%", height:"100%", fontFamily:"-apple-system,sans-serif", display:"flex", flexDirection:"row" }}>
      {/* Left dark panel */}
      <div style={{ width:"42%", background:"#111c2e", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"18px 16px 14px", flexShrink:0 }}>
        <div>
          {/* BT Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
            <div style={{ border:"2px solid #fff", padding:"3px 6px" }}>
              <span style={{ color:"#fff", fontWeight:900, fontSize:"0.75rem" }}>BT</span>
            </div>
            <div>
              <div style={{ color:"#fff", fontWeight:800, fontSize:"0.58rem", letterSpacing:"0.08em" }}>BEAR TEAM</div>
              <div style={{ color:"rgba(255,255,255,0.55)", fontSize:"0.44rem", letterSpacing:"0.15em" }}>— ACADEMY —</div>
            </div>
          </div>
          {/* Title */}
          <div style={{ color:"#fff", fontWeight:900, fontSize:"1.05rem", lineHeight:1.15, marginBottom:12, letterSpacing:"-0.01em" }}>
            HOW THIS<br />ONBOARDING<br />WORKS
          </div>
          {/* Blue accent line */}
          <div style={{ width:36, height:3, background:"#3b82f6", marginBottom:12, borderRadius:2 }} />
          {/* Italic tagline */}
          <div style={{ color:"rgba(255,255,255,0.65)", fontSize:"0.52rem", fontStyle:"italic", marginBottom:14, lineHeight:1.5 }}>
            Sequential. Structured. Intentional.
          </div>
          {/* Purpose */}
          <div style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.44rem", letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:6 }}>Purpose</div>
          <div style={{ color:"rgba(255,255,255,0.8)", fontSize:"0.52rem", lineHeight:1.6 }}>
            Prepare every agent to operate inside Bear Team systems with clarity, consistency, and without guesswork.
          </div>
        </div>
        {/* Footer bar */}
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.15)", paddingTop:8, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.38rem", letterSpacing:"0.12em", textTransform:"uppercase" }}>Bear Team Academy</div>
          <div style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.38rem", letterSpacing:"0.12em", textTransform:"uppercase" }}>Agent Onboarding Program</div>
        </div>
      </div>
      {/* Right light panel */}
      <div style={{ flex:1, background:"#f8f9fb", display:"flex", flexDirection:"column", justifyContent:"center", padding:"18px 16px" }}>
        <div style={{ fontSize:"0.5rem", fontWeight:700, color:"#6b7280", letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:14 }}>In This Overview</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {items.map((item, i) => (
            <div key={i} style={{ background:"#eef0f4", borderRadius:6, padding:"10px 12px", borderLeft:"3px solid #3b82f6", display:"flex", alignItems:"flex-start", gap:8 }}>
              <span style={{ color:"#3b82f6", fontSize:"0.6rem", marginTop:1, flexShrink:0 }}>→</span>
              <div>
                <div style={{ fontSize:"0.62rem", fontWeight:800, color:"#111", marginBottom:2 }}>{item.label}</div>
                <div style={{ fontSize:"0.52rem", color:"#6b7280" }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Card 2: My courses grid
function Card2_MyCourses() {
  const courses = [
    { title:"0 – Starting with Moodle", pct:"100% complete", color:"#16a34a", hasImg:true },
    { title:"1 – Agent Onboarding – How We Think", pct:"100% complete", color:"#16a34a", hasImg:false },
    { title:"2 – Brokerage Structure – How We Function", pct:"66% complete", color:"#2563eb", hasImg:false, badge:"Hidden from students" },
    { title:"3 – Sales Process — How We Produce", pct:"", color:"", hasImg:false, badge:"Hidden from students" },
    { title:"4 – Operational Systems — How We Execute", pct:"", color:"", hasImg:false, badge:"Hidden from students" },
    { title:"5 – Compliance & Risk — How We Protect", pct:"0% complete", color:"#6b7280", hasImg:false, badge:"Hidden from students" },
  ];
  return (
    <div style={{ width:"100%", height:"100%", background:"#fff", fontFamily:"-apple-system,sans-serif", display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"16px 20px 10px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
          <div style={{ fontSize:"1rem", fontWeight:800, color:"#111" }}>My courses</div>
          <div style={{ display:"flex", gap:8 }}>
            <div style={{ padding:"4px 10px", border:"1px solid #d1d5db", borderRadius:6, fontSize:"0.52rem", color:"#374151" }}>Manage courses</div>
            <div style={{ padding:"4px 10px", background:"#2563eb", borderRadius:6, fontSize:"0.52rem", color:"#fff", fontWeight:600 }}>Create course</div>
          </div>
        </div>
        <div style={{ fontSize:"0.6rem", color:"#374151", marginBottom:10 }}>Course overview</div>
        <div style={{ display:"flex", gap:6, marginBottom:10 }}>
          {["All ∨","Search","Sort by course name ∨","Card ∨"].map((t,i) => (
            <div key={i} style={{ padding:"3px 8px", border:"1px solid #d1d5db", borderRadius:5, fontSize:"0.5rem", color: i===1 ? "#9ca3af":"#374151", flex: i===1 ? 1:0 }}>{t}</div>
          ))}
        </div>
      </div>
      <div style={{ flex:1, padding:"0 20px 12px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, overflow:"hidden" }}>
        {courses.map((c,i) => (
          <div key={i} style={{ border:"1px solid #e5e7eb", borderRadius:8, overflow:"hidden", display:"flex", flexDirection:"column" }}>
            <div style={{ height:44, background: c.hasImg ? "#e8dcc8":"#111", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {c.hasImg ? <span style={{ fontSize:"0.7rem" }}>📋</span> : <div style={{ textAlign:"center" }}><div style={{ fontSize:"0.44rem", color:"rgba(255,255,255,0.5)" }}>BT |</div><div style={{ fontSize:"0.46rem", color:"#fff", fontWeight:700 }}>BEAR TEAM</div><div style={{ fontSize:"0.4rem", color:"rgba(255,255,255,0.4)" }}>— ACADEMY —</div></div>}
            </div>
            <div style={{ padding:"6px 7px", flex:1 }}>
              <div style={{ fontSize:"0.48rem", color:"#2563eb", fontWeight:600, lineHeight:1.3, marginBottom:2 }}>{c.title}</div>
              <div style={{ fontSize:"0.44rem", color:"#6b7280", marginBottom:3 }}>Category 1</div>
              {c.badge && <div style={{ display:"inline-block", padding:"1px 5px", background:"#0891b2", borderRadius:4, fontSize:"0.4rem", color:"#fff", marginBottom:2 }}>{c.badge}</div>}
              {c.pct && <div style={{ fontSize:"0.44rem", color:c.color, fontWeight:600 }}>{c.pct}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Card 3: "Introducing Scout" — Scout page with chat preview
function Card3_IntroducingScout() {
  return (
    <div style={{ width:"100%", height:"100%", background:"#f0f1f3", fontFamily:"-apple-system,sans-serif", display:"flex", flexDirection:"column", position:"relative" }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(107,114,128,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(107,114,128,0.08) 1px, transparent 1px)", backgroundSize:"40px 40px" }} />
      <div style={{ position:"relative", zIndex:1, padding:"28px 24px 20px", flex:1, display:"flex", flexDirection:"column" }}>
        <div style={{ fontSize:"1.4rem", fontWeight:800, color:"#111", marginBottom:4 }}>Meet Scout</div>
        <div style={{ fontSize:"0.65rem", color:"#3b5a82", fontWeight:600, marginBottom:10 }}>AI Built Exclusively for Bear Team</div>
        <div style={{ fontSize:"0.62rem", color:"#374151", lineHeight:1.6, marginBottom:14 }}>Not a generic platform. Not a copy.<br />Designed and developed exclusively for Bear Team agents.</div>
        <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 12px", display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <span style={{ fontSize:"0.56rem", color:"#9ca3af", flex:1 }}>Ask Scout about splits, fees, or joining Bear Team...</span>
          <div style={{ width:24, height:24, borderRadius:6, background:"#3b5a82", display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ color:"#fff", fontSize:"0.5rem" }}>➤</span></div>
        </div>
        {[
          "What would I net at Bear Team vs where I am now?",
          "I'm at KW and I never hit my cap. Is that normal?",
          "How does the $16K cap work?",
        ].map((p,i) => (
          <div key={i} style={{ fontSize:"0.52rem", color:"#6b7280", padding:"4px 8px", background:"rgba(255,255,255,0.7)", borderRadius:5, marginBottom:4, border:"1px solid #e5e7eb" }}>{p}</div>
        ))}
        <div style={{ display:"flex", gap:8, marginTop:4, flexWrap:"wrap" }}>
          {["What does it cost to join Bear Team?","I just got my license. Is Bear Team a good fit?"].map((p,i) => (
            <div key={i} style={{ fontSize:"0.52rem", color:"#6b7280", padding:"4px 8px", background:"rgba(255,255,255,0.7)", borderRadius:5, border:"1px solid #e5e7eb" }}>{p}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Card 4: "Scout in Action" — AI-Powered chat section
function Card4_ScoutInAction() {
  return (
    <div style={{ width:"100%", height:"100%", background:"#fff", fontFamily:"-apple-system,sans-serif", display:"flex", flexDirection:"column", padding:"22px 24px" }}>
      <div style={{ fontSize:"0.5rem", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#9ca3af", marginBottom:5 }}>AI-POWERED</div>
      <div style={{ fontSize:"1.2rem", fontWeight:800, color:"#111", marginBottom:4 }}>Scout in Action</div>
      <div style={{ fontSize:"0.6rem", color:"#6b7280", marginBottom:16 }}>Ask Scout anything about splits, fees, or what joining Bear Team looks like for you.</div>
      <div style={{ flex:1, background:"#fff", borderRadius:14, border:"1px solid #e5e7eb", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}>
        <div style={{ padding:"12px 16px", borderBottom:"1px solid #f3f4f6", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <div style={{ width:26, height:26, borderRadius:"50%", background:"#3b5a82", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.55rem", color:"#fff", fontWeight:700 }}>S</div>
          <div><div style={{ fontSize:"0.65rem", fontWeight:700, color:"#111" }}>Scout</div><div style={{ fontSize:"0.5rem", color:"#9ca3af" }}>BearTeam AI Assistant</div></div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:4 }}><div style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e" }}/><span style={{ fontSize:"0.5rem", color:"#22c55e", fontWeight:600 }}>Online</span></div>
        </div>
        <div style={{ flex:1, padding:"14px 16px", display:"flex", flexDirection:"column", gap:10, overflow:"hidden" }}>
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <div style={{ maxWidth:"70%", padding:"10px 14px", background:"#3b5a82", borderRadius:"14px 14px 4px 14px", color:"#fff", fontSize:"0.58rem", lineHeight:1.5 }}>I&rsquo;m at KW doing about 8 deals a year. What would I net at Bear Team?</div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-start" }}>
            <div style={{ maxWidth:"74%", padding:"10px 14px", background:"#f3f4f6", borderRadius:"14px 14px 14px 4px", color:"#374151", fontSize:"0.58rem", lineHeight:1.55 }}>At 8 deals and $415K avg, you&rsquo;d net ~$53,700 at Bear Team vs ~$51,200 at KW — and that&rsquo;s before your monthly fee savings. Year 2 you start at Tier 2 automatically.</div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <div style={{ maxWidth:"62%", padding:"10px 14px", background:"#3b5a82", borderRadius:"14px 14px 4px 14px", color:"#fff", fontSize:"0.58rem", lineHeight:1.5 }}>What are my monthly costs?</div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-start" }}>
            <div style={{ maxWidth:"74%", padding:"10px 14px", background:"#f3f4f6", borderRadius:"14px 14px 14px 4px", color:"#374151", fontSize:"0.58rem", lineHeight:1.55 }}>$0/month. No desk fees, no tech fees, no royalty. Your only cost is $150 flat per closing. E&amp;O is covered by Bear Team.</div>
          </div>
        </div>
        <div style={{ padding:"10px 14px", borderTop:"1px solid #f3f4f6", display:"flex", gap:8, flexShrink:0 }}>
          <div style={{ flex:1, background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 12px", fontSize:"0.55rem", color:"#9ca3af" }}>Ask Scout anything...</div>
          <div style={{ width:30, height:30, borderRadius:8, background:"#3b5a82", display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ color:"#fff", fontSize:"0.55rem" }}>➤</span></div>
        </div>
      </div>
    </div>
  );
}

// Card 5: "See What Scout Can Do" — Try It Now task picker
function Card5_ScoutTryIt() {
  return (
    <div style={{ width:"100%", height:"100%", background:"#fff", fontFamily:"-apple-system,sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"28px 30px" }}>
      <div style={{ fontSize:"0.55rem", color:"#9ca3af", fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:8 }}>TRY IT NOW</div>
      <div style={{ fontSize:"1.3rem", fontWeight:800, color:"#111", marginBottom:6, textAlign:"center" }}>See What Scout Can Do</div>
      <div style={{ fontSize:"0.6rem", color:"#6b7280", marginBottom:22, textAlign:"center" }}>Ask Scout the question every agent wants answered before they switch.</div>
      <div style={{ width:"100%", background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:"16px 18px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          <div style={{ width:22, height:22, borderRadius:"50%", background:"#f3f4f6", border:"1px solid #e5e7eb", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:"0.5rem" }}>⚙</span>
          </div>
          <span style={{ fontSize:"0.62rem", fontWeight:600, color:"#374151" }}>Scout AI</span>
        </div>
        <div style={{ fontSize:"0.58rem", color:"#6b7280", marginBottom:12 }}>Common questions Scout answers instantly:</div>
        {["I closed 8 deals last year. What tier would I be in?","What does it cost to join Bear Team?","What's the difference between Bear Team and eXp?"].map((task,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background:"#f3f4f6", borderRadius:10, marginBottom:8 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#3b5a82", flexShrink:0 }} />
            <span style={{ fontSize:"0.6rem", color:"#374151" }}>{task}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Card 6: Scout full UI — "Hi, I'm Scout" with tabs + prompt grid
function Card6_ScoutFull() {
  return (
    <div style={{ width:"100%", height:"100%", background:"#f3f4f6", fontFamily:"-apple-system,sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}>
      <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e5e7eb", width:"100%", height:"100%", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 2px 20px rgba(0,0,0,0.08)" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid #f3f4f6", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:"#3b5a82", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.6rem", color:"#fff", fontWeight:700 }}>S</div>
          <div><div style={{ fontSize:"0.68rem", fontWeight:700, color:"#111" }}>Scout</div><div style={{ fontSize:"0.52rem", color:"#9ca3af" }}>Bear Team AI Assistant</div></div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:4 }}><div style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e" }}/><span style={{ fontSize:"0.52rem", color:"#22c55e", fontWeight:600 }}>Online</span></div>
        </div>
        <div style={{ padding:"16px 18px 10px", textAlign:"center", flexShrink:0 }}>
          <div style={{ fontSize:"0.78rem", fontWeight:700, color:"#111", marginBottom:4 }}>Hi, I&rsquo;m Scout.</div>
          <div style={{ fontSize:"0.55rem", color:"#6b7280", lineHeight:1.55 }}>I can tell you how Bear Team works, what the commission model looks like, and what joining actually means for your business.</div>
        </div>
        <div style={{ padding:"0 18px 10px", display:"flex", gap:6, flexWrap:"wrap", flexShrink:0 }}>
          {["Listing Marketing","Client Communication","Market Insights","Transaction Support","Agent Growth"].map((t,i) => (
            <span key={t} style={{ fontSize:"0.48rem", padding:"4px 10px", borderRadius:20, background: i===0 ? "#3b5a82":"#f3f4f6", color: i===0 ? "#fff":"#6b7280", fontWeight: i===0 ? 700:400 }}>{t}</span>
          ))}
        </div>
        <div style={{ flex:1, padding:"0 18px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, overflow:"hidden" }}>
          {[
            "I'm at KW and I never hit my cap. Is that normal?",
            "What would I actually net at Bear Team vs where I am now?",
            "How long does it take to switch brokerages in Florida?",
            "I just got my license. Is Bear Team a good first brokerage?",
          ].map((p,i) => (
            <div key={i} style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 10px", fontSize:"0.5rem", color:"#374151", lineHeight:1.5 }}>{p}</div>
          ))}
        </div>
        <div style={{ padding:"10px 18px 12px", display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
          <div style={{ flex:1, background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 12px", fontSize:"0.55rem", color:"#9ca3af" }}>Ask Scout anything...</div>
          <div style={{ width:28, height:28, borderRadius:8, background:"#f3f4f6", border:"1px solid #e5e7eb", display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ fontSize:"0.52rem", color:"#9ca3af" }}>➤</span></div>
        </div>
        <div style={{ textAlign:"center", fontSize:"0.46rem", color:"#9ca3af", paddingBottom:10 }}>Scout is an AI assistant. For complex questions, contact <span style={{ color:"#3b5a82" }}>Tom Songer</span></div>
      </div>
    </div>
  );
}

// ─── Parallax Screen Card wrapper ─────────────────────────────────────────────

function ScreenCard({ children, translate }: { children: React.ReactNode; translate: MotionValue<number> }) {
  return (
    <motion.div
      style={{ x: translate, flexShrink: 0, width: "760px", height: "520px" }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: "14px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)", background: "#fff" }}>
        {children}
      </div>
    </motion.div>
  );
}

// ─── HeroParallax ─────────────────────────────────────────────────────────────

function HeroParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };
  const translateX = useSpring(useTransform(scrollYProgress, [0, 1], [0, 600]), springConfig);
  const translateXReverse = useSpring(useTransform(scrollYProgress, [0, 1], [0, -600]), springConfig);
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.2], [12, 0]), springConfig);
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.15], [0.5, 1]), springConfig);
  const rotateZ = useSpring(useTransform(scrollYProgress, [0, 0.2], [8, 0]), springConfig);
  const translateY = useSpring(useTransform(scrollYProgress, [0, 0.2], [-100, 400]), springConfig);

  const row1 = [<Card1_AcademyWelcome />, <Card2_MyCourses />, <Card3_IntroducingScout />];
  const row2 = [<Card4_ScoutInAction />, <Card5_ScoutTryIt />, <Card6_ScoutFull />];

  return (
    <div
      ref={ref}
      className="hero-parallax-container"
      style={{ height: "200vh", overflow: "hidden", position: "relative", background: "#F0F1F3" }}
    >
      {/* Blueprint photo — base64, lowest layer */}
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('data:image/jpeg;base64,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')",
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.13, filter: "saturate(0.3) brightness(1.05)",
          zIndex: 0, pointerEvents: "none",
        }}
      />
      {/* Blueprint grid lines on top of photo */}
      <BlueprintGrid />

      {/* Sticky hero text */}
      <div style={{ position: "sticky", top: 0, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, pointerEvents: "none", padding: "0 16px" }}>
        <div className="hero-sticky-panel" style={{
          maxWidth: "860px",
          width: "100%",
          padding: "clamp(24px, 5vw, 48px) clamp(20px, 5vw, 48px)",
          textAlign: "center",
          pointerEvents: "all",
          background: "rgba(240,241,243,0.72)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.8) inset",
        }}>
          <HeroFade delay={0}>
            <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", fontWeight: 800, lineHeight: 1.1, color: "#1a1a1a", marginBottom: "20px", letterSpacing: "-0.02em" }}>
              Built Exclusively for
              <br />
              <span style={{ color: "#3b5a82" }}>
                Bear Team Agents
              </span>
            </h1>
          </HeroFade>
          <HeroFade delay={150}>
            <p style={{ fontSize: "1.15rem", color: "#6b7280", maxWidth: "560px", margin: "0 auto 36px", lineHeight: 1.65 }}>
              Scout is not a generic AI tool. It was designed and built from the ground up for Bear Team — to improve every agent's productivity, consistency, and results from day one.
            </p>
          </HeroFade>
          <HeroFade delay={300}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ScoutCTA size="lg" />
            </div>
          </HeroFade>
        </div>
      </div>

      {/* 3D card grid */}
      <div style={{ position: "absolute", inset: 0, zIndex: 5 }}>
        <motion.div className="hero-parallax-rows" style={{ rotateX, rotateZ, translateY, opacity, transformStyle: "preserve-3d", paddingTop: "45vh" }}>
          <motion.div style={{ display: "flex", flexDirection: "row-reverse", gap: "24px", marginBottom: "24px", paddingLeft: "40px", paddingRight: "40px" }}>
            {row1.map((child, i) => <ScreenCard key={i} translate={translateX}>{child}</ScreenCard>)}
          </motion.div>
          <motion.div style={{ display: "flex", flexDirection: "row", gap: "24px", paddingLeft: "40px", paddingRight: "40px" }}>
            {row2.map((child, i) => <ScreenCard key={i} translate={translateXReverse}>{child}</ScreenCard>)}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── System Panel Visuals ──────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function ScoutVisual() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hey — I'm Scout, Bear Team's AI assistant. Ask me about splits, fees, the cap model, or how Bear Team compares to your current brokerage. What's on your mind?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply || "Something went wrong." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Connection error — try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div style={{ width: "100%", height: "100%", background: "#0b1220", borderRadius: "16px", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "10px", background: "#0e1628", flexShrink: 0 }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#81c784", boxShadow: "0 0 7px #81c784" }} />
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.06em" }}>Scout · Bear Team AI</span>
        <div style={{ marginLeft: "auto", padding: "3px 9px", background: "rgba(100,181,246,0.12)", border: "1px solid rgba(100,181,246,0.25)", borderRadius: "10px", fontSize: "0.65rem", color: "#64b5f6", fontWeight: 600 }}>LIVE</div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} style={{ flex: 1, overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ maxWidth: "75%", padding: "10px 14px", background: "rgba(59,90,130,0.55)", borderRadius: "14px 14px 4px 14px", color: "#fff", fontSize: "0.84rem", lineHeight: 1.5 }}>
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={i} style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #3b5a82, #1a2a4a)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.58rem", fontWeight: 700, color: "#64b5f6", marginTop: 2 }}>S</div>
              <div style={{ maxWidth: "80%", padding: "12px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "14px 14px 14px 4px", color: "rgba(255,255,255,0.88)", fontSize: "0.84rem", lineHeight: 1.6 }}>
                {msg.content}
              </div>
            </div>
          )
        )}
        {loading && (
          <div style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #3b5a82, #1a2a4a)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.58rem", fontWeight: 700, color: "#64b5f6" }}>S</div>
            <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "14px 14px 14px 4px", display: "flex", gap: "5px", alignItems: "center" }}>
              {[0,1,2].map(n => (
                <motion.div key={n} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)" }}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: n * 0.18 }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts — only show when just the greeting is visible */}
      {messages.length === 1 && (
        <div style={{ padding: "0 18px 12px", display: "flex", gap: "8px", flexWrap: "wrap", flexShrink: 0 }}>
          {["I want to see the math before I commit.", "I'm tired of paying monthly fees.", "How does the $16K cap work?"].map(q => (
            <button key={q} onClick={() => { setInput(q); }} style={{ padding: "6px 12px", background: "rgba(59,90,130,0.2)", border: "1px solid rgba(59,90,130,0.4)", borderRadius: "20px", color: "rgba(255,255,255,0.65)", fontSize: "0.72rem", cursor: "pointer", whiteSpace: "nowrap" }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.08)", background: "#0e1628", display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask Scout anything about Bear Team..."
          style={{ flex: 1, padding: "9px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", fontSize: "16px", color: "#fff", outline: "none" }}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{ width: 40, height: 40, minWidth: 40, minHeight: 40, borderRadius: "8px", background: loading || !input.trim() ? "rgba(59,90,130,0.3)" : "linear-gradient(135deg, #3b5a82, #2c4a72)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: loading || !input.trim() ? "default" : "pointer", flexShrink: 0, transition: "background 0.2s" }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  );
}

function useCountUp(target: number, duration = 1400, start = 0) {
  const [value, setValue] = useState(start);
  useEffect(() => {
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

function BearTeamOSVisual() {
  // Live-ticking agent deals
  const [agentDeals, setAgentDeals] = useState([19, 12, 7, 3]);
  const [progress, setProgress] = useState(0);
  const [closings, setClosings] = useState(0);
  const [flash, setFlash] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // Trigger animations after mount
  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      setProgress(67);
      setClosings(38);
    }, 200);
    return () => clearTimeout(t);
  }, []);

  // Count-up on mount
  const agents = useCountUp(mounted ? 14 : 0, 1200, 0);
  const rev = useCountUp(mounted ? 67 : 0, 1600, 0);

  // Smoothly grow progress bar continuously
  useEffect(() => {
    const id = setInterval(() => {
      setProgress(p => {
        const next = p + 0.18;
        return next >= 100 ? 67 : next; // loop back to 67 when it hits 100
      });
    }, 80);
    return () => clearInterval(id);
  }, []);

  // Tick a random agent's deal count every 2.8s
  useEffect(() => {
    const id = setInterval(() => {
      const idx = Math.floor(Math.random() * 4);
      setAgentDeals(prev => {
        const next = [...prev];
        next[idx] = next[idx] + 1;
        return next;
      });
      setClosings(c => c + 1);
      setFlash(idx);
      setTimeout(() => setFlash(null), 600);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const agentRows = [
    { name: "M. Rodriguez", tier: "Team Lead", split: "90/10", color: "#ce93d8" },
    { name: "S. Thompson",  tier: "Tier 3",    split: "80/20", color: "#ffb74d" },
    { name: "J. Williams",  tier: "Tier 2",    split: "70/30", color: "#64b5f6" },
    { name: "A. Patel",     tier: "Tier 1",    split: "60/40", color: "#81c784" },
  ];

  return (
    <div style={{ width: "100%", height: "100%", background: "#0b1d3a", borderRadius: "16px", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
      {/* Nav bar */}
      <div style={{ padding: "0 28px", height: "54px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#060e1c", flexShrink: 0 }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.04em" }}>BearTeamOS™</span>
        <div style={{ display: "flex", gap: "24px" }}>
          {["Dashboard", "Agents", "Transactions", "Academy"].map(item => (
            <span key={item} style={{ fontSize: "0.75rem", color: item === "Dashboard" ? "#64b5f6" : "rgba(255,255,255,0.45)", cursor: "pointer", fontWeight: item === "Dashboard" ? 600 : 400 }}>{item}</span>
          ))}
        </div>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #3b5a82, #1a2a4a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", color: "#fff", fontWeight: 700 }}>BT</div>
      </div>
      {/* Dashboard content */}
      <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px", overflowY: "hidden" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Q1 2026 · Bear Team Real Estate</div>
        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {[
            { label: "Active Agents", value: agents.toString(), change: "+3", color: "#81c784" },
            { label: "Q1 Closings", value: closings.toString(), change: "↑ live", color: "#64b5f6" },
            { label: "Avg Split", value: "74%", change: "+4%", color: "#ffb74d" },
            { label: "Brokerage Rev", value: `$${rev}K`, change: "on track", color: "#ce93d8" },
          ].map(kpi => (
            <div key={kpi.label} style={{ padding: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px" }}>
              <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.4)", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{kpi.label}</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff", marginBottom: "3px", transition: "color 0.3s" }}>{kpi.value}</div>
              <div style={{ fontSize: "0.62rem", color: kpi.color, fontWeight: 600 }}>↑ {kpi.change}</div>
            </div>
          ))}
        </div>
        {/* Agent tier table */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ padding: "9px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "8px" }}>
            {["Agent", "Tier", "Deals", "Split"].map(h => <span key={h} style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>)}
          </div>
          {agentRows.map((agent, i) => (
            <div key={i} style={{ padding: "9px 14px", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "8px", alignItems: "center", background: flash === i ? "rgba(255,255,255,0.04)" : "transparent", transition: "background 0.4s" }}>
              <span style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{agent.name}</span>
              <span style={{ fontSize: "0.63rem", color: agent.color, fontWeight: 600, padding: "2px 6px", background: `${agent.color}18`, borderRadius: "4px", display: "inline-block" }}>{agent.tier}</span>
              <motion.span
                key={agentDeals[i]}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{ fontSize: "0.74rem", color: flash === i ? "#81c784" : "rgba(255,255,255,0.6)", fontWeight: flash === i ? 700 : 400, transition: "color 0.4s" }}
              >{agentDeals[i]}</motion.span>
              <span style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{agent.split}</span>
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div style={{ padding: "11px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>Year 1 Growth Target</span>
            <motion.span
              style={{ fontSize: "0.7rem", color: "#81c784", fontWeight: 600 }}
              animate={{ opacity: 1 }}
              key={progress.toFixed(1)}
            >{progress.toFixed(1)}% complete</motion.span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
            <motion.div
              style={{ height: "100%", background: "linear-gradient(90deg, #3b5a82, #81c784)", borderRadius: 3 }}
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AcademyVisual() {
  const courses = [
    { num: "0", title: "Starting with Moodle", pct: 100, color: "#1177d1" },
    { num: "1", title: "Agent Onboarding — How We Think", pct: 100, color: "#1177d1" },
    { num: "2", title: "Brokerage Structure — How We Function", pct: 66, color: "#1177d1", hidden: true },
    { num: "3", title: "Sales Process — How We Produce", pct: null, color: "#1177d1", hidden: true },
    { num: "4", title: "Operational Systems — How We Execute", pct: null, color: "#1177d1", hidden: true },
    { num: "5", title: "Compliance & Risk — How We Protect", pct: 0, color: "#1177d1" },
  ];
  return (
    <div style={{ width: "100%", height: "100%", background: "#f8f8f8", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: "-apple-system,sans-serif" }}>
      {/* Moodle top bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "0 20px", height: "48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #e96e3e, #f4b942, #4caf50, #2196f3, #9c27b0)", flexShrink: 0 }} />
          {["Home", "Dashboard", "My courses", "Site administration"].map((item, i) => (
            <span key={item} style={{ fontSize: "0.7rem", color: i === 2 ? "#1177d1" : "#555", fontWeight: i === 2 ? 700 : 400, borderBottom: i === 2 ? "2px solid #1177d1" : "none", paddingBottom: i === 2 ? "2px" : "0" }}>{item}</span>
          ))}
        </div>
        <span style={{ fontSize: "0.65rem", color: "#888" }}>Student</span>
      </div>
      {/* Body */}
      <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#1a1a1a" }}>My courses</div>
            <div style={{ fontSize: "0.65rem", color: "#666" }}>Course overview</div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <div style={{ padding: "4px 10px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.6rem", color: "#444", background: "#fff" }}>All ▾</div>
            <div style={{ padding: "4px 10px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.6rem", color: "#444", background: "#fff" }}>Sort by course name ▾</div>
            <div style={{ padding: "4px 10px", border: "1px solid #1177d1", borderRadius: "4px", fontSize: "0.6rem", color: "#1177d1", background: "#fff" }}>Card ▾</div>
          </div>
        </div>
        {/* Course grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          {courses.map((c, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "6px", border: "1px solid #e0e0e0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              {/* Card image */}
              <div style={{ height: "64px", background: i === 0 ? "#e8f0f7" : "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                {i === 0 ? (
                  <div style={{ width: "36px", height: "36px", background: "#b0c4d8", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "20px", height: "24px", background: "#fff", borderRadius: "2px", display: "flex", flexDirection: "column", gap: "3px", padding: "4px 3px" }}>
                      {[0,1,2].map(n => <div key={n} style={{ height: "2px", background: "#aaa", borderRadius: "1px" }} />)}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em" }}>BT  |  BEAR TEAM</div>
                    <div style={{ fontSize: "0.42rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.18em" }}>— ACADEMY —</div>
                  </div>
                )}
              </div>
              {/* Card body */}
              <div style={{ padding: "8px 10px" }}>
                <div style={{ fontSize: "0.6rem", color: "#1177d1", fontWeight: 600, marginBottom: "2px", lineHeight: 1.3 }}>{c.num} — {c.title}</div>
                <div style={{ fontSize: "0.52rem", color: "#888", marginBottom: "4px" }}>Category 1</div>
                {c.hidden && (
                  <div style={{ display: "inline-block", background: "#00897b", color: "#fff", fontSize: "0.48rem", padding: "2px 6px", borderRadius: "3px", marginBottom: "4px" }}>Hidden from students</div>
                )}
                {c.pct !== null && !c.hidden && (
                  <div style={{ fontSize: "0.52rem", color: "#1177d1", fontWeight: 600 }}>{c.pct}% complete</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── System Panel (parallax + fade-out per section) ───────────────────────────

function SystemPanel({ label, title, description, href, external, videoModal, visual, index, isLast }: SystemPanelProps & { isLast?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Fade in as it enters; only fade out on exit if not the last panel
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.5, 0.85, 1],
    isLast ? [0, 1, 1, 1, 1] : [0, 1, 1, 1, 0]
  );
  // Subtle vertical parallax on the visual
  const visualY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  // Text comes up slightly
  const textY = useTransform(scrollYProgress, [0, 0.5, 1], [30, 0, -20]);

  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
    >
      <div
        className="system-panel-inner"
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          padding: "clamp(40px,6vw,80px) clamp(20px, 6vw, 100px)",
          gap: "clamp(28px, 5vw, 80px)",
          flexDirection: isEven ? "row" : "row-reverse",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Text block */}
        <motion.div className="system-panel-text" style={{ y: textY, flex: "0 0 clamp(240px, 36%, 480px)" }}>
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              marginBottom: "16px",
            }}
          >
            {label}
          </div>
          <h2
            style={{
              fontSize: "clamp(2rem, 3.5vw, 3.2rem)",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              marginBottom: "20px",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontSize: "1.05rem",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.7,
              marginBottom: "32px",
              maxWidth: "380px",
            }}
          >
            {description}
          </p>
          {videoModal ? (
            <>
              <button
                onClick={() => setShowVideo(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 28px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "background 0.2s ease, border-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.18)";
                }}
              >
                ▶ Explore {title}
              </button>
              {showVideo && (
                <div
                  onClick={() => setShowVideo(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.85)",
                    zIndex: 9999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px",
                  }}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: "relative",
                      width: "100%",
                      maxWidth: "900px",
                      borderRadius: "16px",
                      overflow: "hidden",
                      background: "#000",
                      boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
                    }}
                  >
                    <button
                      onClick={() => setShowVideo(false)}
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "14px",
                        zIndex: 10,
                        background: "rgba(0,0,0,0.6)",
                        border: "none",
                        color: "#fff",
                        fontSize: "1.2rem",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                      }}
                    >
                      ✕
                    </button>
                    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${videoModal}?autoplay=1&rel=0`}
                        title="Bear Academy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          border: "none",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : external ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 28px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: "8px",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.9rem",
                textDecoration: "none",
                transition: "background 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.12)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.18)";
              }}
            >
              Explore {title} →
            </a>
          ) : (
            <Link
              href={href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 28px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: "8px",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              Open {title} →
            </Link>
          )}
        </motion.div>

        {/* Visual block */}
        <motion.div
          className="system-panel-visual"
          style={{
            y: visualY,
            flex: 1,
            minHeight: "clamp(300px, 50vh, 600px)",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          {visual}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── System Showcase Section ──────────────────────────────────────────────────

function SystemShowcase() {
  return (
    <section
      id="systems"
      style={{
        background: "linear-gradient(180deg, #060e1c 0%, #081528 50%, #060e1c 100%)",
        position: "relative",
        overflow: "hidden",
        paddingBottom: "80px",
      }}
    >
      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(59,90,130,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,90,130,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* Section header */}
      <div
        style={{
          textAlign: "center",
          padding: "100px 40px 0",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Reveal>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              marginBottom: "16px",
            }}
          >
            The Infrastructure
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3.4rem)",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: "700px",
              margin: "0 auto 20px",
            }}
          >
            Three systems.
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #64b5f6, #81c784)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              One brokerage built to produce.
            </span>
          </h2>
        </Reveal>
        <Reveal delay={180}>
          <p
            style={{
              fontSize: "1rem",
              color: "rgba(255,255,255,0.4)",
              maxWidth: "480px",
              margin: "0 auto",
              lineHeight: 1.65,
            }}
          >
            Every agent at Bear Team has access to the same infrastructure from day one.
          </p>
        </Reveal>
      </div>

      {/* System panels */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <SystemPanel
          index={0}
          label="AI Assistant"
          title="Scout"
          description="Your 24/7 AI guide to Bear Team. Ask about splits, fees, the cap model, onboarding — Scout gives you real answers, real math, no sales pressure."
          href="/chat"
          external={false}
          visual={<ScoutVisual />}
        />
        <SystemPanel
          index={1}
          label="Brokerage Operating System"
          title="BearTeamOS"
          description="The backend of the brokerage. Commission tracking, agent tiers, transaction management, and the progressive cap model — all in one system."
          href="https://www.joinbearteam.com/BearTeamOS"
          external={true}
          visual={<BearTeamOSVisual />}
        />
        <SystemPanel
          index={2}
          label="Agent Training Platform"
          title="Bear Academy"
          description="A full LMS built on Moodle. Structured 30-60-90 day certification tracks, deal walkthroughs, and ongoing CE — completely free for every Bear Team agent."
          href="/academy"
          external={false}
          visual={<AcademyVisual />}
          isLast={true}
        />
      </div>

    </section>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main
      id="top"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#f0f3f8",
        color: "#1a1a1a",
        overflowX: "hidden",
      }}
    >
      <style>{`
        /* ── Smooth scroll ── */
        html { scroll-behavior: smooth; }

        /* ── Global overflow guard ── */
        *, *::before, *::after { box-sizing: border-box; }

        /* ── Anchor offset for sticky nav ── */
        [id] { scroll-margin-top: 72px; }

        /* ── Nav ── */
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; flex-direction: column; justify-content: center; }
        }
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
        }

        /* ── Hero parallax card rows — hide overflow on mobile ── */
        @media (max-width: 767px) {
          .hero-parallax-rows { display: none !important; }
          .hero-sticky-panel {
            padding: 24px 20px !important;
            max-width: 100% !important;
            border-radius: 16px !important;
          }
          .hero-sticky-panel h1 {
            font-size: clamp(1.8rem, 8vw, 2.4rem) !important;
          }
        }

        /* ── SystemPanel mobile stacking ── */
        @media (max-width: 768px) {
          .system-panel-inner {
            flex-direction: column !important;
            padding: 32px 16px !important;
            min-height: unset !important;
            gap: 24px !important;
          }
          .system-panel-text {
            flex: none !important;
            min-width: unset !important;
            max-width: 100% !important;
          }
          .system-panel-visual {
            min-height: 260px !important;
            max-height: 320px !important;
            width: 100% !important;
          }
        }

        /* ── Grid overrides ── */
        @media (max-width: 640px) {
          .proof-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .testimonial-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .compare-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .hero-card-grid { padding-left: 16px !important; padding-right: 16px !important; }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .testimonial-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .proof-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }

        /* ── Tap-friendly scout CTA ── */
        @media (max-width: 768px) {
          .scout-cta-btn { padding: 13px 24px !important; font-size: 0.95rem !important; width: 100%; text-align: center; }
          .cta-flex-row { flex-direction: column !important; align-items: stretch !important; }
          .cta-flex-row a, .cta-flex-row button { width: 100% !important; text-align: center; justify-content: center; }
        }

        /* ── Footer links wrap ── */
        .footer-links { flex-wrap: wrap; gap: 16px !important; justify-content: center; }

        /* ── Section padding mobile ── */
        @media (max-width: 640px) {
          .section-padded { padding-top: 48px !important; padding-bottom: 48px !important; }
        }

        /* ── Hero parallax — collapse height on mobile so users don't over-scroll ── */
        @media (max-width: 767px) {
          .hero-parallax-container { height: 100vh !important; }
        }

        /* ── Prevent iOS font zoom ── */
        input, textarea, select { font-size: 16px !important; }
      `}</style>
      <Nav />

      {/* ── HERO: Parallax ── */}
      <HeroParallax />

      {/* ── SYSTEM SHOWCASE ── */}
      <SystemShowcase />

      {/* ── PATTERN INTERRUPT ── */}

        <section style={{ background: "#080f1e", padding: "clamp(56px,9vw,96px) clamp(20px,5vw,40px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          {/* Glow line top */}
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(100,181,246,0.5), transparent)" }} />
          {/* Glow line bottom */}
          <div style={{ position: "absolute", bottom: 0, left: "10%", right: "10%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(100,181,246,0.3), transparent)" }} />
          {/* Radial glow behind text */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "200px", background: "radial-gradient(ellipse at center, rgba(59,90,130,0.25) 0%, transparent 70%)", pointerEvents: "none" }} />
          <Reveal>
            <p style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.4rem)", fontWeight: 700, color: "#ffffff", lineHeight: 1.45, maxWidth: "760px", margin: "0 auto", position: "relative", zIndex: 1 }}>
              The #1 reason agents plateau is not effort.
              <br />
              <span style={{ color: "#64b5f6" }}>It&rsquo;s operating without a system.</span>
            </p>
          </Reveal>
        </section>


      {/* ── PROBLEM ── */}

        <section style={{ padding: "clamp(48px,8vw,100px) clamp(20px,5vw,40px)", background: "#f0f3f8", position: "relative", overflow: "hidden" }}>
          {/* Ghost number background */}
          <div style={{ position: "absolute", right: "clamp(-20px, 2vw, 40px)", top: "50%", transform: "translateY(-50%)", fontSize: "clamp(180px, 22vw, 320px)", fontWeight: 900, color: "rgba(220,38,38,0.04)", lineHeight: 1, pointerEvents: "none", userSelect: "none", letterSpacing: "-0.06em" }}>01</div>
          <div style={{ maxWidth: "760px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <Reveal>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <div style={{ width: "32px", height: "3px", background: "#dc2626", borderRadius: "2px" }} />
                <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#dc2626", margin: 0 }}>The Problem</p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: "52px", color: "#0b1d3a", letterSpacing: "-0.02em" }}>
                Most agents don&rsquo;t fail<br />because they lack talent.
              </h2>
            </Reveal>
            {[
              "They fail because they don&rsquo;t have a system — they&rsquo;re making it up deal by deal.",
              "They&rsquo;re paying their brokerage hundreds a month and getting nothing back.",
              "They hit a ceiling and can&rsquo;t figure out why. No visibility. No structure. No next step.",
            ].map((text, i) => (
              <Reveal key={i} delay={150 + i * 120}>
                <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", marginBottom: "32px", paddingBottom: "32px", borderBottom: i < 2 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#dc2626", marginTop: "7px", flexShrink: 0, boxShadow: "0 0 0 3px rgba(220,38,38,0.12)" }} />
                  <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "#374151", margin: 0 }} dangerouslySetInnerHTML={{ __html: text }} />
                </div>
              </Reveal>
            ))}
            <Reveal delay={550}>
              <div style={{ marginTop: "8px", borderLeft: "3px solid #dc2626", paddingLeft: "24px" }}>
                <p style={{ fontSize: "1rem", fontStyle: "italic", color: "#6b7280", lineHeight: 1.65, margin: 0 }}>
                  The brokerage isn&rsquo;t the problem. The absence of a system is.
                </p>
              </div>
            </Reveal>
          </div>
        </section>


      {/* ── SOLUTION ── */}

        <section id="systems-text" style={{ padding: "clamp(60px,10vw,120px) clamp(20px,5vw,40px)", background: "#0b1d3a", position: "relative", overflow: "hidden" }}>
          {/* Ghost number */}
          <div style={{ position: "absolute", left: "clamp(-20px, 2vw, 20px)", top: "50%", transform: "translateY(-50%)", fontSize: "clamp(180px, 22vw, 320px)", fontWeight: 900, color: "rgba(100,181,246,0.04)", lineHeight: 1, pointerEvents: "none", userSelect: "none", letterSpacing: "-0.06em" }}>02</div>
          <div style={{ maxWidth: "860px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <Reveal>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <div style={{ width: "32px", height: "3px", background: "#64b5f6", borderRadius: "2px" }} />
                <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#64b5f6", margin: 0 }}>The Solution</p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "16px", color: "#ffffff", letterSpacing: "-0.025em" }}>
                BearTeamOS.
              </h2>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 600, lineHeight: 1.2, marginBottom: "64px", color: "rgba(255,255,255,0.45)", letterSpacing: "-0.01em" }}>
                A brokerage engineered like a system.
              </h2>
            </Reveal>
            {[
              { num: "01", title: "Scout AI", desc: "Your always-on assistant that knows your pipeline, your commissions, and your next move.", accent: "#64b5f6" },
              { num: "02", title: "Progressive Splits", desc: "Start at 60/40. Earn your way to 90/10 by producing — not by waiting.", accent: "#81c784" },
              { num: "03", title: "Zero Fees", desc: "No monthly, no desk, no tech. E&O covered. $150 flat per close. That&rsquo;s it.", accent: "#ffb74d" },
              { num: "04", title: "BearTeam Academy", desc: "Free training from day one. Structure, mentorship, and a real 30-60-90 day plan.", accent: "#ce93d8" },
            ].map(({ num, title, desc, accent }, i) => (
              <Reveal key={num} delay={100 + i * 100}>
                <div style={{ display: "flex", gap: "0", marginBottom: "16px", borderRadius: "12px", overflow: "hidden", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", transition: "background 0.2s" }}>
                  <div style={{ width: "4px", background: accent, flexShrink: 0 }} />
                  <div style={{ padding: "24px 28px", display: "flex", gap: "20px", alignItems: "center", flex: 1 }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 800, color: accent, opacity: 0.55, minWidth: "28px", letterSpacing: "0.08em" }}>{num}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#ffffff", marginBottom: "4px" }}>{title}</div>
                      <div style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: desc }} />
                    </div>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${accent}18`, border: `1px solid ${accent}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5 2l3 3-3 3" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
            <Reveal delay={500}>
              <div style={{ marginTop: "40px", padding: "28px 32px", background: "rgba(100,181,246,0.06)", border: "1px solid rgba(100,181,246,0.2)", borderRadius: "12px", display: "flex", gap: "20px", alignItems: "center" }}>
                <div style={{ fontSize: "2rem" }}>→</div>
                <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.65, margin: 0 }}>
                  Every piece of this runs on day one. You don&rsquo;t build it — you walk into it.
                </p>
              </div>
            </Reveal>
          </div>
        </section>



      {/* ── WHAT SCOUT DOES FOR YOU ── */}
      <section style={{ background: "#ffffff", padding: "clamp(60px,8vw,96px) clamp(20px,5vw,40px)" }}>
        <style>{`
          .home-flip-card { perspective: 1000px; cursor: default; }
          .home-flip-inner { position: relative; width: 100%; height: 100%; transition: transform 0.45s cubic-bezier(0.4,0,0.2,1); transform-style: preserve-3d; }
          .home-flip-card:hover .home-flip-inner { transform: rotateY(180deg); }
          .home-flip-front, .home-flip-back { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 14px; display: flex; align-items: center; justify-content: center; padding: 32px 28px; background: #1b365d; }
          .home-flip-back { transform: rotateY(180deg); align-items: flex-start; }
          @media (max-width: 640px) {
            .home-flip-card:hover .home-flip-inner { transform: none; }
            .home-flip-front { display: none; }
            .home-flip-back { position: relative; inset: auto; transform: none; backface-visibility: visible; -webkit-backface-visibility: visible; }
            .home-flip-inner { transform: none !important; }
          }
        `}</style>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#3b6ea8", marginBottom: 10 }}>Real Outputs. Not Generic AI.</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, color: "#0b1d3a", marginBottom: 16, lineHeight: 1.15 }}>What Scout Does For You</h2>
            <p style={{ color: "#6b7280", maxWidth: 520, margin: "0 auto", fontSize: "0.95rem", lineHeight: 1.65 }}>
              Every tool is built around Bear Team systems and the Orlando market. Not a generic template — a real output you can use today.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {[
              { title: "Follow-Up Sequences", body: "Give Scout a lead's situation. Get a personalized 5-touch email and text sequence — ready to send in 60 seconds." },
              { title: "Commission Calculator", body: "Input your current split and volume. Scout shows what you'd net at Bear Team vs. where you are now — exact math." },
              { title: "Listing Presentation", body: "Input the address and seller objections. Scout builds a custom talking track — pricing rationale, proof points, closes." },
              { title: "Geo Farm Scripts", body: "Input a neighborhood and price range. Scout writes the door-knock script, mailer copy, and follow-up text." },
              { title: "Weekly Business Audit", body: "Tell Scout your calls, appointments, and closings. It diagnoses your bottleneck and tells you exactly what to fix." },
              { title: "Sphere Reactivation", body: "Pick a contact type — past client, neighbor, referral. Scout writes the re-engagement message for the Orlando market." },
            ].map((item, i) => (
              <div key={i} className="home-flip-card" style={{ height: 200 }}>
                <div className="home-flip-inner" style={{ height: "100%" }}>
                  <div className="home-flip-front">
                    <span style={{ color: "#ffffff", fontWeight: 800, fontSize: "1.1rem", textAlign: "center", fontFamily: "Inter, -apple-system, sans-serif", letterSpacing: "-0.01em" }}>{item.title}</span>
                  </div>
                  <div className="home-flip-back">
                    <div>
                      <div style={{ color: "#7eb8f7", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>{item.title}</div>
                      <div style={{ color: "rgba(255,255,255,0.88)", fontSize: "0.88rem", lineHeight: 1.7, fontFamily: "Inter, -apple-system, sans-serif" }}>{item.body}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
                    <div style={{ textAlign: "center", marginTop: 48 }}>
            <ScoutCTA label="Try Scout Now" />
          </div>
        </div>
      </section>

      {/* ── SCOUT ENTRY ── */}

        <section style={{ padding: "clamp(48px,8vw,80px) clamp(20px,5vw,40px)", background: "#3f5f8a", position: "relative" }}>
          {/* Transition glow from above */}
          <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }} />
          <div style={{ maxWidth: "860px", margin: "0 auto" }}>
            <Reveal>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "16px" }}>Meet Scout</p>
            </Reveal>
            <Reveal delay={100}>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, color: "#ffffff", marginBottom: "48px", lineHeight: 1.2 }}>
                Your AI Assistant. Available 24/7.
                <br />No pressure. Just answers.
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "16px", padding: "32px", backdropFilter: "blur(8px)", marginBottom: "36px" }}>
                {[
                  { from: "agent", text: "What does the commission structure look like?" },
                  { from: "scout", text: "You start at 60/40. Once Bear Team collects $16K from your deals, you automatically graduate to 70/30 — no conversation needed. Keep producing and you move through 80/20 all the way to 90/10. How many deals are you doing right now?" },
                  { from: "agent", text: "About 8-10 a year." },
                  { from: "scout", text: "At 8 deals on a $415K average, you&rsquo;d net roughly $87K+ at current splits — with zero fees coming out. That&rsquo;s the math. Want me to run your specific numbers?" },
                ].map((msg, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: msg.from === "agent" ? "flex-end" : "flex-start", marginBottom: "16px" }}>
                    <div style={{ maxWidth: "min(72%, 480px)", wordBreak: "break-word", padding: "12px 16px", borderRadius: msg.from === "agent" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.from === "agent" ? "rgba(255,255,255,0.15)" : "rgba(59,90,130,0.5)", color: "#ffffff", fontSize: "clamp(0.82rem, 2.2vw, 0.9rem)", lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: msg.text }} />
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={300}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <ScoutCTA label="Talk to Scout" />
              </div>
            </Reveal>
          </div>
        </section>


      {/* ── DAY-TO-DAY ── */}

        <section style={{ padding: "clamp(60px,9vw,100px) clamp(20px,5vw,40px)", background: "#f0f3f8" }}>
          <div style={{ maxWidth: "860px", margin: "0 auto" }}>
            <Reveal>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <div style={{ width: "32px", height: "3px", background: "#3b5a82", borderRadius: "2px" }} />
                <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#3b5a82", margin: 0 }}>How It Works</p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, color: "#0b1d3a", marginBottom: "56px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
                Your day-to-day, simplified.
              </h2>
            </Reveal>
            {[
              { num: "01", title: "Scout surfaces your next deal", desc: "AI-assisted pipeline visibility — Scout tells you who to follow up with and when.", bg: "#0b1d3a", accent: "#64b5f6" },
              { num: "02", title: "System tracks your tier progress", desc: "See exactly where you are on the graduation path. No guessing.", bg: "#ffffff", accent: "#3b5a82" },
              { num: "03", title: "Transactions handled by TC", desc: "Our coordinator manages paperwork and timelines so you stay in front of clients.", bg: "#0b1d3a", accent: "#81c784" },
              { num: "04", title: "You close and graduate", desc: "Every deal moves you up the split ladder — automatically.", bg: "#ffffff", accent: "#3b5a82" },
            ].map(({ num, title, desc, bg, accent }, i) => {
              const isDark = bg === "#0b1d3a";
              return (
                <Reveal key={num} delay={100 + i * 100}>
                  <div style={{ display: "flex", gap: "0", marginBottom: "12px", borderRadius: "14px", overflow: "hidden", border: isDark ? "none" : "1px solid #e5e7eb", boxShadow: isDark ? "0 4px 20px rgba(11,29,58,0.18)" : "0 1px 6px rgba(0,0,0,0.04)" }}>
                    {/* Number tab */}
                    <div style={{ width: "72px", background: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: "1rem", fontWeight: 800, color: isDark ? "#0b1d3a" : "#fff", letterSpacing: "0.04em" }}>{num}</span>
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, padding: "22px 28px", background: bg }}>
                      <div style={{ fontWeight: 700, fontSize: "1.05rem", color: isDark ? "#ffffff" : "#0b1d3a", marginBottom: "6px" }}>{title}</div>
                      <div style={{ fontSize: "0.9rem", color: isDark ? "rgba(255,255,255,0.55)" : "#6b7280", lineHeight: 1.65 }}>{desc}</div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>


      {/* ── PROOF ── */}

        <section id="proof" style={{ padding: "clamp(48px,8vw,80px) clamp(20px,5vw,40px)", background: "#ffffff" }}>
          <div style={{ maxWidth: "960px", margin: "0 auto" }}>
            <Reveal>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6b7280", marginBottom: "16px", textAlign: "center" }}>By The Numbers</p>
            </Reveal>
            <Reveal delay={100}>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, color: "#0b1d3a", marginBottom: "56px", textAlign: "center", lineHeight: 1.2 }}>
                The math speaks for itself.
              </h2>
            </Reveal>
            <div className="proof-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px", marginBottom: "48px" }}>
              {[["$0", "Monthly cost to agent", "#81c784"], ["90/10", "Max split at 16+ deals", "#64b5f6"], ["$150", "Flat fee per closing", "#ffb74d"]].map(([stat, label, color]) => (
                <Reveal key={stat}>
                  <div style={{ padding: "36px 28px", background: "#f8f9fa", borderRadius: "12px", border: "1px solid #e5e7eb", textAlign: "center" }}>
                    <div style={{ fontSize: "2.4rem", fontWeight: 800, color, marginBottom: "8px" }}>{stat}</div>
                    <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>{label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={200}>
              <div style={{ background: "#0b1d3a", borderRadius: "12px", padding: "36px 40px", color: "#fff" }}>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "rgba(255,255,255,0.85)", marginBottom: "16px" }}>
                  &ldquo;I was at a big box paying $200/month and getting nothing. Bear Team has no fees, Scout keeps me on track, and I graduated to 70/30 after my sixth close. The system actually works.&rdquo;
                </p>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", fontWeight: 600, letterSpacing: "0.06em" }}>— Bear Team Agent, Orlando FL</div>
              </div>
            </Reveal>
          </div>
        </section>


      {/* ── DIFFERENTIATION ── */}

        <section style={{ padding: "clamp(48px,8vw,80px) clamp(20px,5vw,40px)", background: "#f0f3f8" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <Reveal>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, color: "#0b1d3a", marginBottom: "56px", textAlign: "center" }}>Traditional vs. Bear Team</h2>
            </Reveal>
            <div className="compare-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <Reveal>
                <div style={{ padding: "36px", background: "#ffffff", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
                  <div style={{ fontWeight: 700, marginBottom: "24px", color: "#6b7280", fontSize: "0.9rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Traditional Brokerage</div>
                  {["Flat split — no graduation path", "$100–$300/month in fees", "Sink or swim onboarding", "You figure out your own pipeline", "E&O comes out of your pocket"].map((item) => (
                    <div key={item} style={{ display: "flex", gap: "10px", marginBottom: "14px", fontSize: "0.9rem", color: "#9ca3af" }}>
                      <span style={{ color: "#ef4444", fontWeight: 700 }}>✕</span>{item}
                    </div>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={150}>
                <div style={{ padding: "36px", background: "#0b1d3a", borderRadius: "12px", border: "1px solid rgba(100,181,246,0.2)" }}>
                  <div style={{ fontWeight: 700, marginBottom: "24px", color: "#64b5f6", fontSize: "0.9rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Bear Team</div>
                  {["60/40 → 70/30 → 80/20 → 90/10", "$0/month — always", "30-60-90 day structured plan", "Scout AI surfaces your next step", "E&O paid by Bear Team"].map((item) => (
                    <div key={item} style={{ display: "flex", gap: "10px", marginBottom: "14px", fontSize: "0.9rem", color: "rgba(255,255,255,0.8)" }}>
                      <span style={{ color: "#81c784", fontWeight: 700 }}>✓</span>{item}
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>


      {/* ── OBJECTION HANDLING ── */}

        <section style={{ padding: "clamp(48px,8vw,80px) clamp(20px,5vw,40px)", background: "#ffffff" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <Reveal>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, color: "#0b1d3a", marginBottom: "56px", textAlign: "center" }}>
                Common questions, straight answers.
              </h2>
            </Reveal>
            {[
              { q: "Is this an MLM or revenue share model?", a: "No. Zero. You earn by producing deals — not by recruiting other agents. No downlines, no referral bonuses, no pyramid." },
              { q: "What if I&rsquo;m new and only do 3–4 deals a year?", a: "You start at Tier 1 (60/40) with no monthly costs. BearTeam Academy and Scout are yours from day one. Low volume doesn&rsquo;t mean low support." },
              { q: "What does &ldquo;boutique brokerage&rdquo; actually mean?", a: "It means you know who Beth and Tom are, they know your deals, and you&rsquo;re not a number in a national franchise. Real support from real people." },
            ].map(({ q, a }, i) => (
              <Reveal key={i} delay={i * 100}>
                <div style={{ marginBottom: "36px" }}>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0b1d3a", marginBottom: "8px" }} dangerouslySetInnerHTML={{ __html: q }} />
                  <div style={{ fontSize: "0.95rem", color: "#6b7280", lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: a }} />
                </div>
              </Reveal>
            ))}
          </div>
        </section>


      {/* ── URGENCY ── */}

        <section style={{ padding: "clamp(48px,8vw,80px) clamp(20px,5vw,40px)", background: "linear-gradient(135deg, #060e1c 0%, #0b1d3a 100%)", textAlign: "center" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, color: "#ffffff", marginBottom: "20px", lineHeight: 1.2 }}>
              Every month you wait costs you
              <br />
              <span style={{ color: "#64b5f6" }}>a tier graduation.</span>
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.55)", maxWidth: "480px", margin: "0 auto 40px", lineHeight: 1.65 }}>
              The math is simple. Start now, hit the cap sooner, earn more on every deal that follows. Scout will walk you through it.
            </p>
          </Reveal>
          <Reveal delay={250}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ScoutCTA label="Run My Numbers" />
            </div>
          </Reveal>
        </section>


      {/* ── FINAL CTA ── */}

        <section style={{ padding: "clamp(48px,8vw,80px) clamp(20px,5vw,40px)", background: "#f0f3f8", textAlign: "center" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, color: "#0b1d3a", marginBottom: "16px", lineHeight: 1.15 }}>
              Stop Guessing. Start Producing.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p style={{ fontSize: "1.05rem", color: "#6b7280", maxWidth: "440px", margin: "0 auto 40px", lineHeight: 1.65 }}>
              No commitment. You&rsquo;re not joining today — you&rsquo;re starting a conversation with a system that has answers.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <ScoutCTA size="lg" />
              <a href="#systems" style={{ padding: "14px 32px", fontSize: "1rem", fontWeight: 600, color: "#3b5a82", border: "2px solid #3b5a82", borderRadius: "8px", textDecoration: "none", display: "inline-block" }}>
                See How It Works
              </a>
            </div>
          </Reveal>
        </section>



      {/* ── AGENT TESTIMONIALS ── */}
      <section style={{ background: "#f0f3f8", padding: "clamp(48px,8vw,80px) clamp(20px,5vw,40px)" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <Reveal>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6b7280", marginBottom: "16px", textAlign: "center" }}>Agent Results</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, color: "#0b1d3a", marginBottom: "56px", textAlign: "center", lineHeight: 1.2 }}>
              What agents say after they make the move.
            </h2>
          </Reveal>
          <div className="testimonial-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "28px" }}>
            {[
              {
                quote: "In my first year at Coldwell Banker, I went from uncertainty to Rookie of the Year. The structure, systems, and support completely changed how I approached the business.",
                name: "Venesa",
                detail: "Coldwell Banker → Bear Team",
                stat: "Rookie of the Year",
                initials: "V",
                color: "#1B8C3A",
              },
              {
                quote: "I tripled my production in one year after plugging into the right system. It wasn't about working more — it was about finally having a clear process that actually worked.",
                name: "Joe",
                detail: "EXIT Realty → Bear Team",
                stat: "3× Production Growth",
                initials: "J",
                color: "#3b5a82",
              },
              {
                quote: "Reaching the top 1% wasn't luck. It came from operating within a system that removed guesswork and allowed me to focus on high-value activities every day.",
                name: "Mike",
                detail: "Coldwell Banker → Bear Team",
                stat: "Top 1% Producer",
                initials: "M",
                color: "#c9a84c",
              },
            ].map(({ quote, name, detail, stat, initials, color }, i) => (
              <Reveal key={name} delay={i * 120}>
                <div style={{ background: "#ffffff", borderRadius: "14px", padding: "32px 28px", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", height: "100%", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                  {/* Stat badge */}
                  <div style={{ display: "inline-block", background: color + "18", color, fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 12px", borderRadius: "20px", marginBottom: "20px", alignSelf: "flex-start" }}>
                    {stat}
                  </div>
                  {/* Quote */}
                  <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "#374151", flex: 1, margin: "0 0 24px", fontStyle: "italic" }}>
                    &ldquo;{quote}&rdquo;
                  </p>
                  {/* Attribution */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "20px", borderTop: "1px solid #f3f4f6" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.95rem", color: "#fff", flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#0b1d3a", fontSize: "0.9rem" }}>{name}</div>
                      <div style={{ color: "#9ca3af", fontSize: "0.78rem", marginTop: "2px" }}>{detail}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section style={{ background: "#0B1D3A", padding: "clamp(48px,8vw,80px) clamp(16px,5vw,40px)", textAlign: "center" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <svg width="40" height="28" viewBox="0 0 40 28" fill="none" style={{ marginBottom: "28px", opacity: 0.4 }}>
            <path d="M0 28V17.2C0 12.533 1.067 8.667 3.2 5.6C5.333 2.533 8.533 0.8 12.8 0L14.4 3.2C11.733 3.867 9.733 5.2 8.4 7.2C7.067 9.2 6.4 11.467 6.4 14H12.8V28H0ZM22.4 28V17.2C22.4 12.533 23.467 8.667 25.6 5.6C27.733 2.533 30.933 0.8 35.2 0L36.8 3.2C34.133 3.867 32.133 5.2 30.8 7.2C29.467 9.2 28.8 11.467 28.8 14H35.2V28H22.4Z" fill="white"/>
          </svg>
          <p style={{ fontSize: "1.25rem", lineHeight: 1.7, color: "#ffffff", fontStyle: "italic", margin: "0 0 32px", fontWeight: 400 }}>
            "I built this model because I was tired of watching good agents pay into a cap they never hit. I've been on both sides of this. I know what it feels like to close a deal and do the math on what you actually kept. The structure works because I designed it to reward production."
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#1B8C3A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem", color: "#fff" }}>TS</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ color: "#ffffff", fontWeight: 700, fontSize: "0.95rem" }}>Tom Songer</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem" }}>Team Lead · Bear Team Real Estate</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#060e1c", padding: "clamp(40px,8vw,60px) clamp(16px,5vw,40px)", textAlign: "center" }}>
        <div style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff", marginBottom: "8px", letterSpacing: "0.04em" }}>Bear Team Real Estate</div>
        <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", marginBottom: "24px", lineHeight: 1.6 }}>Orlando, FL · Independent Licensed Brokerage · Bethanne Baer, Broker</div>
        <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap", marginBottom: "28px" }}>
          <a href="/chat" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "4px 0" }}>Talk to Scout</a>
          <span style={{ color: "rgba(255,255,255,0.15)" }} aria-hidden="true">·</span>
          <a href="/scout" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "4px 0" }}>The System</a>
          <span style={{ color: "rgba(255,255,255,0.15)" }} aria-hidden="true">·</span>
          <a href="/academy" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "4px 0" }}>Academy</a>
        </div>
        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.2)" }}>Copyright WorldTeachPathways 2026</div>
      </footer>
    </main>
  );
}

