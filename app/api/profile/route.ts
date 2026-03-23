import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { User } from "@/lib/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const auth = await getAuthUser();

  const userId = searchParams.get("userId") ?? auth?.userId;

  const db = await getDb();

  const user = await db.collection("users").findOne(
    { _id: new ObjectId(userId) },
    { projection: { password: 0 } }, // exclude password
  );

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const body: Omit<User, "_id"> = await req.json();

  const db = await getDb();

  await db.collection("users").updateOne(
    { _id: new ObjectId(userId!) },
    {
      $set: {
        ...body,
        updatedAt: new Date(),
      },
    },
  );

  return NextResponse.json({ success: true });
}
