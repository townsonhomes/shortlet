// app/api/admin/analytics/lib/analyticsUtils.js
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import User from "@/models/User";
import Shortlet from "@/models/Shortlet";
import mockData from "./mockData.js"; // relative path within analytics/lib

/**
 * parseDateParam(dateStr, endOfDay=false)
 * - Parse YYYY-MM-DD into a Date at local midnight (or end of day)
 * - returns null for invalid formats
 */
export function parseDateParam(dateStr, endOfDay = false) {
  if (!dateStr) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split("-").map((s) => parseInt(s, 10));
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
  return endOfDay
    ? new Date(y, m - 1, d, 23, 59, 59, 999)
    : new Date(y, m - 1, d, 0, 0, 0, 0);
}

/** return array of { year, month } from start..end inclusive */
export function monthsBetween(start, end) {
  const months = [];
  const s = new Date(start.getFullYear(), start.getMonth(), 1);
  const e = new Date(end.getFullYear(), end.getMonth(), 1);
  const cur = new Date(s);
  while (cur <= e) {
    months.push({ year: cur.getFullYear(), month: cur.getMonth() + 1 });
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

export function fmtMonthLabel({ year, month }) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

// deterministic pseudo random (LCG) -> stable per seed
export function pseudoRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  s = (s * 16807) % 2147483647;
  return s / 2147483647;
}

/**
 * generateMockAnalytics(rangeStart, rangeEnd)
 * - Uses concrete mockData arrays to produce analytics
 * - Returns an object compatible with computeAnalytics output
 */
export function generateMockAnalytics(rangeStart, rangeEnd) {
  // parse ISO dates safely
  const parse = (v) => (typeof v === "string" ? new Date(v) : v);

  // use arrays from mockData
  const bookings = (mockData.bookings || []).map((b) => ({
    ...b,
    createdAt: parse(b.createdAt),
  }));
  const users = (mockData.users || []).map((u) => ({
    ...u,
    createdAt: parse(u.createdAt),
  }));
  const shortlets = mockData.shortlets || [];
  const services = (mockData.services || []).map((s) => ({
    ...s,
    createdAt: parse(s.createdAt),
  }));

  // helper: is createdAt between range (inclusive)
  function inRange(itemDate) {
    if (!itemDate) return false;
    const d = itemDate instanceof Date ? itemDate : new Date(itemDate);
    return d >= rangeStart && d <= rangeEnd;
  }

  // months between
  const months = monthsBetween(rangeStart, rangeEnd);

  // users by month (count users.createdAt inside each month)
  const usersByMonth = months.map((m) => {
    const monthStart = new Date(m.year, m.month - 1, 1, 0, 0, 0, 0);
    const monthEnd = new Date(m.year, m.month - 1 + 1, 1, 0, 0, 0, 0);
    monthEnd.setMilliseconds(-1);
    const total = users.filter(
      (u) =>
        new Date(u.createdAt) >= monthStart && new Date(u.createdAt) <= monthEnd
    ).length;
    return { _id: { year: m.year, month: m.month }, total };
  });

  // revenue by month (paid bookings whose createdAt falls in the month)
  const revenueMonthly = months.map((m) => {
    const monthStart = new Date(m.year, m.month - 1, 1, 0, 0, 0, 0);
    const monthEnd = new Date(m.year, m.month - 1 + 1, 1, 0, 0, 0, 0);
    monthEnd.setMilliseconds(-1);
    const total = bookings
      .filter(
        (b) =>
          b.paid &&
          new Date(b.createdAt) >= monthStart &&
          new Date(b.createdAt) <= monthEnd
      )
      .reduce((s, b) => s + (Number(b.totalAmount) || 0), 0);
    const count = bookings.filter(
      (b) =>
        new Date(b.createdAt) >= monthStart && new Date(b.createdAt) <= monthEnd
    ).length;
    return { _id: { year: m.year, month: m.month }, total, count };
  });

  // bookings by month (all bookings created in month, regardless of paid)
  const bookingsByMonth = months.map((m) => {
    const monthStart = new Date(m.year, m.month - 1, 1, 0, 0, 0, 0);
    const monthEnd = new Date(m.year, m.month - 1 + 1, 1, 0, 0, 0, 0);
    monthEnd.setMilliseconds(-1);
    const count = bookings.filter(
      (b) =>
        new Date(b.createdAt) >= monthStart && new Date(b.createdAt) <= monthEnd
    ).length;
    return { _id: { year: m.year, month: m.month }, count };
  });

  // totals over the provided range (using createdAt)
  const rangeBookingsList = bookings.filter((b) =>
    inRange(new Date(b.createdAt))
  );
  const rangeRevenue = rangeBookingsList
    .filter((b) => b.paid)
    .reduce((s, b) => s + (Number(b.totalAmount) || 0), 0);
  const rangeBookingsCount = rangeBookingsList.length;

  // totals global (use all mock bookings)
  const totalBookings = bookings.filter((b) => b.status === "confirmed").length;
  const cancelledBookings = bookings.filter(
    (b) => b.status === "cancelled"
  ).length;
  const paidBookings = bookings.filter((b) => b.paid).length;
  const unpaidBookings = bookings.filter((b) => !b.paid).length;

  // booking source breakdown (group by channel across mock bookings)
  const sourceMap = {};
  bookings.forEach((b) => {
    const c = b.channel || "unknown";
    sourceMap[c] = (sourceMap[c] || 0) + 1;
  });
  const bookingSourceBreakdown = Object.keys(sourceMap).map((k) => ({
    _id: k,
    count: sourceMap[k],
  }));

  // total booking revenue (all paid bookings across dataset)
  const totalBookingRevenue = bookings
    .filter((b) => b.paid)
    .reduce((s, b) => s + (Number(b.totalAmount) || 0), 0);

  // services counts and revenue
  const totalServices = services.length;
  const paidServices = services.filter(
    (s) => s.paymentStatus === "paid"
  ).length;
  const totalServiceRevenue = services
    .filter((s) => s.paymentStatus === "paid")
    .reduce((s, it) => s + (Number(it.price) || 0), 0);
  const avgServicePrice = paidServices
    ? Math.round(totalServiceRevenue / paidServices)
    : 0;

  // aggregated totals
  const totalRevenue = totalBookingRevenue + totalServiceRevenue;

  // avg length of stay (days) from confirmed bookings
  const confirmedBookingsList = bookings.filter(
    (b) => b.status === "confirmed" && b.checkInDate && b.checkOutDate
  );
  const avgLengthOfStay =
    confirmedBookingsList.length > 0
      ? confirmedBookingsList.reduce((s, b) => {
          const ci = new Date(b.checkInDate);
          const co = new Date(b.checkOutDate);
          const days = (co - ci) / (1000 * 60 * 60 * 24);
          return s + days;
        }, 0) / confirmedBookingsList.length
      : null;

  // avg booking value (paid bookings)
  const paidBookingsList = bookings.filter((b) => b.paid);
  const avgBookingValue =
    paidBookingsList.length > 0
      ? paidBookingsList.reduce((s, b) => s + (Number(b.totalAmount) || 0), 0) /
        paidBookingsList.length
      : null;

  // today metrics (if today within range)
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );
  let todayBookingRevenue = 0;
  let todayBookings = 0;
  let todayServiceRevenue = 0;
  if (startOfToday <= rangeEnd && endOfToday >= rangeStart) {
    const todayList = bookings.filter(
      (b) =>
        new Date(b.createdAt) >= startOfToday &&
        new Date(b.createdAt) <= endOfToday
    );
    todayBookingRevenue = todayList
      .filter((b) => b.paid)
      .reduce((s, b) => s + (Number(b.totalAmount) || 0), 0);
    todayBookings = todayList.length;

    const todayServiceList = services.filter(
      (s) =>
        new Date(s.createdAt) >= startOfToday &&
        new Date(s.createdAt) <= endOfToday &&
        s.paymentStatus === "paid"
    );
    todayServiceRevenue = todayServiceList.reduce(
      (s, it) => s + (Number(it.price) || 0),
      0
    );
  }
  const todayRevenue = todayBookingRevenue + todayServiceRevenue;

  // top shortlets by revenue & bookings (across dataset)
  const revenueByShortlet = {};
  const bookingsByShortlet = {};
  bookings.forEach((b) => {
    const id = b.shortlet || "unknown";
    revenueByShortlet[id] =
      (revenueByShortlet[id] || 0) + (b.paid ? Number(b.totalAmount) || 0 : 0);
    bookingsByShortlet[id] = (bookingsByShortlet[id] || 0) + 1;
  });

  const shortletsMap = {};
  shortlets.forEach((s) => (shortletsMap[s._id] = s.title || "Untitled"));

  const topShortletsByRevenue = Object.entries(revenueByShortlet)
    .map(([id, revenue]) => ({
      shortletId: id,
      title: shortletsMap[id] || id,
      revenue,
      bookingsCount: bookingsByShortlet[id] || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const topShortletsByBookings = Object.entries(bookingsByShortlet)
    .map(([id, count]) => ({
      shortletId: id,
      title: shortletsMap[id] || id,
      bookingsCount: count,
      revenue: revenueByShortlet[id] || 0,
    }))
    .sort((a, b) => b.bookingsCount - a.bookingsCount)
    .slice(0, 5);

  // top customers by spend (paid bookings)
  const spendByUser = {};
  bookings.forEach((b) => {
    if (!b.paid) return;
    const u = b.user || "unknown";
    spendByUser[u] = (spendByUser[u] || 0) + Number(b.totalAmount || 0);
  });
  const topCustomers = Object.entries(spendByUser)
    .map(([uid, total]) => {
      const user = users.find((x) => x._id === uid) || {};
      return {
        userId: uid,
        name: user.name || user.email || uid,
        email: user.email,
        totalSpent: total,
        bookings: bookings.filter((bb) => bb.user === uid).length,
      };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  // repeat customer rate (from confirmed bookings)
  const countsByUser = {};
  bookings
    .filter((b) => b.status === "confirmed")
    .forEach((b) => {
      countsByUser[b.user] = (countsByUser[b.user] || 0) + 1;
    });
  const totalCustomers = Object.keys(countsByUser).length;
  const repeatCustomers = Object.values(countsByUser).filter(
    (c) => c > 1
  ).length;
  const repeatCustomerRate = totalCustomers
    ? (repeatCustomers / totalCustomers) * 100
    : 0;

  // cancellation rate (confirmed vs cancelled)
  const confirmedCount = bookings.filter(
    (b) => b.status === "confirmed"
  ).length;
  const cancelledCount = bookings.filter(
    (b) => b.status === "cancelled"
  ).length;
  const cancellationRate =
    confirmedCount + cancelledCount === 0
      ? 0
      : (cancelledCount / (confirmedCount + cancelledCount)) * 100;

  // Format monthly arrays into expected trend shapes
  const bookingsTrend = bookingsByMonth.map((b) => ({
    label: fmtMonthLabel(b._id),
    count: b.count,
  }));
  const revenueTrend = revenueMonthly.map((r) => ({
    label: fmtMonthLabel(r._id),
    total: r.total,
    count: r.count,
  }));

  const currentBookings = totalBookings; // confirmed bookings count

  return {
    range: { start: rangeStart.toISOString(), end: rangeEnd.toISOString() },

    // --- New summary metrics you requested ---
    totalBookingRevenue, // sum of paid bookings (all mock data)
    totalServiceRevenue, // sum of paid services
    totalRevenue, // booking + service revenue
    todayBookingRevenue, // paid booking revenue created today (if today in range)
    todayServiceRevenue, // paid service revenue created today (if today in range)
    todayRevenue, // todayBookingRevenue + todayServiceRevenue
    currentBookings, // number of bookings with status === "confirmed"

    // ---- kept for backward compatibility and charts ----
    bookings: {
      total: totalBookings,
      cancelled: cancelledBookings,
      paid: paidBookings,
      unpaid: unpaidBookings,
      sourceBreakdown: bookingSourceBreakdown.reduce((acc, cur) => {
        acc[cur._id] = cur.count;
        return acc;
      }, {}),
      bookingsTrend,
      cancellationRate: Number(cancellationRate.toFixed(2)),
      range: { bookings: rangeBookingsCount, revenue: rangeRevenue },
      today: { bookings: todayBookings, revenue: todayBookingRevenue },
      avgLengthOfStay:
        avgLengthOfStay !== null ? Number(avgLengthOfStay.toFixed(2)) : null,
      avgBookingValue:
        avgBookingValue !== null ? Number(avgBookingValue.toFixed(2)) : null,
    },
    revenue: {
      // keep legacy 'total' as booking revenue for compatibility (but top-level totalBookingRevenue is the canonical field)
      total: totalBookingRevenue,
      monthly: revenueTrend,
    },
    users: {
      total: users.length,
      monthly: usersByMonth.map((u) => ({
        label: fmtMonthLabel(u._id),
        total: u.total,
      })),
      repeatCustomerRate: Number(repeatCustomerRate.toFixed(2)),
      topCustomers,
    },
    services: {
      total: totalServices,
      paid: paidServices,
      revenue: totalServiceRevenue,
      avgServicePrice,
    },
    topShortletsByBookings,
    topShortletsByRevenue,
  };
}

/** computeAnalytics by querying DB (heavy). returns object shaped same as mock. */
export async function computeAnalytics({
  rangeStart,
  rangeEnd,
  useMock = false,
}) {
  if (useMock) return generateMockAnalytics(rangeStart, rangeEnd);

  await dbConnect();

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  // booking match helpers
  const bookingPaidMatch = { paid: true };
  const bookingConfirmedMatch = { status: "confirmed" };

  const [
    totalBookings,
    cancelledBookings,
    paidBookings,
    unpaidBookings,
    bookingSourceBreakdown,
    totalBookingRevenueAgg,
    revenueByMonth,
    bookingsByMonth,
    totalUsers,
    usersByMonth,
    totalServices,
    paidServices,
    serviceRevenueAgg,
    avgLengthOfStayAgg,
    avgBookingValueAgg,
    rangeRevenueAgg,
    rangeBookingsCount,
    todayBookingRevenueAgg,
    todayBookingsCount,
    todayServiceRevenueAgg,
    topShortletsByBookingsAgg,
    topShortletsByRevenueAgg,
    topCustomersAgg,
    repeatCustomerRateAgg,
    cancellationRateAgg,
  ] = await Promise.all([
    Booking.countDocuments(bookingConfirmedMatch), // confirmed
    Booking.countDocuments({ status: "cancelled" }),
    Booking.countDocuments({ paid: true }),
    Booking.countDocuments({ paid: false }),
    Booking.aggregate([{ $group: { _id: "$channel", count: { $sum: 1 } } }]),
    Booking.aggregate([
      { $match: bookingPaidMatch },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]), // total booking revenue
    Booking.aggregate([
      { $match: bookingPaidMatch },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    User.countDocuments(),
    User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Service.countDocuments(),
    Service.countDocuments({ paymentStatus: "paid" }),
    Service.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$price" },
          avgPrice: { $avg: "$price" },
        },
      },
    ]),
    // avg length of stay (confirmed)
    Booking.aggregate([
      { $match: bookingConfirmedMatch },
      {
        $project: {
          diffDays: {
            $divide: [
              { $subtract: ["$checkOutDate", "$checkInDate"] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
      { $group: { _id: null, avgStay: { $avg: "$diffDays" } } },
    ]),
    // avg booking value (paid)
    Booking.aggregate([
      { $match: bookingPaidMatch },
      { $group: { _id: null, avg: { $avg: "$totalAmount" } } },
    ]),
    // range revenue & range bookings (createdAt within provided range)
    Booking.aggregate([
      {
        $match: {
          ...bookingPaidMatch,
          createdAt: { $gte: rangeStart, $lte: rangeEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Booking.countDocuments({ createdAt: { $gte: rangeStart, $lte: rangeEnd } }),
    // today booking revenue & count
    Booking.aggregate([
      {
        $match: {
          ...bookingPaidMatch,
          createdAt: { $gte: startOfToday, $lte: endOfToday },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Booking.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    }),
    // today service revenue (paid services created today)
    Service.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startOfToday, $lte: endOfToday },
        },
      },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]),
    // top shortlets by bookings
    Booking.aggregate([
      { $match: bookingConfirmedMatch },
      {
        $group: {
          _id: "$shortlet",
          bookingsCount: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { bookingsCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "shortlets",
          localField: "_id",
          foreignField: "_id",
          as: "shortlet",
        },
      },
      { $unwind: { path: "$shortlet", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          shortletId: "$_id",
          title: "$shortlet.title",
          bookingsCount: 1,
          revenue: 1,
        },
      },
    ]),
    // top shortlets by revenue
    Booking.aggregate([
      { $match: bookingConfirmedMatch },
      {
        $group: {
          _id: "$shortlet",
          bookingsCount: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "shortlets",
          localField: "_id",
          foreignField: "_id",
          as: "shortlet",
        },
      },
      { $unwind: { path: "$shortlet", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          shortletId: "$_id",
          title: "$shortlet.title",
          bookingsCount: 1,
          revenue: 1,
        },
      },
    ]),
    // top customers (paid bookings)
    Booking.aggregate([
      { $match: bookingPaidMatch },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$totalAmount" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          userId: "$_id",
          name: "$user.name",
          email: "$user.email",
          totalSpent: 1,
          bookings: 1,
        },
      },
    ]),
    // repeat customer rate agg
    Booking.aggregate([
      { $match: bookingConfirmedMatch },
      { $group: { _id: "$user", count: { $sum: 1 } } },
      {
        $group: {
          _id: null,
          repeatCustomers: { $sum: { $cond: [{ $gt: ["$count", 1] }, 1, 0] } },
          totalCustomers: { $sum: 1 },
        },
      },
    ]),
    // cancellation rate agg
    Booking.aggregate([
      {
        $group: {
          _id: null,
          confirmed: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          cancellationRate: {
            $cond: [
              { $eq: [{ $add: ["$confirmed", "$cancelled"] }, 0] },
              0,
              {
                $multiply: [
                  {
                    $divide: [
                      "$cancelled",
                      { $add: ["$confirmed", "$cancelled"] },
                    ],
                  },
                  100,
                ],
              },
            ],
          },
        },
      },
    ]),
  ]);

  // derived numbers
  const totalBookingRevenue =
    (totalBookingRevenueAgg && totalBookingRevenueAgg[0]?.total) || 0;
  const totalServiceRevenue =
    (serviceRevenueAgg && serviceRevenueAgg[0]?.total) || 0;
  const totalRevenue = totalBookingRevenue + totalServiceRevenue;

  const todayBookingRevenue =
    (todayBookingRevenueAgg && todayBookingRevenueAgg[0]?.total) || 0;
  const todayServiceRevenue =
    (todayServiceRevenueAgg && todayServiceRevenueAgg[0]?.total) || 0;
  const todayRevenue = todayBookingRevenue + todayServiceRevenue;

  const avgStay =
    (avgLengthOfStayAgg && avgLengthOfStayAgg[0]?.avgStay) ?? null;
  const avgBookingValue =
    (avgBookingValueAgg && avgBookingValueAgg[0]?.avg) ?? null;
  const rangeRevenue = (rangeRevenueAgg && rangeRevenueAgg[0]?.total) || 0;
  const rangeBookings = rangeBookingsCount || 0;
  const todayBookings = todayBookingsCount || 0;

  const repeatInfo =
    (repeatCustomerRateAgg && repeatCustomerRateAgg[0]) || null;
  const repeatCustomerRate =
    repeatInfo && repeatInfo.totalCustomers
      ? (repeatInfo.repeatCustomers / repeatInfo.totalCustomers) * 100
      : 0;

  const cancellationInfo =
    (cancellationRateAgg && cancellationRateAgg[0]) || null;
  const cancellationRatePercentage = cancellationInfo
    ? cancellationInfo.cancellationRate
    : 0;

  // safe map helpers (fallback to empty arrays)
  const safeBookingsByMonth = bookingsByMonth || [];
  const safeRevenueByMonth = revenueByMonth || [];
  const safeUsersByMonth = usersByMonth || [];
  const safeBookingSource = bookingSourceBreakdown || [];

  const bookingsTrend = safeBookingsByMonth.map((b) => {
    const year = b._id?.year ?? b.year ?? null;
    const month = b._id?.month ?? b.month ?? null;
    const label =
      year && month
        ? `${year}-${String(month).padStart(2, "0")}`
        : b.label || "";
    return { label, count: Number(b.count || 0) };
  });

  const revenueTrend = safeRevenueByMonth.map((r) => {
    const year = r._id?.year ?? r.year ?? null;
    const month = r._id?.month ?? r.month ?? null;
    const label =
      year && month
        ? `${year}-${String(month).padStart(2, "0")}`
        : r.label || "";
    return { label, total: Number(r.total || 0), count: Number(r.count || 0) };
  });

  // topShortlets & topCustomers come from aggregations (fall back to empty arrays)
  const topShortletsByBookingsList = topShortletsByBookingsAgg || [];
  const topShortletsByRevenueList = topShortletsByRevenueAgg || [];
  const topCustomersList = topCustomersAgg || [];

  // currentBookings is total confirmed bookings
  const currentBookings = totalBookings || 0;

  // Build final response (use safe reductions)
  return {
    range: { start: rangeStart.toISOString(), end: rangeEnd.toISOString() },

    // new requested summary metrics
    totalBookingRevenue,
    totalServiceRevenue,
    totalRevenue,
    todayBookingRevenue,
    todayServiceRevenue,
    todayRevenue,
    currentBookings,

    // legacy / chart-compatible structures
    bookings: {
      total: totalBookings || 0,
      cancelled: cancelledBookings || 0,
      paid: paidBookings || 0,
      unpaid: unpaidBookings || 0,
      sourceBreakdown: safeBookingSource.reduce((acc, cur) => {
        acc[cur._id || "unknown"] = cur.count || 0;
        return acc;
      }, {}),
      bookingsTrend,
      cancellationRate: Number((cancellationRatePercentage || 0).toFixed(2)),
      range: { bookings: rangeBookings, revenue: rangeRevenue },
      today: { bookings: todayBookings, revenue: todayBookingRevenue },
      avgLengthOfStay: avgStay !== null ? Number(avgStay.toFixed(2)) : null,
      avgBookingValue:
        avgBookingValue !== null ? Number(avgBookingValue.toFixed(2)) : null,
    },

    revenue: {
      // legacy: revenue.total remains booking revenue for backwards compatibility
      total: totalBookingRevenue,
      monthly: revenueTrend,
    },

    users: {
      total:
        totalUsers !== undefined && totalUsers !== null
          ? totalUsers
          : mockData.users
          ? mockData.users.length
          : 0,
      monthly: safeUsersByMonth.map((u) => ({
        label: `${u._id?.year ?? "?"}-${String(u._id?.month ?? 0).padStart(
          2,
          "0"
        )}`,
        total: u.total || 0,
      })),
      repeatCustomerRate: Number((repeatCustomerRate || 0).toFixed(2)),
      topCustomers: topCustomersList,
    },

    services: {
      total: totalServices || 0,
      paid: paidServices || 0,
      revenue:
        (serviceRevenueAgg && serviceRevenueAgg[0]?.total) ||
        totalServiceRevenue ||
        0,
      avgServicePrice:
        serviceRevenueAgg && serviceRevenueAgg[0]?.avgPrice
          ? Number(serviceRevenueAgg[0].avgPrice.toFixed(2))
          : avgServicePrice || 0,
    },

    topShortletsByBookings: topShortletsByBookingsList,
    topShortletsByRevenue: topShortletsByRevenueList,
  };
}

/** Simple occupancy util (not used in top-level response anymore) */
// export async function getOccupancyRate() {
//   const totalRooms = await Shortlet.countDocuments();
//   const reservedRooms = await Booking.countDocuments({ status: "confirmed" });
//   return totalRooms > 0 ? (reservedRooms / totalRooms) * 100 : 0;
// }
