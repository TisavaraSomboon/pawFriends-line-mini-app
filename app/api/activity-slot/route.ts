import { NextResponse } from "next/server";
import { activitySlotsCol } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// GET /api/activity-slot?activityId=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const activityId = searchParams.get("activityId");

  if (!activityId) {
    return NextResponse.json({ error: "activityId is required" }, { status: 400 });
  }

  const col = await activitySlotsCol();
  const slots = await col
    .find({ activityId: new ObjectId(activityId) })
    .sort({ weekday: 1, startTime: 1 })
    .toArray();

  return NextResponse.json(slots);
}

// POST /api/activity-slot
export async function POST(req: Request) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { activityId, label, weekday, startTime, endTime, maxDogs } = body;

  if (!activityId || weekday === undefined || !startTime || !endTime) {
    return NextResponse.json(
      { error: "activityId, weekday, startTime, and endTime are required" },
      { status: 400 },
    );
  }

  const col = await activitySlotsCol();
  const result = await col.insertOne({
    activityId: new ObjectId(activityId),
    label: label ?? "",
    weekday: Number(weekday),
    startTime,
    endTime,
    maxDogs: maxDogs ?? 8,
    attendeesID: [],
    createdAt: new Date(),
  });

  return NextResponse.json({ id: result.insertedId }, { status: 201 });
}

// DELETE /api/activity-slot?id=xxx
export async function DELETE(req: Request) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const col = await activitySlotsCol();
  await col.deleteOne({ _id: new ObjectId(id) });

  return NextResponse.json({ ok: true });
}
