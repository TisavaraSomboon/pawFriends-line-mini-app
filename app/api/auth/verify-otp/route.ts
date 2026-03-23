import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  const { email, code } = await req.json();

  if (!email || !code || code.length !== 6) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const record = await db.collection("otps").findOne({ email });

  if (!record || record.used || record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Code expired. Please request a new one." },
      { status: 400 },
    );
  }

  const valid = await bcrypt.compare(code, record.code);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect code." }, { status: 400 });
  }

  // Mark as used so it can't be replayed
  await db.collection("otps").updateOne({ email }, { $set: { used: true } });

  return NextResponse.json({ ok: true });
}
