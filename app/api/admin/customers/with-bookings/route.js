// app/api/admin/customers/with-bookings/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

export async function GET(request) {
  try {
    // const token = await getToken({ req: request, secret: JWT_SECRET });
    // if (!token || token.role !== "admin") {
    //   return NextResponse.json({ error: "Admins only" }, { status: 403 });
    // }

    await dbConnect();

    // Aggregate booking counts grouped by user
    const agg = await Booking.aggregate([
      { $group: { _id: "$user", bookingsCount: { $sum: 1 } } },
    ]);

    // Return map: { userId: count, ... } and list
    const map = {};
    const list = [];
    agg.forEach((r) => {
      const id = String(r._id);
      map[id] = r.bookingsCount || 0;
      list.push({ userId: id, bookingsCount: r.bookingsCount || 0 });
    });

    return NextResponse.json({ map, list });
  } catch (err) {
    console.error("with-bookings route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch booking users" },
      { status: 500 }
    );
  }
}
