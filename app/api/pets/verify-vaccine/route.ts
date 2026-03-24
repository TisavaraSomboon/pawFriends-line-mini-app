import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: Request) {
  const { image, mimeType = "image/jpeg" } = await req.json();

  const currentYearCE = new Date().getFullYear(); // 2026
  const currentYearBE = currentYearCE + 543;      // 2569

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mimeType, data: image },
          },
          {
            type: "text",
            text: `This is a Thai pet vaccination booklet. Examine every vaccine sticker, stamp, or handwritten date on the page.

Thai dates use Buddhist Era (BE). Current year: ${currentYearCE} CE = ${currentYearBE} BE.
A vaccine is "current" if its vaccination date (วันฉีด) is within the past 12 months, OR its next vaccination date (วันฉีดครั้งต่อไป) is in the future.

Extract:
- vaccines: array of vaccine records found, each with { name: string, date: string, nextDate: string | null, isCurrent: boolean }
- hasCurrentVaccine: true if ANY vaccine record is current/valid this year
- summary: one sentence describing what you found (in English)

Reply with ONLY valid JSON, no markdown:
{"vaccines": [...], "hasCurrentVaccine": boolean, "summary": string}`,
          },
        ],
      },
    ],
  });

  const raw = (msg.content[0] as { type: "text"; text: string }).text
    .trim()
    .replace(/^```[a-z]*\n?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    const result = JSON.parse(raw);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Could not read the vaccination booklet. Please try a clearer photo." },
      { status: 422 },
    );
  }
}
