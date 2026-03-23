import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { validatePassword, validateEmail } from "@/lib/validation";

export async function POST(req: Request) {
  const { email, password, ...info } = await req.json();

  const emailError = validateEmail(email);
  if (emailError) {
    return NextResponse.json({ error: emailError }, { status: 400 });
  }

  const { valid, error } = validatePassword(password);
  if (!valid) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const db = await getDb();

  const existing = await db.collection("users").findOne({ email });
  if (existing) {
    return NextResponse.json(
      { error: "Email already in use" },
      { status: 400 },
    );
  }

  const hashed = await bcrypt.hash(password, 12);
  const result = await db.collection("users").insertOne({
    ...info,
    email,
    password: hashed,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Auto-login: sign a JWT and set the auth cookie so the user lands
  // on the home page without needing to log in again.
  const token = jwt.sign(
    { userId: result.insertedId.toString(), email },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" },
  );

  const response = NextResponse.json(
    { id: result.insertedId },
    { status: 201 },
  );
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
