import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getToken } from "next-auth/jwt";

export async function POST(req) {
  try {
    // auth: admins only
    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    await dbConnect();

    const {
      name,
      email,
      phone,
      gender,
      nationality,
      state,
      address,
      password,
    } = await req.json();

    // basic server-side validation (client already validates)
    if (!name || !email || !password || !gender) {
      return NextResponse.json(
        { error: "name, email, password and gender are required" },
        { status: 400 }
      );
    }

    // enforce unique email (lowercase)
    const lowerEmail = String(email).toLowerCase();
    const existing = await User.findOne({ email: lowerEmail });
    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // create sub-admin (force correct role)
    const created = await User.create({
      name: name.trim(),
      email: lowerEmail,
      phone: phone || undefined,
      gender,
      nationality: nationality || undefined,
      state: state || undefined,
      address: address || undefined,
      password: hashed,
      isEmailVerified: true,
      role: "sub-admin",
    });

    // never return password
    const { password: _, ...safe } = created.toObject();

    return NextResponse.json(safe, { status: 201 });
  } catch (err) {
    // duplicate key safety (just in case)
    if (err?.code === 11000) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }
    console.error("Create sub-admin error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
