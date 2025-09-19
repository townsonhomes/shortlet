"use client";

import { X, Loader2 } from "lucide-react";
import { useState } from "react";

export default function AddServiceModal({
  user,
  shortlet,
  bookingId,
  requestedBy,
  isOpen,
  onClose,
}) {
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [markAsPaid, setMarkAsPaid] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");

  if (!isOpen) return null;

  async function handleSubmitService() {
    setLoading(true);
    setError("");

    try {
      // basic validation
      if (!description.trim()) {
        setError("Please enter a service description.");
        setLoading(false);
        return;
      }
      if (price === "" || Number.isNaN(Number(price))) {
        setError("Please enter a valid price.");
        setLoading(false);
        return;
      }

      const body = {
        userId: user._id,
        shortletId: shortlet._id,
        bookingId,
        requestedBy,
        description: description.trim(),
        price: Number(price),
        paid: !!markAsPaid,
      };

      if (
        markAsPaid &&
        paymentReference &&
        String(paymentReference).trim() !== ""
      ) {
        body.paymentReference = String(paymentReference).trim();
      }

      const res = await fetch("/api/admin/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Service request failed");

      // reset
      setDescription("");
      setPrice("");
      setMarkAsPaid(false);
      setPaymentReference("");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add service");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center px-4">
      <div className="bg-white w-full max-w-md rounded-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          aria-label="Close"
          type="button"
        >
          <X />
        </button>
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Add Service for {user?.name}
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Service description"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Service price"
            className="w-full px-4 py-2 border rounded-lg"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={markAsPaid}
              onChange={(e) => setMarkAsPaid(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">Mark service as already paid</span>
          </label>

          {markAsPaid && (
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Payment reference (optional)"
              className="w-full px-4 py-2 border rounded-lg"
            />
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handleSubmitService}
            disabled={loading}
            className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 flex items-center justify-center gap-2"
            type="button"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? "Adding..." : "Add Service"}
          </button>
        </div>
      </div>
    </div>
  );
}
