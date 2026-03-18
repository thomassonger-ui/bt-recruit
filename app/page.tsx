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
    <Link href="/chat" style={{ display: "inline-block" }}>
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
        padding: "0 40px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(11,29,58,0.88)" : "rgba(11,29,58,0)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
        transition: "all 0.35s ease",
      }}
    >
      <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.04em" }}>
        Bear Team
      </span>
      <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
        <a href="#system" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>
          The System
        </a>
        <a href="#proof" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>
          Track Record
        </a>
        <ScoutCTA size="sm" />
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

// ─── Screenshot Mockup Cards (4 unique) ───────────────────────────────────────

// Card 1: "1 – Agent Onboarding" Moodle course with accordion modules
function Card1_MoodleCourse() {
  return (
    <div style={{ width:"100%", height:"100%", background:"#fff", fontFamily:"-apple-system,sans-serif", display:"flex", flexDirection:"column" }}>
      <div style={{ height:32, background:"#fff", borderBottom:"1px solid #e5e7eb", display:"flex", alignItems:"center", padding:"0 16px", gap:20, flexShrink:0 }}>
        {["Home","Dashboard","My courses","Site administration"].map((t,i) => (
          <span key={t} style={{ fontSize:"0.55rem", color: i===2 ? "#1d4ed8":"#374151", fontWeight: i===2 ? 700:400, borderBottom: i===2 ? "2px solid #1d4ed8":"none", paddingBottom:2 }}>{t}</span>
        ))}
      </div>
      <div style={{ padding:"16px 20px 0", flexShrink:0 }}>
        <div style={{ fontSize:"1rem", fontWeight:800, color:"#111", marginBottom:10 }}>1 – Agent Onboarding – How We Think</div>
        <div style={{ display:"flex", gap:18, borderBottom:"1px solid #e5e7eb", paddingBottom:8, marginBottom:14 }}>
          {["Course","Settings","Participants","Grades","Activities","More ∨"].map((t,i) => (
            <span key={t} style={{ fontSize:"0.55rem", color: i===0 ? "#1d4ed8":"#6b7280", fontWeight: i===0 ? 700:400, borderBottom: i===0 ? "2px solid #1d4ed8":"none", paddingBottom:5 }}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{ flex:1, padding:"0 20px 14px", overflow:"hidden", display:"flex", flexDirection:"column", gap:6 }}>
        {[
          ["Who We Are", true],
          ["What We Believe", false],
          ["Why Structure Matters 🔒", false],
          ["What Defines the Bear Team Model", false],
          ["What Agents Can Expect", false],
          ["Completion", false],
        ].map(([m, first], i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"#fff", border:"1px solid #e5e7eb", borderRadius:10 }}>
            <div style={{ width:20, height:20, borderRadius:5, background:"#eff6ff", border:"1px solid #bfdbfe", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontSize:"0.55rem", color:"#1d4ed8", fontWeight:700 }}>›</span>
            </div>
            <span style={{ fontSize:"0.62rem", color:"#111", fontWeight:500 }}>{m as string}</span>
            {first && <span style={{ marginLeft:"auto", fontSize:"0.5rem", color:"#1d4ed8", fontWeight:600, whiteSpace:"nowrap" }}>Collapse all</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// Card 2: "Scout in Action" chat with full conversation thread
function Card2_ScoutChat() {
  return (
    <div style={{ width:"100%", height:"100%", background:"#f0f1f3", fontFamily:"-apple-system,sans-serif", display:"flex", flexDirection:"column", padding:"20px" }}>
      <div style={{ fontSize:"0.5rem", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#6b7280", marginBottom:4 }}>AI-POWERED</div>
      <div style={{ fontSize:"1.1rem", fontWeight:800, color:"#111", marginBottom:3 }}>Scout in Action</div>
      <div style={{ fontSize:"0.55rem", color:"#6b7280", marginBottom:14 }}>Scout assists agents with marketing, communication, and daily workflow tasks.</div>
      <div style={{ flex:1, background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
        {/* Chat header */}
        <div style={{ padding:"10px 14px", borderBottom:"1px solid #f3f4f6", display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <div style={{ width:22, height:22, borderRadius:"50%", background:"#3b5a82", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.5rem", color:"#fff", fontWeight:700 }}>S</div>
          <div><div style={{ fontSize:"0.6rem", fontWeight:700, color:"#111" }}>Scout</div><div style={{ fontSize:"0.48rem", color:"#9ca3af" }}>BearTeam AI Assistant</div></div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:3 }}><div style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e" }}/><span style={{ fontSize:"0.48rem", color:"#22c55e", fontWeight:600 }}>Online</span></div>
        </div>
        {/* Messages */}
        <div style={{ flex:1, padding:"12px 14px", display:"flex", flexDirection:"column", gap:8, overflow:"hidden" }}>
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <div style={{ maxWidth:"72%", padding:"8px 12px", background:"#3b5a82", borderRadius:"12px 12px 3px 12px", color:"#fff", fontSize:"0.56rem", lineHeight:1.5 }}>Scout, write a listing description for a 3 bedroom home in Winter Park.</div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-start" }}>
            <div style={{ maxWidth:"76%", padding:"8px 12px", background:"#f3f4f6", borderRadius:"12px 12px 12px 3px", color:"#374151", fontSize:"0.56rem", lineHeight:1.5 }}>Elegant 3-bedroom residence in the heart of Winter Park featuring updated interiors, natural light throughout, and a spacious backyard ideal for entertaining. Move-in ready with modern finishes and a prime location near shops and dining.</div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <div style={{ maxWidth:"65%", padding:"8px 12px", background:"#3b5a82", borderRadius:"12px 12px 3px 12px", color:"#fff", fontSize:"0.56rem", lineHeight:1.5 }}>What pricing strategy would you recommend?</div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-start" }}>
            <div style={{ maxWidth:"78%", padding:"8px 12px", background:"#f3f4f6", borderRadius:"12px 12px 12px 3px", color:"#374151", fontSize:"0.56rem", lineHeight:1.5 }}>Based on 14 comparable sales within 0.8 miles over the past 90 days, a competitive listing range would be $410,000–$425,000. At $415k you&rsquo;d be positioned to generate multiple offers within 18 days on market.</div>
          </div>
        </div>
        {/* Input */}
        <div style={{ padding:"8px 12px", borderTop:"1px solid #f3f4f6", display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
          <div style={{ flex:1, background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:"6px 10px", fontSize:"0.52rem", color:"#9ca3af" }}>Ask Scout anything...</div>
          <div style={{ width:26, height:26, borderRadius:8, background:"#3b5a82", display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ color:"#fff", fontSize:"0.5rem" }}>➤</span></div>
        </div>
      </div>
    </div>
  );
}

// Card 3: "My Courses" Moodle grid with 6 course cards
function Card3_MyCourses() {
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
      <div style={{ padding:"14px 18px 8px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
          <div style={{ fontSize:"0.9rem", fontWeight:800, color:"#111" }}>My courses</div>
          <div style={{ display:"flex", gap:6 }}>
            <div style={{ padding:"3px 8px", border:"1px solid #d1d5db", borderRadius:5, fontSize:"0.48rem", color:"#374151" }}>Manage courses</div>
            <div style={{ padding:"3px 8px", background:"#2563eb", borderRadius:5, fontSize:"0.48rem", color:"#fff", fontWeight:600 }}>Create course</div>
          </div>
        </div>
        <div style={{ fontSize:"0.55rem", color:"#374151", marginBottom:10 }}>Course overview</div>
        <div style={{ display:"flex", gap:6, marginBottom:10 }}>
          <div style={{ padding:"3px 8px", border:"1px solid #d1d5db", borderRadius:5, fontSize:"0.48rem", color:"#374151" }}>All ∨</div>
          <div style={{ flex:1, padding:"3px 8px", border:"1px solid #d1d5db", borderRadius:5, fontSize:"0.48rem", color:"#9ca3af" }}>Search</div>
          <div style={{ padding:"3px 8px", border:"1px solid #d1d5db", borderRadius:5, fontSize:"0.48rem", color:"#374151" }}>Sort by course name ∨</div>
          <div style={{ padding:"3px 8px", border:"1px solid #d1d5db", borderRadius:5, fontSize:"0.48rem", color:"#374151" }}>Card ∨</div>
        </div>
      </div>
      <div style={{ flex:1, padding:"0 18px 10px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, overflow:"hidden" }}>
        {courses.map((c,i) => (
          <div key={i} style={{ border:"1px solid #e5e7eb", borderRadius:8, overflow:"hidden", display:"flex", flexDirection:"column" }}>
            <div style={{ height:40, background: c.hasImg ? "#f0e8d8" : "#111", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {c.hasImg ? <span style={{ fontSize:"0.6rem" }}>📋</span> : <div style={{ textAlign:"center" }}><div style={{ fontSize:"0.42rem", color:"rgba(255,255,255,0.5)", letterSpacing:"0.08em" }}>BT |</div><div style={{ fontSize:"0.44rem", color:"#fff", fontWeight:700, letterSpacing:"0.06em" }}>BEAR TEAM</div><div style={{ fontSize:"0.38rem", color:"rgba(255,255,255,0.5)", letterSpacing:"0.12em" }}>— ACADEMY —</div></div>}
            </div>
            <div style={{ padding:"5px 6px", flex:1 }}>
              <div style={{ fontSize:"0.46rem", color:"#2563eb", fontWeight:600, lineHeight:1.3, marginBottom:2 }}>{c.title}</div>
              <div style={{ fontSize:"0.42rem", color:"#6b7280", marginBottom:3 }}>Category 1</div>
              {c.badge && <div style={{ display:"inline-block", padding:"1px 5px", background:"#0891b2", borderRadius:4, fontSize:"0.38rem", color:"#fff", marginBottom:2 }}>{c.badge}</div>}
              {c.pct && <div style={{ fontSize:"0.42rem", color:c.color, fontWeight:600 }}>{c.pct}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Card 4: "Bear Academy" lesson page with video + content
function Card4_AcademyLesson() {
  return (
    <div style={{ width:"100%", height:"100%", background:"#f3f4f6", fontFamily:"-apple-system,sans-serif", display:"flex", flexDirection:"column" }}>
      {/* Header bar */}
      <div style={{ background:"#1e3a5f", padding:"10px 16px", flexShrink:0 }}>
        <div style={{ fontSize:"0.7rem", fontWeight:800, color:"#fff", marginBottom:1 }}>Bear Team Academy</div>
        <div style={{ fontSize:"0.52rem", color:"rgba(255,255,255,0.65)" }}>Agent Onboarding — Course Layout</div>
      </div>
      <div style={{ padding:"8px 16px 4px", background:"#fff", borderBottom:"1px solid #e5e7eb", fontSize:"0.52rem", color:"#374151", flexShrink:0 }}>
        <span style={{ fontWeight:700 }}>Lesson:</span> Course Layout Overview
      </div>
      <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column", gap:0 }}>
        {/* Video thumbnail */}
        <div style={{ background:"#1a1a1a", position:"relative", flexShrink:0, height:"44%" }}>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:6 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(255,0,0,0.9)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"#fff", fontSize:"0.7rem" }}>▶</span>
            </div>
            <div style={{ fontSize:"0.48rem", color:"rgba(255,255,255,0.7)" }}>Bear Team Academy | Orientation: Culture &amp; Expectations</div>
          </div>
          <div style={{ position:"absolute", bottom:6, left:10, fontSize:"0.44rem", color:"rgba(255,255,255,0.6)", display:"flex", alignItems:"center", gap:4 }}>
            <span>Watch on</span><span style={{ fontWeight:700, color:"#fff" }}>▶ YouTube</span>
          </div>
        </div>
        {/* Text content */}
        <div style={{ flex:1, background:"#fff", padding:"10px 16px", overflow:"hidden" }}>
          <div style={{ fontSize:"0.75rem", fontWeight:800, color:"#111", marginBottom:6 }}>Course Layout</div>
          <div style={{ fontSize:"0.54rem", color:"#374151", lineHeight:1.6, marginBottom:5 }}>Your onboarding pathway is organized into sequential sections designed to align identity before execution.</div>
          <div style={{ fontSize:"0.54rem", color:"#374151", lineHeight:1.6 }}>The course is structured so that each section builds on the previous one. This ensures that agents understand the Bear Team operating philosophy before moving into <span style={{ color:"#2563eb", textDecoration:"underline" }}>operational systems</span> and execution.</div>
        </div>
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

  const row1 = [<Card1_MoodleCourse />, <Card2_ScoutChat />, <Card3_MyCourses />];
  const row2 = [<Card4_AcademyLesson />, <Card1_MoodleCourse />, <Card2_ScoutChat />, <Card3_MyCourses />];

  return (
    <div
      ref={ref}
      style={{ height: "200vh", overflow: "hidden", position: "relative", background: "#F0F1F3" }}
    >
      {/* Blueprint grid background matching /scout */}
      <BlueprintGrid />

      {/* Sticky hero text */}
      <div style={{ position: "sticky", top: 0, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, pointerEvents: "none" }}>
        <div style={{ maxWidth: "860px", padding: "0 32px", textAlign: "center", pointerEvents: "all" }}>
          <HeroFade delay={100}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", background: "rgba(59,90,130,0.1)", border: "1px solid rgba(59,90,130,0.25)", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#3b5a82", marginBottom: "28px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              Orlando, FL · Independent Brokerage
            </div>
          </HeroFade>
          <HeroFade delay={200}>
            <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", fontWeight: 800, lineHeight: 1.1, color: "#1a1a1a", marginBottom: "20px", letterSpacing: "-0.02em" }}>
              A Real Estate System
              <br />
              <span style={{ color: "#3b5a82" }}>
                That Tells You What To Do Next
              </span>
            </h1>
          </HeroFade>
          <HeroFade delay={350}>
            <p style={{ fontSize: "1.15rem", color: "#6b7280", maxWidth: "560px", margin: "0 auto 36px", lineHeight: 1.65 }}>
              Most agents guess. Bear Team removes that. Zero fees, progressive splits, and Scout AI working for you from day one.
            </p>
          </HeroFade>
          <HeroFade delay={500}>
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
      content: "Hey — I&apos;m Scout, Bear Team&apos;s AI recruiting assistant. Ask me about splits, fees, the cap model, or how Bear Team compares to your current brokerage. What&apos;s on your mind?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: "14px" }}>
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
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts — only show when just the greeting is visible */}
      {messages.length === 1 && (
        <div style={{ padding: "0 18px 12px", display: "flex", gap: "8px", flexWrap: "wrap", flexShrink: 0 }}>
          {["What&apos;s my split at 8 deals?", "How do I compare to KW?", "What does joining cost?"].map(q => (
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
  const [w3Progress, setW3Progress] = useState(0);
  const [certPct, setCertPct] = useState(0);
  const [modulesComplete, setModulesComplete] = useState(0);

  useEffect(() => {
    // Animate in from 0 on mount
    const t = setTimeout(() => {
      setW3Progress(65);
      setCertPct(40);
      setModulesComplete(2);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  // Slowly tick the in-progress bar forward
  useEffect(() => {
    const id = setInterval(() => {
      setW3Progress(p => {
        const next = p + 0.5;
        if (next >= 80) { setCertPct(c => Math.min(c + 0.4, 48)); }
        return next > 80 ? 65 : next; // loop back to 65 to keep it looping visually
      });
    }, 120);
    return () => clearInterval(id);
  }, []);

  const certPctDisplay = useCountUp(certPct, 800, 0);

  return (
    <div style={{ width: "100%", height: "100%", background: "#1a1200", borderRadius: "16px", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ padding: "0 24px", height: "52px", borderBottom: "1px solid rgba(255,200,80,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#120d00", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 26, height: 26, borderRadius: "6px", background: "linear-gradient(135deg, #ffb74d, #e65100)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 800, color: "#fff" }}>BA</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>Bear Academy</span>
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          {["My Courses", "Progress", "Resources"].map(item => (
            <span key={item} style={{ fontSize: "0.72rem", color: item === "My Courses" ? "#ffb74d" : "rgba(255,255,255,0.4)", cursor: "pointer", fontWeight: item === "My Courses" ? 600 : 400 }}>{item}</span>
          ))}
        </div>
      </div>
      {/* Body */}
      <div style={{ flex: 1, padding: "18px 22px", display: "flex", flexDirection: "column", gap: "12px", overflowY: "hidden" }}>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,183,77,0.5)" }}>30-60-90 Day Certification Track</div>
        {/* Course list */}
        {[
          { title: "Week 1: MLS Systems & Listing Agreements", progress: 100, badge: "Complete", color: "#81c784" },
          { title: "Week 2: Bear Team Commission Model Deep Dive", progress: 100, badge: "Complete", color: "#81c784" },
          { title: "Week 3: Buyer Consultation & Pipeline Setup", progress: w3Progress, badge: "In Progress", color: "#64b5f6" },
          { title: "Week 4: Negotiation & Closing Workflows", progress: 0, badge: "Upcoming", color: "rgba(255,255,255,0.3)" },
          { title: "Week 5: Scout AI — Advanced Use", progress: 0, badge: "Upcoming", color: "rgba(255,255,255,0.3)" },
        ].map((course, i) => (
          <div key={i} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: `1px solid ${i < 2 ? "rgba(129,199,132,0.2)" : i === 2 ? "rgba(100,181,246,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: course.progress > 0 && course.progress < 100 ? "8px" : "0" }}>
              <span style={{ fontSize: "0.76rem", color: i < 3 ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.35)", fontWeight: 500, paddingRight: "12px" }}>{course.title}</span>
              <span style={{ fontSize: "0.6rem", color: course.color, fontWeight: 700, whiteSpace: "nowrap", padding: "3px 8px", background: `${course.color}18`, borderRadius: "6px" }}>{course.badge}</span>
            </div>
            {course.progress > 0 && course.progress < 100 && (
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <motion.div
                  style={{ height: "100%", background: "linear-gradient(90deg, #3b5a82, #64b5f6)", borderRadius: 2 }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${course.progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
        ))}
        {/* XP bar */}
        <div style={{ padding: "10px 14px", background: "rgba(255,183,77,0.05)", border: "1px solid rgba(255,183,77,0.15)", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,183,77,0.6)", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Certification Progress</div>
            <div style={{ fontSize: "0.76rem", color: "#ffb74d", fontWeight: 600 }}>{modulesComplete} of 5 modules complete</div>
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#ffb74d" }}>{Math.round(certPct)}%</div>
        </div>
      </div>
    </div>
  );
}

// ─── System Panel (parallax + fade-out per section) ───────────────────────────

function SystemPanel({ label, title, description, href, external, visual, index }: SystemPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Fade in as it enters, fade out as it exits
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.5, 0.85, 1],
    [0, 1, 1, 1, 0]
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
        style={{
          minHeight: "88vh",
          display: "flex",
          alignItems: "center",
          padding: "80px clamp(24px, 6vw, 100px)",
          gap: "clamp(32px, 5vw, 80px)",
          flexDirection: isEven ? "row" : "row-reverse",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Text block */}
        <motion.div style={{ y: textY, flex: "0 0 clamp(280px, 36%, 480px)" }}>
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
          style={{
            y: visualY,
            flex: 1,
            minHeight: "clamp(360px, 50vh, 600px)",
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
          label="AI Recruiting Assistant"
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
          href="https://worldteachpathways.moodlecloud.com/"
          external={true}
          visual={<AcademyVisual />}
        />
      </div>

    </section>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#f0f1f3",
        color: "#1a1a1a",
      }}
    >
      <Nav />

      {/* ── HERO: Parallax ── */}
      <HeroParallax />

      {/* ── SYSTEM SHOWCASE ── */}
      <SystemShowcase />

      {/* ── PATTERN INTERRUPT ── */}
      <section style={{ background: "#080f1e", padding: "120px 40px", textAlign: "center" }}>
        <Reveal>
          <p style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.4rem)", fontWeight: 700, color: "#ffffff", lineHeight: 1.4, maxWidth: "760px", margin: "0 auto" }}>
            The #1 reason agents plateau is not effort.
            <br />
            <span style={{ color: "#64b5f6" }}>It&rsquo;s operating without a system.</span>
          </p>
        </Reveal>
      </section>

      {/* ── PROBLEM ── */}
      <section style={{ padding: "120px 40px", background: "#f0f1f3" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <Reveal>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6b7280", marginBottom: "16px" }}>The Problem</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, lineHeight: 1.2, marginBottom: "48px", color: "#0b1d3a" }}>
              Most agents don&rsquo;t fail because they lack talent.
            </h2>
          </Reveal>
          {[
            "They fail because they don&rsquo;t have a system — they&rsquo;re making it up deal by deal.",
            "They&rsquo;re paying their brokerage hundreds a month and getting nothing back.",
            "They hit a ceiling and can&rsquo;t figure out why. No visibility. No structure. No next step.",
          ].map((text, i) => (
            <Reveal key={i} delay={150 + i * 100}>
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "28px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b5a82", marginTop: "8px", flexShrink: 0 }} />
                <p style={{ fontSize: "1.05rem", lineHeight: 1.65, color: "#374151" }} dangerouslySetInnerHTML={{ __html: text }} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section id="system" style={{ padding: "120px 40px", background: "#0b1d3a" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Reveal>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: "16px" }}>The Solution</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, lineHeight: 1.2, marginBottom: "56px", color: "#ffffff" }}>
              BearTeamOS — a brokerage built like a system.
            </h2>
          </Reveal>
          {[
            ["01", "Scout AI", "Your always-on assistant that knows your pipeline, your commissions, and your next move."],
            ["02", "Progressive Splits", "Start at 60/40. Earn your way to 90/10 by producing — not by waiting."],
            ["03", "Zero Fees", "No monthly, no desk, no tech. E&O covered. $150 flat per close. That&rsquo;s it."],
            ["04", "BearTeam Academy", "Free training from day one. Structure, mentorship, and a real 30-60-90 day plan."],
          ].map(([num, title, desc]) => (
            <Reveal key={num} delay={parseInt(num) * 80}>
              <div style={{ display: "flex", gap: "24px", marginBottom: "40px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "2rem", fontWeight: 800, color: "rgba(100,181,246,0.35)", lineHeight: 1, minWidth: "40px", letterSpacing: "-0.03em" }}>{num}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#ffffff", marginBottom: "6px" }}>{title}</div>
                  <div style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.58)", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: desc }} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── SCOUT ENTRY ── */}
      <section style={{ padding: "120px 40px", background: "#3f5f8a" }}>
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
      <section style={{ padding: "120px 40px", background: "#f0f1f3" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <Reveal>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6b7280", marginBottom: "16px" }}>How It Works</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, color: "#0b1d3a", marginBottom: "56px", lineHeight: 1.2 }}>
              Your day-to-day, simplified.
            </h2>
          </Reveal>
          {[
            ["01", "Scout surfaces your next deal", "AI-assisted pipeline visibility — Scout tells you who to follow up with and when."],
            ["02", "System tracks your tier progress", "See exactly where you are on the graduation path. No guessing."],
            ["03", "Transactions handled by TC", "Our coordinator manages paperwork and timelines so you stay in front of clients."],
            ["04", "You close and graduate", "Every deal moves you up the split ladder — automatically."],
          ].map(([num, title, desc]) => (
            <Reveal key={num} delay={parseInt(num) * 80}>
              <div style={{ display: "flex", gap: "20px", marginBottom: "36px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#0b1d3a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.75rem", fontWeight: 700, color: "#64b5f6" }}>{num}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0b1d3a", marginBottom: "4px" }}>{title}</div>
                  <div style={{ fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PROOF ── */}
      <section id="proof" style={{ padding: "120px 40px", background: "#ffffff" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <Reveal>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6b7280", marginBottom: "16px", textAlign: "center" }}>By The Numbers</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, color: "#0b1d3a", marginBottom: "56px", textAlign: "center", lineHeight: 1.2 }}>
              The math speaks for itself.
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px", marginBottom: "48px" }}>
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
      <section style={{ padding: "120px 40px", background: "#f0f1f3" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, color: "#0b1d3a", marginBottom: "56px", textAlign: "center" }}>Traditional vs. Bear Team</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
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
      <section style={{ padding: "120px 40px", background: "#ffffff" }}>
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
      <section style={{ padding: "120px 40px", background: "linear-gradient(135deg, #060e1c 0%, #0b1d3a 100%)", textAlign: "center" }}>
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
      <section style={{ padding: "120px 40px", background: "#f0f1f3", textAlign: "center" }}>
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
            <a href="#system" style={{ padding: "14px 32px", fontSize: "1rem", fontWeight: 600, color: "#3b5a82", border: "2px solid #3b5a82", borderRadius: "8px", textDecoration: "none", display: "inline-block" }}>
              See How It Works
            </a>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#060e1c", padding: "60px 40px", textAlign: "center" }}>
        <div style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff", marginBottom: "8px", letterSpacing: "0.04em" }}>Bear Team Real Estate</div>
        <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", marginBottom: "24px" }}>Orlando, FL · Independent Licensed Brokerage · Bethanne Baer, Broker</div>
        <div style={{ display: "flex", gap: "32px", justifyContent: "center" }}>
          <a href="/chat" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Talk to Scout</a>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <a href="#system" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>The System</a>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <a href="#proof" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Track Record</a>
        </div>
        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.2)", marginTop: "28px" }}>© 2026 WorldTeachPathways. All rights reserved.</div>
      </footer>
    </main>
  );
}
