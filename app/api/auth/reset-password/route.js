import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(req) {
  const { token, password } = await req.json();
  if (!token || !password)
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  try {
    const { id } = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);

    await dbConnect();
    const user = await User.findById(id);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reset-token error:", err.message);
    return NextResponse.json(
      { error: "Token expired or invalid" },
      { status: 400 }
    );
  }
}
