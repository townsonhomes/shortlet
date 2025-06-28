// app/api/bookings/addBooking/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Notification from "@/models/Notification";
import Shortlet from "@/models/Shortlet";

const INTERNAL_SECRET = process.env.INTERNAL_WEBHOOK_SECRET;

/* ------------------------------------------------------------------ */
/*  POST /api/bookings/addBooking                                     */
/* ------------------------------------------------------------------ */
export async function POST(req) {
  /* ──────────────────────────────────────────────────────────────── */
  /*  1.  Security-gate                                              */
  /* ----------------------------------------------------------------*/
  /*  Allow if:                                                      */
  /*  –  middleware already added a valid session token   OR         */
  /*  –  request bears our internal secret (Paystack webhook)        */
  /* ----------------------------------------------------------------*/
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

  // If there is **no** secret header, we assume the request passed through
  // your NextAuth-protected middleware → okay to continue

  /* ──────────────────────────────────────────────────────────────── */
  /*  2.  Do the usual booking work                                  */
  /* ----------------------------------------------------------------*/
  await dbConnect();
  const body = await req.json();

  const {
    shortlet: shortletId,
    user,
    checkInDate,
    checkOutDate,
    totalAmount,
    status,
    guests,
    paymentReference,
    paid,
    channel,
    verifiedAt,
  } = body;

  if (paymentReference) {
    const dup = await Booking.findOne({ paymentReference });
    if (dup) {
      return NextResponse.json(
        { error: "Booking with this reference already exists." },
        { status: 409 }
      );
    }
  }

  // Create booking
  const booking = await Booking.create({
    shortlet: shortletId,
    user,
    checkInDate,
    checkOutDate,
    totalAmount,
    status,
    guests,
    paymentReference,
    paid,
    channel,
    verifiedAt,
  });

  // Append to shortlet.bookedDates  (per-night logic stored as range)
  const shortlet = await Shortlet.findById(shortletId);
  if (!shortlet) {
    return NextResponse.json({ error: "Shortlet not found" }, { status: 404 });
  }
  shortlet.bookedDates.push({
    checkInDate: new Date(checkInDate),
    checkOutDate: new Date(checkOutDate),
  });
  await shortlet.save();

  // Notification for user
  await Notification.create({
    user,
    message: `Booking confirmed for ${
      checkInDate.toISOString().split("T")[0]
    } → ${checkOutDate.toISOString().split("T")[0]}`,
  });

  /* ──────────────────────────────────────────────────────────────── */
  return NextResponse.json(
    { message: "Booking created", booking },
    { status: 201 }
  );
}
