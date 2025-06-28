import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import User from "@/models/User";
import { sendEmail } from "@/lib/email/sendEmail";
import Notification from "@/models/Notification";

const INTERNAL_SECRET = process.env.INTERNAL_WEBHOOK_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function PUT(req) {
  const secretHeader = req.headers.get("x-internal-secret");

  // If the request comes from the webhook, the header **must** match
  if (secretHeader) {
    if (secretHeader !== INTERNAL_SECRET) {
      return NextResponse.json(
        { error: "Forbidden (invalid internal secret)" },
        { status: 403 }
      );
    }
    // continue… (webhook is authorised)
  }

  try {
    await dbConnect();
    const { serviceId, reference } = await req.json();

    if (!serviceId || !reference) {
      return NextResponse.json(
        { error: "Missing serviceId or reference" },
        { status: 400 }
      );
    }

    // 1️⃣ Check if already marked as paid
    const existing = await Service.findById(serviceId);
    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // 4️⃣ Update the service record
    existing.paymentStatus = "paid";
    existing.paymentReference = reference;
    await existing.save();

    // 5️⃣ Send confirmation email
    const user = await User.findById(existing.user);
    const html = `
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; color: #333; border-radius: 8px;">
    <h2 style="color: #222;">Hello <span style="color: #f59e0b;">${
      user.name || "Guest"
    }</span>,</h2>

    <p style="font-size: 15px;">
      We're pleased to inform you that your payment has been <strong style="color: green;">successfully confirmed</strong> for the following:
    </p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Description:</td>
        <td style="padding: 8px 0;">${existing.description}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Amount:</td>
        <td style="padding: 8px 0;">₦${existing.price.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Status:</td>
        <td style="padding: 8px 0; color: green;"><strong>Paid</strong></td>
      </tr>
    </table>

    <p style="font-size: 14px;">
      You will also receive an official receipt directly from Paystack via email.
    </p>

    <p style="margin-top: 30px; font-size: 14px;">
      Thank you for choosing <strong>Townson Homes</strong>.<br/>
      <span style="color: #999;">— Admin Team</span>
    </p>
  </div>
`;

    await sendEmail({
      to: user.email,
      subject: "Service Payment Confirmed",
      html,
    });

    // 6️⃣ Save notification
    await Notification.create({
      user: user._id,
      message: `Your payment for the service "${existing.description}" was successful.`,
    });

    return NextResponse.json({
      success: true,
      message: "Service updated & receipt saved",
    });
  } catch (err) {
    console.error("Service update error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
