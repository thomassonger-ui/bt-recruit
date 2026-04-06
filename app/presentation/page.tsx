'use client'

import { useState, useEffect } from 'react'

const AGENT_NAME = 'Bethanne'
const AGENT_FULL = 'Bethanne Baer'

const STATS = [
  { value: '40+', label: 'Years' },
  { value: '7,000', label: 'Sold' },
  { value: '$4B', label: 'Volume' },
  { value: '15+', label: 'Markets' },
]

const RESOURCES = [
  { title: 'Real Agent Results', desc: 'See actual production, not promises', href: 'https://www.joinbearteam.com/' },
  { title: 'Live Call Breakdown', desc: 'Hear how Scout\u2122 converts conversations', href: 'https://www.joinbearteam.com/chat' },
  { title: 'Inside Scout', desc: 'Meet the people and structure behind the system', href: 'https://www.joinbearteam.com/scout' },
  { title: 'Earnings Breakdown', desc: 'See what this model actually pays', href: 'https://www.joinbearteam.com/chat' },
  { title: 'System Walkthrough', desc: 'How Scout\u2122 + BearTeamOS\u2122 work together', href: 'https://www.joinbearteam.com/' },
  { title: 'What Happens Next', desc: 'From onboarding \u2192 first deal closed', href: 'https://www.joinbearteam.com/academy' },
]

export default function PresentationPage() {
  const [stage, setStage] = useState<'envelope' | 'welcome' | 'presentation'>('envelope')
  const [envelopeOpen, setEnvelopeOpen] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setEnvelopeOpen(true), 1500)
    const t2 = setTimeout(() => setStage('welcome'), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (stage === 'envelope') {
    return <EnvelopeScreen open={envelopeOpen} />
  }

  if (stage === 'welcome') {
    return <WelcomeScreen onContinue={() => setStage('presentation')} />
  }

  return <PresentationScreen />
}

const TEAM = [
  { name: 'Allen Baer', img: '/images/allen-baer.jpg' },
  { name: 'Lissette Dennis', img: '/images/lissette-dennis.jpg' },
  { name: 'Owen Willis', img: '/images/owen-willis.jpg' },
  { name: 'Shanelle Mitchell', img: '/images/shanelle-mitchell.jpg' },
  { name: 'Beth Baer', img: '/images/beth-baer.jpg' },
]

function TeamCarousel() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActive(prev => (prev + 1) % TEAM.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  // Position each card relative to active: -2, -1, 0, +1, +2
  const getPos = (i: number) => {
    let diff = i - active
    if (diff > Math.floor(TEAM.length / 2)) diff -= TEAM.length
    if (diff < -Math.floor(TEAM.length / 2)) diff += TEAM.length
    return diff
  }

  return (
    <div className="relative max-w-5xl mx-auto" style={{ height: 340 }}>
      {TEAM.map((member, i) => {
        const pos = getPos(i)
        const isCenter = pos === 0
        const isNear = Math.abs(pos) === 1
        const isFar = Math.abs(pos) >= 2

        // 3D transforms
        const translateX = pos * 180
        const translateZ = isCenter ? 80 : isNear ? 0 : -80
        const rotateY = pos * -15
        const scale = isCenter ? 1.15 : isNear ? 0.85 : 0.65
        const zIndex = isCenter ? 30 : isNear ? 20 : 10
        const opacity = isFar ? 0.3 : isNear ? 0.6 : 1

        return (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="absolute left-1/2 border-none bg-transparent cursor-pointer outline-none"
            style={{
              transform: `translateX(calc(-50% + ${translateX}px)) perspective(1000px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
              zIndex,
              opacity,
              transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)',
              top: 0,
            }}
          >
            {/* Glow behind active */}
            {isCenter && (
              <div
                style={{
                  position: 'absolute',
                  inset: -12,
                  borderRadius: 28,
                  background: 'radial-gradient(ellipse at center, rgba(59,90,130,0.35) 0%, transparent 70%)',
                  filter: 'blur(16px)',
                  zIndex: -1,
                  animation: 'pulseGlow 2.5s ease-in-out infinite',
                }}
              />
            )}

            {/* Photo card */}
            <div
              style={{
                width: 180,
                height: 230,
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: isCenter
                  ? '0 20px 60px rgba(59,90,130,0.4), 0 0 0 3px rgba(59,90,130,0.6)'
                  : '0 8px 30px rgba(0,0,0,0.15)',
                transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              <img
                src={member.img}
                alt={member.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top',
                  filter: isCenter ? 'brightness(1.05)' : 'grayscale(50%) brightness(0.85)',
                  transition: 'filter 0.7s ease',
                }}
              />
            </div>

            {/* Name label */}
            <div
              style={{
                marginTop: 16,
                fontSize: isCenter ? 16 : 13,
                fontWeight: isCenter ? 800 : 600,
                color: isCenter ? '#1a1a2e' : '#9ca3af',
                letterSpacing: isCenter ? '0.02em' : 0,
                transition: 'all 0.7s ease',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {member.name}
            </div>

            {/* Role line — only visible on active */}
            <div
              style={{
                marginTop: 4,
                fontSize: 11,
                fontWeight: 600,
                color: '#3B5A82',
                textAlign: 'center',
                opacity: isCenter ? 1 : 0,
                transform: isCenter ? 'translateY(0)' : 'translateY(6px)',
                transition: 'all 0.5s ease 0.15s',
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
              }}
            >
              Bear Team Agent
            </div>
          </button>
        )
      })}

      {/* Nav arrows */}
      <button
        onClick={() => setActive(prev => (prev - 1 + TEAM.length) % TEAM.length)}
        className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 bg-white border-none rounded-full shadow-lg cursor-pointer flex items-center justify-center hover:scale-110"
        style={{ width: 44, height: 44, zIndex: 40, transition: 'transform 0.2s', color: '#3B5A82' }}
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4l-6 6 6 6"/></svg>
      </button>
      <button
        onClick={() => setActive(prev => (prev + 1) % TEAM.length)}
        className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 bg-white border-none rounded-full shadow-lg cursor-pointer flex items-center justify-center hover:scale-110"
        style={{ width: 44, height: 44, zIndex: 40, transition: 'transform 0.2s', color: '#3B5A82' }}
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4l6 6-6 6"/></svg>
      </button>

      {/* Progress dots */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2" style={{ zIndex: 40 }}>
        {TEAM.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="border-none cursor-pointer p-0"
            style={{
              width: i === active ? 28 : 8,
              height: 8,
              borderRadius: 4,
              background: i === active ? '#3B5A82' : '#d1d5db',
              transition: 'all 0.4s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   ENVELOPE SCREEN
   ════════════════════════════════════════ */
function EnvelopeScreen({ open }: { open: boolean }) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen px-4">
      <div className="relative w-[320px] sm:w-[380px] h-[280px] sm:h-[320px]" style={{ perspective: '1000px' }}>

        {/* Card inside envelope */}
        <div className={`absolute inset-x-4 top-4 bottom-16 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center gap-4 transition-all duration-700 ${open ? 'animate-card-rise' : 'opacity-0'}`}>
          <div className="text-xs font-semibold tracking-[0.2em] text-[#3B5A82] uppercase">Prepared For</div>
          <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center text-2xl font-bold text-[#3B5A82]">
            {AGENT_FULL.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="text-xl font-bold text-[#1a1a2e]">{AGENT_FULL}</div>
          <div className="text-sm font-semibold text-[#3B5A82]">BearTeam</div>
        </div>

        {/* Envelope body */}
        <div className="absolute bottom-0 left-0 right-0 h-[140px] sm:h-[160px]">
          <div className="absolute inset-0 bg-[#3B5A82] rounded-b-xl" />
          <div className="absolute inset-0 overflow-hidden rounded-b-xl">
            <div className="absolute bottom-0 left-0 right-0"
              style={{
                height: '100%',
                background: 'linear-gradient(to bottom right, #f0f4f8 50%, transparent 50%)',
                opacity: 0.3,
              }}
            />
          </div>
          <div
            className={`absolute left-0 right-0 top-0 h-[80px] ${open ? 'animate-envelope-open' : ''}`}
            style={{
              transformOrigin: 'top center',
              background: '#3B5A82',
              clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   WELCOME SCREEN
   ════════════════════════════════════════ */
function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  const [activeTab, setActiveTab] = useState(-1)

  useEffect(() => {
    // Alternate: highlight one tab, go dark, then next tab — twice through all 4
    const sequence = [0, -1, 1, -1, 2, -1, 3, -1, 0, -1, 1, -1, 2, -1, 3, -1]
    let step = 0
    const interval = setInterval(() => {
      if (step >= sequence.length) {
        setActiveTab(-1)
        clearInterval(interval)
        return
      }
      setActiveTab(sequence[step])
      step++
    }, 400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen px-4">
      <div className="animate-fade-in max-w-md w-full flex flex-col items-center gap-6 py-12">
        {/* Logo — dissolve fade-in */}
        <img src="/bt-logo.png" alt="BearTeam" className="animate-logo-dissolve w-28 h-28 object-contain shadow-xl" />

        <div className="text-center">
          <h1 className="animate-fade-in text-3xl sm:text-4xl font-bold text-[#1a1a2e]" style={{ animationDelay: '0.4s' }}>
            Welcome to Bear Team
          </h1>
          <p className="text-[#1a1a2e] font-semibold mt-3">
            Free Leads. No Fees. Built-In Coaching System.
          </p>
          <p className="text-[#6b7280] mt-2 text-sm leading-relaxed">
            What to say, what to do, what&apos;s next — already mapped.<br />
            You don&apos;t figure it out — you follow it.
          </p>
        </div>

        {/* Action buttons */}
        <div className="w-full flex flex-col gap-3 mt-4">
          <a
            href="https://www.joinbearteam.com/scout"
            className={`w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer no-underline ${activeTab === 0 ? 'bg-[#1a3a5c] text-white shadow-lg scale-[1.02]' : 'bg-[#0F2747] text-white'}`}
          >
            Meet Scout&#8482;
          </a>
          <a
            href="https://www.joinbearteam.com/chat"
            className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer no-underline ${activeTab === 1 ? 'bg-[#0F2747] text-white shadow-lg scale-[1.02] border border-[#0F2747]' : 'bg-white border border-gray-200 text-[#1a1a2e]'}`}
          >
            Find What&apos;s Missing
          </a>
          <a
            href="https://www.joinbearteam.com/bearteamos"
            className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer no-underline ${activeTab === 2 ? 'bg-[#0F2747] text-white shadow-lg scale-[1.02] border border-[#0F2747]' : 'bg-white border border-gray-200 text-[#1a1a2e]'}`}
          >
            Explore BearTeamOS&#8482;
          </a>
          <button
            onClick={onContinue}
            className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${activeTab === 3 ? 'bg-[#0F2747] text-white shadow-lg scale-[1.02] border border-[#0F2747]' : 'bg-white border border-gray-200 text-[#6b7280]'}`}
          >
            Start the Presentation
          </button>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   PRESENTATION SCREEN
   ════════════════════════════════════════ */
function PresentationScreen() {
  return (
    <div className="flex-1">

      {/* Hero */}
      <section className="py-16 sm:py-24 px-4 text-center">
        <div className="animate-fade-in max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <img src="/bt-logo.png" alt="BearTeam" className="w-20 h-20 object-contain" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1a1a2e]">
            Three Systems.{' '}
            <span className="animate-gradient-fill" style={{ background: 'linear-gradient(90deg, #64b5f6 0%, #81c784 40%, #ffffff 40%, #ffffff 100%)', backgroundSize: '300% 100%', backgroundPosition: '100% 0', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              One Brokerage.
            </span>
          </h2>
          <p className="text-lg sm:text-xl font-semibold text-[#6b7280] mt-3">
            Free Leads. No Fees. Built-In Execution.
          </p>
        </div>
      </section>

      {/* Value Prop */}
      <section className="bg-white py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs font-bold tracking-[0.2em] uppercase mb-4">
            <span className="text-[#1a1a2e]">Not a Lead Source.</span>{' '}
            <span className="animate-gradient-fill" style={{ background: 'linear-gradient(90deg, #64b5f6 0%, #81c784 40%, #ffffff 40%, #ffffff 100%)', backgroundSize: '300% 100%', backgroundPosition: '100% 0', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              A Complete System.
            </span>
          </div>
          <div className="w-12 h-0.5 bg-[#3B5A82] mx-auto mb-6" />
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1a1a2e] mb-4">
            A Real Estate Business&mdash;Already Built for You
          </h2>
          <p className="text-[#6b7280] text-lg max-w-xl mx-auto">
            No fees. No guesswork. Just execution, daily.
          </p>
        </div>
      </section>

      {/* Video + Resources */}
      <section className="py-10 sm:py-14 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Video */}
          <div className="rounded-2xl overflow-hidden aspect-video shadow-lg">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/BaTCb2ZRq8o?rel=0"
              title="Welcome to Bear Team"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: "none" }}
            />
          </div>

          {/* Resources */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-[#1a1a2e] mb-4">Resources Unlocked</h3>
            <div className="flex flex-col gap-2">
              {RESOURCES.map((r, i) => (
                <a key={i} href={r.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-[#3B5A82] hover:bg-blue-50/30 transition-colors text-left cursor-pointer w-full no-underline">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg shrink-0">
                    <span className="text-[#3B5A82] font-bold text-sm">{i + 1}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1a1a2e]">{r.title}</div>
                    <div className="text-xs text-[#6b7280]">{r.desc}</div>
                  </div>
                </a>
              ))}
            </div>
            <a href="https://calendly.com/thomas-songer/bear-team-meet" target="_blank" rel="noopener noreferrer" className="w-full mt-4 py-4 rounded-xl bg-[#3B5A82] text-white font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#2F4768] transition-colors cursor-pointer no-underline">
              Unlock the System
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
              <div className="text-2xl font-extrabold text-[#1a1a2e]">{s.value}</div>
              <div className="text-xs text-[#6b7280] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Carousel */}
      <section className="py-16 sm:py-20 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <div className="text-xs font-bold tracking-[0.2em] text-[#3B5A82] uppercase mb-2">The Team</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a2e]">Real people. Real results.</h2>
        </div>
        <TeamCarousel />
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-bold tracking-[0.2em] text-[#3B5A82] uppercase mb-2">Agent Results</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a2e] mb-8">What agents say after they make the move.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { quote: "I was hovering at 6 deals a year, doing a little of everything with no real direction. Once I followed the system, I hit 12 deals without working more hours.", name: "Lauren S.", detail: "RE/MAX \u2192 Bear Team", stat: "Stuck Mid-Level \u2014 Breakthrough", initials: "L", color: "#1B8C3A" },
              { quote: "I was doing everything manually\u2014calls, follow-ups, tracking\u2014and it was exhausting. This system simplified everything. I\u2019m working less and closing more.", name: "Stephanie L.", detail: "eXp Realty \u2192 Bear Team", stat: "Burned-Out Agent \u2014 Reset", initials: "S", color: "#3b5a82" },
              { quote: "I used to think I needed to work harder. Turns out I needed a system. The daily plan, follow-up, and scripts changed everything. I\u2019m doing fewer things\u2014but closing more deals.", name: "Chris D.", detail: "Coldwell Banker \u2192 Bear Team", stat: "System > Hustle", initials: "C", color: "#3b82f6" },
            ].map(({ quote, name, detail, stat, initials, color }, i) => (
              <div key={i} className="bg-[#f9fafb] rounded-2xl p-6 border border-gray-100 flex flex-col h-full">
                <div className="text-xs font-bold tracking-wide uppercase px-3 py-1 rounded-full mb-4 self-start" style={{ background: color + '18', color }}>{stat}</div>
                <p className="text-sm text-[#374151] leading-relaxed flex-1 italic mb-5">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: color }}>{initials}</div>
                  <div>
                    <div className="text-sm font-bold text-[#1a1a2e]">{name}</div>
                    <div className="text-xs text-[#9ca3af]">{detail}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a2e] mb-3">Schedule a Discovery Call</h2>
          <p className="text-sm text-[#6b7280] mb-8">10 min intro or 60 min deep dive — your choice.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://calendly.com/thomas-songer/bear-team-meet" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-xl bg-[#3B5A82] text-white font-bold text-base hover:bg-[#2F4768] transition-colors shadow-lg cursor-pointer no-underline text-center">
              10 Min Phone Call
            </a>
            <a href="https://calendly.com/thomas-songer/60min" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-xl bg-white text-[#3B5A82] font-bold text-base border-2 border-[#3B5A82] hover:bg-[#f0f3f8] transition-colors shadow-sm cursor-pointer no-underline text-center">
              60 Min Zoom Call
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center border-t border-gray-200">
        <p className="text-xs text-[#6b7280]">&copy; 2026 Bear Real Estate Team &middot; <a href="/privacy" className="text-[#3B5A82] no-underline hover:underline">Privacy Policy</a></p>
      </footer>
    </div>
  )
}
