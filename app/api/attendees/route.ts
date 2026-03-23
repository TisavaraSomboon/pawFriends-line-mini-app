import { getAuthUser } from "@/lib/auth";
import { attendeesCol } from "@/lib/db";
import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const activityId = searchParams.get("activityId");

  if (!activityId)
    return NextResponse.json({ error: "No activity id" }, { status: 401 });

  const col = await attendeesCol();
  const attendees = await col
    .find({
      activityId: new ObjectId(activityId),
    })
    .sort({ date: 1 })
    .toArray();

  return NextResponse.json(attendees);
}

export async function POST(req: Request) {
  const body = await req.json();
  const auth = await getAuthUser();

  if (!auth)
    return NextResponse.json({ error: "Can not found user" }, { status: 401 });

  const db = await getDb();

  const result = await db.collection("attendees").insertOne({
    attendeeId: new ObjectId(body.attendeeId),
    activityId: new ObjectId(body.activityId),
    status: body.status,
    requestMessage: body.requestMessage,
    role: body.role,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const response = NextResponse.json(
    { id: result.insertedId },
    { status: 201 },
  );

  return response;
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const auth = await getAuthUser();

  if (!auth)
    return NextResponse.json({ error: "Can not found user" }, { status: 401 });

  const col = await attendeesCol();

  await col.updateOne(
    { _id: new ObjectId(body._id) },
    { $set: { status: body.status, updatedAt: new Date() } },
  );

  return NextResponse.json({ success: true });
}
