import { NextResponse } from "next/server";
import { activitiesCol } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// GET /api/activities
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const auth = await getAuthUser();

  const col = await activitiesCol();
  const activities = await col
    .find({
      status: "active",
      ...(userId && { userId: userId === "owner" ? auth?.userId : userId }),
    })
    .sort({ date: 1 })
    .toArray();

  return NextResponse.json(activities);
}

// POST /api/activities
export async function POST(req: Request) {
  const body = await req.json();
  const col = await activitiesCol();

  const auth = await getAuthUser();
  if (!auth)
    return NextResponse.json(
      { error: "Can not found user who created this activity" },
      { status: 401 },
    );

  const result = await col.insertOne({
    ...body,
    ownerId: new ObjectId(auth.userId),
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json({ id: result.insertedId }, { status: 201 });
}
