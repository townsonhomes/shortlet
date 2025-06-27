import connectDB from "@/lib/dbConnect";
import BookingPending from "@/models/BookingPending";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      shortlet,
      user,
      checkInDate,
      checkOutDate,
      totalAmount,
      guests,
      channel,
    } = body;

    if (!shortlet || !user || !checkInDate || !checkOutDate || !totalAmount) {
      return Response.json(
        { error: "Missing required booking fields" },
        { status: 400 }
      );
    }

    const pending = await BookingPending.create({
      shortlet,
      user,
      checkInDate,
      checkOutDate,
      totalAmount,
      guests,
      channel,
    });

    return Response.json({ pendingId: pending._id }, { status: 200 });
  } catch (err) {
    console.error("Error creating pending booking:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
