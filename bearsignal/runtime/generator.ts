/**
 * BearSignal — Content Generator
 * Calls Scout (/api/scout) with mode: "signal" to produce
 * a channel-specific marketing post for Bear Team.
 *
 * Returns structured { channel, content } ready for queueContent().
 */

export interface SignalContent {
  channel: "email" | "linkedin" | "facebook" | "twitter";
  content: string;
}

const SIGNAL_PROMPTS: Record<SignalContent["channel"], string> = {
  email:
    "Write a recruiting email targeting real estate agents producing 4–9 deals/year. " +
    "Focus on Bear Team's commission structure (60/40 → 90/10 after $16k cap), zero fees, " +
    "and personal support. Tone: warm, confident, math-led. One CTA. Under 200 words. " +
    "Sign as: Tom Songer | Team Lead | Bear Team Real Estate",
  linkedin:
    "Write a LinkedIn post for a real estate team lead recruiting agents. " +
    "Topic: why agents overpay at big brokerages and what they keep at Bear Team. " +
    "Tone: authoritative, system-driven, no fluff. 150–250 words.",
  facebook:
    "Write a Facebook post recruiting Orlando-area real estate agents to Bear Team. " +
    "Tone: warm, community-focused, conversational. Include one emoji. Under 150 words. " +
    "End with a CTA to DM or comment.",
  twitter:
    "Write a tweet for Bear Team Real Estate recruiting agents. " +
    "Bold, direct, one idea. Under 240 characters. No hashtags.",
};

export async function generateContent(
  channel: SignalContent["channel"],
  baseUrl: string
): Promise<SignalContent | null> {
  const prompt = SIGNAL_PROMPTS[channel];
  if (!prompt) return null;

  try {
    const res = await fetch(`${baseUrl}/api/scout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        mode: "signal",
        channel,
      }),
    });

    if (!res.ok) {
      console.error(`[generator] Scout call failed: ${res.status}`);
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
