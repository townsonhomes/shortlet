// app/api/shortlets/search/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Shortlet from "@/models/Shortlet";
import { isBookingOverlap } from "@/utils/dateUtils";

export async function GET(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const checkInParam = searchParams.get("checkInDate");
  const checkOutParam = searchParams.get("checkOutDate");

  try {
    let shortlets;

    // No filters? Return all shortlets
    if (!category && !checkInParam && !checkOutParam) {
      shortlets = await Shortlet.find().sort({ createdAt: -1 });
      return NextResponse.json(shortlets, { status: 200 });
    }

    const query = {};
    if (category) query.category = category;

    shortlets = await Shortlet.find(query);

    // If both check-in and check-out dates are present, filter for availability
    if (checkInParam && checkOutParam) {
      const requestCheckIn = new Date(checkInParam);
      const requestCheckOut = new Date(checkOutParam);

      shortlets = shortlets.filter((shortlet) => {
        const hasOverlap = shortlet.bookedDates.some((booking) => {
          return isBookingOverlap(
            requestCheckIn,
            requestCheckOut,
            new Date(booking.checkInDate),
            new Date(booking.checkOutDate)
          );
        });
        return !hasOverlap;
      });
    }

    return NextResponse.json(shortlets, { status: 200 });
  } catch (error) {
    console.error("Error in search route:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
