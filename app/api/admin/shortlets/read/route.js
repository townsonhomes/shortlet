import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Shortlet from "@/models/Shortlet";

export async function GET() {
  try {
    await connectDB();

    const shortlets = await Shortlet.find().sort({ createdAt: -1 });

    return NextResponse.json(shortlets);
  } catch (error) {
    console.error("Failed to fetch shortlets:", error);
    return NextResponse.json(
      { message: "Error fetching shortlets", error: error.message },
      { status: 500 }
    );
  }
}
