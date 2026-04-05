'use client'

import { useState, useEffect } from 'react'

const AGENT_NAME = 'Bethanne'
const AGENT_FULL = 'Bethanne Baer'

const STATS = [
  { value: '#1', label: 'Top Producing Team in Central FL' },
  { value: '12+', label: 'Active Agents' },
  { value: '10+', label: 'Years in Business' },
]

const RESOURCES = [
  { title: 'Agent Results', desc: 'Meet the agents on our team' },
  { title: 'Hear Live Calls', desc: 'Listen to actual warm transfer calls' },
  { title: 'Meet the Team', desc: '12+ team members ready to support you' },
  { title: 'Earnings', desc: 'Calculate your projected income' },
  { title: 'FAQs', desc: 'Common questions answered' },
  { title: 'Next Steps', desc: 'What happens after you partner' },
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
            href="https://www.joinbearteam.com/"
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
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-full bg-gray-200 border-2 border-white shadow flex items-center justify-center text-lg font-bold text-[#3B5A82]">
              {AGENT_FULL.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="text-[#6b7280] text-lg">+</span>
            <div className="w-14 h-14 rounded-full bg-white border-2 border-[#3B5A82] shadow flex items-center justify-center text-sm font-bold text-[#3B5A82]">
              BT
            </div>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1a1a2e]">
            Together, let&apos;s make <span className="text-[#3B5A82]">2026</span>
          </h2>
          <p className="text-xl sm:text-2xl font-semibold text-[#34C759] italic mt-2">
            better than 2025
          </p>
        </div>
      </section>

      {/* Value Prop */}
      <section className="bg-white py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs font-bold tracking-[0.2em] text-[#3B5A82] uppercase mb-4">
            Not Another Lead Source.
          </div>
          <div className="w-12 h-0.5 bg-[#3B5A82] mx-auto mb-6" />
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1a1a2e] mb-4">
            A <span className="text-[#3B5A82]">Real Partnership</span> Built to Win
          </h2>
          <p className="text-[#6b7280] text-lg max-w-xl mx-auto">
            For brokerages, teams, and agents done with generic lead gen.
          </p>
        </div>
      </section>

      {/* Video + Resources */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Video placeholder */}
          <div className="bg-gray-300 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-300" />
            <div className="relative flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <span className="text-[#3B5A82] text-2xl ml-1">&#9654;</span>
              </div>
              <div className="bg-white/90 rounded-full px-4 py-2 flex items-center gap-3 shadow">
                <span className="text-sm font-semibold text-[#3B5A82]">How it works</span>
                <span className="text-xs text-[#6b7280] border-l border-gray-300 pl-3">7 min video</span>
              </div>
              <div className="text-xs font-bold text-[#3B5A82] tracking-wide uppercase mt-1">
                Click to Play, {AGENT_NAME}
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-[#1a1a2e] mb-4">Resources Unlocked</h3>
            <div className="flex flex-col gap-2">
              {RESOURCES.map((r, i) => (
                <button key={i} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-[#3B5A82] hover:bg-blue-50/30 transition-colors text-left cursor-pointer w-full">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg shrink-0">
                    <span className="text-[#3B5A82] font-bold text-sm">{i + 1}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1a1a2e]">{r.title}</div>
                    <div className="text-xs text-[#6b7280]">{r.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <button className="w-full mt-4 py-4 rounded-xl bg-[#3B5A82] text-white font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#2F4768] transition-colors cursor-pointer">
              Access Resources
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
              <div className="text-2xl font-extrabold text-[#1a1a2e]">{s.value}</div>
              <div className="text-xs text-[#6b7280] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-white py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-bold tracking-[0.2em] text-[#3B5A82] uppercase mb-2">Our Team</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a2e] mb-2">Meet the BearTeam</h2>
          <p className="text-[#6b7280] mb-8">The support system behind top-producing agents in Central Florida.</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-full aspect-square rounded-full bg-gray-200 border-2 border-white shadow-sm" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4 text-center">
        <div className="max-w-lg mx-auto">
          <button className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-[#3B5A82] text-white font-bold text-lg hover:bg-[#2F4768] transition-colors shadow-lg cursor-pointer">
            Show Me How This Works
          </button>
          <p className="text-xs text-[#6b7280] mt-3">watch a 7 min video</p>
          <button onClick={() => window.location.reload()} className="mt-6 text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors cursor-pointer">
            Replay
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center border-t border-gray-200">
        <div className="text-lg font-bold text-[#3B5A82] mb-2">BearTeam</div>
        <p className="text-xs text-[#6b7280]">&copy; 2026 BearTeam | Bear Real Estate Team</p>
      </footer>
    </div>
  )
}
