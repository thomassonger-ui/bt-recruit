// ─────────────────────────────────────────────────────────────────────────────
// Bear Team — 30-Day Guerrilla Recruiting Campaign Engine
//
// A rotating library of monthly themes. Each theme drives a 4-week play calendar
// AND a set of ready-to-use recruiting content/assets. The active campaign is
// computed purely from the date, so it auto-advances to the next theme every 30
// days with zero manual action. Broker opens and workshops are built in as
// recurring plays in every cycle.
// ─────────────────────────────────────────────────────────────────────────────

export interface Play {
  week: number;
  channel: string; // e.g. "Event", "DM", "Social", "Email", "Phone", "Field"
  action: string;
  event?: "broker_open" | "workshop"; // flags event-type plays
}

export interface CampaignContent {
  socialPosts: string[];
  dms: string[];
  flyerHeadline: string;
  flyerSub: string;
  openHouseAngle: string;
  workshopTitle: string;
  workshopInvite: string;
  brokerOpenInvite: string;
}

export interface CampaignTheme {
  id: string;
  name: string;
  bigIdea: string;
  targetPain: string;
  plays: Play[];
  content: CampaignContent;
}

const SIG = "Tom Songer | Team Lead | Bear Team Real Estate";

// ── The 12-theme library (one per 30-day cycle, repeats yearly) ───────────────
export const CAMPAIGNS: CampaignTheme[] = [
  {
    id: "fee-audit",
    name: "The Fee Audit",
    bigIdea:
      "Get agents to add up what they actually pay their brokerage in a year. Once they see the number, the conversation changes.",
    targetPain: "Monthly fees, desk fees, tech fees, royalties — death by a thousand cuts.",
    plays: [
      { week: 1, channel: "Social", action: "Post the 'Add Up Your Fees' calculator graphic. Ask: what's your real monthly number?" },
      { week: 1, channel: "DM", action: "Send the fee-audit DM to 10 agents at KW/eXp/Compass who post production wins." },
      { week: 2, channel: "Event", action: "Host a Broker Open and casually run the fee math with every agent who walks in.", event: "broker_open" },
      { week: 2, channel: "Phone", action: "Call 5 warm prospects: 'Want me to run your fee number? Takes 2 minutes.'" },
      { week: 3, channel: "Workshop", action: "Run the 'What Are You Really Paying?' lunch-and-learn workshop.", event: "workshop" },
      { week: 4, channel: "Email", action: "Send fee-audit recap + Scout link to everyone who engaged this cycle." },
    ],
    content: {
      socialPosts: [
        "Quick math for my agent friends: add up your monthly fee + desk fee + tech fee + every transaction fee for the last 12 months. Most agents I talk to are shocked. At Bear Team that number is $0/month — your only cost is $150 a closing. DM me 'AUDIT' and I'll run yours.",
        "Your brokerage takes a split AND charges you monthly? That's paying twice. Bear Team: progressive splits 60/40 → 90/10, zero monthly fees, E&O covered. The math is the pitch.",
        "If you don't know exactly what your brokerage costs you per year, that's the problem. Let's find the number together — no pressure, just the math.",
      ],
      dms: [
        "Hey [Name] — saw your recent close, congrats. Random question: do you know what you paid your brokerage in fees last year, all in? I built a quick audit for Orlando agents. Happy to run yours — takes 2 min. — Tom",
        "[Name], not recruiting-pitching you, genuinely curious — between monthly, desk, and tech fees, what's your real number? At Bear Team it's $0/mo + $150 a close. If your number's higher, worth a 15-min call?",
      ],
      flyerHeadline: "What Are You REALLY Paying to Sell Real Estate?",
      flyerSub: "Add it up. Then let's talk. $0/month · $150 flat per close · Bear Team Orlando.",
      openHouseAngle:
        "At the broker open, keep a whiteboard: 'Your monthly fees × 12 = ?' Every agent who fills it in gets a Bear Team fee-comparison card and a Scout link.",
      workshopTitle: "What Are You Really Paying? — A 30-Minute Fee Audit for Agents",
      workshopInvite:
        "Free lunch-and-learn for licensed agents: bring last year's brokerage statements and we'll calculate your true cost-per-deal — then compare it to a $0-monthly model. No pitch, just numbers. Seats limited. RSVP with Tom.",
      brokerOpenInvite:
        "You're invited to a Bear Team Broker Open — great property, great people, and if you're curious, I'll run your fee numbers on the spot. Coffee's on us.",
    },
  },
  {
    id: "cap-you-never-hit",
    name: "The Cap You Never Hit",
    bigIdea:
      "Most capped models are designed so average producers never reach the cap. Show agents the graduation math at Bear Team.",
    targetPain: "Paying into a cap or split structure that never improves no matter how hard you work.",
    plays: [
      { week: 1, channel: "Social", action: "Post the 60/40 → 90/10 ladder graphic with the $16K cap explainer." },
      { week: 1, channel: "DM", action: "DM mid-level producers (6–15 deals) the graduation math." },
      { week: 2, channel: "Workshop", action: "Run the 'Do the Cap Math' workshop with a live spreadsheet.", event: "workshop" },
      { week: 3, channel: "Event", action: "Broker Open: hand out the tier-ladder card to every agent.", event: "broker_open" },
      { week: 3, channel: "Phone", action: "Call agents who hit a plateau last year. Ask what their split is now." },
      { week: 4, channel: "Email", action: "Send personalized 'here's your tier in year one' projections." },
    ],
    content: {
      socialPosts: [
        "Real talk: most 'cap' models are built so the average agent never actually hits the cap. At Bear Team you start at 60/40, and once the company collects $16K from your deals you graduate — automatically — 70/30, then 80/20, then 90/10. You earn your split. You don't wait for it.",
        "8 deals a year and your split still hasn't moved? That's by design at most shops. Ours graduates you on production, not tenure. DM 'MATH' and I'll show you your tier in year one.",
        "Tenure shouldn't decide your split. Production should. 60/40 → 90/10 at Bear Team, no negotiation required.",
      ],
      dms: [
        "[Name] — you're clearly producing. Quick one: has your split actually improved as you've grown, or is it stuck? At Bear Team the cap is $16K then you auto-graduate toward 90/10. Want me to run where you'd land in year one?",
        "Hey [Name], not a hard pitch — just think you'd want to see the graduation math. Most caps are unreachable on purpose. Ours isn't. 15 min this week?",
      ],
      flyerHeadline: "You Earn Your Split. You Don't Wait For It.",
      flyerSub: "60/40 → 70/30 → 80/20 → 90/10 · $16K cap, then you advance · Bear Team Orlando.",
      openHouseAngle:
        "Display the tier ladder at the broker open. Ask each agent: 'What split are you at, and how long did it take?' Their answer is the opening.",
      workshopTitle: "Do the Cap Math — Will You Actually Hit Your Cap This Year?",
      workshopInvite:
        "Free workshop for Orlando agents: we'll build your real numbers in a live spreadsheet and find out whether your current cap is reachable — and what a graduating split would net you instead. Bring your deal count. RSVP with Tom.",
      brokerOpenInvite:
        "Bear Team Broker Open this week — come see the property, grab the tier-ladder breakdown, and if you want, I'll map your split graduation for year one.",
    },
  },
  {
    id: "net-check",
    name: "The Net Check",
    bigIdea:
      "Gross commission is vanity. Net is sanity. Walk agents through what they actually keep per deal after splits and fees.",
    targetPain: "Closing deals but keeping less than expected after the brokerage takes its cut.",
    plays: [
      { week: 1, channel: "Social", action: "Post a 'GCI vs Net' side-by-side on a $415K Orlando sale." },
      { week: 2, channel: "DM", action: "Send the net-per-deal breakdown to agents posting closings." },
      { week: 2, channel: "Event", action: "Broker Open: run a live 'what you'd net here' calc for visitors.", event: "broker_open" },
      { week: 3, channel: "Workshop", action: "Host 'Know Your Net' workshop with Scout doing live math.", event: "workshop" },
      { week: 4, channel: "Phone", action: "Follow up with everyone who asked Scout to run their numbers." },
    ],
    content: {
      socialPosts: [
        "Gross is vanity, net is sanity. On a $415K Orlando sale at 3%, the question isn't your commission — it's what lands in your account after your split and fees. Scout will run your exact net at Bear Team vs. where you are now, free. Link in bio.",
        "Stop celebrating GCI. Start tracking net-per-deal. Most agents have never actually calculated it. I'll do it with you in 10 minutes.",
        "What you KEEP per deal is the only number that matters. Ours: bigger split as you grow, $0 monthly, $150 flat per close. Want yours run? Say the word.",
      ],
      dms: [
        "[Name] congrats on the close! Genuinely curious — did you net what you expected after the split and fees? I can show you what that same deal nets at Bear Team. No pressure, just the comparison.",
        "Hey [Name] — quick one. Have you ever calculated your true net-per-deal? Most haven't. Happy to run it side by side with a $0-monthly model. 15 min?",
      ],
      flyerHeadline: "Gross Is Vanity. Net Is Sanity.",
      flyerSub: "Know what you actually keep per deal. Run your net with Scout — free.",
      openHouseAngle:
        "At the broker open, offer a 'Net Check' — agents tell you a recent sale price and you show what it'd net at Bear Team on the spot.",
      workshopTitle: "Know Your Net — What You Actually Keep Per Deal",
      workshopInvite:
        "Free 30-minute workshop: we'll calculate your true net-per-deal after splits and fees, then compare it to a graduating-split, zero-monthly model. Bring a recent closing. RSVP with Tom.",
      brokerOpenInvite:
        "Come to the Bear Team Broker Open — tour a great listing and, if you're up for it, I'll run a quick 'net check' on your last deal.",
    },
  },
  {
    id: "broker-open-blitz",
    name: "The Broker Open Blitz",
    bigIdea:
      "Turn ordinary broker opens into recruiting engines. Every agent who walks through is a warm conversation.",
    targetPain: "Agents feeling isolated and unsupported; never meeting a brokerage that invests in them.",
    plays: [
      { week: 1, channel: "Event", action: "Schedule 2 Broker Opens this cycle in target Orlando zips.", event: "broker_open" },
      { week: 1, channel: "Field", action: "Invite 40 area agents per open via DM + door knock + email." },
      { week: 2, channel: "Event", action: "Host Broker Open #1 — capture every agent into Scout follow-up.", event: "broker_open" },
      { week: 3, channel: "Workshop", action: "Convert hot open contacts into a small-group 'systems' workshop.", event: "workshop" },
      { week: 4, channel: "Event", action: "Host Broker Open #2 + same-day Scout follow-up to all attendees.", event: "broker_open" },
    ],
    content: {
      socialPosts: [
        "Hosting a Bear Team Broker Open this week 🏡 Agents: come for the property, stay for the coffee, and ask me anything about splits, fees, or what joining actually looks like. No pressure — just a great house and straight answers.",
        "The best recruiting tool I have is a good listing and an open door. Broker Open Thursday — Orlando agents welcome. Come see how we work.",
        "Bring your card to our Broker Open and I'll bring the numbers. Splits, fees, the cap model — all of it, no spin.",
      ],
      dms: [
        "[Name] — hosting a Broker Open at [address] [day] 11–1. Great property and I'd love to finally connect in person. Come through? Coffee and straight talk, zero pitch.",
        "Hey [Name], we've got a Broker Open this week in [area]. Even if you're happy where you are, come see the listing — and if you're curious how Bear Team works, I'm an open book.",
      ],
      flyerHeadline: "Bear Team Broker Open — Agents Welcome",
      flyerSub: "[Address] · [Date/Time] · Great property, straight answers, coffee on us.",
      openHouseAngle:
        "Run the broker open as a recruiting touchpoint: sign-in sheet captures name + brokerage, every attendee gets a follow-up from Scout the same afternoon.",
      workshopTitle: "From Open House to Closed Deal — A Bear Team Systems Session",
      workshopInvite:
        "Small-group workshop for agents who came to the open: see the exact Scout + BearTeamOS workflow that turns an open house into booked appointments. Free, limited seats. RSVP with Tom.",
      brokerOpenInvite:
        "You're invited to the Bear Team Broker Open at [address], [date] from 11–1. Tour the home, meet the team, and ask me anything about how we work. Hope to see you there.",
    },
  },
  {
    id: "license-to-launch",
    name: "License to Launch",
    bigIdea:
      "Reach newly licensed Orlando agents before the big boxes recruit them. Lead with training and structure, not splits.",
    targetPain: "New licensees handed a login and wished good luck — no plan, no mentor, no system.",
    plays: [
      { week: 1, channel: "Social", action: "Post 'Just got your license? Read this before you pick a brokerage.'" },
      { week: 2, channel: "Workshop", action: "Run a 'First 90 Days' workshop for new licensees.", event: "workshop" },
      { week: 2, channel: "DM", action: "DM recent license-passers from local school cohorts." },
      { week: 3, channel: "Event", action: "Invite new agents to a Broker Open to see the team in action.", event: "broker_open" },
      { week: 4, channel: "Email", action: "Send the BearTeam Academy 30-60-90 overview to all new contacts." },
    ],
    content: {
      socialPosts: [
        "Just got your real estate license in Orlando? Before a big box recruits you with a flashy pitch: ask what their actual onboarding plan is. At Bear Team, day one you get a structured 30-60-90 plan, a real mentor, Scout AI, and free Academy training. Start with a system, not a guess.",
        "New agents: your first brokerage should teach you how to actually do this job. We built a 30-60-90 day plan so you're never making it up deal by deal. DM 'NEW' for the Academy walkthrough.",
        "The big boxes will recruit you the week you pass. Just make sure you're picking training and structure — not a logo. Happy to show you ours.",
      ],
      dms: [
        "[Name] — congrats on passing your exam! Huge. Before you commit to a brokerage, would it help to see what a real first-90-days plan looks like? No pressure — I just hate watching new agents get dropped in the deep end. — Tom",
        "Hey [Name], saw you just got licensed. At Bear Team new agents start at 60/40 with $0 monthly, free Academy training and a real mentor. Want the 30-60-90 overview?",
      ],
      flyerHeadline: "Just Got Licensed? Start With a System — Not a Guess.",
      flyerSub: "30-60-90 day plan · Free Academy training · Real mentorship · Bear Team Orlando.",
      openHouseAngle:
        "Invite new licensees to shadow a broker open. Let them watch how a structured team actually works a room.",
      workshopTitle: "Your First 90 Days — A Launch Plan for New Orlando Agents",
      workshopInvite:
        "Free workshop for newly licensed agents: the exact 30-60-90 day plan we use to get new agents producing — lead sources, scripts, and systems. No experience required. RSVP with Tom.",
      brokerOpenInvite:
        "New to the business? Come to our Broker Open and see how a structured team runs. Bring questions — I'll walk you through everything.",
    },
  },
  {
    id: "the-switch-window",
    name: "The Switch Window",
    bigIdea:
      "Most agents overestimate how hard it is to change brokerages in Florida. Remove the friction and the fear.",
    targetPain: "Staying put out of inertia — believing switching is slow, risky, or will cost pending deals.",
    plays: [
      { week: 1, channel: "Social", action: "Post 'How switching brokerages in FL actually works' explainer." },
      { week: 2, channel: "DM", action: "DM fence-sitters who've engaged before: 'It's easier than you think.'" },
      { week: 2, channel: "Workshop", action: "Run a 'Make the Move' workshop covering the DBPR transfer steps.", event: "workshop" },
      { week: 3, channel: "Event", action: "Broker Open: address the 'what about my pending deals?' question live.", event: "broker_open" },
      { week: 4, channel: "Phone", action: "Call prior 'maybe later' leads — the window is now." },
    ],
    content: {
      socialPosts: [
        "Agents stay stuck because they think switching brokerages is a nightmare. In Florida it's a DBPR form and a few days. Your pending deals come with you. Your license transfers. The hard part is deciding — not doing. Questions? I'll walk you through every step.",
        "'I'd switch but it seems like such a hassle.' It isn't. Transfer is a form. I'll handle the friction with you. The only real question is whether the new home is worth it — let's find out.",
        "Your brokerage isn't keeping you with a fence — it's keeping you with inertia. The switch window is open. Want to see how easy it is?",
      ],
      dms: [
        "[Name] — I know we talked a while back. Quick myth-bust: switching brokerages in FL is a DBPR form and a few days, pending deals included. If the only thing holding you back is the hassle, that part's on me. Worth revisiting?",
        "Hey [Name], no rush — just a reminder that moving is way easier than people think. I'll handle the transfer logistics with you. 15-min call to see if Bear Team's a fit?",
      ],
      flyerHeadline: "Switching Brokerages Is Easier Than You Think.",
      flyerSub: "It's a form and a few days. Your deals come with you. Let's make the move.",
      openHouseAngle:
        "At the broker open, have a one-page 'How a FL transfer works' handout. Kills the #1 objection before it's spoken.",
      workshopTitle: "Make the Move — How to Switch Brokerages Without Losing a Beat",
      workshopInvite:
        "Free workshop: the step-by-step of changing brokerages in Florida — the DBPR transfer, your pending deals, your timeline. Come get every question answered. RSVP with Tom.",
      brokerOpenInvite:
        "Thinking about a move but worried about the hassle? Come to our Broker Open — I'll show you exactly how a Florida transfer works while you tour the home.",
    },
  },
  {
    id: "leads-without-the-lottery",
    name: "Leads Without the Lottery",
    bigIdea:
      "Agents are tired of paying for leads or waiting for referrals. Show how Scout + systems remove the lead lottery.",
    targetPain: "No reliable lead flow; buying leads that don't convert; feast-or-famine pipeline.",
    plays: [
      { week: 1, channel: "Social", action: "Post a Scout lead-qualification demo clip." },
      { week: 2, channel: "DM", action: "DM agents complaining about lead quality online." },
      { week: 3, channel: "Workshop", action: "Run a 'Stop Buying Bad Leads' workshop showing the Scout workflow.", event: "workshop" },
      { week: 3, channel: "Event", action: "Broker Open: demo Scout qualifying a lead in real time.", event: "broker_open" },
      { week: 4, channel: "Email", action: "Send the 'lead flow without the lottery' breakdown to engaged contacts." },
    ],
    content: {
      socialPosts: [
        "Buying leads that ghost you is a tax on hope. Bear Team agents get Scout — an AI that qualifies, follows up, and books appointments around the clock, so you talk to decision-ready people instead of dialing for dollars. Want a demo? DM 'SCOUT.'",
        "The lead lottery is exhausting. Pay, pray, repeat. There's a better way: systematized capture + follow-up that doesn't decay. I'll show you how ours works.",
        "Your pipeline shouldn't be feast or famine. Scout runs follow-up in the background so nothing falls through. That's the difference between a system and a hustle.",
      ],
      dms: [
        "[Name] — saw your post about lead quality (felt that). Genuinely, what if follow-up just… ran itself? Bear Team agents use Scout to qualify and book while they sleep. Want a 10-min demo? No pitch if it's not a fit.",
        "Hey [Name], tired of paying for leads that go nowhere? I'd love to show you the Scout workflow — it's the opposite of the lead lottery. 15 min?",
      ],
      flyerHeadline: "End the Lead Lottery.",
      flyerSub: "Scout AI qualifies, follows up, and books — 24/7. Bear Team agents never chase cold.",
      openHouseAngle:
        "Live-demo Scout at the broker open: let an agent type a real objection and watch Scout handle it. Seeing is believing.",
      workshopTitle: "Stop Buying Bad Leads — Build a Pipeline That Doesn't Decay",
      workshopInvite:
        "Free workshop: see the exact Scout + BearTeamOS workflow that captures, qualifies, and follows up automatically — so you stop renting leads and start owning a pipeline. RSVP with Tom.",
      brokerOpenInvite:
        "Curious how AI actually helps agents? Come to our Broker Open and I'll demo Scout qualifying a live lead while you tour the property.",
    },
  },
  {
    id: "boutique-over-big-box",
    name: "Boutique Over Big Box",
    bigIdea:
      "Agents at national franchises feel like a number. Sell the personal support and culture of a boutique brokerage.",
    targetPain: "Being one of thousands in a faceless franchise — no real support, no one knows your deals.",
    plays: [
      { week: 1, channel: "Social", action: "Post a 'you know who your broker is?' culture piece." },
      { week: 2, channel: "Event", action: "Broker Open framed as 'meet the actual humans you'd work with.'", event: "broker_open" },
      { week: 3, channel: "Workshop", action: "Host an intimate roundtable workshop with Beth + Tom + agents.", event: "workshop" },
      { week: 4, channel: "DM", action: "DM agents at big boxes: 'When did your broker last call you?'" },
    ],
    content: {
      socialPosts: [
        "At a national franchise, who answers when you're stuck mid-deal at 7pm? At Bear Team it's a real person — you know Beth and Tom, they know your deals, and support isn't a ticket number. Boutique by design. There's a difference between a brand and a team.",
        "You're not a number here. You're an agent we actually know. When did your current broker last call you just to check in? Ours do. That's the whole point of boutique.",
        "Big box = big logo, small support. Boutique = real people who answer the phone. Come find out what that feels like.",
      ],
      dms: [
        "[Name] — honest question, no snark: when did someone at your brokerage last call you just to see how you're doing? At Bear Team that's normal. If you've been feeling like a number, maybe worth a coffee with Beth and me?",
        "Hey [Name], we're boutique on purpose — you'd actually know your broker. If the franchise grind has you feeling invisible, I'd love to introduce you to the team. 15 min?",
      ],
      flyerHeadline: "You're Not a Number Here.",
      flyerSub: "Boutique Orlando brokerage. Real support, real culture, real people. Bear Team.",
      openHouseAngle:
        "Frame the broker open as a meet-the-team event: Beth and Tom both present, no scripts — just real conversations about how the team works.",
      workshopTitle: "Inside a Boutique Brokerage — A Roundtable With Beth & Tom",
      workshopInvite:
        "Small-group roundtable for agents curious about boutique: sit down with Broker/Owner Bethanne Baer and Team Lead Tom Songer, ask anything, and see what real support looks like. Limited seats. RSVP with Tom.",
      brokerOpenInvite:
        "Come meet the actual humans behind Bear Team at our Broker Open — Beth and Tom will both be there. No pitch, just real conversation.",
    },
  },
  {
    id: "production-sprint",
    name: "The Production Sprint",
    bigIdea:
      "Use a seasonal production push to attract agents who want to level up — lead with systems and accountability.",
    targetPain: "Plateaued production; working harder without working smarter; no accountability structure.",
    plays: [
      { week: 1, channel: "Social", action: "Announce a 30-day production sprint; invite agents to join the challenge." },
      { week: 2, channel: "Workshop", action: "Run a 'Systems Over Hustle' workshop with the daily-action framework.", event: "workshop" },
      { week: 3, channel: "Event", action: "Broker Open doubling as a sprint check-in + networking.", event: "broker_open" },
      { week: 4, channel: "DM", action: "DM agents who engaged: 'Want this structure permanently?'" },
    ],
    content: {
      socialPosts: [
        "The #1 reason agents plateau isn't effort — it's operating without a system. This month we're running a 30-day production sprint: daily actions, real accountability, Scout keeping you on track. Want in? It's a preview of how Bear Team agents work every day.",
        "Working harder hasn't fixed your numbers because the problem was never effort. It's structure. Join our 30-day sprint and feel the difference a system makes.",
        "Fewer things, done consistently, beats hustle every time. That's the whole Bear Team operating model. Come try it for 30 days.",
      ],
      dms: [
        "[Name] — running a 30-day production sprint with daily actions + accountability. It's basically a test drive of how Bear Team agents work. Free to join. Want in? Could be exactly the structure you've been missing.",
        "Hey [Name], you clearly work hard — what if the missing piece is a system, not more hours? Join our sprint this month and see. No commitment.",
      ],
      flyerHeadline: "Systems Over Hustle. Join the 30-Day Sprint.",
      flyerSub: "Daily actions · Real accountability · Scout keeping you on track. Bear Team Orlando.",
      openHouseAngle:
        "Use the broker open as a public sprint check-in: agents share wins, you show how the daily-action framework drives them.",
      workshopTitle: "Systems Over Hustle — The Daily-Action Framework That Ends Plateaus",
      workshopInvite:
        "Free workshop: the exact daily-action system Bear Team agents run to break plateaus — pipeline, follow-up, and next-best-action without the guesswork. Bring your goals. RSVP with Tom.",
      brokerOpenInvite:
        "Join our Broker Open + production-sprint check-in — see the daily system that's moving agents' numbers, and tour a great listing while you're at it.",
    },
  },
  {
    id: "ninety-day-plan",
    name: "The 90-Day Plan",
    bigIdea:
      "Onboarding is where most brokerages fail agents. Lead with the structured 30-60-90 plan and free Academy.",
    targetPain: "No onboarding, no roadmap, no mentorship — left to sink or swim.",
    plays: [
      { week: 1, channel: "Social", action: "Post the 30-60-90 roadmap graphic." },
      { week: 2, channel: "Workshop", action: "Run an open 'Day One to Day 90' Academy preview workshop.", event: "workshop" },
      { week: 3, channel: "Event", action: "Broker Open with an Academy demo station.", event: "broker_open" },
      { week: 4, channel: "Email", action: "Send the full Academy track outline to engaged prospects." },
    ],
    content: {
      socialPosts: [
        "Most agents fail not from lack of talent but from a sink-or-swim start. Bear Team gives every agent a structured 30-60-90 day plan and free Academy training from day one — mentorship, scripts, deal walkthroughs, real structure. You walk into the system. You don't build it.",
        "What was your onboarding like? For most agents the answer is 'here's your login, good luck.' Ours is a real 30-60-90 roadmap. Want to see it?",
        "Free training, a real mentor, and a day-by-day plan for your first 90 days. That's the floor at Bear Team, not a perk.",
      ],
      dms: [
        "[Name] — curious what your first 90 days at your brokerage looked like? At Bear Team every agent gets a structured 30-60-90 plan + free Academy. Even strong agents tell me they wish they'd had it. Want the walkthrough?",
        "Hey [Name], we built a real onboarding — 30-60-90 day roadmap, mentorship, free Academy. If 'sink or swim' sounds familiar, let's talk. 15 min?",
      ],
      flyerHeadline: "You Walk Into the System. You Don't Build It.",
      flyerSub: "Structured 30-60-90 day plan · Free BearTeam Academy · Real mentorship.",
      openHouseAngle:
        "Set up an Academy demo laptop at the broker open. Let agents click through the actual 30-60-90 tracks.",
      workshopTitle: "Day One to Day 90 — A Preview of BearTeam Academy",
      workshopInvite:
        "Free workshop: walk through the structured 30-60-90 day onboarding and Academy tracks every Bear Team agent gets — and see what a real launch plan looks like. RSVP with Tom.",
      brokerOpenInvite:
        "Come to our Broker Open and demo BearTeam Academy live — see the exact 30-60-90 day plan new agents get on day one.",
    },
  },
  {
    id: "keep-more",
    name: "Keep More of What You Earn",
    bigIdea:
      "Frame the brokerage decision as a business decision: lower overhead and a better split means more take-home.",
    targetPain: "High overhead eating into take-home; treating the brokerage cost as fixed instead of a choice.",
    plays: [
      { week: 1, channel: "Social", action: "Post 'your brokerage is a business expense — are you overpaying?'" },
      { week: 2, channel: "Workshop", action: "Run a 'Run Your Business Like a Business' workshop.", event: "workshop" },
      { week: 3, channel: "Event", action: "Broker Open with a take-home comparison handout.", event: "broker_open" },
      { week: 4, channel: "DM", action: "DM producers: 'What's your overhead as a % of GCI?'" },
    ],
    content: {
      socialPosts: [
        "Your brokerage is your single biggest business expense. Treat it like one. Lower overhead + a graduating split = more take-home on every deal. Bear Team: $0 monthly, $150 flat per close, E&O covered, 60/40 → 90/10. Run the comparison — I'll help.",
        "Smart agents run their book like a business. That means questioning your biggest line item: brokerage cost. When did you last shop it? Let's do the comparison.",
        "More production AND lower overhead isn't a fantasy — it's a different model. Keep more of what you earn. I'll show you the math.",
      ],
      dms: [
        "[Name] — business question: what's your brokerage costing you as a % of GCI? Most agents have never calculated it. At Bear Team it's $0 monthly + $150 a close. If yours is higher, the take-home difference is real. Want me to run it?",
        "Hey [Name], treating the brokerage as a fixed cost is the trap. It's a choice. Lower overhead + better split = more take-home. 15 min to compare?",
      ],
      flyerHeadline: "Keep More of What You Earn.",
      flyerSub: "Your brokerage is a business expense. $0/mo · $150/close · 60/40 → 90/10. Bear Team.",
      openHouseAngle:
        "Hand out a simple take-home comparison at the broker open: same GCI, two overhead structures, real net difference.",
      workshopTitle: "Run Your Business Like a Business — Overhead, Split & Take-Home",
      workshopInvite:
        "Free workshop for agents who want to treat their career like the business it is: we'll break down brokerage overhead as a % of GCI and what a leaner model nets you. RSVP with Tom. (Bring your numbers; we're not giving tax advice — just doing the math.)",
      brokerOpenInvite:
        "Bear Team Broker Open this week — tour the listing and grab a take-home comparison that treats your brokerage like the business expense it is.",
    },
  },
  {
    id: "year-end-move",
    name: "The Year-End Move",
    bigIdea:
      "Position a brokerage change as the smart Q4 play: start the new year at a better split with a clean slate.",
    targetPain: "Dragging another year of fees and a flat split into January out of inertia.",
    plays: [
      { week: 1, channel: "Social", action: "Post 'plan your January 1 brokerage move now' piece." },
      { week: 2, channel: "DM", action: "DM warm prospects: 'Start next year at a better split.'" },
      { week: 3, channel: "Workshop", action: "Run a 'New Year, New Brokerage' planning workshop.", event: "workshop" },
      { week: 3, channel: "Event", action: "Year-end Broker Open + appreciation/networking mixer.", event: "broker_open" },
      { week: 4, channel: "Phone", action: "Call every 'maybe next year' lead — next year is now." },
    ],
    content: {
      socialPosts: [
        "The agents who win January are the ones who decide in Q4. Don't drag another year of monthly fees and a flat split into the new year. Start January 1 at Bear Team: graduating splits, $0 monthly, a clean slate and a real plan. Let's map your move now.",
        "'I'll switch after the new year' usually becomes another year of overpaying. Plan the move now, execute clean, start January strong. I'll help you line it up.",
        "New year, better split. If you've been thinking about it, Q4 is when the smart agents make the call. Want to talk timing?",
      ],
      dms: [
        "[Name] — Q4 is the right time to plan a brokerage move so you start January 1 clean and at a better split. If 'someday' has been on your mind, let's map the timing now — no pressure to act today. — Tom",
        "Hey [Name], the agents who start January strong decide in Q4. Want to see what beginning next year at Bear Team would look like for your numbers? 15 min.",
      ],
      flyerHeadline: "Start January 1 at a Better Split.",
      flyerSub: "Plan your year-end move now. $0/mo · graduating splits · clean slate. Bear Team.",
      openHouseAngle:
        "Make the year-end broker open a low-key appreciation mixer — warm, social, the kind of room agents want to be part of next year.",
      workshopTitle: "New Year, New Brokerage — Plan Your Q1 Move",
      workshopInvite:
        "Free year-end planning workshop: map a clean brokerage transition so you start January at a better split with a real plan. We'll cover timing, transfer, and your first-90 setup. RSVP with Tom.",
      brokerOpenInvite:
        "You're invited to our Year-End Broker Open & Agent Mixer — great property, good people, and a look at what starting next year with Bear Team could mean for you.",
    },
  },
];

// ── Rotation logic — auto-advances every 30 days from the anchor date ──────────
const CYCLE_DAYS = 30;
const DAY_MS = 86_400_000;
// Anchor cycle 0 at Jan 1, 2026 (UTC). Change only if you want to re-phase the rotation.
const ANCHOR = Date.UTC(2026, 0, 1);

export interface ActiveCampaign {
  theme: CampaignTheme;
  nextTheme: CampaignTheme;
  cycleIndex: number; // absolute cycle number since anchor
  themeIndex: number; // index into CAMPAIGNS
  cycleStart: Date;
  cycleEnd: Date;
  dayInCycle: number; // 1..30
  daysRemaining: number; // days left in this cycle
}

export function getCurrentCampaign(now: Date = new Date()): ActiveCampaign {
  const elapsed = now.getTime() - ANCHOR;
  const cycleIndex = Math.floor(elapsed / (CYCLE_DAYS * DAY_MS));
  const len = CAMPAIGNS.length;
  const themeIndex = ((cycleIndex % len) + len) % len;
  const cycleStartMs = ANCHOR + cycleIndex * CYCLE_DAYS * DAY_MS;
  const cycleStart = new Date(cycleStartMs);
  const cycleEnd = new Date(cycleStartMs + CYCLE_DAYS * DAY_MS - DAY_MS);
  const dayInCycle = Math.min(
    CYCLE_DAYS,
    Math.max(1, Math.floor((now.getTime() - cycleStartMs) / DAY_MS) + 1)
  );
  const daysRemaining = CYCLE_DAYS - dayInCycle;
  return {
    theme: CAMPAIGNS[themeIndex],
    nextTheme: CAMPAIGNS[(themeIndex + 1) % len],
    cycleIndex,
    themeIndex,
    cycleStart,
    cycleEnd,
    dayInCycle,
    daysRemaining,
  };
}

export const CAMPAIGN_SIGNATURE = SIG;
