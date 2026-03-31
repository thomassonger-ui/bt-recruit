/**
 * BearSignal — Content Generator
 * Calls OpenAI directly (gpt-4o) to produce channel-specific
 * marketing content for Bear Team recruiting posts.
 *
 * Email topics rotate weekly (deterministic by week-of-year).
 * LinkedIn topics also rotate weekly for consistent variety.
 */

import OpenAI from "openai";

export interface SignalContent {
  channel: "email" | "linkedin";
  content: string;
}

// ── OpenAI client ─────────────────────────────────────────────────────────────
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  return _openai;
}

// ── Bear Team value props — email topic rotation ──────────────────────────────
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

// ── LinkedIn post topics — weekly rotation ────────────────────────────────────
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

// ── Channel prompt builders ───────────────────────────────────────────────────
function buildEmailPrompt(): string {
  const topic = pickByWeek(EMAIL_TOPICS);
  return (
    topic.prompt +
    " Sign as: Tom Songer | Team Lead | Bear Team Real Estate"
  );
}

function buildLinkedInPrompt(): string {
  const topic = pickByWeek(LINKEDIN_TOPICS);
  return (
    "Write a LinkedIn article post for a real estate recruiting page (Join Bear Team). " +
    "Topic: " + topic + ". " +
    "Structure: " +
    "1) A bold opening hook (1-2 sentences that stop the scroll). " +
    "2) Body — 3 to 4 short paragraphs expanding on the topic with specific Bear Team details, real numbers, and agent-focused insights. " +
    "3) A soft CTA closing paragraph. End it with this exact line on its own: " +
    "\"Start with Scout™ | AI Powered → https://www.joinbearteam.com/scout\" " +
    "4) End with exactly 3 relevant hashtags on their own line (e.g. #RealEstate #OrlandoRealEstate #BearTeam). " +
    "Tone: authoritative, financially sharp, warm — like a team lead who knows the numbers. " +
    "Total length: 300-400 words. No generic fluff. Write for producing agents thinking about making a move."
  );
}

const PROMPT_BUILDERS: Record<SignalContent["channel"], () => string> = {
  email:    buildEmailPrompt,
  linkedin: buildLinkedInPrompt,
};

// ── Main export ───────────────────────────────────────────────────────────────
export async function generateContent(
  channel: SignalContent["channel"]
): Promise<SignalContent | null> {
  const prompt = PROMPT_BUILDERS[channel]();

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content:
            "You are a real estate recruiting specialist for Bear Team Real Estate in Orlando, FL. " +
            "You write compelling, financially-grounded content that helps agents understand the value of joining Bear Team. " +
            "Always be warm, confident, and lead with real numbers when relevant.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!content) {
      console.error("[generator] OpenAI returned empty content");
      return null;
    }

    console.log("[generator] Generated " + channel + " content (" + content.length + " chars)");
    return { channel, content };
  } catch (err) {
    console.error("[generator] OpenAI call failed:", err);
    return null;
  }
}
