// app/api/admin/customers/export/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Booking from "@/models/Booking";
import Service from "@/models/Service";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

/** format date as dd/mm/yyyy (empty string on invalid) */
function formatDateShort(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yy = dt.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

// format phone for CSV so Excel opens it as text (prevents scientific notation)
function formatPhoneForCsv(phone) {
  if (phone === undefined || phone === null || String(phone).trim() === "") {
    return "";
  }
  // ensure it's a string and remove surrounding whitespace
  const s = String(phone).trim();

  // If you want to only force-text for long numeric strings, you can detect digits-only:
  // if (!/^\+?\d+$/.test(s)) return s; // leave non-numeric as-is
  // But simpler: always wrap it as text to be safe

  // Escape any double quotes (CSV escaping will later wrap whole cell)
  const escaped = s.replace(/"/g, '""');

  // Use Excel formula syntax to force text: ="123456789012"
  // This will make Excel evaluate the formula and show the number as text (not scientific).
  return `="${escaped}"`;

  // --- alternative approach (single-quote) ---
  // return `'${escaped}`; // Excel hides leading apostrophe but treats the value as text
}

/** currency formatter that prefixes with '#' as requested */
function currencyHash(n) {
  if (n === null || n === undefined || n === "") return "₦0";
  return `₦${new Intl.NumberFormat("en-NG").format(Number(n) || 0)}`;
}

/**
 * Escape CSV cell safely.
 * - If forceQuote === true, always wrap in quotes (useful for phone numbers)
 * - Wrap/escape when cell contains comma, newline or double-quotes
 */
function escapeCell(v, { forceQuote = false } = {}) {
  if (v === null || v === undefined) return '""';
  const s = String(v);
  if (forceQuote) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request) {
  try {
    // admin-only
    const token = await getToken({ req: request, secret: JWT_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    await dbConnect();

    const url = new URL(request.url);
    const haveBooked = url.searchParams.get("haveBooked") === "true";

    // fetch users (optionally filter to users who have bookings)
    let users;
    if (haveBooked) {
      // aggregate user ids who have bookings
      const userIdsAgg = await Booking.aggregate([
        { $group: { _id: "$user", count: { $sum: 1 } } },
      ]);
      const ids = userIdsAgg.map((r) => r._id).filter(Boolean);
      users = await User.find({ _id: { $in: ids } }).lean();
    } else {
      users = await User.find().lean();
    }

    // get raw user ids (no need to construct new ObjectId instances)
    const userIds = users.map((u) => u._id);

    // fetch bookings for these users (populate shortlet title and user basic info)
    const bookings = await Booking.find({ user: { $in: userIds } })
      .select(
        "_id user shortlet checkInDate checkOutDate totalAmount status paid createdAt"
      )
      .populate("shortlet", "title")
      .populate("user", "name email")
      .lean();

    // fetch services for these users (populate requestedBy)
    const services = await Service.find({ user: { $in: userIds } })
      .select(
        "_id user requestedBy description booking paymentStatus price createdAt"
      )
      .populate("requestedBy", "name email")
      .lean();

    // group bookings & services by user id
    const bookingsByUser = {};
    for (const b of bookings) {
      const uid = String(b.user?._id ?? b.user);
      if (!uid) continue;
      bookingsByUser[uid] = bookingsByUser[uid] || [];
      bookingsByUser[uid].push(b);
    }

    const servicesByUser = {};
    for (const s of services) {
      const uid = String(s.user);
      if (!uid) continue;
      servicesByUser[uid] = servicesByUser[uid] || [];
      servicesByUser[uid].push(s);
    }

    // CSV headers (add totals columns)
    const headers = [
      "User ID",
      "Name",
      "Email",
      "Phone",
      "Gender",
      "Nationality",
      "Address",
      "ID Verified",
      "Registered",
      "Bookings Count",
      "Bookings Total",
      "Services Count",
      "Services Total",
      "Total Expenditure",
      "Bookings (details)",
      "Services (details)",
    ];

    // build rows
    const rows = [];
    for (const u of users) {
      const uid = String(u._id);
      const userBookings = bookingsByUser[uid] || [];
      const userServices = servicesByUser[uid] || [];

      const bookingsTotal = userBookings.reduce(
        (s, b) => s + (Number(b.totalAmount) || 0),
        0
      );
      const servicesTotal = userServices.reduce(
        (s, si) => s + (Number(si.price) || 0),
        0
      );
      const totalExpenditure = bookingsTotal + servicesTotal;

      const bookingsDetailLines = (userBookings || [])
        .map((b, idx) => {
          const room = b.shortlet?.title || "—";
          const dates = `${formatDateShort(b.checkInDate)} → ${formatDateShort(
            b.checkOutDate
          )}`;
          // prefix money with # and format
          const amt = `₦${new Intl.NumberFormat("en-NG").format(
            Number(b.totalAmount) || 0
          )}`;
          const paid = b.paid ? "paid" : "unpaid";
          const created = formatDateShort(b.createdAt);

          // Multi-line, semantic block for this booking
          return (
            `${idx + 1}) ID: ${String(b._id)}\n` +
            `Room: ${room}\n` +
            `Dates: ${dates}\n` +
            `Amount: ${amt}\n` +
            `Status: ${paid}\n` +
            `Created: ${created}`
          );
        })
        // Use '\n\n' to visually separate bookings inside the cell; switch to '\n' if you want no blank line.
        .join("\n\n");

      // formatted service detail lines (newline separated)
      const servicesDetailLines = userServices
        .map((sitem, idx) => {
          const desc = sitem.description || "service";
          const reqBy =
            sitem.requestedBy?.name || sitem.requestedBy?.email || "—";
          const bookingRef = sitem.booking ? `${String(sitem.booking)}` : "—";
          const price = currencyHash(sitem.price); // uses your "#₦..." helper
          const payStatus = sitem.paymentStatus || "unpaid";
          const created = formatDateShort(sitem.createdAt);

          // each property on its own line; an extra blank line between services for readability
          return (
            `${idx + 1}) ${desc}\n` +
            `requestedBy: ${reqBy}\n` +
            `booking: ${bookingRef}\n` +
            `price: ${price}\n` +
            `status:${payStatus}\n` +
            `created: ${created}\n`
          );
        })
        .join("\n\n");
      const phoneForCsv = formatPhoneForCsv(u.phone);
      rows.push({
        userId: uid,
        name: u.name ?? "",
        email: u.email ?? "",
        phone: u.phone ? phoneForCsv : "",
        gender: u.gender ?? "",
        nationality: u.nationality ?? "",
        address: u.address ?? "",
        idVerified: u.isIdVerified ? "Verified" : "Unverified",
        registeredAt: u.createdAt ? formatDateShort(u.createdAt) : "",
        bookingsCount: userBookings.length,
        bookingsTotal: bookingsTotal,
        servicesCount: userServices.length,
        servicesTotal: servicesTotal,
        totalExpenditure: totalExpenditure,
        bookingsDetailLines,
        servicesDetailLines,
      });
    }

    // build CSV string (add BOM for Excel UTF-8)
    const bom = "\uFEFF";
    const csvLines = [];
    csvLines.push(headers.map((h) => escapeCell(h)).join(","));

    for (const r of rows) {
      // Build row cells in the same order as headers
      const cells = [
        escapeCell(r.userId),
        escapeCell(r.name),
        escapeCell(r.email),
        // force-quote phone so Excel won't convert to scientific notation
        escapeCell(r.phone, { forceQuote: true }),
        escapeCell(r.gender),
        escapeCell(r.nationality),
        escapeCell(r.address),
        escapeCell(r.idVerified),
        escapeCell(r.registeredAt),
        // bookings count
        escapeCell(r.bookingsCount),
        // bookings total (currency)
        escapeCell(currencyHash(r.bookingsTotal)),
        // services count
        escapeCell(r.servicesCount),
        // services total (currency)
        escapeCell(currencyHash(r.servicesTotal)),
        // total expenditure (currency)
        escapeCell(currencyHash(r.totalExpenditure)),
        // bookings / services details include newlines -> escapeCell will quote them
        escapeCell(r.bookingsDetailLines),
        escapeCell(r.servicesDetailLines),
      ];
      csvLines.push(cells.join(","));
    }

    const csv = bom + csvLines.join("\r\n");
    const filename = `customers-${new Date().toISOString().slice(0, 10)}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("customers export route error:", err);
    return NextResponse.json(
      { error: "Failed to generate CSV" },
      { status: 500 }
    );
  }
}
