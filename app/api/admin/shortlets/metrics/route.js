// app/api/admin/shortlets/metrics/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/dbConnect";
import Shortlet from "@/models/Shortlet";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  try {
    // --- AUTH ---
    let token = null;
    try {
      token = await getToken({
        req: request,
        secret: JWT_SECRET,
      });
    } catch (e) {
      console.warn("getToken error:", e?.message ?? e);
    }

    if (!token && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    if (
      token &&
      token.role !== "admin" &&
      process.env.NODE_ENV === "production"
    ) {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    // --- DB + metrics ---
    await dbConnect();

    const shortlets = await Shortlet.find().lean();
    if (!shortlets || shortlets.length === 0) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    // Ensure we construct ObjectId instances properly (use `new`)
    const shortletIds = shortlets.map(
      (s) => new mongoose.Types.ObjectId(String(s._id))
    );

    const bookingsAgg = await Booking.aggregate([
      { $match: { shortlet: { $in: shortletIds } } },
      {
        $group: {
          _id: "$shortlet",
          bookingsCount: { $sum: 1 },
          bookingsRevenue: {
            $sum: { $cond: [{ $eq: ["$paid", true] }, "$totalAmount", 0] },
          },
        },
      },
    ]);

    const servicesAgg = await Service.aggregate([
      { $match: { shortlet: { $in: shortletIds } } },
      {
        $group: {
          _id: "$shortlet",
          servicesRevenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$price", 0],
            },
          },
        },
      },
    ]);

    const bookingsList = await Booking.find({ shortlet: { $in: shortletIds } })
      .select(
        "_id shortlet user checkInDate checkOutDate totalAmount status paid createdAt"
      )
      .populate("user", "name email")
      .lean();

    const bookingsMap = {};
    bookingsAgg.forEach((b) => {
      bookingsMap[String(b._id)] = {
        bookingsCount: b.bookingsCount || 0,
        bookingsRevenue: b.bookingsRevenue || 0,
      };
    });

    const servicesMap = {};
    servicesAgg.forEach((s) => {
      servicesMap[String(s._id)] = {
        servicesRevenue: s.servicesRevenue || 0,
      };
    });

    const bookingsByShortlet = {};
    bookingsList.forEach((bk) => {
      const sid = String(bk.shortlet);
      bookingsByShortlet[sid] = bookingsByShortlet[sid] || [];
      bookingsByShortlet[sid].push({
        _id: String(bk._id),
        userName: bk.user?.name || bk.user?.email || "Unknown",
        userEmail: bk.user?.email || "",
        checkInDate: bk.checkInDate,
        checkOutDate: bk.checkOutDate,
        totalAmount: bk.totalAmount || 0,
        paid: bk.paid || false,
        status: bk.status || "",
        createdAt: bk.createdAt,
      });
    });

    const items = shortlets.map((s) => {
      const sid = String(s._id);
      const binfo = bookingsMap[sid] || {
        bookingsCount: 0,
        bookingsRevenue: 0,
      };
      const sinfo = servicesMap[sid] || { servicesRevenue: 0 };
      const groupedBookings = bookingsByShortlet[sid] || [];

      return {
        _id: s._id,
        title: s.title || s.name || "",
        ownership: s.ownership || "",
        address: s.location || "",
        price: s.pricePerDay ?? "",
        rooms: s.rooms ?? "",
        active: s.active ?? false,
        bookingsCount: binfo.bookingsCount,
        bookingsRevenue: binfo.bookingsRevenue,
        servicesRevenue: sinfo.servicesRevenue,
        totalRevenue:
          (binfo.bookingsRevenue || 0) + (sinfo.servicesRevenue || 0),
        bookings: groupedBookings,
      };
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("shortlets metrics route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
