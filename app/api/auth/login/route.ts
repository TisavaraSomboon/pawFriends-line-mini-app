import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const db = await getDb();

  const user = await db.collection("users").findOne({ email });
  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  // Create JWT token
  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" },
  );

  const { password: _, ...safeUser } = user;

  // Set HTTP-only cookie in the response
  const response = NextResponse.json(safeUser);
  response.cookies.set("auth_token", token, {
    httpOnly: true, // JS cannot read this — more secure
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: "/",
  });

  return response;
}
