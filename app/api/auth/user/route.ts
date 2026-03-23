import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAuthUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const auth = await getAuthUser();

  // No cookie / invalid token → return null (not an error)
  if (!auth) {
    return NextResponse.json(null, { status: 200 });
  }

  const db = await getDb();

  const user = await db
    .collection("users")
    .findOne(
      { _id: new ObjectId(auth.userId) },
      { projection: { password: 0 } },
    );

  // Token is valid but account no longer exists — kill both cookies
  if (!user) {
    const res = NextResponse.json(null, { status: 200 });
    res.cookies.delete("auth_token");
    res.cookies.delete("session_user");
    return res;
  }

  return NextResponse.json(user);
}
