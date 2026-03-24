import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export type PetInsight = { icon: string; text: string };

export type PetInsightsResult = {
  careTips: PetInsight[];
  agePrecautions: PetInsight[];
  diseases: PetInsight[];
  behaviorExpectations: PetInsight[];
  illustrationUrl?: string;
};

export async function POST(req: Request) {
  const { breed, ageGroup, energyLevel, emotions, behaviorTraits } =
    await req.json();

  const prompt = `You are a veterinary and dog behaviour expert. Generate a friendly, calm, easy-to-read care guide for a dog with the following profile:
- Breed: ${breed || "Mixed breed"}
- Age group: ${ageGroup || "Adult"}
- Energy level: ${energyLevel ?? "Medium"}
- Emotions / temperament: ${emotions?.join(", ") || "unknown"}
- Key behaviour traits: ${behaviorTraits?.join(", ") || "unknown"}

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "careTips": [
    { "icon": "<material_symbol_name>", "text": "<one short tip under 20 words>" },
    { "icon": "<material_symbol_name>", "text": "<tip>" },
    { "icon": "<material_symbol_name>", "text": "<tip>" }
  ],
  "agePrecautions": [
    { "icon": "<material_symbol_name>", "text": "<precaution relevant to this age group, under 20 words>" },
    { "icon": "<material_symbol_name>", "text": "<precaution>" }
  ],
  "diseases": [
    { "icon": "<material_symbol_name>", "text": "<disease name + brief prevention, under 20 words>" },
    { "icon": "<material_symbol_name>", "text": "<disease>" },
    { "icon": "<material_symbol_name>", "text": "<disease>" }
  ],
  "behaviorExpectations": [
    { "icon": "<material_symbol_name>", "text": "<expected behaviour based on breed/emotions/energy, under 20 words>" },
    { "icon": "<material_symbol_name>", "text": "<behaviour>" },
    { "icon": "<material_symbol_name>", "text": "<behaviour>" }
  ]
}

Use real Material Symbols icon names (e.g. "favorite", "health_and_safety", "directions_run", "psychology", "warning", "water_drop", "local_hospital", "shield", "self_improvement", "pets", "sports_soccer", "night_shelter", "sunny", "schedule").
Keep tone warm, supportive, and simple — like advice from a caring vet.`;

  const aiResponse = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  const raw =
    aiResponse.content[0].type === "text" ? aiResponse.content[0].text : "{}";
  const match = raw.match(/\{[\s\S]*\}/);
  const insights: Omit<PetInsightsResult, "illustrationUrl"> = match
    ? JSON.parse(match[0])
    : { careTips: [], agePrecautions: [], diseases: [], behaviorExpectations: [] };

  // Fetch a cute dog illustration from Pexels
  let illustrationUrl: string | undefined;
  try {
    const q = encodeURIComponent(`cute ${breed || "dog"} puppy cartoon illustration`);
    const pexelsRes = await fetch(
      `https://api.pexels.com/v1/search?query=${q}&per_page=1&orientation=square`,
      { headers: { Authorization: process.env.PEXELS_API_KEY! } },
    );
    const pexelsData = await pexelsRes.json();
    illustrationUrl = pexelsData.photos?.[0]?.src?.medium ?? undefined;
  } catch {
    // illustration is optional — silently skip
  }

  return NextResponse.json({ ...insights, illustrationUrl } satisfies PetInsightsResult);
}
