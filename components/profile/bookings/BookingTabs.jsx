"use client";
import { useState } from "react";
import BookingTable from "./BookingTable";

export default function BookingTabs({ bookings }) {
  const [filter, setFilter] = useState("all");

  const filtered = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status?.toLowerCase() === filter;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Your Bookings</h2>
      <div className="flex flex-wrap gap-3 mt-8">
        {["all", "confirmed", "cancelled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`capitalize px-4 py-2 rounded-md border text-sm font-medium transition ${
              filter === tab
                ? "bg-yellow-100 shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <BookingTable bookings={filtered} />
    </div>
  );
}
