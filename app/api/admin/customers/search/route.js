// app/api/admin/customers/search/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q || q.length < 2) {
      // keep it light: require at least 2 chars to search
      return NextResponse.json([]);
    }

    const regex = new RegExp(q, "i");
    const users = await User.find({
      role: "user", // only real customers
      $or: [{ name: regex }, { email: regex }],
    })
      .select("_id name email")
      .lean(); // return plain objects for less overhead

    return NextResponse.json(users);
  } catch (err) {
    console.error("Customer search error:", err);
    return NextResponse.json(
      { error: "Failed to search customers" },
      { status: 500 }
    );
  }
}
