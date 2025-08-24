import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/sendEmail";
import Notification from "@/models/Notification";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export async function POST(req) {
  try {
    await dbConnect();

    const { email, name, message } = await req.json();

    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required." },
        { status: 400 }
      );
    }

    const subject = `Towson Apartments & Homes - Notification`;

    const html = `
      <div style="font-family: sans-serif; line-height: 1.6">
        <p>Hi <strong>${name || "User"}</strong>,</p>
        <p>${message}</p>
        <br />
        <p>Best regards,<br/>The Towson Apartments & Homes Admin Team</p>
      </div>
    `;

    // Send email
    await sendEmail({ to: email, subject, html });

    // Find user to get ID
    const user = await User.findOne({ email }).lean();
    if (user?._id) {
      await Notification.create({
        user: user._id,
        message,
        read: false,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Message email error:", err);
    return NextResponse.json(
      { error: "Failed to send message", details: err.message },
      { status: 500 }
    );
  }
}
