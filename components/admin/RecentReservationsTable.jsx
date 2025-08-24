"use client";

import { useState, useMemo } from "react";
import ReservationRow from "./ReservationRow";
import ConfirmModal from "../ConfirmModal";
import SearchBar from "../SearchBar";
import StatusFilter from "../StatusFilter";
//import DateRangePicker from "../DateRangePicker";
import { isSameDay, isAfter, isBefore } from "date-fns";
import SimpleDateFilters from "../SimpleDateFilters";
import AddServiceModal from "./AddServiceModal";
import { useSession } from "next-auth/react";
import BookingDetailsModal from "./BookingDetailsModal";

export default function RecentReservationsTable({ bookings }) {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [serviceBooking, setServiceBooking] = useState(null);
  const [detailsBookingId, setDetailsBookingId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const { data: session } = useSession();
  const role = session?.user.role;
  // Handle updates
  const handleDateChange = (type, value) => {
    if (type === "checkIn") setCheckInDate(value);
    if (type === "checkOut") setCheckOutDate(value);
  };

  const handleViewDetails = (booking) => {
    // Accept either booking object or id
    const id = booking?._id || booking;
    setDetailsBookingId(id);
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
  };
  const handleAddServiceClick = (booking) => setServiceBooking(booking);

  const handleConfirmCancel = async () => {
    try {
      const res = await fetch(
        `/api/admin/bookings/${selectedBooking._id}/cancel`,
        {
          method: "PUT",
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to cancel booking");
      window.location.reload();
    } catch (err) {
      console.error(err.message);
    } finally {
      setSelectedBooking(null);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkInDate);
      const bookingCheckOut = new Date(booking.checkOutDate);

      const matchesSearch = (() => {
        const query = (searchQuery || "").toLowerCase();
        const guestName = booking.user?.name?.toLowerCase() || "";
        const roomTitle = booking.shortlet?.title?.toLowerCase() || "";

        return guestName.includes(query) || roomTitle.includes(query);
      })();

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      const hasCheckIn = !!checkInDate;
      const hasCheckOut = !!checkOutDate;

      const matchesDate = (() => {
        if (hasCheckIn && hasCheckOut) {
          return (
            (isSameDay(bookingCheckIn, new Date(checkInDate)) ||
              isAfter(bookingCheckIn, new Date(checkInDate))) &&
            (isSameDay(bookingCheckOut, new Date(checkOutDate)) ||
              isBefore(bookingCheckOut, new Date(checkOutDate)))
          );
        }

        if (hasCheckIn) return isSameDay(bookingCheckIn, new Date(checkInDate));
        if (hasCheckOut)
          return isSameDay(bookingCheckOut, new Date(checkOutDate));

        return true; // No date filter
      })();

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, searchQuery, statusFilter, checkInDate, checkOutDate]);

  // ---------- CSV export logic ----------
  const csvSafe = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    // escape double quotes by doubling them
    return `"${s.replace(/"/g, '""')}"`;
  };

  const formatDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString("en-GB");
  };

  async function exportCsv() {
    if (!filteredBookings || filteredBookings.length === 0) {
      alert("No bookings to export.");
      return;
    }
    setExporting(true);
    try {
      const detailPromises = filteredBookings.map((b) =>
        fetch(`/api/admin/bookings/${b._id}/details`)
          .then(async (res) => {
            if (!res.ok) return { booking: b, services: [], totals: {} };
            const data = await res.json();
            return data;
          })
          .catch(() => ({ booking: b, services: [], totals: {} }))
      );

      const detailsList = await Promise.all(detailPromises);

      const csvSafe = (v) => {
        if (v === null || v === undefined) return '""';
        const s = String(v);
        return `"${s.replace(/"/g, '""')}"`;
      };

      const formatDateNice = (d) => {
        if (!d) return "";
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return "";
        return dt.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      };

      const mapBookingStatusForCsv = (st) => {
        if (!st) return "";
        if (st === "confirmed") return "checked in";
        if (st === "cancelled") return "checked out";
        return st;
      };

      const currencyFmt = (n) =>
        `₦${new Intl.NumberFormat("en-NG").format(Number(n) || 0)}`;

      const headers = [
        "Booking ID",
        "Guest Name",
        "Guest Email",
        "Room Title",
        "Check-in",
        "Check-out",
        "Booking Amount",
        "Booking Paid",
        "Booking Status",
        "Service Count",
        "Services",
        "BookingRevenue",
        "ServicesRevenue",
        "TotalRevenue",
      ];

      const rows = [headers.map(csvSafe).join(",")];

      for (const details of detailsList) {
        const booking = details.booking || {};
        const services = details.services || [];
        const bookingRevenue = booking.totalAmount ?? 0;
        const servicesRevenue =
          details.totals?.servicesRevenue ??
          services.reduce((s, it) => s + (Number(it.price) || 0), 0);
        const totalRevenue =
          details.totals?.totalRevenue ?? bookingRevenue + servicesRevenue;

        const servicesSerialized = services.length
          ? services
              .map((s, index) => {
                const requestedBy =
                  s.requestedBy?.name || s.requestedBy?.email || "unknown";
                const created = formatDateNice(s.createdAt);
                const desc = (s.description || "").replace(/\s+/g, " ").trim();
                const price = currencyFmt(s.price);
                const paymentStatus = s.paymentStatus || "";
                // each service on its own line inside the same quoted cell
                return `(${
                  index + 1
                }) ${desc} (requestedBy: ${requestedBy}; price: ${price}; paymentStatus: ${paymentStatus}; created: ${created})`;
              })
              .join("\r\n")
          : "";

        const row = [
          booking._id ?? "",
          booking.user?.name ?? booking.user?.email ?? "",
          booking.user?.email ?? "",
          booking.shortlet?.title ?? "",
          formatDateNice(booking.checkInDate),
          formatDateNice(booking.checkOutDate),
          booking.totalAmount ?? "",
          booking.paid ? "TRUE" : "FALSE",
          mapBookingStatusForCsv(booking.status),
          services.length,
          servicesSerialized,
          bookingRevenue,
          servicesRevenue,
          totalRevenue,
        ];

        rows.push(row.map(csvSafe).join(","));
      }

      // Use CRLF between rows for Windows Excel compatibility
      const csv = rows.join("\r\n");

      // Prefix with UTF-8 BOM so Excel detects UTF-8 and shows the ₦ sign correctly
      const csvWithBOM = "\uFEFF" + csv;

      const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const now = new Date();
      a.setAttribute(
        "download",
        `bookings_export_${now.toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export CSV. See console for details.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-700 px-6 py-2 pt-6 ">
        Bookings
      </h2>

      <div className="px-6 w-full py-2 pt-0 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-end max-sm:flex-col max-sm:items-start mt-2 gap-4 w-full lg:w-auto overflow-visible">
          <div className="flex flex-col gap-3 min-w-1/2">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search Customer Name"
            />
            <StatusFilter value={statusFilter} onChange={setStatusFilter} />
          </div>

          <SimpleDateFilters
            checkIn={checkInDate}
            checkOut={checkOutDate}
            onChange={handleDateChange}
          />
        </div>

        {/* Export button placed on the right */}
        {role === "admin" ? (
          <div className="flex gap-2 items-center">
            <button
              onClick={exportCsv}
              disabled={exporting}
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 text-sm rounded-md shadow"
              title="Export CSV of bookings and attached services"
            >
              {exporting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                "Export CSV"
              )}
            </button>
          </div>
        ) : (
          <></>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">#ID</th>
              <th className="px-4 py-3 text-left">Guest Name</th>
              <th className="px-4 py-3 text-left">Room Type</th>
              <th className="px-4 py-3 text-left">Check-In</th>
              <th className="px-4 py-3 text-left">Check-Out</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-gray-700">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <ReservationRow
                  key={booking._id}
                  booking={booking}
                  onCancelClick={handleCancelClick}
                  onAddServiceClick={handleAddServiceClick}
                  onViewDetails={handleViewDetails}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="text-center px-4 py-8 text-gray-500 italic"
                >
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking? A cancellation email will be sent to the guest."
        confirmText="Yes, Cancel Booking"
      />
      {/* Add Service Modal */}
      {serviceBooking && (
        <AddServiceModal
          isOpen={!!serviceBooking}
          onClose={() => setServiceBooking(null)}
          user={serviceBooking.user}
          shortlet={serviceBooking.shortlet}
          bookingId={serviceBooking._id}
          requestedBy={session?.user?.id}
        />
      )}
      {/* Booking Details Modal */}
      {detailsBookingId && (
        <BookingDetailsModal
          bookingId={detailsBookingId}
          isOpen={!!detailsBookingId}
          onClose={() => setDetailsBookingId(null)}
        />
      )}
    </div>
  );
}
