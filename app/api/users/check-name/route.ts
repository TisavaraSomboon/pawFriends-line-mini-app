import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

// GET /api/users/check-name?name=John&excludeUserId=xxx
// Returns { available: boolean }
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name")?.trim();
  const excludeUserId = searchParams.get("excludeUserId");

  if (!name) {
    return NextResponse.json({ available: false }, { status: 400 });
  }

  const db = await getDb();
  const { ObjectId } = await import("mongodb");

  const existing = await db.collection("users").findOne(
    {
      name: { $regex: `^${name}$`, $options: "i" },
      ...(excludeUserId ? { _id: { $ne: new ObjectId(excludeUserId) } } : {}),
    },
    { projection: { _id: 1 } },
  );

  return NextResponse.json({ available: !existing });
}
