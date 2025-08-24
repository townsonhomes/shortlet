import ExcelJS from "exceljs";
import { getToken } from "next-auth/jwt";
import {
  computeAnalytics,
  generateMockAnalytics,
  parseDateParam,
} from "../lib/analyticsUtils.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

// Helper: normalize series into { label, value }
function normalizeRevenueSeries(src) {
  const arr = src || [];
  return arr.map((p) => {
    const label =
      p.label ||
      p.x ||
      (p._id && p._id.year && p._id.month
        ? `${p._id.year}-${String(p._id.month).padStart(2, "0")}`
        : "");
    const value = Number(
      p.total ?? p.totalRevenue ?? p.value ?? p.y ?? p.count ?? 0
    );
    return { label, value };
  });
}
function normalizeBookingsSeries(src) {
  const arr = src || [];
  return arr.map((p) => {
    const label =
      p.label ||
      p.x ||
      (p._id ? `${p._id.year}-${String(p._id.month).padStart(2, "0")}` : "");
    const value = Number(p.count ?? p.value ?? p.y ?? p.bookings ?? 0);
    return { label, value };
  });
}

function styleHeaderRow(row, opts = {}) {
  // default blue header
  const bg = opts.bg || "FF1F6FEB"; // ARGB
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: bg },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
}

function autosizeColumns(ws) {
  ws.columns.forEach((col) => {
    let maxLen = 10;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const v = cell.value ?? "";
      const l = String(v).length;
      if (l > maxLen) maxLen = l;
    });
    col.width = Math.min(Math.max(maxLen + 2, 12), 60);
  });
}

/**
 * Fetch analytics for a given start/end (YYYY-MM-DD strings).
 * - Will fall back to a sensible default range (last 30 days) if missing/invalid.
 * - Tries computeAnalytics (DB) first, falls back to generateMockAnalytics.
 * - Returns an object compatible with the frontend and with revenueSeries/bookingsSeries arrays.
 */
async function fetchAnalyticsForRange(startStr, endStr) {
  // parse using helper (keeps midnight / endOfDay handling)
  let rangeStart = parseDateParam(startStr, false);
  let rangeEnd = parseDateParam(endStr, true);

  // default to last 30 days if parse failed
  if (!rangeStart || !rangeEnd) {
    const now = new Date();
    const e = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );
    const s = new Date(now);
    s.setDate(now.getDate() - 29);
    s.setHours(0, 0, 0, 0);
    rangeStart = rangeStart || s;
    rangeEnd = rangeEnd || e;
  }

  // attempt DB-backed computeAnalytics if available
  try {
    if (typeof computeAnalytics === "function") {
      const data = await computeAnalytics({
        rangeStart,
        rangeEnd,
        useMock: false,
      });
      // Ensure we return consistent series shapes for the exporter and frontend
      const revenueSeries =
        data.revenue && data.revenue.monthly && data.revenue.monthly.length
          ? normalizeRevenueSeries(data.revenue.monthly)
          : normalizeRevenueSeries(
              data.revenueSeries || data.revenueMonthly || []
            );

      const bookingsSeries =
        data.bookings &&
        data.bookings.bookingsTrend &&
        data.bookings.bookingsTrend.length
          ? normalizeBookingsSeries(data.bookings.bookingsTrend)
          : normalizeBookingsSeries(
              data.bookingsSeries || data.bookings?.series || []
            );

      return {
        ...data,
        revenueSeries,
        bookingsSeries,
        range: { start: rangeStart.toISOString(), end: rangeEnd.toISOString() },
      };
    }
  } catch (err) {
    console.error("computeAnalytics failed, falling back to mock:", err);
    // fall through to mock
  }

  // fallback: generate mock analytics
  const mocked = generateMockAnalytics(rangeStart, rangeEnd);
  const revenueSeries =
    mocked.revenue && mocked.revenue.monthly
      ? normalizeRevenueSeries(mocked.revenue.monthly)
      : normalizeRevenueSeries(mocked.revenueSeries || []);
  const bookingsSeries =
    mocked.bookings && mocked.bookings.bookingsTrend
      ? normalizeBookingsSeries(mocked.bookings.bookingsTrend)
      : normalizeBookingsSeries(
          mocked.bookingsSeries || mocked.bookings?.series || []
        );

  return {
    ...mocked,
    revenueSeries,
    bookingsSeries,
    range: { start: rangeStart.toISOString(), end: rangeEnd.toISOString() },
  };
}

export async function GET(request) {
  try {
    // auth (adjust as needed)
    const token = await getToken({ req: request, secret: JWT_SECRET });
    if (!token || token.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admins only" }), {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    const url = new URL(request.url);
    const start = url.searchParams.get("start") || "";
    const end = url.searchParams.get("end") || "";

    // fetch analytics (DB or mock)
    const analytics = await fetchAnalyticsForRange(start, end);

    // Workbook and sheets
    const wb = new ExcelJS.Workbook();
    wb.creator = token?.name || "admin";
    wb.created = new Date();

    // 1) Summary sheet
    const s1 = wb.addWorksheet("Summary");
    s1.addRow(["Analytics Export"]);
    s1.addRow([
      `Range: ${analytics.range?.start ?? start} → ${
        analytics.range?.end ?? end
      }`,
    ]);
    s1.addRow([`Exported: ${new Date().toISOString()}`]);
    s1.addRow([]); // blank line

    s1.addRow(["Metric", "Value"]);
    styleHeaderRow(s1.getRow(s1.lastRow.number));
    const summaryRows = [
      ["Start", analytics.range?.start ?? start],
      ["End", analytics.range?.end ?? end],
      [
        "Total Booking Revenue",
        analytics.totalBookingRevenue ?? analytics.revenue?.total ?? 0,
      ],
      [
        "Total Service Revenue",
        analytics.totalServiceRevenue ?? analytics.services?.revenue ?? 0,
      ],
      [
        "Total Revenue",
        analytics.totalRevenue ??
          (analytics.totalBookingRevenue ?? analytics.revenue?.total ?? 0) +
            (analytics.totalServiceRevenue ?? analytics.services?.revenue ?? 0),
      ],
      [
        "Avg booking value",
        analytics.bookings?.avgBookingValue ??
          analytics.bookings?.avgBookingValue ??
          "",
      ],
      ["Avg length of stay (days)", analytics.bookings?.avgLengthOfStay ?? ""],
      [
        "Repeat customer rate (%)",
        analytics.users?.repeatCustomerRate ??
          analytics.users?.repeatCustomerRate ??
          "",
      ],
    ];
    summaryRows.forEach((r) => s1.addRow(r));
    autosizeColumns(s1);

    // 2) Revenue series sheet
    const s2 = wb.addWorksheet("Revenue");
    s2.addRow(["Month", "Amount (₦)"]);
    styleHeaderRow(s2.getRow(1), { bg: "FF2D9CDB" });
    (analytics.revenueSeries || []).forEach((p) => {
      s2.addRow([p.label ?? p.x ?? "", Number(p.value ?? p.total ?? 0)]);
    });
    autosizeColumns(s2);

    // 3) Bookings series sheet
    const s3 = wb.addWorksheet("Bookings");
    s3.addRow(["Month", "Count"]);
    styleHeaderRow(s3.getRow(1), { bg: "FF7ED957" });
    (analytics.bookingsSeries || []).forEach((p) => {
      s3.addRow([p.label ?? p.x ?? "", Number(p.value ?? p.count ?? 0)]);
    });
    autosizeColumns(s3);

    // 4) Top properties
    const s4 = wb.addWorksheet("Top Properties");
    s4.addRow(["Rank", "Title", "Bookings Count", "Revenue (₦)"]);
    styleHeaderRow(s4.getRow(1), { bg: "FF9B59B6" });
    (analytics.topShortletsByRevenue || []).forEach((sitem, i) => {
      s4.addRow([
        i + 1,
        sitem.title ?? "Untitled",
        sitem.bookingsCount ?? 0,
        sitem.revenue ?? sitem.totalRevenue ?? sitem.bookingRevenue ?? 0,
      ]);
    });
    autosizeColumns(s4);

    // 5) Top customers
    const s5 = wb.addWorksheet("Top Customers");
    s5.addRow(["Rank", "Name", "Email", "Total Spent (₦)"]);
    styleHeaderRow(s5.getRow(1), { bg: "FFEB7A00" });
    (analytics.users?.topCustomers || analytics.topCustomers || []).forEach(
      (c, i) => {
        s5.addRow([
          i + 1,
          c.name ?? c.email ?? "—",
          c.email ?? "",
          c.totalSpent ?? c.total ?? 0,
        ]);
      }
    );
    autosizeColumns(s5);

    // Finalize and send buffer
    const buffer = await wb.xlsx.writeBuffer();
    const filename = `analytics-${
      analytics.range?.start || start || "all"
    }_to_${analytics.range?.end || end || "all"}.xlsx`;

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("analytics export error:", err);
    return new Response(JSON.stringify({ error: "Failed to generate XLSX" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }
}
