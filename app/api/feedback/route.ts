import { NextResponse } from "next/server";
import { feedbackCol } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const auth = await getAuthUser();

  if (!body.message?.trim()) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const col = await feedbackCol();
  await col.insertOne({
    userId: auth?.userId,
    userName: auth?.email,
    message: body.message.trim(),
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true });
}
