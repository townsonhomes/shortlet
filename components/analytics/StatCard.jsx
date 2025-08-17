"use client";

import React from "react";

export default function StatCard({ label, value, icon: Icon, color = "blue" }) {
  const colorMap = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col justify-between">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-xl ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <div className="mt-4 text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
