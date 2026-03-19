import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// GET /api/places/details?placeId=ChIJ...
export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("placeId");
  if (!placeId) {
    return NextResponse.json({ error: "placeId required" }, { status: 400 });
  }

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json",
  );
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "name,geometry");
  url.searchParams.set("key", process.env.GOOGLE_MAPS_API_KEY!);

  const res = await fetch(url.toString());
  const data = await res.json();

  const result = data.result;
  if (!result) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: result.name,
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
  });
}
