// app/api/admin/bookings/create/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Notification from "@/models/Notification";
import Shortlet from "@/models/Shortlet";
import User from "@/models/User";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET ?? "";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";

function generateRef(len = 16) {
  // returns hex string of roughly `len` characters
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString("hex")
    .slice(0, len);
}

export async function POST(req) {
  try {
    // 1) require admin
    const token = await getToken({ req, secret: JWT_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();

    const {
      shortletId,
      userId,
      checkInDate,
      checkOutDate,
      totalAmount: providedAmount,
      paymentReference: providedRef,
      status = "confirmed",
      guests = undefined, // not used but kept for compatibility if client sends it
    } = body;

    // basic validation
    if (!shortletId || !userId || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        {
          error:
            "shortletId, userId, checkInDate and checkOutDate are required",
        },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
    }
    if (checkOut <= checkIn) {
      return NextResponse.json(
        { error: "checkOutDate must be after checkInDate" },
        { status: 400 }
      );
    }

    // load shortlet and user
    const shortlet = await Shortlet.findById(shortletId);
    if (!shortlet) {
      return NextResponse.json(
        { error: "Shortlet not found" },
        { status: 404 }
      );
    }

    const user = await User.findById(userId).select("name email");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // calculate nights
    const msPerDay = 24 * 60 * 60 * 1000;
    // count whole nights
    const nights = Math.max(
      1,
      Math.round(Math.abs((checkOut.getTime() - checkIn.getTime()) / msPerDay))
    );

    // determine amount
    let totalAmount = providedAmount;
    if (
      totalAmount === undefined ||
      totalAmount === null ||
      totalAmount === ""
    ) {
      // fallback to pricePerDay * nights
      const pricePerDay = Number(shortlet.pricePerDay || 0);
      totalAmount = pricePerDay * nights;
    } else {
      totalAmount = Number(totalAmount);
      if (Number.isNaN(totalAmount) || totalAmount < 0) {
        return NextResponse.json(
          { error: "Invalid totalAmount" },
          { status: 400 }
        );
      }
    }

    // ensure unique paymentReference
    let paymentReference = providedRef && String(providedRef).trim();
    if (paymentReference) {
      const dup = await Booking.findOne({ paymentReference });
      if (dup) {
        return NextResponse.json(
          { error: "Booking with this payment reference already exists." },
          { status: 409 }
        );
      }
    } else {
      // generate until unique (small loop with safety limit)
      let tries = 0;
      do {
        paymentReference = generateRef(16); // 16 hex chars
        const dup = await Booking.findOne({ paymentReference });
        if (!dup) break;
        tries += 1;
      } while (tries < 5);

      // if still duplicate (extremely unlikely), append timestamp
      if (tries >= 5) {
        paymentReference = `${paymentReference}-${Date.now()}`;
      }
    }

    // Build booking payload
    const bookingPayload = {
      shortlet: shortletId,
      user: userId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalAmount,
      status,
      guests,
      paymentReference,
      paid: true,
      channel: "manual",
      verifiedAt: new Date(),
    };

    // Create booking
    const booking = await Booking.create(bookingPayload);

    // Append to shortlet.bookedDates
    shortlet.bookedDates.push({
      checkInDate: new Date(checkIn),
      checkOutDate: new Date(checkOut),
    });
    await shortlet.save();

    // Send booking email using your existing email endpoint
    // keep it fire-and-forget but await so failures are logged
    try {
      await fetch(`${BASE_URL}/api/emails/sendAPI`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.name || "",
          shortlet: shortlet.title,
          checkInDate: checkIn.toISOString(),
          checkOutDate: checkOut.toISOString(),
          totalAmount,
        }),
      });
    } catch (e) {
      // don't fail the booking if email fails — log and continue
      console.error("Failed to send booking email:", e);
    }

    // Notification for user
    try {
      await Notification.create({
        user: userId,
        message: `Booking confirmed for ${
          checkIn.toISOString().split("T")[0]
        } → ${checkOut.toISOString().split("T")[0]}`,
      });
    } catch (e) {
      console.error("Failed to create notification:", e);
    }

    return NextResponse.json(
      { message: "Booking created", booking },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create booking error:", err);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
