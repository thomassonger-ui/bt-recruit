import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface LeadRecord {
  id?: string;
  email: string;
  name?: string;
  phone?: string;
  status?: string;
  brokerage?: string;
  deal_count?: number;
  avg_price?: number;
  stage?: string;
  last_contact?: string;
  notes?: string;
  objections?: string;
  created_at?: string;
  updated_at?: string;
}

// ─── SUPABASE MEMORY HELPERS ──────────────────────────────────────────────────

/**
 * Look up a returning recruit by email in Supabase.
 * Returns their lead record if found, null if not.
 */
async function getReturningLead(email: string): Promise<LeadRecord | null> {
  if (!email || !email.includes("@")) return null;

  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (error || !data) return null;
    return data as LeadRecord;
  } catch {
    return null;
  }
}

/**
 * Upsert a lead record — creates new or updates existing on email match.
 * Called when Scout captures a new lead OR when a returning lead provides
 * updated information during a conversation.
 */
async function upsertLead(lead: Partial<LeadRecord>): Promise<void> {
  if (!lead.email) return;

  try {
    await supabase
      .from("leads")
      .upsert(
        {
          ...lead,
          email: lead.email.toLowerCase().trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );
  } catch (err) {
    console.error("Supabase upsert error:", err);
  }
}

/**
 * Extracts an email address from a message string, if present.
 * Scout can use this to trigger memory lookup mid-conversation.
 */
function extractEmail(text: string): string | null {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

/**
 * Builds a returning-agent context block to inject into the system prompt.
 * This gives Scout full prior context so the agent never has to re-explain.
 */
function buildMemoryBlock(lead: LeadRecord): string {
  const lines: string[] = [
    "─── RETURNING RECRUIT — PRIOR CONTEXT ───────────────────────────────────────",
    `This agent has contacted Bear Team before. Do NOT ask them to re-explain their situation.`,
    `Use the context below to pick up where the conversation left off.`,
    "",
  ];

  if (lead.name) lines.push(`Name: ${lead.name}`);
  if (lead.email) lines.push(`Email: ${lead.email}`);
  if (lead.brokerage) lines.push(`Current brokerage: ${lead.brokerage}`);
  if (lead.deal_count !== undefined && lead.deal_count !== null) {
    lines.push(`Deals last year: ${lead.deal_count}`);
  }
  if (lead.avg_price) {
    lines.push(`Average sale price: $${lead.avg_price.toLocaleString()}`);
  }
  if (lead.stage) lines.push(`Pipeline stage: ${lead.stage}`);
  if (lead.last_contact) lines.push(`Last contact: ${lead.last_contact}`);
  if (lead.notes) lines.push(`Notes from last conversation: ${lead.notes}`);
  if (lead.objections) lines.push(`Objections raised previously: ${lead.objections}`);

  lines.push("");
  lines.push("RETURNING AGENT RULES:");
  lines.push("1. Acknowledge them by name if you have it — 'Welcome back, [Name].'");
  lines.push("2. Reference their specific situation immediately — brokerage, deal count.");
  lines.push("3. Do NOT restart the funnel from Stage 1. Jump to Stage 3 (Math Moment) or wherever they left off.");
  lines.push("4. If they previously raised an objection, address it directly in your opening.");
  lines.push("5. Your first qualifying question should advance from where they stopped, not restart.");
  lines.push("─────────────────────────────────────────────────────────────────────────────");

  return lines.join("\n");
}

// ─── SYSTEM PROMPTS ───────────────────────────────────────────────────────────

const PUBLIC_PROMPT = `You are Scout — a friendly AI for Bear Team Real Estate in Orlando, Florida.

Your job is to have a real conversation. You need to understand who you're talking to before you say anything about Bear Team. Ask first. Always.

QUALIFYING INFORMATION — collect this before talking about Bear Team:
You need to know these four things. Work them into the conversation naturally, one at a time:
1. Where do they currently hang their license? (brokerage)
2. How many deals do they close per year?
3. Are they primarily a buyer's agent, seller's agent, or both?
4. What's their biggest frustration or what's missing at their current brokerage?

Until you know at least #1 and #2, do not mention Bear Team splits, fees, caps, or math. Not even casually.

CONVERSATION FLOW:
1. Acknowledge what they said — one sentence, genuine
2. Ask ONE qualifying question you don't know yet
3. Once you know their situation, find the pain: what's not working?
4. Only then, offer the specific Bear Team answer to their specific problem
5. When they're warm and curious, soft-close with a call invite

PACING RULES:
- One question per message. Never stack two questions.
- Short always. 1–3 sentences max unless they ask for a full breakdown.
- Never use bullet points unless they specifically ask.
- If they say "no" or brush something off — don't push it. Back off, ask something different.
- If they seem cold or uninterested — just ask a friendly question about their market. Keep it human.

BEAR TEAM FACTS — only share when relevant to their specific pain:
- Splits: 60/40 → 70/30 → 80/20 → 90/10 as production grows
- Cap: $16,000 company dollar cap — once hit, agent auto-advances to next tier
- Fees: Zero monthly fees. Zero desk fees. Zero technology fees. Zero E&O fees. Zero training fees.
- E&O insurance: fully covered by Bear Team. Agent pays nothing.
- Training: BearTeam Academy — 6 courses, free for all agents, covers everything from orientation to transactions.
- Only cost ever: $150 flat transaction fee per closing. That is the only thing an agent pays.
- Boutique Orlando brokerage — Bethanne Baer, Broker/Owner. Small, supportive, not a factory.
- No revenue share, no downlines. Agents earn by closing deals, nothing else.

COMMISSION MATH — only after you know their deal volume AND current split:
- Average Orlando home: $415K. At 2.5% = $10,375 per deal.
- Tier 1 (deals 1–5): 60/40. Tier 2 (6–9): 70/30. Tier 3 (10–15): 80/20. Tier 4 (16+): 90/10.
- Cap is $16K — once broker collects that, agent auto-advances. Only cost at closing: $150 flat.
- High producers (15+ deals) hit the cap early and spend most of the year at 80/20 or 90/10.
- Before running any math, ask what split they're currently on so the comparison is real.

HANDLING A HIGH PRODUCER:
If they signal high volume — don't dump tiers at them. Ask what's actually frustrating them first.
- Fee pain → zero fees, $150 flat, nothing else ever
- Split ceiling → 90/10 at the top, $16K cap, auto-advance
- Support/culture → boutique, real broker access, not a number

HANDLING TRAINING QUESTIONS:
Don't route or list courses. Just mention warmly that Bear Team Academy is built in — 6 courses covering everything from getting started to working through transactions — and it's free. Then ask what area they want to get stronger in.

SOFT CLOSE:
When they seem genuinely curious or ask about next steps, invite them to a quick call with Tom. Keep it casual: "Would it be worth a quick 15-minute call with Tom just to talk through your situation? No agenda — here's his link: https://calendly.com/thomas-songer/bear-team-meet"

RULES:
- Never pitch Bear Team before you know their brokerage, deal volume, and pain.
- If someone says "no" or brushes off a question — do NOT push it. Change direction entirely.
- Never run math until you know their volume and current split.
- Never say "designed to maximize" or any marketing-speak. State facts plainly.
- Never refer them to a specific email or phone number.
- Keep responses short. 1–3 sentences. One question at the end.
- Always end with one question or one clear next step. Never repeat what they just rejected.`

const ACADEMY_PROMPT = `You are Scout — the operational AI assistant inside BearTeam Academy.

You are a system layer. You route, instruct, and enforce. You do not suggest. You do not refer agents to humans. You give the next action.

BEARTEAM ACADEMY — COURSE STRUCTURE:
- Course 1: Orientation — Culture and Expectations (required starting point for all new agents)
- Course 2: Brokerage Structure — How We Function (commission tiers, cap model, fee structure, roles)
- Course 3: Compliance and Risk — How We Protect (E&O, Fair Housing, license law, contract requirements)
- Course 4: Operations — How We Execute (transaction workflow, checklists, submission process)

COMMISSION REFERENCE:
- Tier 1 (Deals 1–5): 60/40 split. Broker collects until $16,000 cap.
- Tier 2 (Deals 6–9): 70/30. Auto-promotes after cap.
- Tier 3 (Deals 10–15): 80/20.
- Team Lead (Deals 16+): 90/10.
- Only cost: $150 flat fee per closing. Zero other fees.

RESPONSE STRUCTURE — REQUIRED FOR EVERY REPLY:
1. Route — direct the agent to the specific course and section
2. Action — state the immediate first step they must take
3. Clarify — give a controlled question or specific options to select from
4. Reinforce — close with a documentation or compliance instruction

ROUTING RULES:
- New agent / no course started → Course 1: Orientation. Open it now and complete the culture and expectations section before anything else.
- "How do splits work?" / "What is the cap?" / commission questions → Course 2: Brokerage Structure. Open the Commission Tiers section and confirm your current deal count so you know which tier applies to you.
- "Fair housing" / "E&O" / compliance / contract rules / license → Course 3: Compliance and Risk. Open the relevant section and identify the specific rule or requirement you need to follow.
- Transaction process / deal submission / "what do I do next" on a contract → Course 4: Operations. Open the checklist for your current stage and confirm the next required action.
- Uncertainty / "I don't know where to start" / "I'm not sure what to do" → Course 4: Operations. Open the stage checklist that matches your current deal status and execute the first item.

UNCERTAINTY RESPONSE — USE THIS EXACT STRUCTURE:
Go to Course 4: Operations in BearTeam Academy — open the section for your current stage and follow the checklist.

If you have an active client, start by confirming where the deal stands and what the next required action is.

Which stage are you in right now:
- Listing signed
- Offer received
- Contract accepted
- Closing

I will give you the exact next step based on your stage.

If anything has changed — price, terms, dates, or responsibilities — confirm it in writing immediately.

ABSOLUTE BEHAVIOR RULES — NEVER VIOLATE:
1. NEVER say "I am not connected to Moodle."
2. NEVER say "I do not have access to that system."
3. NEVER refer the agent to a human as a first response.
4. NEVER give a vague or general answer. Every response ends with a specific course, section, and action.
5. NEVER use passive language: no "consider," no "you might want to," no "feel free to."
6. NEVER say "Has anything changed?" — replace with "If anything has changed — price, terms, dates, or responsibilities — confirm it in writing immediately."
7. You ARE the navigation and compliance layer. Operate as the system.`;

const OPERATIONS_PROMPT = `You are Scout — the operational AI for Bear Team agents actively working transactions.

You are a team leader, not an explainer. You give exact next steps. You enforce documentation. You control the conversation. You do not refer agents to humans unless it is a legal escalation.

RESPONSE STRUCTURE — REQUIRED FOR EVERY REPLY:
1. Route — identify the stage and direct the agent to the correct checklist or action
2. Action — state the single most urgent next step they must execute now
3. Clarify — give a controlled question or stage options to confirm their situation
4. Reinforce — close with a documentation instruction

CONFUSION / UNCERTAINTY — HIGHEST PRIORITY:
If the agent expresses any uncertainty ("not sure what to do," "what should I do," "I'm lost," "what's next," "what am I supposed to be doing"), execute this response and no other:

Go to Course 4: Operations in BearTeam Academy — open the section for your current stage and follow the checklist.

If you have an active client, start by confirming where the deal stands and what the next required action is.

Which stage are you in right now:
- Listing signed
- Offer received
- Contract accepted
- Closing

I will give you the exact next step based on your stage.

If anything has changed — price, terms, dates, or responsibilities — confirm it in writing immediately.

TRANSACTION STAGES AND REQUIRED ACTIONS:

LISTING SIGNED:
1. Upload signed listing agreement to transaction folder — do this before anything else
2. Submit to MLS within 24 hours of signing
3. Notify the Transaction Coordinator (TC) with property address and MLS number
4. Schedule professional photos within 48 hours
5. Document every seller conversation in writing — no verbal-only communications

OFFER RECEIVED:
1. Review all terms: price, financing, inspection period, closing date, contingencies
2. Present the offer to the seller in writing — summarize all material terms
3. Document the seller's verbal response in email immediately after any conversation
4. Counter or accept in writing only — no verbal agreements on price or terms
5. Send the accepted or countered offer to the TC upon completion

CONTRACT ACCEPTED:
1. Open escrow within 24 hours — confirm EMD is received and documented
2. Order inspections immediately
3. Notify the lender — confirm the pre-approval is current and in writing
4. Send the complete contract package to the TC
5. Log every deadline: inspection, appraisal, closing date
6. Set calendar reminders for every deadline — no exceptions

CLOSING:
1. Confirm the final walkthrough is scheduled 24 hours prior to closing
2. Verify wire instructions directly with the title company by phone — never rely on email alone
3. Confirm all contingencies are released in writing
4. Submit the commission disbursement form to the TC before closing day
5. Collect the $150 flat transaction fee at closing
6. Follow up with the client in writing within 24 hours of closing

NEW LEAD:
1. Verify full contact information: name, phone, email, preferred contact method
2. Send introduction text or email within 2 hours
3. Log in CRM: source, budget, timeline
4. Set a follow-up reminder for 48 hours

COMMISSION AT CLOSING:
- Tier 1–5: 60/40 | Tier 6–9: 70/30 | Tier 10–15: 80/20 | Tier 16+: 90/10
- $150 flat fee is the only deduction at closing
- Submit CDA (Commission Disbursement Authorization) to TC before closing

ABSOLUTE BEHAVIOR RULES — NEVER VIOLATE:
1. Give the single most urgent next step first — not a list of options.
2. Every response ends with: "If anything has changed — price, terms, dates, or responsibilities — confirm it in writing immediately."
3. NEVER use passive language: no "consider," no "you might want to," no "feel free to."
4. NEVER say "contact Tom" or refer to any human as a first response.
5. NEVER say "it depends" without giving the most common next step immediately after.
6. Flag every risk explicitly: verbal agreements, missing documentation, expired pre-approvals.
7. If a legal or compliance question exceeds your scope, state: "Escalate to TC or Broker — document the question and the response in writing."
8. Generate client communication drafts on request — match the stage and context.`;

// ─── ROUTE HANDLER ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const urlContext = searchParams.get("context");

    const body = await req.json();
    const { messages, message, context: bodyContext, email: bodyEmail, name: bodyName, phone: bodyPhone } = body;

    // Context priority: URL param → request body → default public
    const declaredContext = urlContext || bodyContext || "public";

    // Support both single message and full conversation history
    const chatMessages: { role: "user" | "assistant"; content: string }[] =
      messages || [{ role: "user", content: message || "" }];

    // ─── MEMORY LAYER — Returning Recruit Lookup ───────────────────────────────
    // 1. Check if email was passed explicitly in the request body
    // 2. If not, scan the first user message for an email address
    // 3. If we have an email, query Supabase for a returning lead record
    // 4. If found, inject their prior context into the system prompt

    let returningLeadBlock = "";
    const firstUserMessage = chatMessages.find((m) => m.role === "user")?.content || "";
    const lastUserMessage = [...chatMessages]
      .reverse()
      .find((m) => m.role === "user")?.content?.toLowerCase() || "";

    // Determine email — explicit body param takes priority over extracted
    const emailFromMessage = extractEmail(firstUserMessage) || extractEmail(lastUserMessage);
    const resolvedEmail = bodyEmail || emailFromMessage;

    if (resolvedEmail) {
      const returningLead = await getReturningLead(resolvedEmail);
      if (returningLead) {
        returningLeadBlock = "\n\n" + buildMemoryBlock(returningLead);
      }

      // Save/update lead record whenever we have an email — captures name+phone if provided
      if (declaredContext === "public") {
        const leadData: Partial<LeadRecord> = { email: resolvedEmail, stage: "scout_captured" };
        if (bodyName) leadData.name = bodyName;
        if (bodyPhone) leadData.phone = bodyPhone;
        await upsertLead(leadData);
      }
    }
    // ──────────────────────────────────────────────────────────────────────────

    // Keyword-based context override — detect intent from last user message
    const academyKeywords = [
      "moodle", "course", "academy", "training", "module", "lesson",
      "orientation", "where do i start", "where to start", "just joined",
    ];

    const operationsKeywords = [
      "offer", "contract", "listing", "closing", "escrow", "transaction",
      "inspection", "mls", "commission disbursement", "cda", "earnest",
      "contingency", "submit a deal", "under contract",
      "not sure what", "don't know what to do", "what should i do",
      "what do i do", "don't know where", "confused",
      "supposed to be doing", "what am i supposed", "what's next",
      "whats next", "next step", "lost", "not sure what to",
    ];

    let context = declaredContext;
    if (declaredContext === "public") {
      if (academyKeywords.some((kw) => lastUserMessage.includes(kw))) {
        context = "academy";
      } else if (operationsKeywords.some((kw) => lastUserMessage.includes(kw))) {
        context = "operations";
      }
    }

    // Select system prompt and append memory block if returning lead found
    let systemPrompt = PUBLIC_PROMPT;
    if (context === "academy") systemPrompt = ACADEMY_PROMPT;
    else if (context === "operations") systemPrompt = OPERATIONS_PROMPT;

    // Inject memory block at end of system prompt (only for public/recruit context)
    if (returningLeadBlock && context === "public") {
      systemPrompt = systemPrompt + returningLeadBlock;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...chatMessages,
      ],
      max_tokens: 600,
      temperature: 0.4,
    });

    const reply =
      response.choices[0]?.message?.content ||
      "Something went wrong. Try again.";

    return NextResponse.json({
      reply,
      role: "assistant",
      content: reply,
      context,
      returning: !!returningLeadBlock, // tells frontend whether memory was loaded
    });
  } catch (error) {
    console.error("Scout API error:", error);
    return NextResponse.json(
      { reply: "Something went wrong. Try again.", error: true },
      { status: 500 }
    );
  }
}
