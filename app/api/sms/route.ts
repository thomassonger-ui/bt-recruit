/**
 * Twilio SMS webhook endpoint — now powered by Scout Guardrail System.
 *
 * Flow:
 * 1. Parse inbound SMS (Body + From)
 * 2. Load/create contact state
 * 3. Classify intent (existing system)
 * 4. Advance conversation stage (existing state machine)
 * 5. Generate response through Scout guardrail pipeline
 * 6. Return TwiML XML response
 *
 * The guardrail system ensures every response is:
 * - Compliant (Fair Housing + legal safe)
 * - On-brand (professional, no fluff)
 * - Conversion-focused (always moves forward)
 * - Controlled (no hallucinations or unsafe responses)
 */

import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { getContact, saveContact } from "@/lib/state";
import { classifyIntent } from "@/lib/intent";
import { nextStage } from "@/lib/flow";
import { generateScoutResponse } from "@/lib/scout";

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
      return new NextResponse(
        buildTwiml(
          "Hey — send me a message and I'll get back to you."
        ),
        { status: 200, headers: { "Content-Type": "text/xml" } }
      );
    }

    // 1. Load state
    const contact = await getContact(from);

    // 2. Classify intent (existing keyword system)
    const intent = classifyIntent(body);
    contact.intent = intent;

    // 3. Extract deal context from substantive messages
    if (body.length > 20) {
      contact.dealContext = body;
    }

    // 4. Advance stage (existing state machine)
    contact.stage = nextStage(contact.stage, intent, contact);

    // 5. Generate response through Scout guardrail pipeline
    const scoutResponse = await generateScoutResponse({
      message: body,
      channel: "sms",
      context: {
        stage: contact.stage,
        intent: contact.intent,
        dealContext: contact.dealContext,
        messageCount: contact.messageCount,
      },
    });

    // 6. Save updated state
    await saveContact(contact);

    // 7. Return TwiML
    return new NextResponse(buildTwiml(scoutResponse.text), {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch {
    // Failsafe — never leave the user hanging
    const fallback = buildTwiml(
      "Got your message — let me look into this and text you right back."
    );
    return new NextResponse(fallback, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }
}
```

**Only two lines changed:**
- Line: `const contact = getContact(from)` → `const contact = await getContact(from)`
- Line: `saveContact(contact)` → `await saveContact(contact)`

---

Commit message:
```
fix: await async state calls in SMS route — Supabase persistence now active
