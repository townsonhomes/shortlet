import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Shortlet from "@/models/Shortlet";

export async function GET() {
  try {
    await dbConnect();
    const categories = await Shortlet.distinct("category");
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
}
