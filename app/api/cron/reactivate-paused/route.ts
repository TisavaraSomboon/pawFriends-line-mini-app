import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";

// GET /api/cron/reactivate-paused
// Sets all paused activities back to active at the end of each day.
// Called daily by Vercel Cron — protected by CRON_SECRET.
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();

  const result = await db.collection("activities").updateMany(
    { status: "paused" },
    { $set: { status: "active", updatedAt: new Date() } },
  );

  return NextResponse.json({
    success: true,
    modifiedCount: result.modifiedCount,
    reactivatedAt: new Date().toISOString(),
  });
}
