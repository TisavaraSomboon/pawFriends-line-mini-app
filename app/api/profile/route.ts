import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { Tier, User } from "@/lib/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const lineUserId = searchParams.get("lineUserId");

  if (!userId && !lineUserId)
    return NextResponse.json({ error: "userId or lineUserId is required" }, { status: 400 });

  const db = await getDb();

  // ── Lookup by MongoDB ID ──────────────────────────────────────────────────────
  if (userId) {
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } },
    );
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  }

  // ── Lookup by LINE user ID (upsert on first visit) ───────────────────────────
  const displayName = searchParams.get("displayName") ?? "PawFriend";
  const pictureUrl = searchParams.get("pictureUrl") ?? undefined;

  const existing = await db.collection("users").findOne({ lineUserId });

  if (existing) {
    return NextResponse.json(existing);
  }

  // First visit — create user from LINE profile
  const now = new Date();
  const result = await db.collection("users").insertOne({
    lineUserId,
    name: displayName,
    image: pictureUrl,
    followers: 0,
    following: 0,
    rating: 0,
    tier: Tier.Beginner,
    createdAt: now,
    updatedAt: now,
  });

  const newUser = await db.collection("users").findOne({ _id: result.insertedId });
  return NextResponse.json(newUser, { status: 201 });
}

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const lineUserId = searchParams.get("lineUserId");
  const body: Omit<User, "_id"> = await req.json();

  const db = await getDb();

  const filter = userId
    ? { _id: new ObjectId(userId) }
    : { lineUserId };

  await db.collection("users").updateOne(filter, {
    $set: { ...body, updatedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
