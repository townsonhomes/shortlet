// components/StatusFilter.jsx
"use client";

import { FaFilter } from "react-icons/fa";

export default function StatusFilter({ value, onChange }) {
  return (
    <div className="relative w-full sm:min-w-[200px] max-w-xs">
      <FaFilter className="absolute max-sm:hidden left-3 top-1/2 -translate-y-1/2 text-yellow-500 text-sm pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-[10px] border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white shadow-sm truncate"
      >
        <option value="all">All Statuses</option>
        <option value="confirmed">Confirmed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}
