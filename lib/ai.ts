/**
 * OpenAI response engine for SMS conversion.
 * Generates short, natural, call-focused replies.
 */

import OpenAI from "openai";
import type { Stage, Intent } from "./state";

let _openai: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

const SYSTEM_PROMPT = `You are Scout, an AI assistant for BearTeam real estate. You are responding via SMS to an agent who expressed interest.

RULES — follow these exactly:
- Maximum 2 sentences per reply
- Sound natural and human — like texting a colleague
- Never explain features or give a sales pitch
- Never use corporate language, buzzwords, or exclamation marks
- Ask only ONE question per message
- Every reply must move the conversation toward scheduling a phone call
- If they share deal details, acknowledge briefly then push to call
- If they ask about pricing or costs, say "easiest to cover that on a quick call" and offer one
- Be direct, warm, and confident
- You are not educating — you are converting`;

function buildUserPrompt(
  message: string,
  intent: Intent,
  stage: Stage,
  dealContext: string
): string {
  let prompt = `User message: "${message}"\nIntent: ${intent}\nStage: ${stage}`;

  if (dealContext) {
    prompt += `\nDeal context: "${dealContext}"`;
  }

  // Stage-specific guidance
  switch (stage) {
    case "ENGAGE":
      prompt +=
        "\nGoal: Acknowledge their interest. Ask if they're working with active buyers or listings right now.";
      break;
    case "QUALIFY":
      prompt +=
        "\nGoal: They've responded. Briefly validate their situation, then ask a qualifying question about their current pipeline.";
      break;
    case "ALIGN":
      prompt +=
        "\nGoal: Connect Scout to their specific situation. Then suggest a quick call.";
      break;
    case "TRANSITION":
      prompt +=
        '\nGoal: Directly offer a 5-minute call. Say something like "Easiest way to show you is a quick call — what works, now or later today?"';
      break;
    case "CALL_NOW":
      prompt +=
        '\nGoal: Close for the call. Ask "What\'s the best number to reach you?" or confirm you\'ll call them.';
      break;
    case "FOLLOW_UP":
      prompt +=
        "\nGoal: Re-engage warmly. Reference their earlier interest and offer to pick up where you left off.";
      break;
  }

  return prompt;
}

export async function generateResponse(
  message: string,
  intent: Intent,
  stage: Stage,
  dealContext: string
): Promise<string> {
  const completion = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 120,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(message, intent, stage, dealContext) },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();

  if (!text) {
    return "Hey — got your message. Quick question: are you working with active buyers or listings right now?";
  }

  return text;
}
