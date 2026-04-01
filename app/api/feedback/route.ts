import { NextResponse } from "next/server";
import { feedbackCol } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.message?.trim()) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const col = await feedbackCol();
  await col.insertOne({
    userId: body.userId,
    message: body.message.trim(),
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true });
}
