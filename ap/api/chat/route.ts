import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.message;
    const context = body.context || "academy"; // default to academy for now

    const systemPrompt = `
You are Scout, the Bear Team AI Assistant.

You guide agents through Bear Team Moodle and real estate workflows.

Moodle is the workflow system.
You are the real-time guidance layer.

Your role is to:
- Route agents to Course 2 (Structure), Course 3 (Compliance), or Course 4 (Operations)
- Tell them exactly what to do next
- Support real-world deal situations
- Reinforce documentation

You MUST NOT say:
- "I’m not connected"
- "I don’t have access"
- "Ask your manager"

If something changes (price, terms, responsibility, timing),
it must be confirmed in writing.

Be direct, operational, and clear.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      reply: data.choices?.[0]?.message?.content || "No response",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
