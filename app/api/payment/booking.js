import dbConnect from "@/lib/dbConnect";
import BookingPending from "@/models/BookingPending";

export default async function queueBackgroundWork(raw) {
  try {
    const event = JSON.parse(raw);

    // Only care about successful charges
    if (event.event !== "charge.success") return;

    const { reference, customer, metadata } = event.data;
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
      email: customer.email,
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
