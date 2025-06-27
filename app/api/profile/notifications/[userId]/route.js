import { NextResponse } from "next/server";
import Notification from "@/models/Notification";
import dbConnect from "@/lib/dbConnect";

export async function GET(req, context) {
  try {
    await dbConnect();
    const { userId } = await context.params;

    const notifs = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = notifs.map((n) => ({
      _id: n._id.toString(),
      message: n.message,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
