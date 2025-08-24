// components/analytics/AnalyticsSection.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DollarSign, Calendar, BookOpen, Layers } from "lucide-react";
import DatePicker from "react-datepicker";
import StatCard from "./StatCard";
import ChartModal from "./ChartModal";
import RevenueChart from "./RevenueChart";
import BookingsChart from "./BookingsChart";
import useAnalytics from "./hooks/useAnalytics";
import LoaderOverlay from "../LoaderOverlay";
import StatCardSkeleton from "../admin/StatCardSkeleton";

export default function AnalyticsSection({ defaultMock = false }) {
  const [activePreset, setActivePreset] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  // default date range = last 30 days (YYYY-MM-DD strings)
  const getDefault = () => {
    const now = new Date();
    const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;
    const s = new Date(now);
    s.setDate(now.getDate() - 29);
    const start = `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(s.getDate()).padStart(2, "0")}`;
    return { start, end };
  };
  const { start: defStart, end: defEnd } = getDefault();

  const {
    analytics,
    loading,
    start,
    setStart,
    end,
    setEnd,
    fetchAnalytics,
    revenueChartData,
    bookingsChartData,
    revenueChartDataForChart,
    bookingsChartDataForChart,
    setAnalytics,
  } = useAnalytics({
    initialStart: defStart,
    initialEnd: defEnd,
    mock: defaultMock,
  });

  const [rangeLabel, setRangeLabel] = useState("Last 30 days");
  const [openModal, setOpenModal] = useState(null);
  const revenueModalRef = useRef(null);
  const bookingsModalRef = useRef(null);
  const [useMock, setUseMock] = useState(defaultMock);

  useEffect(() => {
    // fetch whenever start/end/mock change (initial mount also)
    (async () => {
      try {
        const data = await fetchAnalytics(start, end, useMock);
        setRangeLabel(`${start} → ${end}`);
        if (!data) toast.error("No analytics data");
      } catch (err) {
        // already handled in hook
      }
    })();
  }, [start, end, useMock]);

  // ----------------- small helpers -----------------
  // fallback toYMD helper (remove if you already have your own)
  function toYMD(date) {
    if (!date) return "";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  }

  // When user changes start via DatePicker, immediately fetch using the new range
  async function handleStartChange(date) {
    const newStart = toYMD(date);

    // if end not set yet just update UI and don't fetch
    if (!end) {
      setRangeLabel(`${newStart} → ${end || ""}`);
      return;
    }

    // validate dates: require both valid and strictly start < end
    const s = new Date(newStart);
    const e = new Date(end);
    if (Number.isNaN(s.getTime())) {
      toast.error("Invalid start date. Please choose a valid date.");
      return;
    }
    if (Number.isNaN(e.getTime())) {
      toast.error("Invalid end date. Please choose a valid date.");
      return;
    }

    if (!(s < e)) {
      toast.error("Start date must be earlier than End date.");
      return;
    }

    try {
      setStart(newStart);
      const data = await fetchAnalytics(newStart, end, useMock);
      setRangeLabel(`${newStart} → ${end}`);
      if (!data) toast.info("No analytics for chosen range");
    } catch (err) {
      console.error("Failed to fetch after start change", err);
    }
  }

  // When user changes end via DatePicker, immediately fetch using the new range
  async function handleEndChange(date) {
    const newEnd = toYMD(date);

    // if start not set yet just update UI and don't fetch
    if (!start) {
      setRangeLabel(`${start || ""} → ${newEnd}`);
      return;
    }

    // validate dates: require both valid and strictly start < end
    const s = new Date(start);
    const e = new Date(newEnd);
    if (Number.isNaN(s.getTime())) {
      toast.error("Invalid start date. Please choose a valid date.");
      return;
    }
    if (Number.isNaN(e.getTime())) {
      toast.error("Invalid end date. Please choose a valid date.");
      return;
    }

    if (!(s < e)) {
      toast.error("Start date must be earlier than End date (strictly).");
      return;
    }

    try {
      setEnd(newEnd);
      const data = await fetchAnalytics(start, newEnd, useMock);
      setRangeLabel(`${start} → ${newEnd}`);
      if (!data) toast.info("No analytics for chosen range");
    } catch (err) {
      console.error("Failed to fetch after end change", err);
    }
  }

  // ----------------- export helpers -----------------
  const humanTimestamp = (d = new Date()) =>
    d.toLocaleString("en-GB", {
      timeZone: "Africa/Lagos",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  const fileSafeRange = (s, e) => {
    const safe = (x) => (x ? x.replace(/:/g, "-").replace(/\s+/g, "_") : "all");
    return `${safe(s)}_to_${safe(e)}`;
  };

  function formatDateReadable(d) {
    if (!d) return "";
    return new Date(d).toLocaleString("en-GB", {
      timeZone: "Africa/Lagos",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  function isFullMonthRange(startDate, endDate) {
    if (!startDate || !endDate) return false;
    if (startDate.getDate() !== 1) return false;
    const last = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
    ).getDate();
    return (
      startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() === endDate.getMonth() &&
      endDate.getDate() === last
    );
  }
  function formatRangeLabelForSheet(startDate, endDate, fallbackLabel) {
    if (startDate && endDate) {
      if (isFullMonthRange(startDate, endDate)) {
        return startDate.toLocaleString("en-GB", {
          timeZone: "Africa/Lagos",
          month: "short",
          year: "numeric",
        });
      }
      return `${formatDateReadable(startDate)} → ${formatDateReadable(
        endDate
      )}`;
    }
    if (startDate && !endDate) return formatDateReadable(startDate);
    if (!startDate && endDate) return formatDateReadable(endDate);
    return String(fallbackLabel ?? "");
  }

  // ----------------- XLSX export (client-side) -----------------
  async function exportAnalyticsXlsx() {
    if (!analytics) {
      toast.error("No analytics data to export");
      return;
    }
    setExportLoading(true);
    try {
      const mod = await import("exceljs");
      const ExcelJS = mod?.default ?? mod;
      const wb = new ExcelJS.Workbook();
      wb.creator = "Analytics Export";
      wb.created = new Date();

      // style helpers
      function styleHeaderRow(row, opts = {}) {
        const bg = opts.bg || "FF1F6FEB";
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

      // ---------- SUMMARY ----------
      const s1 = wb.addWorksheet("Summary");
      s1.addRow(["Analytics Export"]);
      s1.addRow([`Range: ${start} → ${end}`]);
      s1.addRow([`Exported: ${humanTimestamp(new Date())}`]);
      s1.addRow([]);
      s1.addRow(["Metric", "Value"]);
      styleHeaderRow(s1.getRow(s1.lastRow.number));
      const totalBookingRevenue =
        analytics?.totalBookingRevenue ?? analytics?.revenue?.total ?? 0;
      const totalServiceRevenue =
        analytics?.totalServiceRevenue ?? analytics?.services?.revenue ?? 0;
      const totalRevenue =
        analytics?.totalRevenue ?? totalBookingRevenue + totalServiceRevenue;
      const currencyCellStr = (n) =>
        `₦${new Intl.NumberFormat("en-NG").format(Number(n) || 0)}`;

      const summaryRows = [
        ["Start", start],
        ["End", end],
        ["Total Booking Revenue", currencyCellStr(totalBookingRevenue)],
        ["Total Service Revenue", currencyCellStr(totalServiceRevenue)],
        ["Total Revenue", currencyCellStr(totalRevenue)],
        [
          "Avg booking value",
          currencyCellStr(analytics?.bookings?.avgBookingValue ?? ""),
        ],
        [
          "Avg length of stay (days)",
          analytics?.bookings?.avgLengthOfStay ?? "",
        ],
        [
          "Repeat customer rate (%)",
          analytics?.users?.repeatCustomerRate ?? "",
        ],
      ];
      summaryRows.forEach((r) => s1.addRow(r));
      autosizeColumns(s1);

      // ---------- canonical series (from hook) ----------
      const revSeries = Array.isArray(revenueChartData) ? revenueChartData : [];
      const bookSeries = Array.isArray(bookingsChartData)
        ? bookingsChartData
        : [];

      // // require data to export aligned sheets
      // const revHas = revSeries.length > 0;
      // const bookHas = bookSeries.length > 0;
      // if (!revHas || !bookHas) {
      //   const missing = [];
      //   if (!revHas) missing.push("revenue");
      //   if (!bookHas) missing.push("bookings");
      //   toast.error(
      //     `Cannot export aligned Revenue & Bookings — missing data for: ${missing.join(
      //       ", "
      //     )}. Ensure analytics API returns series (not empty).`
      //   );
      //   setExportLoading(false);
      //   return;
      // }

      const canonicalKey = (pt) => {
        if (pt.start && pt.end) {
          const y1 = pt.start.getFullYear();
          const m1 = String(pt.start.getMonth() + 1).padStart(2, "0");
          const d1 = String(pt.start.getDate()).padStart(2, "0");
          const y2 = pt.end.getFullYear();
          const m2 = String(pt.end.getMonth() + 1).padStart(2, "0");
          const d2 = String(pt.end.getDate()).padStart(2, "0");
          return `${y1}-${m1}-${d1}__${y2}-${m2}-${d2}`;
        }
        if (pt.start) {
          const y = pt.start.getFullYear();
          const m = String(pt.start.getMonth() + 1).padStart(2, "0");
          const d = String(pt.start.getDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        }
        return String(pt.label || "");
      };

      const revMap = new Map();
      for (const p of revSeries) {
        const key = canonicalKey(p);
        const cur = revMap.get(key) || {
          start: p.start || null,
          end: p.end || null,
          label: p.label || "",
          sum: 0,
        };
        cur.sum += Number(p.value || 0);
        revMap.set(key, cur);
      }
      const bookMap = new Map();
      for (const p of bookSeries) {
        const key = canonicalKey(p);
        const cur = bookMap.get(key) || {
          start: p.start || null,
          end: p.end || null,
          label: p.label || "",
          sum: 0,
        };
        cur.sum += Number(p.value || 0);
        bookMap.set(key, cur);
      }

      const allKeys = new Set([...revMap.keys(), ...bookMap.keys()]);
      const entries = [];
      for (const k of allKeys) {
        const r = revMap.get(k) || {
          start: null,
          end: null,
          label: "",
          sum: 0,
        };
        const b = bookMap.get(k) || {
          start: null,
          end: null,
          label: "",
          sum: 0,
        };
        entries.push({
          key: k,
          start: r.start || b.start || null,
          end: r.end || b.end || null,
          label: r.label || b.label || "",
          rev: r.sum || 0,
          book: b.sum || 0,
        });
      }
      entries.sort((a, b) => {
        if (a.start && b.start) return a.start - b.start;
        if (a.start && !b.start) return -1;
        if (!a.start && b.start) return 1;
        return String(a.key).localeCompare(String(b.key));
      });

      // ---------- REVENUE sheet ----------
      const s2 = wb.addWorksheet("Revenue");
      s2.addRow(["Period", "Amount (₦)"]);
      styleHeaderRow(s2.getRow(1), { bg: "FF2D9CDB" });
      for (const e of entries) {
        const display = formatRangeLabelForSheet(e.start, e.end, e.label);
        const row = s2.addRow([display, Number(e.rev || 0)]);
        row.getCell(2).numFmt = '"₦"#,##0';
        row.getCell(2).alignment = { horizontal: "right" };
      }
      autosizeColumns(s2);

      // ---------- BOOKINGS sheet ----------
      const s3 = wb.addWorksheet("Bookings");
      s3.addRow(["Period", "Count"]);
      styleHeaderRow(s3.getRow(1), { bg: "FF7ED957" });
      for (const e of entries) {
        const display = formatRangeLabelForSheet(e.start, e.end, e.label);
        const row = s3.addRow([display, Math.round(Number(e.book || 0))]);
        row.getCell(2).alignment = { horizontal: "right" };
      }
      autosizeColumns(s3);

      // ---------- TOP PROPERTIES ----------
      const s4 = wb.addWorksheet("Top Properties");
      s4.addRow(["Rank", "Title", "Bookings Count", "Revenue (₦)"]);
      styleHeaderRow(s4.getRow(1), { bg: "FF9B59B6" });
      const topProps =
        analytics?.topShortletsByRevenue ??
        analytics?.topShortlets ??
        analytics?.topProperties ??
        [];
      (topProps || []).forEach((sitem, i) => {
        const bookingsCount = Number(
          sitem.bookingsCount ?? sitem.bookings ?? 0
        );
        const revenue = Number(sitem.totalRevenue ?? sitem.totalSpent ?? 0);
        const row = s4.addRow([
          i + 1,
          sitem.title ?? sitem.name ?? "Untitled",
          bookingsCount,
          revenue,
        ]);
        row.getCell(4).numFmt = '"₦"#,##0';
        row.getCell(4).alignment = { horizontal: "right" };
      });
      autosizeColumns(s4);

      // ---------- TOP CUSTOMERS ----------
      const s5 = wb.addWorksheet("Top Customers");
      s5.addRow(["Rank", "Name", "Email", "Total Spent (₦)"]);
      styleHeaderRow(s5.getRow(1), { bg: "FFEB7A00" });
      const topCustomers =
        analytics?.users?.topCustomers ?? analytics?.topCustomers ?? [];
      (topCustomers || []).forEach((c, i) => {
        const total = Number(c.totalSpent ?? c.total ?? 0);
        const row = s5.addRow([
          i + 1,
          c.name ?? c.email ?? "—",
          c.email ?? "",
          total,
        ]);
        row.getCell(4).numFmt = '"₦"#,##0';
        row.getCell(4).alignment = { horizontal: "right" };
      });
      autosizeColumns(s5);

      // ---------- finalize ----------
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const filename = `analytics-[${humanTimestamp(new Date())}].xlsx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("Analytics XLSX export started");
    } catch (err) {
      console.error("exportAnalyticsXlsx error:", err);
      toast.error("Failed to export analytics XLSX");
    } finally {
      setExportLoading(false);
    }
  }

  const handleApply = async () => {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s) || isNaN(e) || s > e) {
      toast.error("Invalid date range. Ensure start ≤ end and valid dates.");
      return;
    }
    try {
      const data = await fetchAnalytics(start, end, useMock);
      setRangeLabel(`${start} → ${end}`);
      if (!data) toast.info("No data for selected range");
    } catch (err) {
      // handled in hook
    }
  };

  const applyPreset = async (days) => {
    const now = new Date();
    const sDate = new Date();
    sDate.setDate(now.getDate() - (days - 1));
    const startStr = `${sDate.getFullYear()}-${String(
      sDate.getMonth() + 1
    ).padStart(2, "0")}-${String(sDate.getDate()).padStart(2, "0")}`;
    const endStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;
    try {
      await fetchAnalytics(startStr, endStr, useMock);
      setStart(startStr);
      setEnd(endStr);
      setRangeLabel(`${startStr} → ${endStr}`);
      setActivePreset(days);
    } catch (err) {
      toast.error("Failed to fetch analytics for preset range");
    }
  };

  // helpers to safely read new fields with fallbacks for older shapes
  const totalBookingRevenue =
    analytics?.totalBookingRevenue ?? analytics?.revenue?.total ?? 0;
  const totalServiceRevenue =
    analytics?.totalServiceRevenue ?? analytics?.services?.revenue ?? 0;
  const totalRevenue =
    analytics?.totalRevenue ?? totalBookingRevenue + totalServiceRevenue;
  const todayRevenue =
    analytics?.todayRevenue ??
    (analytics?.bookings?.today?.revenue ?? 0) +
      (analytics?.services?.todayRevenue ?? 0);
  const currentBookings =
    analytics?.currentBookings ?? analytics?.bookings?.total ?? "—";

  return (
    <div className="relative space-y-6 overflow-hidden">
      <ToastContainer position="top-right" />
      {loading && <LoaderOverlay />}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-3xl font-semibold">Analytics</h3>
          <p className="text-sm text-gray-500 mt-1">{rangeLabel}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex gap-4">
            {/* Start Date */}
            <div className="flex flex-col items-start gap-2 bg-white p-2 rounded-lg shadow-sm">
              <label className="text-xs font-semibold text-black">Start</label>
              <div className="relative">
                <DatePicker
                  selected={start ? new Date(start) : null}
                  onChange={(date) => handleStartChange(date)}
                  dateFormat="yyyy-MM-dd"
                  className="text-sm px-3 py-1 border rounded-md w-36"
                  placeholderText="Select date"
                />
                <Calendar className="absolute right-2 top-1.5 w-4 h-4 text-black pointer-events-none" />
              </div>
            </div>

            {/* End Date */}
            <div className="flex flex-col items-start gap-2 bg-white p-2 rounded-lg shadow-sm ">
              <label className="text-xs font-semibold text-black">End</label>
              <div className="relative">
                <DatePicker
                  selected={end ? new Date(end) : null}
                  onChange={(date) => handleEndChange(date)}
                  dateFormat="yyyy-MM-dd"
                  className="text-sm px-3 py-1 border rounded-md w-36"
                  placeholderText="Select date"
                />
                <Calendar className="absolute right-2 top-1.5 w-4 h-4 text-black pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApply}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              ) : (
                "Apply"
              )}
            </button>

            <button
              onClick={() => applyPreset(7)}
              className={`px-3 py-2 border rounded-lg text-sm transition ${
                activePreset === 7
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              7d
            </button>
            <button
              onClick={() => applyPreset(30)}
              className={`px-3 py-2 border rounded-lg text-sm transition ${
                activePreset === 30
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              30d
            </button>
            <button
              onClick={() => applyPreset(90)}
              className={`px-3 py-2 border rounded-lg text-sm transition ${
                activePreset === 90
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              90d
            </button>

            <button
              onClick={exportAnalyticsXlsx}
              className="ml-1 px-3 py-2 border rounded bg-yellow-500 text-white text-sm font-semibold hover:bg-yellow-600 flex items-center gap-2"
              disabled={exportLoading}
              title="Export analytics (XLSX)"
            >
              {exportLoading ? (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-25"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                    className="opacity-75"
                  />
                </svg>
              ) : (
                "Export XLSX"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {analytics ? (
          <>
            <StatCard
              label="Total Booking Revenue"
              value={`₦ ${new Intl.NumberFormat().format(totalBookingRevenue)}`}
              icon={DollarSign}
              color="purple"
            />
            <StatCard
              label="Total Service Revenue"
              value={`₦ ${new Intl.NumberFormat().format(totalServiceRevenue)}`}
              icon={Layers}
              color="gray"
            />
            <StatCard
              label="Total Revenue"
              value={`₦ ${new Intl.NumberFormat().format(totalRevenue)}`}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              label="Today's Revenue"
              value={`₦ ${new Intl.NumberFormat().format(todayRevenue)}`}
              icon={Calendar}
              color="blue"
            />
            <StatCard
              label="Active Bookings"
              value={currentBookings}
              icon={BookOpen}
              color="orange"
            />
          </>
        ) : (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        )}
      </div>

      {/* small KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        {analytics ? (
          <>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-sm text-gray-500">Avg booking value</div>
              <div className="text-xl font-semibold mt-2">
                ₦ {analytics.bookings?.avgBookingValue ?? "0"}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-sm text-gray-500">
                Avg length of stay (days)
              </div>
              <div className="text-xl font-semibold mt-2">
                {Math.round(analytics.bookings?.avgLengthOfStay) ?? "0"}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-sm text-gray-500">Repeat customer rate</div>
              <div className="text-xl font-semibold mt-2">{`${
                analytics.users?.repeatCustomerRate ?? 0
              }%`}</div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-6 bg-gray-200 rounded w-20 mt-2" />
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-40" />
              <div className="h-6 bg-gray-200 rounded w-16 mt-2" />
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-36" />
              <div className="h-6 bg-gray-200 rounded w-14 mt-2" />
            </div>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition"
          onClick={() => setOpenModal("revenue")}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Revenue (monthly)</h4>
            <p className="text-sm text-gray-500">
              Total: ₦
              {analytics
                ? new Intl.NumberFormat().format(
                    totalBookingRevenue + totalServiceRevenue
                  )
                : "—"}
            </p>
          </div>
          <div style={{ minHeight: 240 }}>
            <RevenueChart data={revenueChartDataForChart} />
          </div>
        </div>

        <div
          className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition"
          onClick={() => setOpenModal("bookings")}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Bookings Trend</h4>
            <p className="text-sm text-gray-500">Monthly bookings</p>
          </div>
          <div style={{ minHeight: 240 }}>
            <BookingsChart data={bookingsChartDataForChart} />
          </div>
        </div>
      </div>

      {/* Top lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h4 className="font-semibold mb-3">Top Properties (By revenue)</h4>
          {analytics?.topShortletsByRevenue?.length ? (
            <ul className="space-y-3">
              {analytics.topShortletsByRevenue.map((s, i) => (
                <li
                  key={s.shortletId || i}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg bg-gray-50"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {s.title || "Untitled"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Bookings: {s.bookingsCount} • Revenue: ₦
                      {new Intl.NumberFormat().format(s.totalRevenue || 0)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 font-semibold">
                    #{i + 1}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No top properties yet.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h4 className="font-semibold mb-3">Top Customers (By Expenses)</h4>
          {analytics?.users?.topCustomers?.length ? (
            <ul className="space-y-3">
              {analytics.users.topCustomers.map((c, i) => (
                <li
                  key={c.userId || i}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg bg-gray-50"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {c.name || c.email}
                    </div>
                    <div className="text-xs text-gray-500">{c.email}</div>
                  </div>
                  <div className="text-sm text-gray-700 font-semibold">
                    ₦{new Intl.NumberFormat().format(c.totalSpent || 0)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No customers yet.</p>
          )}
        </div>
      </div>

      {/* Chart modals */}
      <ChartModal
        open={openModal === "revenue"}
        onClose={() => setOpenModal(null)}
        title="Revenue (monthly) — Fullscreen"
        chartRef={revenueModalRef}
        csvData={revenueChartDataForChart}
        csvFilename="revenue-monthly.csv"
      >
        <div className="h-full">
          <RevenueChart data={revenueChartDataForChart} height={600} />
        </div>
      </ChartModal>

      <ChartModal
        open={openModal === "bookings"}
        onClose={() => setOpenModal(null)}
        title="Bookings Trend — Fullscreen"
        chartRef={bookingsModalRef}
        csvData={bookingsChartDataForChart}
        csvFilename="bookings-monthly.csv"
      >
        <div className="h-full">
          <BookingsChart data={bookingsChartDataForChart} height={600} />
        </div>
      </ChartModal>
    </div>
  );
}
