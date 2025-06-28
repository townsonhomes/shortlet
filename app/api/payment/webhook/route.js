import crypto from "crypto";
import { NextResponse } from "next/server";

import dbConnect from "@/lib/dbConnect";
import BookingPending from "@/models/BookingPending";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const INTERNAL_SECRET = process.env.INTERNAL_WEBHOOK_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(req) {
  /* ───────────── 1. Read raw body – don’t JSON.parse yet ───────────── */
  const rawBody = await req.text();

  /* ───────────── 2. Verify Paystack signature ───────────── */
  const expected = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (expected !== req.headers.get("x-paystack-signature")) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  /* ---------------- Acknowledge *immediately* ---------------- */
  // Paystack now has its 200 OK and will not retry.
  queueBackgroundWork(rawBody); // fire and forget
  return NextResponse.json({ received: true }, { status: 200 });
}

/* ------------------------------------------------------------------ */
/*  Background worker  – runs after we’ve answered Paystack           */
/* ------------------------------------------------------------------ */
async function queueBackgroundWork(raw) {
  console.log("body", raw);
  try {
    const event = JSON.parse(raw);

    // Only care about successful charges
    if (event.event !== "charge.success") return;

    const { reference, metadata } = event.data;
    const pendingId = metadata?.pendingId;
    if (!pendingId) throw new Error("pendingId missing in metadata");

    await dbConnect();

    /* 1️⃣  Look up the pending booking */
    const pending = await BookingPending.findById(pendingId);
    if (!pending) throw new Error("Pending booking not found");

    /* 2️⃣  Build payload for /addBooking */
    const payload = {
      shortlet: pending.shortlet,
      name: metadata.name,
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

    /* 3️⃣  POST to internal /addBooking route */
    const res = await fetch(`${BASE_URL}/api/bookings/addBooking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": INTERNAL_SECRET,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Add-booking failed:", text);
    }

    /* 4️⃣  Cleanup pending record */
    await BookingPending.deleteOne({ _id: pendingId });
  } catch (err) {
    console.error("Webhook background error:", err);
  }
}
