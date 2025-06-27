// /app/api/verify/route.js
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET(req) {
  await dbConnect();

  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return Response.json({ error: "Token missing" }, { status: 400 });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return Response.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }

  const { name, lastName, email, password, phone } = payload;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return Response.json({ error: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name: `${name} ${lastName}`,
    email,
    password: hashedPassword,
    phone,
    isEmailVerified: true,
    role: "user",
  });

  return Response.json({ success: true, user: newUser });
}
