import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import User from "@/models/User";
import Notification from "@/models/Notification"; // ✅ import the model
import { sendEmail } from "@/lib/email/sendEmail";

export async function POST(req) {
  try {
    await dbConnect();
    const { userId, shortletId, description, price, requestedBy, bookingId } =
      await req.json();

    if (!userId || !shortletId || !description || !price || !requestedBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Create the service
    const newService = await Service.create({
      user: userId,
      shortlet: shortletId,
      description,
      price,
      requestedBy,
      booking: bookingId || null,
    });

    // 2. Compose email
    const html = `
      <div style="font-family: sans-serif; line-height: 1.6">
        <p>Hi <strong>${user.name || "Guest"}</strong>,</p>
        <p>A new service has been added to your account:</p>
        <ul>
          <li><strong>Description:</strong> ${description}</li>
          <li><strong>Amount:</strong> ₦${price.toLocaleString()}</li>
        </ul>
        <p>Please log in to your account to proceed with payment.</p>
        <br />
        <p>Thank you!<br/>Towson Apartments & Homes Admin Team</p>
      </div>
    `;

    // 3. Send email
    await sendEmail({
      to: user.email,
      subject: "New Service Added",
      html,
    });

    // 4. Create notification
    await Notification.create({
      user: userId,
      message: `A new service has been added to your account: ${description} (₦${price.toLocaleString()})`,
      read: false,
    });

    return NextResponse.json({ success: true, service: newService });
  } catch (error) {
    console.error("Service API Error:", error);
    return NextResponse.json(
      { error: "Failed to add service" },
      { status: 500 }
    );
  }
}
