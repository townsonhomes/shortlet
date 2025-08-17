// components/analytics/hooks/useAnalytics.js
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

/** Helper: parse/normalize monthly arrays returned by API */
function normalizeRevenueMonthly(arr = []) {
  return arr.map((m) => {
    let name = "";
    if (m.label) name = m.label;
    else if (m._id && typeof m._id === "object" && m._id.year && m._id.month) {
      name = `${m._id.year}-${String(m._id.month).padStart(2, "0")}`;
    } else if (m.year && m.month) {
      name = `${m.year}-${String(m.month).padStart(2, "0")}`;
    } else {
      name = String(m.name ?? m.key ?? "");
    }
    const revenue =
      Number(m.total ?? m.value ?? m.revenue ?? m.amount ?? 0) || 0;
    return { name, revenue };
  });
}

function normalizeBookingsTrend(arr = []) {
  return arr.map((t) => {
    let name =
      t.label ??
      (t._id && t._id.year
        ? `${t._id.year}-${String(t._id.month).padStart(2, "0")}`
        : t.name ?? "");
    const bookings = Number(t.count ?? t.bookings ?? t.value ?? 0) || 0;
    return { name, bookings };
  });
}

export default function useAnalytics({
  initialStart,
  initialEnd,
  mock = false,
} = {}) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);

  const fetchAnalytics = useCallback(
    async (s = start, e = end, useMock = mock) => {
      setLoading(true);
      try {
        const q = `?start=${encodeURIComponent(s)}&end=${encodeURIComponent(
          e
        )}${useMock ? "&mock=true" : ""}`;
        let res = await fetch(`/api/admin/analytics${q}`, { method: "GET" });

        if (res.status === 405) {
          res = await fetch(`/api/admin/analytics`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ start: s, end: e, mock: useMock }),
          });
        }

        if (!res.ok) {
          const text = await res.text();
          let payload;
          try {
            payload = JSON.parse(text);
          } catch {
            payload = {
              error: text || `Request failed with status ${res.status}`,
            };
          }
          if (res.status === 401 || res.status === 403) {
            toast.error(
              "You must be an admin to access analytics. Please login with an admin account."
            );
          } else {
            toast.error(payload.error || `Request failed (${res.status})`);
          }
          throw new Error(payload.error || `Request failed (${res.status})`);
        }

        const data = await res.json();
        setAnalytics(data);
        return data;
      } catch (err) {
        console.error("Analytics fetch error:", err);
        if (!err.message) toast.error("Failed to load analytics");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [start, end, mock]
  );

  // normalized derived series
  const revenueChartData = useMemo(() => {
    const monthly = analytics?.revenue?.monthly || [];
    return normalizeRevenueMonthly(monthly);
  }, [analytics]);

  const bookingsChartData = useMemo(() => {
    const trend = analytics?.bookings?.bookingsTrend || [];
    return normalizeBookingsTrend(trend);
  }, [analytics]);

  return {
    analytics,
    setAnalytics,
    loading,
    start,
    setStart,
    end,
    setEnd,
    fetchAnalytics,
    revenueChartData,
    bookingsChartData,
  };
}
