import { NextResponse } from "next/server";
import { getSignedUrlFromR2, uploadTypes } from "@/lib/uploadImage";
import type { NextRequest } from "next/server";

// POST /api/upload/signed-url
// Body: { fileName: string; type: "user-profile" | "pet-profile" | "activity-image" }
// Returns: { signedUrl: string }
export async function POST(req: NextRequest) {
  const { fileName, type } = await req.json();

  if (!fileName || !uploadTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const signedUrl = await getSignedUrlFromR2(fileName, type);

  return NextResponse.json({ signedUrl });
}
