// components/admin/StatCard.jsx
"use client";
import React from "react";

export default function StatCard({ icon, label, value }) {
  return (
    <div className="bg-[#fffaf2] rounded-lg p-4 flex items-center shadow-sm w-full">
      <div className="bg-yellow-300 text-black p-3 rounded-full text-xl mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
