import crypto from "crypto";
import { NextResponse } from "next/server";

import dbConnect from "@/lib/dbConnect";
import BookingPending from "@/models/BookingPending";

/** ----------------------------------------------------------------
 *  🔔  PAYSTACK WEBHOOK  – App-router route
 *  ----------------------------------------------------------------
 *  Paystack sends a POST with:
 *    •   raw JSON body
 *    •   header `x-paystack-signature`
 *-----------------------------------------------------------------*/
export async function POST(req) {
  // 1️⃣  — read raw body (important: DO NOT parse first)
  const rawBody = await req.text();

  // 2️⃣  — verify signature
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  const signature = req.headers.get("x-paystack-signature");
  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 3️⃣  — we’re good; now parse JSON
  const event = JSON.parse(rawBody);

  // We only care about successful charges
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const data = event.data;
  const { reference } = data;
  const pendingId = data.metadata?.pendingId; // you sent this from client

  if (!pendingId) {
    return NextResponse.json(
      { error: "pendingId missing in metadata" },
      { status: 400 }
    );
  }

  await dbConnect();

  // 4️⃣  — grab the pending-booking record
  const pending = await BookingPending.findById(pendingId);
  if (!pending) {
    return NextResponse.json(
      { error: "Pending booking not found" },
      { status: 404 }
    );
  }

  // 5️⃣  — build payload for addBooking API  (uses existing email + notification flow)
  const payload = {
    shortlet: pending.shortlet,
    user: pending.user,
    checkInDate: pending.checkInDate,
    checkOutDate: pending.checkOutDate,
    totalAmount: pending.totalAmount,
    status: "confirmed",
    guests: pending.guests,
    paymentReference: reference,
    paid: true,
    channel: pending.channel,
    verifiedAt: new Date(),
  };

  // 6️⃣  — call internal add-booking route
  // NOTE: use your own site URL (env or hard-code). In Vercel use VERCE_URL or custom domain.
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || "https://your-site.com";
  const res = await fetch(`${baseURL}/api/bookings/addBooking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": process.env.INTERNAL_WEBHOOK_SECRET,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Add-Booking failed:", err);
    return NextResponse.json(
      { error: "Failed to finalise booking" },
      { status: 500 }
    );
  }

  // 7️⃣  — clean up pending doc
  await BookingPending.deleteOne({ _id: pendingId });

  return NextResponse.json({ success: true });
}

/*  No matcher/config section needed – all /api/webhook/* routes are covered. */
