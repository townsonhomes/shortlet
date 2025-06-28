"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-hot-toast";
import ReactDOM from "react-dom";
import { isBookingOverlap } from "@/utils/dateUtils";

export default function DateSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  room: shortlet,
}) {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const handleConfirm = () => {
    const checkInDateStr = checkIn.toISOString().split("T")[0];
    const checkOutDateStr = checkOut.toISOString().split("T")[0];

    if (
      !checkInDateStr ||
      !checkOutDateStr ||
      checkInDateStr >= checkOutDateStr
    ) {
      toast.error("Please select valid check-in and check-out dates.");
      return;
    }

    setUnavailable(false);

    const isOverlapping = shortlet.bookedDates?.some((entry) => {
      const existingCheckIn = new Date(entry.checkInDate);
      const existingCheckOut = new Date(entry.checkOutDate);
      const selectedCheckIn = checkIn;
      const selectedCheckOut = checkOut;

      return isBookingOverlap(
        selectedCheckIn,
        selectedCheckOut,
        existingCheckIn,
        existingCheckOut
      );
    });

    if (isOverlapping) {
      setUnavailable(true);
      toast.error("Selected dates are not available.");
      return;
    }

    // All good
    const checkInDate = checkIn.toISOString().split("T")[0];
    const checkOutDate = checkOut.toISOString().split("T")[0];
    onConfirm(checkInDate, checkOutDate);
  };

  if (!isOpen || typeof window === "undefined") return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center px-[5%]">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-center text-neutral-800">
          Choose Your Stay Dates
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Check-in Date
            </label>
            <DatePicker
              selected={checkIn}
              onChange={(date) => {
                setCheckIn(date);
                if (date >= checkOut) {
                  setCheckOut(new Date(date.getTime() + 86400000));
                }
              }}
              minDate={today}
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
              minDate={new Date(checkIn.getTime() + 86400000)}
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

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={checkingAvailability}
            className="bg-neutral-900 hover:bg-neutral-700 text-white px-4 py-2 rounded-md transition"
          >
            {checkingAvailability ? "Checking..." : "Confirm Dates"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
