"use client";

import { useState, useMemo } from "react";
import ReservationRow from "./ReservationRow";
import ConfirmModal from "../ConfirmModal";
import SearchBar from "../SearchBar";
import StatusFilter from "../StatusFilter";
//import DateRangePicker from "../DateRangePicker";
import { isSameDay, isAfter, isBefore, parseISO } from "date-fns";
import SimpleDateFilters from "../SimpleDateFilters";
import AddServiceModal from "./AddServiceModal";
import { useSession } from "next-auth/react";

export default function RecentReservationsTable({ bookings }) {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [serviceBooking, setServiceBooking] = useState(null);
  const { data: session } = useSession();
  // Handle updates
  const handleDateChange = (type, value) => {
    if (type === "checkIn") setCheckInDate(value);
    if (type === "checkOut") setCheckOutDate(value);
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

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-700 px-6 py-2 pt-6 ">
        Bookings
      </h2>
      <div className="px-6 w-full py-2 pt-0  border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
    </div>
  );
}
