/**
 * BearSignal — Content Generator
 * Calls Scout (/api/scout) with mode: "signal" to produce
 * a channel-specific marketing post for Bear Team.
 *
 * Email topics rotate weekly so every draft covers a different
 * Bear Team value prop. Topic is selected by week-of-year so
 * the same week always produces the same topic (deterministic,
 * no DB needed).
 */

export interface SignalContent {
  channel: "email" | "linkedin" | "facebook" | "twitter";
  content: string;
}

// ── Bear Team value props — email topic rotation ──────────────────────────────
// Each entry becomes the focus of that week's Monday + Friday email.
// Add new topics here to expand the rotation.
const EMAIL_TOPICS = [
  {
    topic: "commission structure",
    prompt:
      "Write a recruiting email targeting real estate agents producing 4-9 deals/year. " +
      "Focus on Bear Team's progressive commission tiers: 60/40 to start, advancing to 70/30, 80/20, then 90/10 after the $16,000 cap. " +
      "Lead with the math — show what an agent actually keeps vs. a typical 70/30 brokerage with monthly fees. " +
      "Tone: warm, confident, math-led. One CTA. Under 200 words.",
  },
  {
    topic: "zero fees",
    prompt:
      "Write a recruiting email targeting real estate agents producing 4-9 deals/year. " +
      "Focus on Bear Team's zero-fee model: no monthly fees, no desk fees, no technology fees. " +
      "Only cost is a $150 flat transaction fee per closing. " +
      "Compare this to what agents typically pay at KW, eXp, or Compass in monthly overhead. " +
      "Tone: direct, eye-opening, conversational. One CTA. Under 200 words.",
  },
  {
    topic: "BearTeam Academy",
    prompt:
      "Write a recruiting email targeting real estate agents producing 4-9 deals/year. " +
      "Focus on Bear Team Academy — free training included for all agents. " +
      "Position it as the unfair advantage: agents at big brokerages pay for coaching, Bear Team agents get it built in. " +
      "Cover topics like systems, lead gen, scripts, and business planning. " +
      "Tone: aspirational, supportive, growth-focused. One CTA. Under 200 words.",
  },
  {
    topic: "E&O insurance covered",
    prompt:
      "Write a recruiting email targeting real estate agents producing 4-9 deals/year. " +
      "Focus on Bear Team covering E&O (Errors and Omissions) insurance fully — agents pay nothing. " +
      "Most brokerages pass this cost to agents ($400-800/year). " +
      "Position this as part of Bear Team's commitment to removing every hidden cost. " +
      "Tone: factual, trust-building, confident. One CTA. Under 200 words.",
  },
  {
    topic: "boutique brokerage culture",
    prompt:
      "Write a recruiting email targeting real estate agents producing 4-9 deals/year. " +
      "Focus on Bear Team being a boutique Orlando brokerage — personal support, real culture, not a number in a franchise. " +
      "Contrast with the experience at large national brokerages where agents feel overlooked. " +
      "Emphasize direct access to leadership and a team that actually knows your name. " +
      "Tone: warm, personal, community-focused. One CTA. Under 200 words.",
  },
  {
    topic: "cap and advancement system",
    prompt:
      "Write a recruiting email targeting real estate agents producing 4-9 deals/year. " +
      "Focus on Bear Team's $16,000 company dollar cap — once hit, the agent automatically advances to the next commission tier. " +
      "Explain how this rewards production and creates a clear path to keeping 90% of every commission. " +
      "Show the math for an agent doing 10 deals at average $300k. " +
      "Tone: motivating, math-driven, clear. One CTA. Under 200 words.",
  },
  {
    topic: "Orlando market opportunity",
    prompt:
      "Write a recruiting email targeting real estate agents producing 4-9 deals/year in the Orlando, FL market. " +
      "Focus on the Orlando real estate market growth and why now is the right time to be at a well-supported boutique brokerage. " +
      "Position Bear Team as built specifically for Orlando agents who want to capitalize on market momentum. " +
      "Tone: timely, local, opportunity-driven. One CTA. Under 200 words.",
  },
  {
    topic: "agent systems and technology",
    prompt:
      "Write a recruiting email targeting real estate agents producing 4-9 deals/year. " +
      "Focus on Bear Team's systems: Scout AI, automated follow-up, pipeline tools, and tech stack — all included, no extra cost. " +
      "Position this as the difference between agents who grind and agents who scale. " +
      "Tone: modern, system-driven, forward-looking. One CTA. Under 200 words.",
  },
  {
    topic: "new licensees",
    prompt:
      "Write a recruiting email targeting newly licensed real estate agents in the Orlando area. " +
      "Focus on why starting at Bear Team is the right foundation: free Academy training, personal mentorship, zero fees while building the business, and a clear commission path. " +
      "Position joining Bear Team early as the decision that saves years of wasted splits at a big box. " +
      "Tone: encouraging, mentor-like, opportunity-focused. One CTA. Under 200 words.",
  },
  {
    topic: "producing agent upgrade",
    prompt:
      "Write a recruiting email targeting producing real estate agents closing 10-20 deals/year. " +
      "Focus on what they are leaving on the table at their current brokerage in fees, splits, and lack of support. " +
      "Show the Bear Team math for a 15-deal/year agent and what they net vs. a standard 70/30 brokerage with monthly fees. " +
      "Tone: peer-to-peer, financially sharp, no pressure. One CTA. Under 200 words.",
  },
];

// ── LinkedIn post topics ──────────────────────────────────────────────────────
const LINKEDIN_TOPICS = [
  "why agents overpay at big brokerages and what they actually keep at Bear Team",
  "the difference between a brokerage with systems and one without",
  "what the $16,000 cap means for an agent doing 10 deals a year — the real math",
  "why boutique brokerages are winning agents from KW and eXp in 2026",
  "the hidden costs most real estate agents never calculate",
  "why Bear Team covers E&O insurance and what that means for your bottom line",
  "what Bear Team Academy gives agents that big box coaching programs charge for",
  "the commission path from 60/40 to 90/10 — and how fast you can get there",
];

// ── Facebook post topics ──────────────────────────────────────────────────────
const FACEBOOK_TOPICS = [
  "Orlando agents — are you keeping what you earn?",
  "Bear Team is growing and we are looking for agents who are ready to level up",
  "what does zero monthly fees actually mean for your business?",
  "why agents leave big brokerages and what they find at Bear Team",
  "Bear Team Academy: free training for every agent on our team",
  "the Orlando market is moving — is your brokerage moving with it?",
];

// ── Twitter post topics ───────────────────────────────────────────────────────
const TWITTER_TOPICS = [
  "most agents are splitting 70/30 and paying monthly fees on top of it",
  "Bear Team: 90/10 after cap, zero monthly fees, $150 flat per closing",
  "your brokerage should be making you money, not costing you money",
  "systems beat hustle every time in real estate",
  "the agents winning in Orlando have one thing in common: the right infrastructure",
  "if you do not know exactly what you net per closing, that is a problem",
];

// ── Week-of-year helper ───────────────────────────────────────────────────────
function getWeekOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

function pickByWeek<T>(arr: T[]): T {
  return arr[getWeekOfYear() % arr.length];
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Channel prompt builders ───────────────────────────────────────────────────
function buildEmailPrompt(): string {
  const topic = pickByWeek(EMAIL_TOPICS);
  return (
    topic.prompt +
    " Sign as: Tom Songer | Team Lead | Bear Team Real Estate"
  );
}

function buildLinkedInPrompt(): string {
  const topic = pickRandom(LINKEDIN_TOPICS);
  return (
    "Write a LinkedIn post for a real estate team lead recruiting agents. " +
    "Topic: " + topic + ". " +
    "Tone: authoritative, system-driven, no fluff. 150-250 words. " +
    "Do not use hashtags. End with one soft CTA."
  );
}

function buildFacebookPrompt(): string {
  const topic = pickRandom(FACEBOOK_TOPICS);
  return (
    "Write a Facebook post recruiting Orlando-area real estate agents to Bear Team. " +
    "Angle: " + topic + ". " +
    "Tone: warm, community-focused, conversational. One emoji max. Under 150 words. " +
    "End with a CTA to DM or comment."
  );
}

function buildTwitterPrompt(): string {
  const topic = pickRandom(TWITTER_TOPICS);
  return (
    "Write a tweet for Bear Team Real Estate recruiting agents. " +
    "Angle: " + topic + ". " +
    "Bold, direct, one idea. Under 240 characters. No hashtags."
  );
}

const PROMPT_BUILDERS: Record<SignalContent["channel"], () => string> = {
  email:    buildEmailPrompt,
  linkedin: buildLinkedInPrompt,
  facebook: buildFacebookPrompt,
  twitter:  buildTwitterPrompt,
};

// ── Main export ───────────────────────────────────────────────────────────────
export async function generateContent(
  channel: SignalContent["channel"],
  baseUrl: string
): Promise<SignalContent | null> {
  const prompt = PROMPT_BUILDERS[channel]();

  try {
    const res = await fetch(baseUrl + "/api/scout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        mode: "signal",
        channel,
      }),
    });

    if (!res.ok) {
      console.error("[generator] Scout call failed: " + res.status);
      return null;
    }

    const data = await res.json();
    const content: string = data?.message ?? data?.reply ?? "";

    if (!content) {
      console.error("[generator] Scout returned empty content");
      return null;
    }

    return { channel, content };
  } catch (err) {
    console.error("[generator] Error calling Scout:", err);
    return null;
  }
}
