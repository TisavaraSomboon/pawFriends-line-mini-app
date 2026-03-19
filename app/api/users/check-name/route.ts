import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/users/check-name?name=John
// Returns { available: boolean }
// Excludes the currently logged-in user so they can keep their existing name.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name")?.trim();

  if (!name) {
    return NextResponse.json({ available: false }, { status: 400 });
  }

  const auth = await getAuthUser();
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const existing = await db.collection("users").findOne(
    {
      name: { $regex: `^${name}$`, $options: "i" }, // case-insensitive exact match
      ...(auth ? { _id: { $ne: new ObjectId(auth.userId) } } : {}),
    },
    { projection: { _id: 1 } },
  );

  return NextResponse.json({ available: !existing });
}
