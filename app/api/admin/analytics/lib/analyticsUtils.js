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
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(dateStr)) return null;
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
  // ensure inputs are Date objects
  rangeStart =
    typeof rangeStart === "string" ? new Date(rangeStart) : rangeStart;
  rangeEnd = typeof rangeEnd === "string" ? new Date(rangeEnd) : rangeEnd;

  // parse ISO dates safely for mock items
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
    const monthEnd = new Date(m.year, m.month, 1, 0, 0, 0, 0);
    monthEnd.setMilliseconds(-1);
    const actualStart = monthStart < rangeStart ? rangeStart : monthStart;
    const actualEnd = monthEnd > rangeEnd ? rangeEnd : monthEnd;
    const total = users.filter(
      (u) =>
        new Date(u.createdAt) >= actualStart &&
        new Date(u.createdAt) <= actualEnd
    ).length;
    return { _id: { year: m.year, month: m.month }, total };
  });

  // revenue by month (paid bookings whose createdAt falls in the month, clamped to range)
  const revenueMonthly = months.map((m) => {
    const monthStart = new Date(m.year, m.month - 1, 1, 0, 0, 0, 0);
    const monthEnd = new Date(m.year, m.month, 1, 0, 0, 0, 0);
    monthEnd.setMilliseconds(-1);

    // clamp to requested range
    const actualStart = monthStart < rangeStart ? rangeStart : monthStart;
    const actualEnd = monthEnd > rangeEnd ? rangeEnd : monthEnd;

    const total = bookings
      .filter(
        (b) =>
          b.paid &&
          new Date(b.createdAt) >= actualStart &&
          new Date(b.createdAt) <= actualEnd
      )
      .reduce((s, b) => s + (Number(b.totalAmount) || 0), 0);
    const count = bookings.filter(
      (b) =>
        new Date(b.createdAt) >= actualStart &&
        new Date(b.createdAt) <= actualEnd
    ).length;
    return { _id: { year: m.year, month: m.month }, total, count };
  });

  // bookings by month (all bookings created in month, clamped to range)
  const bookingsByMonth = months.map((m) => {
    const monthStart = new Date(m.year, m.month - 1, 1, 0, 0, 0, 0);
    const monthEnd = new Date(m.year, m.month, 1, 0, 0, 0, 0);
    monthEnd.setMilliseconds(-1);
    const actualStart = monthStart < rangeStart ? rangeStart : monthStart;
    const actualEnd = monthEnd > rangeEnd ? rangeEnd : monthEnd;
    const count = bookings.filter(
      (b) =>
        new Date(b.createdAt) >= actualStart &&
        new Date(b.createdAt) <= actualEnd
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
    total: Number(r.total ?? r.totalRevenue ?? 0),
    count: r.count,
  }));

  const currentBookings = totalBookings; // confirmed bookings count

  return {
    range: { start: rangeStart.toISOString(), end: rangeEnd.toISOString() },

    // --- New summary metrics you requested ---
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
      sourceBreakdown: bookingSourceBreakdown.reduce((acc, cur) => {
        acc[cur._id || "unknown"] = cur.count || 0;
        return acc;
      }, {}),
      bookingsTrend,
      cancellationRate: Number((cancellationRate || 0).toFixed(2)),
      range: { bookings: rangeBookings || 0, revenue: rangeRevenue || 0 },
      today: {
        bookings: todayBookings || 0,
        revenue: todayBookingRevenue || 0,
      },
      avgLengthOfStay:
        avgLengthOfStay !== null ? Number(avgLengthOfStay.toFixed(2)) : null,
      avgBookingValue:
        avgBookingValue !== null ? Number(avgBookingValue.toFixed(2)) : null,
    },

    revenue: {
      total: totalBookingRevenue || 0,
      monthly: revenueTrend,
    },

    users: {
      total:
        typeof totalUsers === "number"
          ? totalUsers
          : mockData.users
          ? mockData.users.length
          : 0,
      monthly: safeUsersByMonth.map((u) => ({
        label: fmtMonthLabel(u._id),
        total: u.total || 0,
      })),
      repeatCustomerRate: Number((repeatCustomerRate || 0).toFixed(2)),
      topCustomers,
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

// --- helpers ---
const ymLabel = (y, m) => `${y}-${String(m).padStart(2, "0")}`;

function mergeMonthly(a = [], b = [], { aKey = "total", bKey = "total" } = {}) {
  const map = new Map();
  for (const it of a) {
    const k = ymLabel(it._id.year, it._id.month);
    map.set(k, {
      year: it._id.year,
      month: it._id.month,
      a: Number(it[aKey] || 0),
      b: 0,
      countA: Number(it.count || 0),
      countB: 0,
    });
  }
  for (const it of b) {
    const k = ymLabel(it._id.year, it._id.month);
    const prev = map.get(k) || {
      year: it._id.year,
      month: it._id.month,
      a: 0,
      b: 0,
      countA: 0,
      countB: 0,
    };
    map.set(k, {
      ...prev,
      b: prev.b + Number(it[bKey] || 0),
      countB: prev.countB + Number(it.count || 0),
    });
  }
  return [...map.values()]
    .sort((x, y) => x.year - y.year || x.month - y.month)
    .map((v) => ({
      _id: { year: v.year, month: v.month },
      totalRevenue: v.a + v.b,
      count: v.countA + v.countB,
    }));
}

function ensureDate(d) {
  return d instanceof Date ? d : new Date(d);
}

/** computeAnalytics by querying DB (heavy). returns object shaped same as mock. */
export async function computeAnalytics({
  rangeStart,
  rangeEnd,
  useMock = false,
}) {
  if (useMock) return generateMockAnalytics(rangeStart, rangeEnd);

  await dbConnect();

  // normalize inputs to Date
  rangeStart = ensureDate(rangeStart);
  rangeEnd = ensureDate(rangeEnd);

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

  // reusable matches (keep simple to let indexes work)
  const bookingPaidMatch = { paid: true };
  const bookingConfirmedMatch = { status: "confirmed" };
  const withinRange = { createdAt: { $gte: rangeStart, $lte: rangeEnd } };
  const todayRange = { createdAt: { $gte: startOfToday, $lte: endOfToday } };

  // ---------------------
  // Batch 1: cheap counts
  // ---------------------
  const [
    totalBookings,
    cancelledBookings,
    paidBookings,
    unpaidBookings,
    totalUsers,
    totalServices,
    paidServices,
  ] = await Promise.all([
    Booking.countDocuments({ ...bookingConfirmedMatch, ...withinRange }), // global confirmed
    Booking.countDocuments({ status: "cancelled" }), // global cancelled
    Booking.countDocuments({ paid: true }), // global paid
    Booking.countDocuments({ paid: false }), // global unpaid
    User.countDocuments(), // global users
    Service.countDocuments(), // global services
    Service.countDocuments({ paymentStatus: "paid" }), // global paid services
  ]);

  // --------------------------------
  // Batch 2: range-scoped aggregations
  // --------------------------------
  const [
    bookingSourceBreakdown,
    rangeRevenueAgg,
    rangeBookingsCount,
    bookingsByMonth,
    usersByMonth, // (global monthly; can scope to range if desired)
    serviceRevenueAgg,
    avgLengthOfStayAgg,
    avgBookingValueAgg,
  ] = await Promise.all([
    Booking.aggregate([
      { $match: withinRange },
      { $group: { _id: "$channel", count: { $sum: 1 } } },
    ]),
    Booking.aggregate([
      { $match: { ...bookingPaidMatch, ...withinRange } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Booking.countDocuments(withinRange),
    Booking.aggregate([
      { $match: withinRange },
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
    Service.aggregate([
      { $match: { paymentStatus: "paid", ...withinRange } },
      {
        $group: {
          _id: null,
          total: { $sum: "$price" },
          avgPrice: { $avg: "$price" },
        },
      },
    ]),
    Booking.aggregate([
      { $match: { ...bookingConfirmedMatch, ...withinRange } },
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
    Booking.aggregate([
      { $match: { ...bookingPaidMatch, ...withinRange } },
      { $group: { _id: null, avg: { $avg: "$totalAmount" } } },
    ]),
  ]);

  // --------------------------------
  // Batch 3: revenue-by-month (split pipelines) & today metrics
  // --------------------------------
  const [
    bookingRevenueByMonth,
    serviceRevenueByMonth,
    todayBookingRevenueAgg,
    todayBookingsCount,
    todayServiceRevenueAgg,
  ] = await Promise.all([
    Booking.aggregate([
      { $match: { ...bookingPaidMatch, ...withinRange } },
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
    Service.aggregate([
      { $match: { paymentStatus: "paid", ...withinRange } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$price" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Booking.aggregate([
      { $match: { ...bookingPaidMatch, ...todayRange } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Booking.countDocuments(todayRange),
    Service.aggregate([
      { $match: { paymentStatus: "paid", ...todayRange } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]),
  ]);

  const revenueByMonth = mergeMonthly(
    bookingRevenueByMonth,
    serviceRevenueByMonth,
    { aKey: "total", bKey: "total" }
  );

  // --------------------------------
  // Batch 4: tops (split & merge in JS, then hydrate names)
  // --------------------------------

  // Top shortlets by bookings (confirmed, range)
  const topShortletsByBookingsAgg = await Booking.aggregate([
    { $match: { ...bookingConfirmedMatch, ...withinRange } },
    {
      $group: {
        _id: "$shortlet",
        bookingsCount: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { bookingsCount: -1 } },
    { $limit: 5 },
  ]);

  // Top shortlets by total revenue (merge bookings+services)
  // Top shortlets by total revenue (merge bookings + services) — unified aggregation
  // bookingPaidMatch and withinRange should be defined above as in your computeAnalytics
  const bookingMatch = { ...bookingPaidMatch, ...(withinRange || {}) };
  const serviceMatch = { paymentStatus: "paid", ...(withinRange || {}) };

  // Run one aggregation that unions bookings and services into a common shape
  const shortletRevenueAgg = await Booking.aggregate([
    // match bookings in-range & paid (if bookingPaidMatch contains paid: true)
    { $match: bookingMatch },

    // project common shape for bookings
    {
      $project: {
        shortlet: 1,
        amount: "$totalAmount",
        type: { $literal: "booking" },
      },
    },

    // merge in paid services in-range (same shape)
    {
      $unionWith: {
        coll: "services",
        pipeline: [
          { $match: serviceMatch },
          {
            $project: {
              shortlet: 1,
              amount: "$price",
              type: { $literal: "service" },
            },
          },
        ],
      },
    },

    // group by shortlet and compute bookings/services counts and sums
    {
      $group: {
        _id: "$shortlet",
        bookingsCount: {
          $sum: {
            $cond: [{ $eq: ["$type", "booking"] }, 1, 0],
          },
        },
        servicesCount: {
          $sum: {
            $cond: [{ $eq: ["$type", "service"] }, 1, 0],
          },
        },
        bookingRevenue: {
          $sum: {
            $cond: [{ $eq: ["$type", "booking"] }, "$amount", 0],
          },
        },
        serviceRevenue: {
          $sum: {
            $cond: [{ $eq: ["$type", "service"] }, "$amount", 0],
          },
        },
        totalRevenue: { $sum: "$amount" },
      },
    },

    // Exclude entries with null/undefined shortlet (safety)
    { $match: { _id: { $exists: true, $ne: null } } },

    // sort and limit to top 5
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 },
  ]);

  // shortletRevenueAgg now has objects like:
  // { _id: ObjectId("..."), bookingsCount: X, servicesCount: Y, bookingRevenue: N, serviceRevenue: M, totalRevenue: T }

  // hydrate shortlet titles in one query
  const shortletIds = shortletRevenueAgg.map((r) => r._id).filter(Boolean);
  const shortletDocs = await Shortlet.find(
    { _id: { $in: shortletIds } },
    { _id: 1, title: 1 }
  ).lean();

  const shortletTitleMap = new Map(
    (shortletDocs || []).map((s) => [String(s._id), s.title || "Untitled"])
  );

  // map to the final shape your frontend expects
  const topShortletsByRevenue = (shortletRevenueAgg || []).map((r) => {
    const idStr = String(r._id);
    return {
      shortletId: r._id,
      title: shortletTitleMap.get(idStr) || idStr,
      bookingsCount: Number(r.bookingsCount || 0),
      servicesCount: Number(r.servicesCount || 0),
      bookingRevenue: Number(r.bookingRevenue || 0),
      serviceRevenue: Number(r.serviceRevenue || 0),
      totalRevenue: Number(r.totalRevenue || 0),
    };
  });

  const bookingMatch2 = { ...bookingPaidMatch, ...withinRange }; // paid bookings in range
  const serviceMatch2 = { paymentStatus: "paid", ...withinRange }; // paid services in range

  const topCustomers = await Booking.aggregate([
    { $match: bookingMatch2 },
    {
      $project: {
        user: 1,
        amount: "$totalAmount",
        type: { $literal: "booking" },
      },
    },

    {
      $unionWith: {
        coll: "services",
        pipeline: [
          { $match: serviceMatch2 },
          {
            $project: {
              user: 1,
              amount: "$price",
              type: { $literal: "service" },
            },
          },
        ],
      },
    },

    {
      $group: {
        _id: "$user",
        totalSpent: { $sum: "$amount" },
        bookings: {
          $sum: {
            $cond: [{ $eq: ["$type", "booking"] }, 1, 0],
          },
        },
        services: {
          $sum: {
            $cond: [{ $eq: ["$type", "service"] }, 1, 0],
          },
        },
      },
    },

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
        services: 1,
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 5 },
  ]);

  // Repeat customer rate (within range)
  const repeatsAgg = await Booking.aggregate([
    { $match: withinRange },
    { $group: { _id: "$user", count: { $sum: 1 } } },
  ]);
  const totalCustomersRange = repeatsAgg.length;
  const repeatCustomers = repeatsAgg.reduce(
    (acc, x) => acc + (x.count > 1 ? 1 : 0),
    0
  );
  const repeatCustomerRate = totalCustomersRange
    ? (repeatCustomers / totalCustomersRange) * 100
    : 0;

  // Cancellation rate (within range)
  const cancellationAgg = await Booking.aggregate([
    { $match: withinRange },
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
  ]);
  const canc = cancellationAgg[0] || { confirmed: 0, cancelled: 0 };
  const cancellationRatePercentage =
    canc.confirmed + canc.cancelled === 0
      ? 0
      : (canc.cancelled / (canc.confirmed + canc.cancelled)) * 100;

  // ---- derive scalars / shapes ----
  const totalBookingRevenue =
    (rangeRevenueAgg && rangeRevenueAgg[0]?.total) || 0; // range-scoped
  const totalServiceRevenue =
    (serviceRevenueAgg && serviceRevenueAgg[0]?.total) || 0; // global services sum
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

  const revenueTrend = (revenueByMonth || []).map((r) => ({
    label: ymLabel(r._id.year, r._id.month),
    total: Number(r.totalRevenue || 0),
    count: Number(r.count || 0),
  }));

  const bookingsTrend = (bookingsByMonth || []).map((b) => ({
    label: ymLabel(b._id.year, b._id.month),
    count: Number(b.count || 0),
  }));

  // --- final payload (same shape as before) ---
  return {
    range: { start: rangeStart.toISOString(), end: rangeEnd.toISOString() },

    // summary metrics
    totalBookingRevenue,
    totalServiceRevenue,
    totalRevenue,
    todayBookingRevenue,
    todayServiceRevenue,
    todayRevenue,
    currentBookings: totalBookings || 0,

    bookings: {
      total: totalBookings || 0,
      cancelled: cancelledBookings || 0,
      paid: paidBookings || 0,
      unpaid: unpaidBookings || 0,
      sourceBreakdown: (bookingSourceBreakdown || []).reduce((acc, cur) => {
        acc[cur._id || "unknown"] = Number(cur.count || 0);
        return acc;
      }, {}),
      bookingsTrend,
      cancellationRate: Number(cancellationRatePercentage.toFixed(2)),
      range: {
        bookings: Number(rangeBookingsCount || 0),
        revenue: Number(totalBookingRevenue || 0),
      },
      today: {
        bookings: Number(todayBookingsCount || 0),
        revenue: Number(todayBookingRevenue || 0),
      },
      avgLengthOfStay: avgStay !== null ? Number(avgStay.toFixed(2)) : null,
      avgBookingValue:
        avgBookingValue !== null ? Number(avgBookingValue.toFixed(2)) : null,
    },

    revenue: {
      total: totalBookingRevenue, // keep legacy meaning
      monthly: revenueTrend,
    },

    users: {
      total:
        typeof totalUsers === "number"
          ? totalUsers
          : mockData.users
          ? mockData.users.length
          : 0,
      monthly: (usersByMonth || []).map((u) => ({
        label: ymLabel(u._id?.year ?? 0, u._id?.month ?? 0),
        total: Number(u.total || 0),
      })),
      repeatCustomerRate: Number(repeatCustomerRate.toFixed(2)),
      topCustomers,
    },

    services: {
      total: totalServices || 0,
      paid: paidServices || 0,
      revenue: (serviceRevenueAgg && serviceRevenueAgg[0]?.total) || 0,
      avgServicePrice:
        serviceRevenueAgg && serviceRevenueAgg[0]?.avgPrice
          ? Number(serviceRevenueAgg[0].avgPrice.toFixed(2))
          : 0,
    },

    // topShortletsByBookings,
    topShortletsByRevenue,
  };
}
