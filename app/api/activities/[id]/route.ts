import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { activitiesCol } from "@/lib/db";

// GET /api/activities/:id
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { id: userId } = await params;
  const col = await activitiesCol();
  const activity = await col.findOne({ _id: new ObjectId(userId) });

  if (!activity)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(activity);
}

// PATCH /api/activities/:id
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = await req.json();
  const col = await activitiesCol();

  await col.updateOne(
    { _id: new ObjectId(params.id) },
    { $set: { ...body, updatedAt: new Date() } },
  );

  return NextResponse.json({ success: true });
}
