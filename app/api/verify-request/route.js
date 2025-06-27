// /app/api/verify-request/route.js
import jwt from "jsonwebtoken";
import { sendEmail } from "@/lib/email/sendEmail";
import { generateVerificationEmail } from "@/utils/email/templates/emailVerification";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  const { name, lastName, email, password, phone } = await req.json();

  if (!name || !lastName || !email || !password || !phone) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  const token = jwt.sign(
    { name, lastName, email, password, phone },
    JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );

  await sendEmail({
    to: email,
    ...generateVerificationEmail(token),
  });

  return Response.json({ success: true, message: "Verification email sent" });
}
