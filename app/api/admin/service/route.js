// app/api/admin/service/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { sendEmail } from "@/lib/email/sendEmail";
import crypto from "crypto";

/** small helper to generate a hex ref */
function generateRef(len = 16) {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString("hex")
    .slice(0, len);
}

export async function POST(req) {
  try {
    await dbConnect();

    const {
      userId,
      shortletId,
      description,
      price,
      requestedBy,
      bookingId,
      paid = false,
      paymentReference: providedRef,
    } = await req.json();

    // validation
    if (
      !userId ||
      !shortletId ||
      !description ||
      price === undefined ||
      !requestedBy
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).select("name email");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare service document according to your schema
    const serviceData = {
      user: userId,
      shortlet: shortletId,
      description,
      price: Number(price),
      requestedBy,
      booking: bookingId || null,
      paymentReference: undefined,
      paymentStatus: paid ? "paid" : "unpaid",
    };

    // If admin flagged as paid, ensure paymentReference exists (generate if not)
    if (paid) {
      serviceData.paymentReference =
        (providedRef && String(providedRef).trim()) || generateRef(16);
    }

    const newService = await Service.create(serviceData);

    // Compose email + notification flows
    if (paid) {
      // Paid email
      const html = `
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; color: #333; border-radius: 8px;">
    <h2 style="color: #222;">Hello <span style="color: #f59e0b;">${
      user.name || "Guest"
    }</span>,</h2>

    <p style="font-size: 15px;">
      We're pleased to inform you that your payment has been <strong style="color: green;">successfully confirmed</strong> for the following service:
    </p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Description:</td>
        <td style="padding: 8px 0;">${newService.description}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Amount:</td>
        <td style="padding: 8px 0;">₦${Number(
          newService.price
        ).toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Reference:</td>
        <td style="padding: 8px 0;">${newService.paymentReference || ""}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Status:</td>
        <td style="padding: 8px 0; color: green;"><strong>Paid</strong></td>
      </tr>
    </table>

    <p style="font-size: 14px;">
      You will also receive an official receipt if applicable.
    </p>

    <p style="margin-top: 30px; font-size: 14px;">
      Thank you.<br/>
      <span style="color: #999;">— Admin Team</span>
    </p>
  </div>
      `;

      try {
        await sendEmail({
          to: user.email,
          subject: "Service Payment Confirmed",
          html,
        });
      } catch (e) {
        console.error("Failed to send paid service email:", e);
      }

      try {
        await Notification.create({
          user: user._id,
          message: `Your payment for the service "${newService.description}" was successful.`,
          read: false,
        });
      } catch (e) {
        console.error("Failed to create paid notification:", e);
      }
    } else {
      // Unpaid flow — request payment email + notification
      const html = `
      <div style="font-family: sans-serif; line-height: 1.6">
        <p>Hi <strong>${user.name || "Guest"}</strong>,</p>
        <p>A new service has been added to your account:</p>
        <ul>
          <li><strong>Description:</strong> ${newService.description}</li>
          <li><strong>Amount:</strong> ₦${Number(
            newService.price
          ).toLocaleString()}</li>
        </ul>
        <p>Please log in to your account to proceed with payment.</p>
        <br />
        <p>Thank you!<br/>Admin Team</p>
      </div>
    `;

      try {
        await sendEmail({ to: user.email, subject: "New Service Added", html });
      } catch (e) {
        console.error("Failed to send new service email:", e);
      }

      try {
        await Notification.create({
          user: user._id,
          message: `A new service has been added to your account: ${
            newService.description
          } (₦${Number(newService.price).toLocaleString()})`,
          read: false,
        });
      } catch (e) {
        console.error("Failed to create unpaid notification:", e);
      }
    }

    return NextResponse.json({ success: true, service: newService });
  } catch (error) {
    console.error("Service API Error:", error);
    return NextResponse.json(
      { error: "Failed to add service" },
      { status: 500 }
    );
  }
}
