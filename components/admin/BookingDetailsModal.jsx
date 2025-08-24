// components/bookings/BookingDetailsModal.jsx
"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function BookingDetailsModal({ bookingId, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    if (!bookingId) return;

    let aborted = false;
    async function load() {
      setLoading(true);
      setError(null);
      setDetails(null);
      try {
        const res = await fetch(`/api/admin/bookings/${bookingId}/details`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch details");
        if (!aborted) setDetails(data);
      } catch (err) {
        if (!aborted) setError(err.message || "Failed to load");
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    load();
    return () => {
      aborted = true;
    };
  }, [isOpen, bookingId]);

  if (!isOpen) return null;

  // helper for formatting dates (date-only, en-GB)
  const formatDate = (d) => {
    if (!d) return "-";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }); // e.g. "18 Aug 2025"
  };

  const currency = (n) => `₦ ${new Intl.NumberFormat("en-NG").format(n ?? 0)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl mx-4 bg-white rounded-lg shadow-xl overflow-auto max-h-[85vh] custom-scrollbar">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 rounded-t-lg text-white"
          style={{ background: "#F0B100" }}
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-full w-10 h-10 flex items-center justify-center">
              {/* simple badge — could be an icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white/90"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M6 2a2 2 0 00-2 2v2h12V4a2 2 0 00-2-2H6zM4 9v5a2 2 0 002 2h8a2 2 0 002-2V9H4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold leading-none">
                Booking Details
              </h3>
              <div className="text-xs opacity-90">
                {details?.booking?._id ? `#${details.booking._id}` : ""}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-md bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <svg
                className="animate-spin h-10 w-10"
                viewBox="0 0 24 24"
                fill="none"
                style={{ color: "#F0B100" }}
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
            </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : !details ? (
            <div className="text-gray-600">No details available.</div>
          ) : (
            <>
              {/* Booking summary (responsive grid) */}
              <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Guest</div>
                  <div className="font-medium">
                    {details.booking.user?.name ||
                      details.booking.user?.email ||
                      "-"}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Room</div>
                  <div className="font-medium">
                    {details.booking.shortlet?.title || "-"}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Status</div>
                  <div
                    className={`inline-block px-2 py-1 rounded text-sm font-semibold ${
                      details.booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {details.booking.status === "cancelled"
                      ? "checked out"
                      : "checked in"}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Payment</div>
                  <div className="font-medium">
                    {details.booking.paid ? "Paid" : "Unpaid"}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Check-in</div>
                  <div className="font-medium">
                    {formatDate(details.booking.checkInDate)}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Check-out</div>
                  <div className="font-medium">
                    {formatDate(details.booking.checkOutDate)}
                  </div>
                </div>
              </div>

              {/* Services table */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-3">Services</h4>
                {details.services?.length ? (
                  <div className="overflow-x-auto rounded border border-gray-100">
                    <table className="min-w-full text-sm table-auto">
                      <thead className="text-xs text-gray-600 bg-gray-50">
                        <tr>
                          <th className="p-3 text-left">Description</th>
                          <th className="p-3 text-left">Requested by</th>
                          <th className="p-3 text-left">Price</th>
                          <th className="p-3 text-left">Payment status</th>
                          <th className="p-3 text-left">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.services.map((s) => (
                          <tr key={s._id} className="border-t last:border-b">
                            <td className="p-3 align-top">{s.description}</td>
                            <td className="p-3 align-top">
                              {s.requestedBy?.name ||
                                s.requestedBy?.email ||
                                "-"}
                            </td>
                            <td className="p-3 align-top">
                              {currency(s.price)}
                            </td>
                            <td
                              className={`p-3 align-top capitalize ${
                                s.paymentStatus === "paid"
                                  ? "text-[green]"
                                  : "text-[red]"
                              }`}
                            >
                              {s.paymentStatus}
                            </td>
                            <td className="p-3 align-top">
                              {new Date(s.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    No services attached to this booking.
                  </div>
                )}
              </div>

              {/* Totals (right aligned on larger screens) */}
              <div className="flex flex-col sm:flex-row justify-end gap-6 items-end">
                <div className="text-right">
                  <div className="text-xs text-gray-500">Booking revenue</div>
                  <div className="text-lg font-semibold">
                    {currency(
                      details?.totals?.bookingRevenue ??
                        details?.booking?.totalAmount
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-500">Services revenue</div>
                  <div className="text-lg font-semibold">
                    {currency(details?.totals?.servicesRevenue ?? 0)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-500">Total revenue</div>
                  <div className="text-lg font-semibold">
                    {currency(
                      details?.totals?.totalRevenue ??
                        (details?.booking?.totalAmount ?? 0) +
                          (details?.totals?.servicesRevenue ?? 0)
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
