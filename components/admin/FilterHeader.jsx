"use client";
import { useState } from "react";

export default function FilterHeader({ onSearchChange, onStatusChange }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleStatus = (e) => {
    const value = e.target.value;
    setStatus(value);
    onStatusChange(value);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search by guest name or room type"
        className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />
      <select
        value={status}
        onChange={handleStatus}
        className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        <option value="all">All Statuses</option>
        <option value="confirmed">Confirmed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}
