import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";

type CachedPlace = {
  placeId: string;
  description: string;
  latitude: number;
  longitude: number;
};

// GET /api/places/autocomplete?q=bangkok+park
// 1. Check MongoDB cache first — return immediately if hit
// 2. On miss: call Google Places Text Search, store result, then return
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ predictions: [] });

  const normalizedQuery = q.toLowerCase();

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const col = db.collection<{ query: string; places: CachedPlace[]; cachedAt: Date }>(
    "place_searches",
  );

  // ── Cache hit ──
  const cached = await col.findOne({ query: normalizedQuery });
  if (cached) {
    return NextResponse.json({ predictions: cached.places, fromCache: true });
  }

  // ── Cache miss: call Google Places Text Search (New) ──
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY!,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location",
    },
    body: JSON.stringify({ textQuery: q, pageSize: 5 }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    console.error("[places/autocomplete] Google error:", data.error);
    return NextResponse.json(
      { predictions: [], error: data.error?.message },
      { status: 502 },
    );
  }

  const places: CachedPlace[] = (data.places ?? []).map(
    (p: {
      id: string;
      displayName?: { text: string };
      formattedAddress?: string;
      location: { latitude: number; longitude: number };
    }) => ({
      placeId: p.id,
      description: p.formattedAddress ?? p.displayName?.text ?? "",
      latitude: p.location.latitude,
      longitude: p.location.longitude,
    }),
  );

  // Store in cache (fire-and-forget)
  col
    .insertOne({ query: normalizedQuery, places, cachedAt: new Date() })
    .catch((err) => console.error("[places/autocomplete] cache write failed:", err));

  return NextResponse.json({ predictions: places });
}
