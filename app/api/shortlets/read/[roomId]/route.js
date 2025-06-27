import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Shortlet from "@/models/Shortlet";

export async function GET(request) {
  try {
    await dbConnect();

    // Extract the dynamic segment from the URL
    const url = new URL(request.url);
    const pathnameParts = url.pathname.split("/");
    const roomId = pathnameParts[pathnameParts.length - 1];

    const room = await Shortlet.findById(roomId);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(room, { status: 200 });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
