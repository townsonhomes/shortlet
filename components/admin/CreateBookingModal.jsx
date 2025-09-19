"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";

export default function CreateBookingModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    shortlet: "",
    user: "",
    checkInDate: "",
    checkOutDate: "",
    totalAmount: "",
    adults: 1,
    children: 0,
    paymentReference: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings/addBooking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shortlet: form.shortlet,
          user: form.user,
          checkInDate: form.checkInDate,
          checkOutDate: form.checkOutDate,
          totalAmount: Number(form.totalAmount),
          status: "confirmed",
          guests: {
            adults: Number(form.adults),
            children: Number(form.children),
          },
          paymentReference: form.paymentReference,
          paid: true,
          channel: "manual",
          verifiedAt: new Date(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create booking");
      }

      onClose();
      window.location.reload(); // refresh to show new booking
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-gray-800 mb-4">
            Create Booking
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="shortlet"
              placeholder="Shortlet ID"
              value={form.shortlet}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
            <input
              type="text"
              name="user"
              placeholder="User ID"
              value={form.user}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                name="checkInDate"
                value={form.checkInDate}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
              <input
                type="date"
                name="checkOutDate"
                value={form.checkOutDate}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <input
              type="number"
              name="totalAmount"
              placeholder="Total Amount"
              value={form.totalAmount}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                name="adults"
                placeholder="Adults"
                value={form.adults}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
              <input
                type="number"
                name="children"
                placeholder="Children"
                value={form.children}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            <input
              type="text"
              name="paymentReference"
              placeholder="Payment Reference"
              value={form.paymentReference}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                {submitting ? "Saving..." : "Save Booking"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
