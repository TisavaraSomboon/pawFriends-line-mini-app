import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { getDb } from "@/lib/mongodb";
import { validateEmail } from "@/lib/validation";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  const { email } = await req.json();

  const emailError = validateEmail(email);
  if (emailError) {
    return NextResponse.json({ error: emailError }, { status: 400 });
  }

  const code = generateOtp();
  const hashed = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const db = await getDb();
  console.log("OTP code 🌱:", code);

  // One active OTP per email — upsert replaces any previous code
  await db
    .collection("otps")
    .updateOne(
      { email },
      { $set: { code: hashed, expiresAt, used: false } },
      { upsert: true },
    );

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Your PawFriends verification code",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="font-size:22px;font-weight:800;color:#1e293b;margin-bottom:8px">
          Your verification code
        </h2>
        <p style="font-size:15px;color:#64748b;margin-bottom:24px">
          Enter this code in PawFriends to verify your email address.
          It expires in <strong>10 minutes</strong>.
        </p>
        <div style="letter-spacing:12px;font-size:36px;font-weight:800;color:#1e293b;
                    background:#fdf8f3;border:1px solid #e2cfb7;border-radius:14px;
                    padding:20px 24px;text-align:center;margin-bottom:24px">
          ${code}
        </div>
        <p style="font-size:13px;color:#94a3b8">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
