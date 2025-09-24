// app/api/admin/service/toggle-payment/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { sendEmail } from "@/lib/email/sendEmail";

/** simple ref generator (short) */
function genRef() {
  return `MANUAL-${Date.now().toString(36)}`;
}

export async function PUT(req) {
  try {
    await dbConnect();
    const { serviceId, paymentStatus } = await req.json();

    if (!serviceId || !["paid", "unpaid"].includes(paymentStatus)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Update fields
    service.paymentStatus = paymentStatus;
    if (paymentStatus === "paid") {
      service.paymentReference = service.paymentReference || genRef();
    } else {
      service.paymentReference = undefined;
    }

    await service.save();

    // If marked paid, send paid confirmation email & notification
    if (paymentStatus === "paid") {
      try {
        const user = await User.findById(service.user).select("name email");
        if (user) {
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
        <td style="padding: 8px 0;">${service.description}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Amount:</td>
        <td style="padding: 8px 0;">₦${Number(
          service.price
        ).toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Reference:</td>
        <td style="padding: 8px 0;">${service.paymentReference || ""}</td>
      </tr>
    </table>

    <p style="margin-top: 30px; font-size: 14px;">
      Thank you.<br/>
      <span style="color: #999;">— Admin Team</span>
    </p>
  </div>
          `;
          await sendEmail({
            to: user.email,
            subject: "Service Payment Confirmed",
            html,
          });
          await Notification.create({
            user: user._id,
            message: `Your payment for the service "${service.description}" was successful.`,
            read: false,
          });
        }
      } catch (e) {
        console.error("Failed to notify on manual paid toggle:", e);
      }
    }

    // 🔑 Repopulate user + shortlet so frontend doesn’t lose info
    const populatedService = await Service.findById(service._id)
      .populate("user", "name email")
      .populate("shortlet", "title")
      .lean();

    return NextResponse.json({ success: true, service: populatedService });
  } catch (err) {
    console.error("toggle-payment error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
