// app/api/admin/bookings/[id]/details/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import Shortlet from "@/models/Shortlet";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

export async function GET(req, context) {
  const params = await context.params;
  try {
    // auth: admin only
    const token = await getToken({ req, secret: JWT_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    const bookingId = params?.id;
    if (!bookingId) {
      return NextResponse.json(
        { error: "Missing booking id" },
        { status: 400 }
      );
    }

    await dbConnect();

    // fetch booking with lightweight populates
    const booking = await Booking.findById(bookingId)
      .populate("user", "name email")
      .populate("shortlet", "title")
      .lean();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // fetch services tied to this booking
    const services = await Service.find({ booking: booking._id })
      .populate("user", "name email")
      .populate("requestedBy", "name email")
      .lean();

    // compute booking revenue (only if paid - follow your analytics behavior)
    const bookingRevenue = booking.paid ? Number(booking.totalAmount || 0) : 0;

    // compute services revenue (sum of paid services.price)
    const servicesRevenue = (services || []).reduce((acc, s) => {
      return acc + (s.paymentStatus === "paid" ? Number(s.price || 0) : 0);
    }, 0);

    const totalRevenue = bookingRevenue + servicesRevenue;

    return NextResponse.json({
      booking,
      services,
      totals: {
        bookingRevenue,
        servicesRevenue,
        totalRevenue,
      },
    });
  } catch (err) {
    console.error("Booking details error:", err);
    return NextResponse.json(
      { error: "Failed to fetch booking details" },
      { status: 500 }
    );
  }
}
