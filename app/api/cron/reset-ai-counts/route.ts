import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";

// GET /api/cron/reset-ai-counts
// Resets aiProfilePhotoCount and aiCoverImageCount to 0 for all users.
// Called daily by Vercel Cron — protected by CRON_SECRET.
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = await getDb();

  const result = await db.collection("users").updateMany(
    {},
    {
      $set: {
        aiProfilePhotoCount: 0,
        aiCoverImageCount: 0,
        aiCountResetAt: new Date(),
      },
    },
  );

  return NextResponse.json({
    success: true,
    modifiedCount: result.modifiedCount,
    resetAt: new Date().toISOString(),
  });
}
