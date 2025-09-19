"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import SearchBar from "../../SearchBar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-hot-toast";
import { isBookingOverlap } from "@/utils/dateUtils";

/**
 * BookingFormModal (updated)
 * Props:
 *  - shortlet: shortlet object (must include _id, pricePerDay, bookedDates)
 *  - onClose: function to close modal
 *  - onSuccess: optional callback (e.g. refresh parent data)
 */
export default function BookingFormModal({ shortlet, onClose, onSuccess }) {
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Use Date objects for DatePicker
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);

  // New fields
  const [amount, setAmount] = useState(""); // number (string state)
  const [paymentReference, setPaymentReference] = useState(""); // optional override

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState(false);

  const cacheRef = useRef(new Map()); // simple in-memory cache by query
  const abortRef = useRef(null);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // compute nights from Date objects
  const computeNights = (inD, outD) => {
    if (!inD || !outD) return 0;
    const a = inD instanceof Date ? inD : new Date(inD);
    const b = outD instanceof Date ? outD : new Date(outD);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.max(
      1,
      Math.round(Math.abs((b.getTime() - a.getTime()) / msPerDay))
    );
  };

  // when dates change, if amount is empty (was not typed), auto-fill from shortlet.pricePerDay * nights
  useEffect(() => {
    const nights = computeNights(checkIn, checkOut);
    if (
      (!amount || String(amount).trim() === "") &&
      nights > 0 &&
      shortlet?.pricePerDay !== undefined
    ) {
      const est = Number(shortlet.pricePerDay || 0) * nights;
      if (!Number.isNaN(est)) setAmount(String(est));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIn, checkOut, shortlet?.pricePerDay]);

  // search customers (debounced SearchBar does throttle)
  const handleSearch = useCallback(
    async (q) => {
      setCustomerQuery(q);
      setSelectedCustomer(null);
      setError("");

      const trimmed = (q || "").trim();
      if (!trimmed || trimmed.length < 2) {
        setCustomerResults([]);
        return;
      }

      if (cacheRef.current.has(trimmed)) {
        setCustomerResults(cacheRef.current.get(trimmed));
        return;
      }

      if (abortRef.current) abortRef.current.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setSearching(true);
      try {
        const res = await fetch(
          `/api/admin/customers/search?q=${encodeURIComponent(trimmed)}`,
          { signal: ac.signal }
        );
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        const items = Array.isArray(data) ? data : [];
        cacheRef.current.set(trimmed, items);
        setCustomerResults(items);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Customer search failed:", err);
        setCustomerResults([]);
        setError("Failed to search customers");
      } finally {
        setSearching(false);
        abortRef.current = null;
      }
    },
    [setCustomerQuery, setCustomerResults]
  );

  const handleSelectCustomer = (c) => {
    setSelectedCustomer(c);
    setCustomerResults([]);
    setCustomerQuery(`${c.name} (${c.email})`);
  };

  // validate selected dates using the same checks you provided
  const validateDates = () => {
    if (!checkIn || !checkOut || checkIn >= checkOut) {
      toast.error("Please select valid check-in and check-out dates.");
      return false;
    }

    // check overlap against existing bookedDates
    const isOverlapping = (shortlet.bookedDates || []).some((entry) => {
      const existingCheckIn = new Date(entry.checkInDate);
      const existingCheckOut = new Date(entry.checkOutDate);
      return isBookingOverlap(
        checkIn,
        checkOut,
        existingCheckIn,
        existingCheckOut
      );
    });

    if (isOverlapping) {
      setUnavailable(true);
      toast.error("Selected dates are not available.");
      return false;
    }

    setUnavailable(false);
    return true;
  };

  // form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedCustomer) {
      setError("Please select a customer.");
      return;
    }

    // validate dates using the same checks and toasts
    if (!validateDates()) return;

    const nights = computeNights(checkIn, checkOut);
    if (nights <= 0) {
      setError("Invalid date range.");
      return;
    }

    // ensure amount
    let totalAmount = amount;
    if (
      totalAmount === "" ||
      totalAmount === null ||
      totalAmount === undefined
    ) {
      totalAmount = Number(shortlet.pricePerDay || 0) * nights;
    } else {
      totalAmount = Number(totalAmount);
    }

    if (Number.isNaN(totalAmount) || totalAmount < 0) {
      setError("Please provide a valid amount.");
      return;
    }

    // convert dates to yyyy-mm-dd
    const checkInDateStr = checkIn.toISOString().split("T")[0];
    const checkOutDateStr = checkOut.toISOString().split("T")[0];

    setLoading(true);
    try {
      const payload = {
        shortletId: shortlet._id,
        userId: selectedCustomer._id,
        checkInDate: checkInDateStr,
        checkOutDate: checkOutDateStr,
        totalAmount,
      };
      if (paymentReference && String(paymentReference).trim() !== "") {
        payload.paymentReference = String(paymentReference).trim();
      }

      const res = await fetch("/api/admin/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create booking");
      }

      // success: call callback and close
      onSuccess?.(data.booking);
      toast.success("Booking created");
      onClose();
    } catch (err) {
      console.error("Create booking error:", err);
      setError(err.message || "Failed to create booking");
      toast.error(err.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  // allow overlay click to close
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={() => {
          if (abortRef.current) abortRef.current.abort();
          onClose();
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close X */}
        <button
          type="button"
          onClick={() => {
            if (abortRef.current) abortRef.current.abort();
            onClose();
          }}
          aria-label="Close"
          className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M6 6L18 18M6 18L18 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <h2 className="text-lg font-semibold mb-3">Create Booking</h2>

        {/* Customer Search */}
        <div className="relative mb-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <SearchBar
                value={customerQuery}
                onChange={handleSearch}
                placeholder="Search customer by name or email"
              />
            </div>

            {/* small spinner when searching */}
            {searching && (
              <div className="w-6 h-6 flex items-center justify-center">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              </div>
            )}
          </div>

          {customerResults.length > 0 && (
            <div className="absolute top-full mt-1 bg-white border rounded shadow w-full max-h-48 overflow-auto z-10">
              {customerResults.map((c) => (
                <div
                  key={c._id}
                  onClick={() => handleSelectCustomer(c)}
                  className="px-3 py-2 text-sm hover:bg-yellow-100 cursor-pointer"
                >
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.email}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DatePicker controls (adopted checks & UX) */}
        <div className="space-y-3 mb-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Check-in Date
            </label>
            <DatePicker
              selected={checkIn}
              onChange={(date) => {
                setCheckIn(date);
                // ensure checkOut is at least next day
                if (date && (!checkOut || date >= checkOut)) {
                  setCheckOut(new Date(date.getTime() + 86400000));
                }
              }}
              minDate={new Date()}
              className="w-full px-3 py-2 border rounded-md text-sm"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Check-out Date
            </label>
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              minDate={
                checkIn ? new Date(checkIn.getTime() + 86400000) : new Date()
              }
              className="w-full px-3 py-2 border rounded-md text-sm"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          {unavailable && (
            <p className="text-sm text-red-600 text-center">
              Selected dates are unavailable.
            </p>
          )}
        </div>

        {/* Nights + estimated price (informational) */}
        <div className="mb-3 text-sm text-gray-600">
          <div>
            Nights:{" "}
            <span className="font-medium">
              {computeNights(checkIn, checkOut) || "-"}
            </span>
          </div>
          <div>
            Price per night:{" "}
            <span className="font-medium">
              {shortlet?.pricePerDay
                ? `₦${Number(shortlet.pricePerDay).toLocaleString()}`
                : "-"}
            </span>
          </div>
        </div>

        {/* Amount and Payment Reference */}
        <div className="mb-4 space-y-2">
          <label className="block text-sm text-gray-700">
            Amount (₦)
            <input
              type="number"
              step="1"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Leave empty to auto-calc from shortlet price"
              className="mt-1 w-full border px-3 py-2 rounded"
            />
          </label>

          <label className="block text-sm text-gray-700">
            Payment reference (optional)
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Generated automatically if blank"
              className="mt-1 w-full border px-3 py-2 rounded"
            />
          </label>
        </div>

        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              if (abortRef.current) abortRef.current.abort();
              onClose();
            }}
            className="px-4 py-2 border rounded"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            {loading ? "Saving..." : "Create Booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
