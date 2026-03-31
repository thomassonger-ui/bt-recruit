import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Real Estate Agent — No Fees | AI-Powered Systems | Bear Team",
  description:
    "Join Bear Team Real Estate in Orlando. Zero monthly fees, progressive splits from 60/40 to 90/10, E&O covered, and Scout AI built in. See what you'd actually keep.",
  openGraph: {
    title: "Real Estate Agent — No Fees | AI-Powered Systems | Bear Team",
    description:
      "Zero fees. 60/40 → 90/10. E&O covered. Scout AI included. Bear Team Real Estate — Orlando, FL.",
    url: "https://www.joinbearteam.com/join",
    siteName: "Bear Team Real Estate",
    images: [{ url: "https://www.joinbearteam.com/images/bear-team-recruit-13.png", width: 1200, height: 627 }],
    type: "website",
  },
};

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-black text-white font-sans">

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 max-w-6xl mx-auto">
        <span className="text-white font-bold text-lg tracking-tight">
          <span className="text-[#FF6B00]">Bear</span> Team
        </span>
        <a
          href="https://www.joinbearteam.com/scout"
          className="bg-[#FF6B00] hover:bg-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
        >
          Talk to Scout™
        </a>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-[#FF6B00] text-sm font-semibold uppercase tracking-widest mb-4">
          Now Recruiting · Orlando, FL
        </p>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Real Estate Agent<br />
          <span className="text-[#FF6B00]">No Fees. Real Support.</span><br />
          AI-Powered Systems.
        </h1>
        <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Bear Team is a boutique Orlando brokerage built for agents who want to
          keep more of what they earn — with the systems, training, and support
          to actually grow.
        </p>
        <a
          href="https://www.joinbearteam.com/scout"
          className="inline-block bg-[#FF6B00] hover:bg-orange-500 text-white font-bold text-lg px-10 py-4 rounded-full transition-colors shadow-lg shadow-orange-900/30"
        >
          Start with Scout™ — AI Powered →
        </a>
        <p className="text-neutral-600 text-sm mt-4">No phone call required. Start the conversation now.</p>
      </section>

      {/* ── Divider ── */}
      <div className="h-px bg-[#FF6B00] max-w-6xl mx-auto opacity-40" />

      {/* ── Value Props ── */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            label: "Zero Fees",
            detail: "No monthly fees. No desk fees. No technology fees. Just a flat $150 per closing.",
          },
          {
            label: "60/40 → 90/10",
            detail: "Start at 60/40 and automatically advance to 90/10 once you hit the $16K company dollar cap.",
          },
          {
            label: "E&O Covered",
            detail: "Bear Team covers Errors & Omissions insurance fully. Most brokerages charge you $400–$800/year.",
          },
          {
            label: "Scout™ AI Built In",
            detail: "Every agent gets access to Scout — Bear Team's AI system for lead conversion, follow-up, and pipeline automation.",
          },
          {
            label: "Bear Team Academy",
            detail: "Free training on systems, lead gen, scripts, and business planning. No extra cost, ever.",
          },
          {
            label: "Boutique Orlando",
            detail: "Personal support from leadership. You're not a number here. Real culture, real team.",
          },
        ].map(({ label, detail }) => (
          <div key={label} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
            <div className="w-8 h-1 bg-[#FF6B00] rounded mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">{label}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">{detail}</p>
          </div>
        ))}
      </section>

      {/* ── The Math ── */}
      <section className="bg-neutral-950 border-y border-neutral-800 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[#FF6B00] text-sm font-semibold uppercase tracking-widest mb-4">Run the numbers</p>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            What does 10 deals/year<br />actually look like?
          </h2>
          <p className="text-neutral-400 text-lg mb-12 max-w-2xl mx-auto">
            At $300K average price, 3% commission, here's what a producing agent keeps
            at a standard 70/30 brokerage vs. Bear Team.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-black border border-neutral-700 rounded-2xl p-8">
              <p className="text-neutral-500 text-sm font-semibold uppercase tracking-widest mb-4">Typical 70/30 Brokerage</p>
              <div className="space-y-3 text-sm text-neutral-400">
                <div className="flex justify-between"><span>Gross commission (10 deals)</span><span className="text-white">$90,000</span></div>
                <div className="flex justify-between"><span>Brokerage split (30%)</span><span className="text-red-400">−$27,000</span></div>
                <div className="flex justify-between"><span>Monthly fees ($85 × 12)</span><span className="text-red-400">−$1,020</span></div>
                <div className="flex justify-between"><span>E&O insurance</span><span className="text-red-400">−$600</span></div>
                <div className="h-px bg-neutral-800 my-2" />
                <div className="flex justify-between text-white font-bold text-base"><span>Agent keeps</span><span>$61,380</span></div>
              </div>
            </div>
            <div className="bg-black border border-[#FF6B00] rounded-2xl p-8">
              <p className="text-[#FF6B00] text-sm font-semibold uppercase tracking-widest mb-4">Bear Team</p>
              <div className="space-y-3 text-sm text-neutral-400">
                <div className="flex justify-between"><span>Gross commission (10 deals)</span><span className="text-white">$90,000</span></div>
                <div className="flex justify-between"><span>Brokerage split (40% until cap)</span><span className="text-red-400">−$16,000</span></div>
                <div className="flex justify-between"><span>Flat transaction fees</span><span className="text-red-400">−$1,500</span></div>
                <div className="flex justify-between"><span>E&O insurance</span><span className="text-green-500">$0 — covered</span></div>
                <div className="h-px bg-neutral-800 my-2" />
                <div className="flex justify-between text-white font-bold text-base"><span>Agent keeps</span><span className="text-[#FF6B00]">$72,500</span></div>
              </div>
            </div>
          </div>
          <p className="text-[#FF6B00] font-bold text-2xl mt-10">
            That's $11,120 more per year — in your pocket.
          </p>
        </div>
      </section>

      {/* ── Scout CTA ── */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-[#FF6B00] text-sm font-semibold uppercase tracking-widest mb-4">
          AI-Powered Recruiting
        </p>
        <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
          Not ready to call?<br />Start with Scout™.
        </h2>
        <p className="text-neutral-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Scout is Bear Team's AI assistant. Ask it anything — commission math,
          what training looks like, how the cap works. It'll walk you through
          everything and connect you with Tom when you're ready.
        </p>
        <a
          href="https://www.joinbearteam.com/scout"
          className="inline-block bg-[#FF6B00] hover:bg-orange-500 text-white font-bold text-xl px-12 py-5 rounded-full transition-colors shadow-xl shadow-orange-900/40"
        >
          Start with Scout™ | AI Powered →
        </a>
        <p className="text-neutral-600 text-sm mt-5">
          Bear Team Real Estate · Orlando, FL · Tom Songer, Team Lead
        </p>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-800 py-8 text-center text-neutral-600 text-sm">
        <p>© {new Date().getFullYear()} Bear Team Real Estate · Orlando, FL · All rights reserved.</p>
        <p className="mt-2">
          <a href="https://www.linkedin.com/showcase/join-bear-team" className="hover:text-[#FF6B00] transition-colors">
            LinkedIn
          </a>
          {" · "}
          <a href="https://www.joinbearteam.com" className="hover:text-[#FF6B00] transition-colors">
            joinbearteam.com
          </a>
        </p>
      </footer>

    </main>
  );
}
