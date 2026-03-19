# BearTeamOS — Claude Memory File
Last updated: March 18, 2026 (added full build tally — done, in progress, not started)

This file gives Claude persistent context for all BearTeamOS work sessions.

---

## WHO WE ARE

**Bear Team Real Estate** — an independent licensed real estate brokerage in Florida.
- Owner/Broker: Tom (thomas.songer@gmail.com | 407-758-8102)
- Broker contact referenced in docs: Beth (broker/boss)
- Platform brand: BearTeamOS™ (Enterprise Brokerage Operating System)
- Version: 1.0 | March 2026

---

## THE PROGRESSIVE CAP MODEL — CORE CONCEPT

**THIS IS THE MOST IMPORTANT THING TO GET RIGHT.**

The $16,000 cap is a **GRADUATION TRIGGER**, NOT "agent keeps 100%."

| Tier | Deal # | Agent Split | Broker Split | Notes |
|------|--------|-------------|--------------|-------|
| Tier 1 | Deals 1–5 | 60% | 40% | Broker collects until $16K cap |
| Tier 2 | Deals 6–9 | 70% | 30% | Agent promotes AFTER cap hit |
| Tier 3 | Deals 10–15 | 80% | 20% | Based on deal count |
| Team Lead | Deals 16+ | 90% | 10% | Highest producers |

**Key rules:**
- Cap = $16,000/year per agent (Tier 1 broker collections)
- Once broker hits $16K from an agent's deals → agent graduates to Tier 2 (70/30)
- The agent does NOT keep 100% — they earn a BETTER SPLIT
- The brokerage ALWAYS earns revenue at every tier
- Average home price: $415,000 | Commission rate: 2.5% | GCI per deal: $10,375

---

## LEADERSHIP ROLES

| Role | Title | Description |
|------|-------|-------------|
| Broker / Founder | Broker of Record | Ultimate authority. Regulatory oversight, financial oversight, agent recruitment approval, policy enforcement. |
| Operations Manager | Operations Manager | Oversees operational procedures and brokerage systems. |
| Compliance Officer | Compliance Officer | Monitors and enforces regulatory compliance. |
| Marketing Director | Marketing Director | Approves all advertising and marketing materials. |
| Transaction Coordinator | Transaction Coordinator | Manages transaction documentation and closing timelines. |
| Team Lead / Recruiter / Trainer | Team Lead \| Recruiter & Trainer | Senior combined leadership role. As **Team Lead**, models top production at Deals 16+ (90/10 split). As **Recruiter**, identifies and screens agent candidates, conducts initial outreach, and guides qualified candidates through the recruiting workflow before final Broker approval. As **Trainer**, supports BearTeam Academy by mentoring new agents through the 30-60-90 day development plan, facilitating onboarding training, and providing ongoing transaction guidance and coaching. Reports directly to the Broker. |

---

## AGENT COST STRUCTURE — $0 EXPENSES

This is a major differentiator. Agents pay:
- **$0** monthly fees
- **$0** desk fees
- **$0** technology fees
- **$0** for training (BearTeam Academy on Moodle — free)
- **E&O insurance: Paid by Bear Team** (~$150/yr per agent, absorbed from brokerage revenue)
- **Transaction fee: flat $150 per closing** for paperwork processing — same whether deal is $200K or $2M — the ONLY out-of-pocket cost

---

## NOT AN MLM

- No revenue share, no downlines, no recruiting bonuses
- Agents earn by PRODUCING, not recruiting
- This attracts producers, not tire kickers

---

## FINANCIAL MODEL NUMBERS

- Average blended broker revenue per agent (9 deals/yr): ~$19,263
- Operating expenses: $6,920/month ($83,040/year)
- Break-even: approximately 5–6 producing agents
- E&O cost absorbed by brokerage: ~$150/yr per agent

### 5-Year Revenue Projections (updated model)
| Year | Agents | Rev/Agent | Brokerage Revenue |
|------|--------|-----------|-------------------|
| Year 1 | 3–4 | $19,263 | $67,420 |
| Year 2 | 7 | $19,263 | $134,841 |
| Year 3 | 10–11 | $19,263 | $202,262 |
| Year 4 | 14 | $19,263 | $269,682 |
| Year 5 | 17–18 | $19,263 | $337,103 |

---

## FILES IN THIS FOLDER

All documents updated March 2026 to reflect the progressive cap model:

| # | File | Status |
|---|------|--------|
| 01 | Governance Manual | ✅ No changes needed |
| 02 | Compliance Manual | ✅ No changes needed |
| 03 | Operations Manual | ✅ Updated (tiers, cap language, $0 fees) |
| 04 | SOP Manual | ✅ Updated (commission processing language) |
| 05 | Transaction Management Manual | ✅ No changes needed |
| 06 | Agent Handbook | ✅ No changes needed |
| 07 | Financial Commission Manual | ✅ Updated (tiers, graduation trigger, $0 fees) |
| 08 | Technology Data Governance | ✅ No changes needed |
| 09 | Training Academy Manual | ✅ No changes needed |
| 10 | Investor Data Room Guide | ✅ No changes needed |
| 11 | Compensation Architecture | ✅ Updated (cap mechanics, graduation, $0 fees) |
| — | BearTeamOS Master Playbook | ✅ Updated (both tier tables, cap paragraphs) |
| — | BearTeam 5-Year Growth Model | ✅ Major update (new financials, tier model) |
| — | Enterprise Architecture Diagram | ✅ No changes needed |

---

## SCOUT AI ASSISTANT

- **Live URL:** https://www.joinbearteam.com/chat
- **Status:** FULLY LIVE — conversion prompt active, Calendly slots injected, lead capture working
- **Defined role:** Entry Point, Decision Assistant, Trigger Engine
- **Backend:** OpenAI GPT-4o | Supabase leads table | Resend email | Calendly API | Vercel

---

## BEARTEAMOS BUILD TALLY (March 2026)

### ✅ DONE
- Scout conversion prompt — pain-callout opening, 3 entry buttons, scenario handlers
- Live Calendly slot injection into Scout on every public request
- Lead capture → Supabase + instant email to Tom via [LEAD:] tag
- Calendly booking webhook → Supabase confirmed event write
- Weekly lead digest every Monday 8 AM (scheduled task live)
- Calendly reminder + follow-up email copy written
- All 8 competitive brokerage models in Scout memory (KW, eXp, RE/MAX, Compass, CB, LPT, Mainframe, EXIT)
- All env vars live in Vercel (OPENAI_API_KEY, RESEND_API_KEY, NOTIFY_EMAIL, SUPABASE_URL, SUPABASE_ANON_KEY, CALENDLY_TOKEN, TWILIO_AUTH_TOKEN, API_KEY_21ST)

### 🔧 IN PROGRESS / PARTIALLY DONE
- Nurture sequence — only 2 Calendly emails exist, no drip after the call
- Scout memory — starts cold every conversation, no prior context carries over

### ❌ NOT STARTED (priority order)
1. **Scout memory layer** — returning agent email lookup from Supabase, inject prior context (2–3 hrs)
2. **No-show follow-up automation** — agent books but doesn't join the call (1–2 hrs)
3. **Nurture drip sequence** — 3–5 emails after the call, before agent decides (2–3 hrs)
4. **Post-call onboarding automation** — what happens after they say yes (3–4 hrs)
5. **Analytics dashboard** — Scout conversion rates, drop-off points (4–6 hrs)
6. **UI/UX polish** — LongPoint-level design refinement (4–8 hrs)
7. **Testimonials + social proof** — nothing on the website yet (2–3 hrs)
8. **Traffic + lead generation** — no one is finding the site yet (ongoing)

---

## BEARTEAMOS BUILD STATUS (March 2026)

| Step | Status | Document |
|------|--------|----------|
| Step 1 — System of Record declared | ✅ | `Manuals/System_of_Record_Declaration.docx` |
| Step 2 — Scout Layer added | ✅ | `Manuals/Scout_Layer.docx` |
| Step 3 — 5 Critical Moments connected | ✅ | `Manuals/Critical_Moments.docx` |

**Gap resolutions completed:**
- Gap 1: `Manuals/Governance_Scenario_Library.docx`
- Gap 2: `Manuals/Manual_Hierarchy_Audit.docx`
- Gap 3: `Checklist/Checklist_Trigger_System.docx`
- Gap 4: `Manuals/AI_Integration_Architecture.docx`
- Gap 5: `Manuals/Intelligence_Feedback_Loop.docx`

**Moodle/Academy tools:**
- `BearTeam_Moodle_Chat_Embed.html` — standalone Scout chat widget
- `BearTeam_Moodle_Page_WithScout.html` — course page with Scout floating assistant

---

## DELIVERABLES CREATED (stored elsewhere)

- `BearTeamOS_Q1_Strategy.html` — Competitive Intelligence Report website (navy/white design, BT logo, 5-step walkthrough)
- `BearTeam_Solvency_Growth_Model.html` — Standalone solvency analysis (4 tabs, interactive simulator)
- `BearTeamOS_Investor_Deck.pptx` — 20-slide investor pitch deck
- `Email_to_Beth_Progressive_Cap_Model.md` — Email to broker summarizing strategy

---

## DESIGN / BRAND GUIDELINES

- Primary color: Navy Blue `#0B1D3A`
- Text: Black `#1A1A1A`
- Background: White
- Accent — Growth: Green `#1B8C3A`
- Accent — Warning: Red `#C62828`
- Accent — Highlight: Yellow `#E6A817`
- Logo: BT monogram (double-bordered square, dark letters)
- No emojis in professional documents
- Larger, easy-to-read text preferred

---

## KW COMPETITIVE MODEL — SCOUT MATH REFERENCE

Use this when comparing Bear Team to Keller Williams agents.

### KW Fee Structure
- Split: 70/30 until company dollar cap (~$14K–$25K depending on market center)
- Royalty: 6% separate from split, capped at $3K
- Total cap range: ~$17K–$28K annually
- Effective take-home before cap: ~64% (after 30% split + 6% royalty)
- After cap: 100% commission (no more split or royalty)
- Monthly fees: $100–$350/month tech/desk ($1,200–$4,200/year)
- Transaction fee: ~$150/closing

### The Critical Question
**"Do you typically cap at KW?"** — this determines the entire comparison.

### KW Agent Who Does NOT Cap (6–14 deals/year — the majority)
- Pays full 64% effective rate all year, resets, pays again
- Bear Team wins on net earnings in year 1
- Example (10 deals, $415K avg, $200/mo KW fees):
  - KW net: 10 × $10,375 × 64% = $66,400 − $2,400 fees = **$64,000**
  - Bear Team: Deals 1–5 at 60/40 = $31,125 | Deals 6–9 at 70/30 = $29,050 | Deal 10 at 80/20 = $8,300 = $68,475 − $1,500 ($150×10) = **$66,975**
  - Bear Team wins by ~$3,000 year 1 — and year 2 agent starts at Tier 2, graduates faster

### KW Agent Who DOES Cap (15+ deals, $3M+ volume)
- KW is a genuinely strong model for these agents — acknowledge it directly
- Bear Team pitch: simplicity, zero monthly fees, no reset anxiety, 90/10 at Tier 4
- Honest line: "If you're capping every year, KW works. Bear Team makes more sense if you're in the 6–14 deal range paying into a cap you never hit."

### Always Show
1. Monthly fee savings separately (not buried in the split math)
2. Year 2–3 trajectory — Bear Team agents graduate tiers faster each year
3. Bear Team's only cost: $150 flat per closing, no monthly fees, E&O paid by brokerage

---

### 2. eXp Realty (High Split + Low Cap Model)
**Progression: 80/20 → cap (~$16K) → 100%**
- Split: 80/20
- Cap: ~$16K (same as Bear Team cap amount)
- After cap: 100% commission — no royalty layer
- Revenue share model — agents earn by recruiting, not just producing
- Monthly fees: ~$85–$139/month

**Bear Team vs eXp:**
- eXp 80/20 early split is better than Bear Team's 60/40 start — acknowledge this honestly
- Bear Team has no revenue share / MLM structure — agents earn by closing, not recruiting
- Bear Team wins on: zero monthly fees, no recruiting pressure, boutique personal support vs virtual-only
- Honest line: "eXp's model works if you want revenue share. Bear Team is for agents who want to earn by closing deals, not building a downline."

---

### 3. RE/MAX (Near-100% / Desk Fee Model)
**Progression: ~95/5 or 100% split with fixed monthly costs**
- Split: ~95/5 or 100% desk fee model — no traditional cap
- Agent pays: monthly desk fee ($300–$2,000+/month depending on office), franchise fee, transaction fees
- High fixed costs regardless of production volume

**Bear Team vs RE/MAX:**
- RE/MAX agents need consistent volume just to cover their fixed monthly costs
- Bear Team zero monthly fees means a slow month costs the agent nothing
- Honest line: "If you're producing enough to justify RE/MAX desk fees, great. But if you have a slow quarter, those fees don't stop. Ours do — because we don't charge them."

---

### 4. Compass (Negotiated / Performance-Based Model)
**Progression: Negotiated splits ~80/20, no standard cap**
- Split: typically ~80/20 but fully negotiated — varies by production, recruiting value, luxury volume
- No standardized cap structure
- Top agents get favorable splits; new agents get inconsistent structure
- Known for tech tools and marketing spend

**Bear Team vs Compass:**
- Compass splits are negotiated — agents often don't know if they're getting a fair deal
- Bear Team is fully transparent: published tiers, no negotiation, same rules for everyone
- Honest line: "At Compass you negotiate your split and hope. At Bear Team the structure is public and it rewards production automatically."

---

### 5. Coldwell Banker (Traditional / Legacy Model)
**Progression: 50/50 new → 70/30 mid → 80–90% top (negotiated)**
- No standard national split — varies by office and broker relationship
- New agents: typically 50/50–60/40 | Mid-level: ~70/30 | Top producers: ~80–90% negotiated
- No clear cap or predictable scaling path — progression is relationship-dependent

**Bear Team vs Coldwell Banker:**
- CB new agents often start at same or worse split than Bear Team Tier 1
- Bear Team graduation is automatic and transparent — CB progression depends on broker politics
- Honest line: "Coldwell's split improves if your broker likes you. Ours improves automatically when you produce. There's no politics in the math."

---

### 6. LPT Realty (Lofty Platform / Hybrid Model)
**Progression: 80/20 → cap (~$12K–$16K) → 100% + revenue share + stock**
- Split: 80/20
- Cap: ~$12K–$16K (lower cap than most — faster path to 100%)
- After cap: 100% commission
- Additional layers: revenue share, stock incentives, built-in Lofty CRM + marketing platform
- Designed as a hybrid of eXp + platform + recruiting economics

**Bear Team vs LPT:**
- LPT's 80/20 start is better than Bear Team's 60/40 — acknowledge this honestly
- LPT has revenue share / stock layers — appeals to agents who want passive income on top of production
- Bear Team wins on: simplicity, zero monthly fees, no recruiting pressure, boutique personal support
- LPT's cap is similar or lower than Bear Team's — the real differentiator is the fee stack and culture
- Honest line: "LPT is built for agents who want a platform + passive income layers. Bear Team is for agents who want to earn by closing deals with zero overhead and real human support."

---

### 7. Mainframe Real Estate (Flat-Fee / SaaS Model)
**Progression: 100% from day one, pay flat monthly + transaction fees**
- Commission: 100% from day one — no split
- Monthly fee: ~$99–$199/month
- Transaction fee: ~$250–$500 per closing
- No cap structure needed
- Minimal brokerage support — designed for self-sufficient producers

**Bear Team vs Mainframe:**
- Mainframe's 100% split looks best on paper — but the math only works if the agent is self-generating and closing consistently
- A slow month at Mainframe still costs $99–$199 in fees. Bear Team costs nothing in a slow month.
- Bear Team provides training, E&O, systems, and support — Mainframe does not
- Honest line: "If you're a fully self-sufficient producer who needs nothing from a brokerage, Mainframe's model is clean. If you want support, training, and E&O covered — and you're not closing every month — Bear Team's zero-fee model costs you less and gives you more."

---

### 8. EXIT Realty (Residual + Sponsorship Model)
**Progression: Split → Active income + Residual sponsorship income → Passive retirement income**
- Split: typically 70/30 or 80/20 (varies by office)
- No universal hard cap — some offices may have soft caps
- Signature feature: residual income through agent sponsorship (not full MLM but similar structure)
- Three income layers: (1) active commission, (2) residual from sponsored agents, (3) retirement/vesting income

**Bear Team vs EXIT:**
- EXIT's residual model appeals to agents thinking long-term passive income — acknowledge this honestly
- Bear Team has zero recruiting structure — agents earn by closing deals only
- Bear Team wins on: simplicity, zero monthly fees, no recruiting requirement, transparent tier structure
- Honest line: "EXIT is built for agents who want to build a passive income stream through sponsorship. Bear Team is for agents who want to earn by producing — clean splits, zero fees, no complexity."

---

### Universal Bear Team Positioning (All Competitors)
1. Always ask: "What are you paying monthly right now?" — that number often changes the entire comparison
2. Always show monthly fee savings as a separate line item, not buried in split math
3. Always show Year 2–3 trajectory — Bear Team agents graduate tiers faster each year
4. Bear Team's only cost: $150 flat per closing, zero monthly fees, E&O paid by brokerage
5. Bear Team wins most clearly for agents doing 6–14 deals/year who never cap or reach upper tiers at their current brokerage

---

## LANGUAGE TO ALWAYS USE / AVOID

| ✅ USE | ❌ AVOID |
|--------|---------|
| "Graduation trigger" | "Agent keeps 100%" |
| "Promotes to Tier 2" | "No longer retains additional commission" |
| "Progressive cap model" | "Flat 40% split" |
| "E&O Paid by Bear" | "E&O Included" (implies free with no cost) |
| "Flat $150 per closing" | "Transaction fee" (without explanation) |
| "Rewards producers, not recruiters" | MLM-adjacent language |
| "Brokerage earns at every tier" | "Brokerage stops collecting" |
