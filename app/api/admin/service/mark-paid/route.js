import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import User from "@/models/User";
import { sendEmail } from "@/lib/email/sendEmail";
import Notification from "@/models/Notification";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function PUT(req) {
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
    if (existing.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "Service already marked as paid" },
        { status: 400 }
      );
    }

    // 2️⃣ Re-verify with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return NextResponse.json(
        { error: "Transaction verification failed" },
        { status: 400 }
      );
    }

    // 4️⃣ Update the service record
    existing.paymentStatus = "paid";
    existing.paymentReference = reference;
    await existing.save();

    // 5️⃣ Send confirmation email
    const user = await User.findById(existing.user);
    const html = `
      <div style="font-family: sans-serif; line-height: 1.6">
        <p>Hi <strong>${user.name || "Guest"}</strong>,</p>
        <p>Your payment for the following service has been confirmed:</p>
        <ul>
          <li><strong>Description:</strong> ${existing.description}</li>
          <li><strong>Amount:</strong> ₦${existing.price.toLocaleString()}</li>
          <li><strong>Status:</strong> Paid</li>
        </ul>
        <p>You will receive an official receipt from Paystack via email shortly.</p>
        <br/>
        <p>Thanks for using our service.<br/>Townson Homes Admin</p>
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
