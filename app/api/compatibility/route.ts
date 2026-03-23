import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: Request) {
  const { breed, size, vaccine, fleaTick, activityType, activitySizes } =
    await req.json();

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 128,
    messages: [
      {
        role: "user",
        content: `Rate how well a dog would enjoy this activity. Score 0-100.

Dog: ${breed || "Mixed breed"}, size: ${size || "unknown"}, vaccinated: ${vaccine ? "yes" : "no"}, flea/tick treated: ${fleaTick ? "yes" : "no"}
Activity: ${activityType}
Activity size requirement: ${activitySizes?.length ? activitySizes.join(", ") : "all sizes welcome"}

Reply with ONLY valid JSON, no markdown: {"score": <integer 0-100>, "reason": "<one sentence max 12 words>"}`,
      },
    ],
  });

  const text = (message.content[0] as { type: "text"; text: string }).text.trim();
  const result = JSON.parse(text);
  return NextResponse.json(result);
}
