// app/api/admin/owners/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Shortlet from "@/models/Shortlet";

export async function GET() {
  try {
    await connectDB();

    const owners = await Shortlet.distinct("ownership", {
      ownership: { $exists: true, $ne: "" },
    });
    return NextResponse.json(owners, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch owners:", error);
    return NextResponse.json(
      { error: "Failed to fetch owners" },
      { status: 500 }
    );
  }
}
