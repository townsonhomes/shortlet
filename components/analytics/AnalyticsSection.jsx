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
    // fetch whenever start/end/mock change
    (async () => {
      try {
        const data = await fetchAnalytics(start, end, useMock);
        setRangeLabel(`${start} → ${end}`);
        if (!data) toast.error("No analytics data");
      } catch (err) {
        // already handled in hook
      }
    })();
  }, [start, end, useMock, fetchAnalytics]);

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
      setStart(startStr); // update UI
      setEnd(endStr);
      setRangeLabel(`${startStr} → ${endStr}`);
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
          {/* <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useMock}
              onChange={(e) => setUseMock(e.target.checked)}
              className="mr-1"
            />
            Use mock data
          </label> */}
          <div className="flex gap-4">
            {/* Start Date */}
            <div className="flex flex-col items-start gap-2 bg-white p-2 rounded-lg shadow-sm">
              <label className="text-xs font-semibold text-black">Start</label>
              <div className="relative">
                <DatePicker
                  selected={start ? new Date(start) : null}
                  onChange={(date) =>
                    setStart(date ? date.toISOString().split("T")[0] : "")
                  }
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
                  onChange={(date) =>
                    setEnd(date ? date.toISOString().split("T")[0] : "")
                  }
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
              className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              7d
            </button>
            <button
              onClick={() => applyPreset(30)}
              className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              30d
            </button>
            <button
              onClick={() => applyPreset(90)}
              className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              90d
            </button>
          </div>
        </div>
      </div>

      {/* KPI cards (responsive — 5 cards) */}
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
              label="Current Bookings"
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

      {/* Small KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        {analytics ? (
          <>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-sm text-gray-500">Avg booking value</div>
              <div className="text-xl font-semibold mt-2">
                ₦ {analytics.bookings.avgBookingValue ?? "—"}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-sm text-gray-500">
                Avg length of stay (days)
              </div>
              <div className="text-xl font-semibold mt-2">
                {Math.round(analytics.bookings.avgLengthOfStay) ?? "—"}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-sm text-gray-500">Repeat customer rate</div>
              <div className="text-xl font-semibold mt-2">
                {`${analytics.users.repeatCustomerRate ?? 0}%`}
              </div>
            </div>
          </>
        ) : (
          // Skeletons
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

      {/* Charts: click to open modal */}
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
            <RevenueChart data={revenueChartData} />
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
            <BookingsChart data={bookingsChartData} />
          </div>
        </div>
      </div>

      {/* Top lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h4 className="font-semibold mb-3">Top Properties (by revenue)</h4>
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
                      {new Intl.NumberFormat().format(s.revenue || 0)}
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
          <h4 className="font-semibold mb-3">Top Customers (by Expenses)</h4>
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

      {/* Chart modals (fullscreen) */}
      <ChartModal
        open={openModal === "revenue"}
        onClose={() => setOpenModal(null)}
        title="Revenue (monthly) — Fullscreen"
        chartRef={revenueModalRef}
        csvData={revenueChartData}
        csvFilename="revenue-monthly.csv"
      >
        <div className="h-full">
          <RevenueChart data={revenueChartData} height={600} />
        </div>
      </ChartModal>

      <ChartModal
        open={openModal === "bookings"}
        onClose={() => setOpenModal(null)}
        title="Bookings Trend — Fullscreen"
        chartRef={bookingsModalRef}
        csvData={bookingsChartData}
        csvFilename="bookings-monthly.csv"
      >
        <div className="h-full">
          <BookingsChart data={bookingsChartData} height={600} />
        </div>
      </ChartModal>
    </div>
  );
}
