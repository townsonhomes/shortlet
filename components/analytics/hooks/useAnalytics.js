// components/analytics/hooks/useAnalytics.js
"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";

/**
 * This hook returns both:
 * - revenueChartDataForChart / bookingsChartDataForChart  -> legacy shapes the chart components expect
 * - revenueChartData / bookingsChartData                -> canonical shape used by exporter: { label, start, end, value }
 */

/* ----- date helpers ----- */
function parseDateFlexible(s) {
  if (s === null || s === undefined) return null;
  const str = String(s).trim();
  if (!str) return null;
  // YYYY-MM
  if (/^\d{4}-\d{2}$/.test(str)) {
    const [y, m] = str.split("-");
    return new Date(Number(y), Number(m) - 1, 1);
  }
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, mo, d] = str.split("-");
    return new Date(Number(y), Number(mo) - 1, Number(d));
  }
  // numeric timestamp (seconds or ms)
  if (/^\d+$/.test(str)) {
    const num = Number(str);
    return num > 1e12 ? new Date(num) : new Date(num * 1000);
  }
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? null : d;
}
function endOfMonth(date) {
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/* ----- canonicalization ----- */
function canonicalizePointToRange(p) {
  if (p == null) return { label: "", start: null, end: null, value: 0 };

  // Array shapes: ['YYYY-MM', value] or ['YYYY-MM-DD','YYYY-MM-DD', value]
  if (Array.isArray(p)) {
    if (p.length >= 2) {
      const first = p[0];
      const second = p[1];
      const third = p.length >= 3 ? p[2] : undefined;

      // ['YYYY-MM-DD','YYYY-MM-DD', value]
      const start = parseDateFlexible(first);
      const end = parseDateFlexible(second);
      if (start && end) {
        return {
          label: `${first} → ${second}`,
          start,
          end,
          value: Number.isFinite(Number(third)) ? Number(third) : 0,
        };
      }

      // ['YYYY-MM', value]
      if (/^\d{4}-\d{2}$/.test(String(first))) {
        const [y, mo] = String(first).split("-");
        const s = new Date(Number(y), Number(mo) - 1, 1);
        const e = endOfMonth(s);
        return {
          label: first,
          start: s,
          end: e,
          value: Number.isFinite(Number(second)) ? Number(second) : 0,
        };
      }

      // fallback: first as label, last value
      return {
        label: String(first ?? ""),
        start: parseDateFlexible(first),
        end: null,
        value: Number.isFinite(Number(third ?? second))
          ? Number(third ?? second)
          : 0,
      };
    }
  }

  // Object shapes
  if (typeof p === "object") {
    const startKeys = ["start", "from", "periodStart", "dateStart", "x0"];
    const endKeys = ["end", "to", "periodEnd", "dateEnd", "x1"];

    let start = null;
    let end = null;
    for (const k of startKeys) {
      if (p[k] !== undefined) {
        start = parseDateFlexible(p[k]);
        break;
      }
    }
    for (const k of endKeys) {
      if (p[k] !== undefined) {
        end = parseDateFlexible(p[k]);
        break;
      }
    }

    // _id.year/_id.month shapes
    if (
      !start &&
      p._id &&
      typeof p._id === "object" &&
      p._id.year &&
      p._id.month
    ) {
      const y = Number(p._id.year);
      const mo = Number(p._id.month);
      start = new Date(y, mo - 1, 1);
      end = endOfMonth(start);
    } else if (!start && p.year && p.month) {
      const y = Number(p.year);
      const mo = Number(p.month);
      start = new Date(y, mo - 1, 1);
      end = endOfMonth(start);
    }

    const rawLabel = p.label ?? p.x ?? p.date ?? p.name ?? p.key ?? "";
    if (!start && /^\d{4}-\d{2}$/.test(String(rawLabel))) {
      const [y, mo] = String(rawLabel).split("-");
      start = new Date(Number(y), Number(mo) - 1, 1);
      end = endOfMonth(start);
    }

    const valueKeys = [
      "total",
      "value",
      "revenue",
      "amount",
      "y",
      "v",
      "val",
      "count",
      "bookings",
    ];
    let value = 0;
    for (const k of valueKeys) {
      if (p[k] !== undefined && p[k] !== null) {
        const n = Number(p[k]);
        if (Number.isFinite(n)) {
          value = n;
          break;
        }
      }
    }

    const label =
      rawLabel || (start ? `${start.toISOString().slice(0, 10)}` : "");
    return {
      label: String(label),
      start: start || null,
      end: end || null,
      value: Number(value || 0),
    };
  }

  // Primitive fallback
  const parsed = parseDateFlexible(p);
  if (parsed) {
    return { label: String(p), start: parsed, end: null, value: 0 };
  }

  return { label: String(p), start: null, end: null, value: 0 };
}

/* ----- normalize functions ----- */
function normalizeRevenueMonthly(arr = []) {
  if (!Array.isArray(arr)) return [];
  return arr.map((m) => {
    const c = canonicalizePointToRange(m);
    return {
      label: c.label,
      start: c.start,
      end: c.end,
      value: Number(c.value || 0),
    };
  });
}

function normalizeBookingsTrend(arr = []) {
  if (!Array.isArray(arr)) return [];
  return arr.map((t) => {
    const c = canonicalizePointToRange(t);
    return {
      label: c.label,
      start: c.start,
      end: c.end,
      value: Math.round(Number(c.value || 0)),
    };
  });
}

/* ----- helper to produce legacy chart shapes (what charts expect) ----- */
function toChartFriendlyRevenue(canonicalArr = []) {
  // produce [{ name: label, revenue: value }]
  return canonicalArr.map((p) => ({
    name: p.label || "",
    revenue: Number(p.value || 0),
  }));
}
function toChartFriendlyBookings(canonicalArr = []) {
  // produce [{ name: label, bookings: value }]
  return canonicalArr.map((p) => ({
    name: p.label || "",
    bookings: Math.round(Number(p.value || 0)),
  }));
}

/* ----- hook ----- */
export default function useAnalytics({
  initialStart,
  initialEnd,
  mock = false,
} = {}) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);

  // inside useAnalytics.js - replace existing fetchAnalytics with this

  const fetchAnalytics = useCallback(
    // require explicit s and e to avoid stale-closure bugs
    async (s, e, useMockParam = false) => {
      if (!s || !e) {
        console.warn("fetchAnalytics called without explicit start/end:", {
          s,
          e,
        });
        // still allow calling but return nothing
        return null;
      }

      setLoading(true);
      try {
        const q = `?start=${encodeURIComponent(s)}&end=${encodeURIComponent(
          e
        )}${useMockParam ? "&mock=true" : ""}`;

        // IMPORTANT: force no-store so browser/edge caches don't give us old data
        let res = await fetch(`/api/admin/analytics${q}`, {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        // fallback for servers that expect POST (your old logic)
        if (res.status === 405) {
          res = await fetch(`/api/admin/analytics`, {
            method: "POST",
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ start: s, end: e, mock: useMockParam }),
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
    [] // no closure on start/end -> must pass s,e explicitly
  );

  // try multiple likely fields that might contain series
  const canonicalRevenue = useMemo(() => {
    const monthly = analytics?.revenue?.monthly ?? [];
    return normalizeRevenueMonthly(monthly);
  }, [analytics]);

  const canonicalBookings = useMemo(() => {
    const trend =
      analytics?.bookings?.bookingsTrend ??
      analytics?.bookingsTrend ??
      analytics?.bookings?.series ??
      analytics?.bookings ??
      [];
    return normalizeBookingsTrend(trend);
  }, [analytics]);

  // chart-friendly (legacy) outputs
  const revenueChartDataForChart = useMemo(
    () => toChartFriendlyRevenue(canonicalRevenue),
    [canonicalRevenue]
  );
  const bookingsChartDataForChart = useMemo(
    () => toChartFriendlyBookings(canonicalBookings),
    [canonicalBookings]
  );

  return {
    analytics,
    setAnalytics,
    loading,
    start,
    setStart,
    end,
    setEnd,
    fetchAnalytics,
    // keep canonical names (used by exporter in AnalyticsSection)
    revenueChartData: canonicalRevenue,
    bookingsChartData: canonicalBookings,
    // provide legacy/compatible arrays for chart components
    revenueChartDataForChart,
    bookingsChartDataForChart,
  };
}
