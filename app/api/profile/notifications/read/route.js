import { NextResponse } from "next/server";
import Notification from "@/models/Notification";
import dbConnect from "@/lib/dbConnect";

export async function PATCH(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    await Notification.findByIdAndUpdate(id, { read: true });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
