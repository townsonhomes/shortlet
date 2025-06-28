// app/api/change-password/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcrypt";

import { sendEmail } from "@/lib/email/sendEmail";
import { generatePasswordChangeEmail } from "@/lib/email/templates/passwordChange";

export async function POST(req) {
  try {
    /* 1️⃣  Session -------------------------------------------------------- */
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* 2️⃣  Body ----------------------------------------------------------- */
    const { newPassword } = await req.json();
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    /* 3️⃣  Hash & update -------------------------------------------------- */
    await dbConnect();
    const hashed = await bcrypt.hash(newPassword, 10);

    const { modifiedCount } = await User.updateOne(
      { _id: session.user.id },
      { $set: { password: hashed } },
      { runValidators: false } // ⬅️ skip gender / enum checks
    );

    if (modifiedCount === 0) {
      return NextResponse.json(
        { error: "User not found or password unchanged." },
        { status: 404 }
      );
    }

    /* 4️⃣  Confirmation e-mail ------------------------------------------- */
    await sendEmail({
      to: session.user.email,
      ...generatePasswordChangeEmail(session.user.name ?? "User"),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Change-password error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
