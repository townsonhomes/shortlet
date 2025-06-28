import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { sendEmail } from "@/lib/email/sendEmail";

export async function POST(req) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  await dbConnect();
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ ok: true }); //   ↩ don’t leak info

  // create 1-hour token
  const token = jwt.sign({ id: user._id }, process.env.RESET_PASSWORD_SECRET, {
    expiresIn: "1h",
  });

  const link = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Reset your password",
    html: `
      <p>Hi ${user.name ?? "there"},</p>
      <p>Click the link below to set a new password (valid for 1 hour):</p>
      <p><a href="${link}">${link}</a></p>
      <p>If you didn’t request this, please ignore.</p>
    `,
  });

  return NextResponse.json({ success: true });
}
