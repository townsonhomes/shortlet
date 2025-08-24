// app/api/admin/bookings/export/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import Shortlet from "@/models/Shortlet";
import User from "@/models/User";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

/**
 * Optional query params:
 *  - start=YYYY-MM-DD
 *  - end=YYYY-MM-DD
 *  - status=confirmed|cancelled
 *
 * Produces CSV where each booking is one row and Services are grouped into one quoted cell.
 */
export async function GET(request) {
  try {
    const token = await getToken({ req: request, secret: JWT_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    await dbConnect();

    const url = new URL(request.url);
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");
    const status = url.searchParams.get("status");

    const match = {};
    if (start || end) {
      match.createdAt = {};
      if (start) match.createdAt.$gte = new Date(start);
      if (end) {
        // include end day
        const e = new Date(end);
        e.setHours(23, 59, 59, 999);
        match.createdAt.$lte = e;
      }
    }
    if (status) match.status = status;

    // fetch bookings with populated user & shortlet
    const bookings = await Booking.find(match)
      .populate("user", "name email")
      .populate("shortlet", "title")
      .sort({ createdAt: -1 })
      .lean();

    const bookingIds = bookings.map((b) => b._id);

    // fetch services grouped by booking
    const services = await Service.find({ booking: { $in: bookingIds } })
      .populate("requestedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const servicesByBooking = services.reduce((acc, s) => {
      const bid = String(s.booking);
      if (!acc[bid]) acc[bid] = [];
      acc[bid].push(s);
      return acc;
    }, {});

    // CSV builder
    const escapeCell = (v) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const headers = [
      "Booking ID",
      "Guest Name",
      "Guest Email",
      "Room Title",
      "Check-in",
      "Check-out",
      "Booking Amount",
      "Booking Paid",
      "Booking Status",
      "Service Count",
      "Services (grouped)",
      "BookingRevenue",
      "ServicesRevenue",
      "TotalRevenue",
    ];

    const formatDate = (d) => {
      if (!d) return "";
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return "";
      const dd = String(dt.getDate()).padStart(2, "0");
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      const yy = dt.getFullYear();
      return `${dd}/${mm}/${yy}`;
    };

    const currency = (n) =>
      n === null || n === undefined
        ? ""
        : `₦${new Intl.NumberFormat("en-NG").format(Number(n) || 0)}`;

    const rows = bookings.map((b) => {
      const bid = String(b._id);
      const svc = servicesByBooking[bid] || [];

      const servicesStr = svc
        .map(
          (s, i) =>
            `${i + 1}) ${s.description} (requestedBy: ${
              s.requestedBy?.name || s.requestedBy?.email || "-"
            }; price: ${currency(s.price)}; paymentStatus: ${
              s.paymentStatus || "unpaid"
            }; created: ${formatDate(s.createdAt)})`
        )
        .join(" \n"); // newline inside quoted cell for readability

      const bookingRevenue = Number(b.totalAmount || 0);
      const servicesRevenue = svc
        .filter((x) => x.paymentStatus === "paid")
        .reduce((acc, x) => acc + (Number(x.price) || 0), 0);
      const totalRevenue = bookingRevenue + servicesRevenue;

      const row = [
        bid,
        b.user?.name || "",
        b.user?.email || "",
        b.shortlet?.title || "",
        formatDate(b.checkInDate),
        formatDate(b.checkOutDate),
        Number(b.totalAmount || 0),
        b.paid ? "TRUE" : "FALSE",
        b.status === "cancelled"
          ? "checked out"
          : b.status === "confirmed"
          ? "checked in"
          : b.status,
        svc.length,
        servicesStr,
        bookingRevenue,
        servicesRevenue,
        totalRevenue,
      ];
      return row.map(escapeCell).join(",");
    });

    const bom = "\uFEFF";
    const csv = bom + [headers.map(escapeCell).join(","), ...rows].join("\r\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="bookings-${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("bookings export error:", err);
    return NextResponse.json(
      { error: "Failed to export bookings" },
      { status: 500 }
    );
  }
}
