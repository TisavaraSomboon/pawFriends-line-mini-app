import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";

const client = new Anthropic({ maxRetries: 3 });

// POST /api/detect-pet
// Body: { imageBase64: string; mediaType: string }
// Returns: { breed, color, size, ageGroup, weight }
export async function POST(req: NextRequest) {
  const { imageBase64, mediaType } = await req.json();

  if (!imageBase64 || !mediaType) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `Analyze this image and return ONLY a JSON object with these keys:
- "isDog": true if there is exactly one dog clearly visible, false otherwise
- "breed": dog breed (e.g. "Labrador Retriever")
- "color": primary coat color (e.g. "Yellow")
- "gender": "Male" or "Female" based on visible features or best guess
- "size": one of "XS", "SM", "MD", "LG", "XL" — judge by current body size visible in the photo, NOT the expected adult size
- "ageGroup": one of "Puppy", "Young", "Adult", "Senior".
  Look carefully for these visual cues:
  • Puppy signs: disproportionately large paws, round chubby face, soft fluffy coat, big floppy ears relative to head, clumsy posture, small compact body
  • Young signs: lean athletic build, coat fully grown but still glossy, energetic posture
  • Senior signs: grey/white muzzle, cloudy eyes, loose skin, stiff posture
  Be conservative — if it shows any puppy features, choose "Puppy"
- "weight": estimated weight in kg as a number. Base this on the visible age and current body size:
  • Puppy Labrador: 5–15 kg
  • Puppy small breed: 1–5 kg
  • Adult small breed: 3–10 kg
  • Adult medium breed: 10–25 kg
  • Adult large breed: 25–45 kg
- "energyLevel": one of "Low", "Medium", "High", "VeryHigh" based on visible posture, breed, gender, size and age cues. For example, a puppy or young Labrador in an active pose would be "VeryHigh", while a senior small breed resting would be "Low".
- "emotions": array of up to 5 emotions the dog appears to be expressing, chosen from "Happy", "Sad", "Anxious", "Relaxed", "Playful", "Aggressive". Base this on facial expression, body language, breed, gender, size, age cues and posture cues.
- "socialStyle": one of "Friendly", "Shy", "Aggressive", "Avoidant" based on visible posture, facial expression, body language, breed, gender, size, age cues and posture cues.
- "behaviorTraits": array of up to 5 behavior traits the dog appears to be exhibiting, chosen from "Curious", "Calm", "Nervous", "Confident", "Timid", "Sociable", "Independent". Base this on visible posture, facial expression, body language, breed, gender, size, age cues and posture cues.
- "goodWith": array of up to 5 types of people, animals or environments the dog appears to be good with, chosen from "Kids", "Adults", "Other Dogs", "Cats", "Small Spaces", "Large Spaces". Base this on visible posture, facial expression, body language
- "considerNotes": if there are any concerning signs (e.g. aggressive posture, fearful expression, signs of neglect or abuse), include a "considerNote" key with a brief note on what to consider (e.g. "May be fearful around strangers", "Shows signs of possible past neglect"). Base this on visible posture, facial expression, body language, breed, energyLevel, emotions, socialStyle, behaviorTraits, goodWith
Remember, do NOT use adult weight ranges for puppies. Ignore the filename entirely. Only analyze the image content. If you cannot confidently determine a key, make your best guess based on visible cues and breed tendencies. Return the JSON object ONLY, with no additional text or explanation.

Example: {"isDog":true,"breed":"Labrador Retriever","color":"Yellow","gender":"Male","size":"SM","ageGroup":"Puppy","weight":8,"energyLevel":"VeryHigh","emotions":["Happy","Playful"]}`,
          },
        ],
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    return NextResponse.json(
      { error: "Could not parse AI response" },
      { status: 500 },
    );
  }

  const result = JSON.parse(match[0]);

  if (!result.isDog) {
    return NextResponse.json(
      { error: "Please upload a photo with a single dog clearly visible." },
      { status: 422 },
    );
  }

  const {
    breed,
    color,
    gender,
    size,
    ageGroup,
    weight,
    energyLevel,
    emotions,
    socialStyle,
    behaviorTraits,
    goodWith,
    considerNotes,
  } = result;
  return NextResponse.json({
    breed,
    color,
    gender,
    size,
    ageGroup,
    weight,
    energyLevel,
    emotions,
    socialStyle,
    behaviorTraits,
    goodWith,
    considerNotes,
  });
}
