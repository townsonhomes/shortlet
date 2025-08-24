import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";

export async function DELETE(req, context) {
  const params = await context.params;
  try {
    // auth: admins only
    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    await dbConnect();

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Ensure we only delete sub-admins (safety)
    const deleted = await User.findOneAndDelete({ _id: id, role: "sub-admin" });

    if (!deleted) {
      return NextResponse.json(
        { error: "Sub-admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Sub-admin deleted" }, { status: 200 });
  } catch (err) {
    console.error("Delete sub-admin error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
