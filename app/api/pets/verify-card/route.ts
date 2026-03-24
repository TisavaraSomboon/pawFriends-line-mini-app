import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: Request) {
  const { image, mimeType = "image/jpeg" } = await req.json();

  // ── Step 1: Extract microchip code via Claude Vision ──────────────────────
  const visionMsg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 64,
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
            text: "This is a Thai pet ID card. Find the microchip code (รหัสไมโครชิป). It is a 15-digit number printed near the barcode at the top. Reply with ONLY the 15-digit number, no spaces or other text.",
          },
        ],
      },
    ],
  });

  const raw = (visionMsg.content[0] as { type: "text"; text: string }).text
    .trim()
    .replace(/\D/g, "");

  if (raw.length < 10 || raw.length > 20) {
    return NextResponse.json(
      { error: "Could not detect a valid microchip code from the image." },
      { status: 422 },
    );
  }

  const microchipCode = raw;

  // ── Step 2: Query Bangkok pet registry ───────────────────────────────────
  let html = "";
  try {
    const res = await fetch(
      `https://petregis.bangkok.go.th/frontend/web/index.php/site/checknumber?VPetInfoSearch%5Bpet_code%5D=${microchipCode}&_pjax=%23pjax-checknumber-form`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "th-TH,th;q=0.9,en;q=0.8",
        },
        signal: AbortSignal.timeout(10_000),
      },
    );
    html = await res.text();
  } catch {
    return NextResponse.json(
      { error: "Could not reach the pet registry. Please try again later." },
      { status: 503 },
    );
  }

  // ── Step 3: Use Claude to parse the registry result ───────────────────────
  const parseMsg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `This is HTML from the Bangkok pet registry (petregis.bangkok.go.th) after searching for microchip ${microchipCode}.
Parse it and extract:
- found: was a pet record found (true/false)
- vaccine: is the pet vaccinated (true/false) — look for "ฉีดวัคซีน", "วัคซีน"
- sterilizing: is the pet sterilized (true/false) — look for "ทำหมันแล้ว", "ทำหมัน"
- petName: name of the pet if found (Thai or English)
- breed: breed of the pet exactly as written in the registry (may be Thai)
- breedEnglish: the English name of that breed (e.g. if breed is "ปอมเมอราเนียน" → "Pomeranian", "ชิวาวา" → "Chihuahua", "ลาบราดอร์" → "Labrador Retriever"). If breed is already English, repeat it here. Null if no breed found.

HTML (truncated): ${html.slice(0, 10000)}

Reply with ONLY valid JSON, no markdown: {"found": boolean, "vaccine": boolean, "sterilizing": boolean, "petName": string | null, "breed": string | null, "breedEnglish": string | null}`,
      },
    ],
  });

  const parseRaw = (parseMsg.content[0] as { type: "text"; text: string }).text
    .trim()
    .replace(/^```[a-z]*\n?/i, "")
    .replace(/```$/i, "")
    .trim();

  let parsed: {
    found: boolean;
    vaccine: boolean;
    sterilizing: boolean;
    petName: string | null;
    breed: string | null;
    breedEnglish: string | null;
  };

  try {
    parsed = JSON.parse(parseRaw);
  } catch {
    return NextResponse.json(
      { error: "Could not parse registry response." },
      { status: 500 },
    );
  }

  if (!parsed.found) {
    return NextResponse.json(
      {
        error: `No pet found with microchip ${microchipCode}. Make sure the number is correct.`,
        microchipCode,
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    microchipCode,
    vaccine: parsed.vaccine,
    sterilizing: parsed.sterilizing,
    petName: parsed.petName,
    breed: parsed.breed,
    breedEnglish: parsed.breedEnglish,
  });
}
