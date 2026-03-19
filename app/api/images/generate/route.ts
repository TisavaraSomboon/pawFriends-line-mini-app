import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";

const client = new Anthropic({ maxRetries: 3 });

// GET /api/images/generate?context=park+run+dogs
// 1. Claude Haiku generates 4 diverse search queries from the context
// 2. Pexels fetches one landscape photo per query
// Returns: { images: string[] }
export async function GET(req: NextRequest) {
  const context =
    req.nextUrl.searchParams.get("context") ?? "dogs outdoor activity";

  // Step 1 — Claude generates 4 distinct search queries
  const aiResponse = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 150,
    messages: [
      {
        role: "user",
        content: `Generate 4 diverse, visually distinct Pexels image search queries for a dog activity cover photo related to: "${context}".
Return ONLY a valid JSON array of 4 short strings (2–4 words each). No extra text.
Make each query visually different from the others. Always include dogs.
Example: ["golden retriever park", "dogs running trail", "puppy playdate grass", "dog training outdoor"]`,
      },
    ],
  });

  const raw =
    aiResponse.content[0].type === "text" ? aiResponse.content[0].text : "[]";
  const match = raw.match(/\[[\s\S]*\]/);
  const queries: string[] = match
    ? JSON.parse(match[0])
    : ["dog park run", "dogs playing outdoor", "dog trail hike", "puppy activity"];

  // Step 2 — Fetch one Pexels photo per query in parallel
  const images = await Promise.all(
    queries.map(async (q) => {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=1&orientation=landscape`,
        { headers: { Authorization: process.env.PEXELS_API_KEY! } },
      );
      const data = await res.json();
      return (data.photos?.[0]?.src?.large ?? null) as string | null;
    }),
  );

  const filtered = images.filter((url): url is string => url !== null);

  if (filtered.length === 0) {
    return NextResponse.json(
      { error: "Could not fetch images. Check PEXELS_API_KEY." },
      { status: 500 },
    );
  }

  return NextResponse.json({ images: filtered });
}
