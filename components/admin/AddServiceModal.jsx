"use client";

import { X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

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

  if (!isOpen) return null;

  async function handleSubmitService() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          shortletId: shortlet._id,
          bookingId,
          requestedBy,
          description,
          price: Number(price),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Service request failed");

      setDescription("");
      setPrice("");
      onClose();
    } catch (err) {
      setError(err.message);
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
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            onClick={handleSubmitService}
            disabled={loading}
            className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? "Adding..." : "Add Service"}
          </button>
        </div>
      </div>
    </div>
  );
}
