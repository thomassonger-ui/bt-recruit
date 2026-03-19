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
    <Link href="https://www.joinbearteam.com/scout" style={{ display: "inline-block" }}>
      <button
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
        padding: "0 clamp(16px, 4vw, 40px)",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0)",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.08)" : "none",
        transition: "all 0.35s ease",
      }}
    >
      <a href="#top" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        {/* BT Logo — double-bordered square */}
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="32" height="32" rx="1" stroke="#1a1a1a" strokeWidth="2" fill="none"/>
          <rect x="4" y="4" width="26" height="26" rx="0.5" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
          <text x="17" y="22.5" textAnchor="middle" fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" fontWeight="800" fontSize="12" fill="#1a1a1a" letterSpacing="0.5">BT</text>
        </svg>
        <span style={{ color: "#1a1a1a", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "0.04em" }}>
          Bear Team
        </span>
      </a>
      {/* Desktop links */}
      <div style={{ display: "flex", gap: "28px", alignItems: "center" }} className="nav-desktop">
        <a href="#systems" style={{ color: "#1a1a1a", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>
          The System
        </a>
        <a href="#proof" style={{ color: "#1a1a1a", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>
          Track Record
        </a>
        <ScoutCTA size="sm" />
      </div>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(o => !o)}
        style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: "8px", color: "#1a1a1a" }}
        className="nav-hamburger"
        aria-label="Menu"
      >
        <div style={{ width: 22, height: 2, background: "#1a1a1a", marginBottom: 5, transition: "all 0.2s", transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
        <div style={{ width: 22, height: 2, background: "#1a1a1a", marginBottom: 5, opacity: menuOpen ? 0 : 1, transition: "all 0.2s" }} />
        <div style={{ width: 22, height: 2, background: "#1a1a1a", transition: "all 0.2s", transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
      </button>
      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{ position: "absolute", top: "60px", left: 0, right: 0, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(14px)", padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: "20px", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <a href="#systems" onClick={() => setMenuOpen(false)} style={{ color: "#1a1a1a", textDecoration: "none", fontSize: "1rem", fontWeight: 600 }}>The System</a>
          <a href="#proof" onClick={() => setMenuOpen(false)} style={{ color: "#1a1a1a", textDecoration: "none", fontSize: "1rem", fontWeight: 600 }}>Track Record</a>
          <div onClick={() => setMenuOpen(false)}><ScoutCTA size="sm" label="Start with Scout" /></div>
        </div>
      )}
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

// Card 1: "1 – Agent Onboarding" Moodle course with accordion modules
// Card 1: Bear Academy Welcome lesson — video + Operating Philosophy
function Card1_AcademyWelcome() {
  return (
    <div style={{ width:"100%", height:"100%", background:"#fff", fontFamily:"-apple-system,sans-serif", display:"flex", flexDirection:"column" }}>
      <div style={{ background:"#1e3a5f", padding:"14px 20px", flexShrink:0 }}>
        <div style={{ fontSize:"1rem", fontWeight:800, color:"#fff", marginBottom:2 }}>Bear Academy</div>
        <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.65)" }}>Agent Onboarding</div>
      </div>
      <div style={{ padding:"10px 20px", background:"#f9fafb", borderBottom:"1px solid #e5e7eb", fontSize:"0.6rem", color:"#374151", flexShrink:0 }}>
        <span style={{ fontWeight:700 }}>Lesson:</span> Welcome to Bear Academy
      </div>
      <div style={{ position:"relative", flexShrink:0, height:"45%", background:"#b0bec5", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg, #b0bec5 0%, #78909c 100%)" }} />
        <div style={{ position:"absolute", top:10, left:12, right:12, display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:18, height:18, borderRadius:"50%", background:"#e63946", display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ color:"#fff", fontSize:"0.45rem" }}>▶</span></div>
          <span style={{ fontSize:"0.52rem", color:"#fff", fontWeight:600 }}>Brokerage Vision &amp; Structure</span>
          <div style={{ marginLeft:"auto", display:"flex", gap:12 }}>
            <span style={{ fontSize:"0.46rem", color:"rgba(255,255,255,0.8)" }}>⏱ Watch later</span>
            <span style={{ fontSize:"0.46rem", color:"rgba(255,255,255,0.8)" }}>↑ Share</span>
          </div>
        </div>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(220,38,38,0.92)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 20px rgba(0,0,0,0.4)" }}>
            <span style={{ color:"#fff", fontSize:"1.1rem", marginLeft:4 }}>▶</span>
          </div>
        </div>
        <div style={{ position:"absolute", bottom:8, right:10, border:"1.5px solid rgba(255,255,255,0.7)", padding:"3px 8px" }}>
          <span style={{ fontSize:"0.48rem", color:"#fff", fontWeight:800 }}>BT</span>
        </div>
        <div style={{ position:"absolute", bottom:8, left:10, background:"rgba(0,0,0,0.55)", padding:"3px 8px", borderRadius:4 }}>
          <span style={{ fontSize:"0.46rem", color:"#fff" }}>Watch on <strong>▶ YouTube</strong></span>
        </div>
      </div>
      <div style={{ flex:1, padding:"14px 20px", overflow:"hidden" }}>
        <div style={{ borderLeft:"3px solid #1e3a5f", paddingLeft:12, marginBottom:10 }}>
          <div style={{ fontSize:"0.82rem", fontWeight:800, color:"#111", marginBottom:5 }}>Operating Philosophy</div>
          <div style={{ fontSize:"0.58rem", color:"#374151", lineHeight:1.65, marginBottom:5 }}>Bear Team does not operate on improvisation. The brokerage operates through defined structure and disciplined execution.</div>
        </div>
        <div style={{ fontSize:"0.6rem", fontWeight:700, color:"#111", marginBottom:6 }}>Our operating philosophy is simple:</div>
        {["Structure reduces friction","Systems create speed","Execution builds trust"].map((item,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#1e3a5f", flexShrink:0 }} />
            <span style={{ fontSize:"0.58rem", color:"#374151" }}>{item}</span>
          </div>
        ))}
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
        <div style={{ fontSize:"1.4rem", fontWeight:800, color:"#111", marginBottom:4 }}>Introducing Scout</div>
        <div style={{ fontSize:"0.65rem", color:"#3b5a82", fontWeight:600, marginBottom:10 }}>BearTeam AI Assistant</div>
        <div style={{ fontSize:"0.62rem", color:"#374151", lineHeight:1.6, marginBottom:14 }}>Most agents don&rsquo;t lose deals because of skill.<br />They lose them because of broken systems.</div>
        <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 12px", display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <span style={{ fontSize:"0.56rem", color:"#9ca3af", flex:1 }}>Ask Scout about splits, fees, or joining Bear Team...</span>
          <div style={{ width:24, height:24, borderRadius:6, background:"#3b5a82", display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ color:"#fff", fontSize:"0.5rem" }}>➤</span></div>
        </div>
        {[
          "What's my split if I close 10 deals this year?",
          "How does Bear Team compare to eXp?",
          "What are my monthly costs at Bear Team?",
        ].map((p,i) => (
          <div key={i} style={{ fontSize:"0.52rem", color:"#6b7280", padding:"4px 8px", background:"rgba(255,255,255,0.7)", borderRadius:5, marginBottom:4, border:"1px solid #e5e7eb" }}>{p}</div>
        ))}
        <div style={{ display:"flex", gap:8, marginTop:4, flexWrap:"wrap" }}>
          {["Summarize the Orlando housing market","Prepare a showing checklist for a buyer client"].map((p,i) => (
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
        {["What's my split at 8 deals?","How do I compare to KW?","What does joining cost?"].map((task,i) => (
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
            "Scout, write an MLS listing for a 3-bed in Winter Park with an updated kitchen.",
            "Scout, create a social media post announcing a new listing in Baldwin Park.",
            "Scout, summarize the key selling points so I can present to buyers quickly.",
            "Scout, write an email introducing this listing to potential buyers.",
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
      style={{ height: "200vh", overflow: "hidden", position: "relative", background: "#F0F1F3" }}
    >
      {/* Blueprint grid background matching /scout */}
      <BlueprintGrid />

      {/* Sticky hero text */}
      <div style={{ position: "sticky", top: 0, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, pointerEvents: "none" }}>
        <div style={{
          maxWidth: "860px",
          padding: "40px 48px",
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
              A Real Estate System
              <br />
              <span style={{ color: "#3b5a82" }}>
                That Tells You What To Do Next
              </span>
            </h1>
          </HeroFade>
          <HeroFade delay={150}>
            <p style={{ fontSize: "1.15rem", color: "#6b7280", maxWidth: "560px", margin: "0 auto 36px", lineHeight: 1.65 }}>
              Most agents guess. Bear Team removes that. Zero fees, progressive splits, and Scout AI working for you from day one.
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
        <motion.div style={{ rotateX, rotateZ, translateY, opacity, transformStyle: "preserve-3d", paddingTop: "45vh" }}>
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
          {["What's my split at 8 deals?", "How do I compare to KW?", "What does joining cost?"].map(q => (
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
          style={{ flex: 1, padding: "9px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", fontSize: "0.8rem", color: "#fff", outline: "none" }}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{ width: 34, height: 34, borderRadius: "8px", background: loading || !input.trim() ? "rgba(59,90,130,0.3)" : "linear-gradient(135deg, #3b5a82, #2c4a72)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: loading || !input.trim() ? "default" : "pointer", flexShrink: 0, transition: "background 0.2s" }}>
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

function SystemPanel({ label, title, description, href, external, visual, index, isLast }: SystemPanelProps & { isLast?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
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
          {external ? (
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
          href="https://www.bearteam.com/"
          external={true}
          visual={<BearTeamOSVisual />}
        />
        <SystemPanel
          index={2}
          label="Agent Training Platform"
          title="Bear Academy"
          description="A full LMS built on Moodle. Structured 30-60-90 day certification tracks, deal walkthroughs, and ongoing CE — completely free for every Bear Team agent."
          href="https://youtu.be/o8q68ONEMnk"
          external={true}
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
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; flex-direction: column; justify-content: center; }
        }
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
        }
        /* SystemPanel mobile stacking */
        @media (max-width: 768px) {
          .system-panel-inner {
            flex-direction: column !important;
            padding: 40px 20px !important;
            min-height: unset !important;
            gap: 32px !important;
          }
          .system-panel-text {
            flex: none !important;
            min-width: unset !important;
            max-width: 100% !important;
          }
          .system-panel-visual {
            min-height: 320px !important;
            max-height: 380px !important;
          }
          .proof-grid { grid-template-columns: 1fr !important; }
          .compare-grid { grid-template-columns: 1fr !important; }
          .hero-card-grid { padding-left: 16px !important; padding-right: 16px !important; }
        }
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
              <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: "52px", color: "#0b1d3a", letterSpacing: "-0.02em" }}>
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
              <h2 style={{ fontSize: "clamp(2.2rem, 4vw, 3.6rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "16px", color: "#ffffff", letterSpacing: "-0.025em" }}>
                BearTeamOS.
              </h2>
              <h2 style={{ fontSize: "clamp(1.4rem, 2.5vw, 2.2rem)", fontWeight: 600, lineHeight: 1.2, marginBottom: "64px", color: "rgba(255,255,255,0.45)", letterSpacing: "-0.01em" }}>
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
                    <div style={{ maxWidth: "72%", padding: "12px 16px", borderRadius: msg.from === "agent" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.from === "agent" ? "rgba(255,255,255,0.15)" : "rgba(59,90,130,0.5)", color: "#ffffff", fontSize: "0.9rem", lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: msg.text }} />
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
              <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 800, color: "#0b1d3a", marginBottom: "56px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
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
            <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)", fontWeight: 800, color: "#ffffff", marginBottom: "20px", lineHeight: 1.2 }}>
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
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 800, color: "#0b1d3a", marginBottom: "16px", lineHeight: 1.15 }}>
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


      {/* ── TESTIMONIAL ── */}
      <section style={{ background: "#0B1D3A", padding: "80px 40px", textAlign: "center" }}>
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
      <footer style={{ background: "#060e1c", padding: "60px 40px", textAlign: "center" }}>
        <div style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff", marginBottom: "8px", letterSpacing: "0.04em" }}>Bear Team Real Estate</div>
        <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", marginBottom: "24px" }}>Orlando, FL · Independent Licensed Brokerage · Bethanne Baer, Broker</div>
        <div style={{ display: "flex", gap: "32px", justifyContent: "center" }}>
          <a href="/chat" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Talk to Scout</a>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <a href="#systems" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>The System</a>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <a href="#proof" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Track Record</a>
        </div>
        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.2)", marginTop: "28px" }}>© 2026 WorldTeachPathways. All rights reserved.</div>
      </footer>
    </main>
  );
}
