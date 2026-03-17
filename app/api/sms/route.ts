/**
 * Twilio SMS webhook endpoint.
 *
 * Flow:
 * 1. Parse inbound SMS (Body + From)
 * 2. Load/create contact state
 * 3. Classify intent
 * 4. Extract deal context if substantive message
 * 5. Advance conversation stage
 * 6. Generate AI response via OpenAI
 * 7. Return TwiML XML response
 */

import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { getContact, saveContact } from "@/lib/state";
import { classifyIntent } from "@/lib/intent";
import { nextStage } from "@/lib/flow";
import { generateResponse } from "@/lib/ai";

const { MessagingResponse } = twilio.twiml;

function buildTwiml(body: string): string {
  const response = new MessagingResponse();
  response.message(body);
  return response.toString();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const body = (formData.get("Body") as string) ?? "";
    const from = (formData.get("From") as string) ?? "";

    if (!from || !body) {
      return new NextResponse(buildTwiml("Hey — send me a message and I'll get back to you."), {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      });
    }

    // 1. Load state
    const contact = getContact(from);

    // 2. Classify intent
    const intent = classifyIntent(body);
    contact.intent = intent;

    // 3. Extract deal context from substantive messages
    if (body.length > 20) {
      contact.dealContext = body;
    }

    // 4. Advance stage
    contact.stage = nextStage(contact.stage, intent, contact);

    // 5. Generate AI response
    const reply = await generateResponse(
      body,
      contact.intent,
      contact.stage,
      contact.dealContext
    );

    // 6. Save updated state
    saveContact(contact);

    // 7. Return TwiML
    return new NextResponse(buildTwiml(reply), {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch {
    // Fallback — never leave the user hanging
    const fallback = buildTwiml(
      "Got your message — let me look into this and text you right back."
    );
    return new NextResponse(fallback, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }
}
