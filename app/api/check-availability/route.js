import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect"; // Your MongoDB connection utility
import Booking from "@/models/Booking"; // Mongoose model for bookings

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const checkInDate = searchParams.get("checkInDate");
  const checkOutDate = searchParams.get("checkOutDate");

  if (!roomId || !checkInDate || !checkOutDate) {
    return NextResponse.json(
      { message: "Missing required query parameters." },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Check for existing bookings that overlap
    const existingBooking = await Booking.findOne({
      roomId,
      $or: [
        {
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gt: checkIn },
        },
      ],
    });

    const isAvailable = !existingBooking;

    return NextResponse.json({ available: isAvailable }, { status: 200 });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { message: "Server error while checking availability." },
      { status: 500 }
    );
  }
}
