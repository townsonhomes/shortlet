import crypto from "crypto";
import { NextResponse } from "next/server";
import bookingBackgroundWork from "../booking";
import serviceBackgroundWork from "../service";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req) {
  /* ───────────── 1. Read raw body – don’t JSON.parse yet ───────────── */
  const rawBody = await req.text();
  const event = JSON.parse(rawBody);
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

  if (event.data.metadata.reason === "booking") {
    bookingBackgroundWork(rawBody);
  } else if (event.data.metadata.reason === "service") {
    serviceBackgroundWork(rawBody);
  }
  // fire and forget
  return NextResponse.json({ received: true }, { status: 200 });
}
