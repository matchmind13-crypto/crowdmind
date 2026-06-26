import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { comments } = await req.json();
  
  const prompt = `Az alábbi hozzászólások egy témához érkeztek:\n\n${comments.map((c: {user: string, tip: string, text: string}) => `${c.user}: "${c.text}"`).join('\n')}\n\nÍrj egy rövid magyar összefoglalót CSAK ebben a JSON formátumban, semmi más szöveg nélkül:\n{"agree": ["miben értenek egyet (max 2 pont, max 15 szó/pont)"], "disagree": ["miben vitatkoznak (max 1 pont, max 15 szó)"], "summary": "2-3 mondatos összefoglaló magyarul"}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  const raw = data.content[0].text;
  const clean = raw.replace(/```json|```/g, "").trim();
  
  try {
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ summary: raw, agree: [], disagree: [] });
  }
}