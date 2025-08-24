// app/api/admin/shortlets/[id]/metrics/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

export async function GET(request, { params }) {
  try {
    const token = await getToken({ req: request, secret: JWT_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    const id = params?.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await dbConnect();

    const bookings = await Booking.find({ shortlet: id })
      .select(
        "_id user checkInDate checkOutDate totalAmount status createdAt paid"
      )
      .populate("user", "name email")
      .lean();

    // bookings revenue (paid bookings only)
    const bookingsRevenueAgg = await Booking.aggregate([
      { $match: { shortlet: mongoose.Types.ObjectId(id), paid: true } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);
    const bookingsRevenue = bookingsRevenueAgg[0]?.total ?? 0;
    const bookingsCount = bookings.length;

    // services revenue (paid)
    const servicesAgg = await Service.aggregate([
      {
        $match: {
          shortlet: mongoose.Types.ObjectId(id),
          paymentStatus: "paid",
        },
      },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    const servicesRevenue = servicesAgg[0]?.total ?? 0;

    const totalRevenue = bookingsRevenue + servicesRevenue;

    return NextResponse.json({
      bookingsCount,
      bookingsRevenue,
      servicesRevenue,
      totalRevenue,
      bookings,
    });
  } catch (err) {
    console.error("shortlet metrics error:", err);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
