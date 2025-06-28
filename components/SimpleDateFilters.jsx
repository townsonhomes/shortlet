"use client";

export default function SimpleDateFilters({ checkIn, checkOut, onChange }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formattedTomorrow = tomorrow.toISOString().split("T")[0];

  return (
    <div className="flex gap-3  items-center">
      <div className="flex flex-col text-sm">
        <label htmlFor="check-in" className="mb-1 text-gray-600">
          Check-In
        </label>
        <input
          type="date"
          id="check-in"
          value={checkIn || ""}
          onChange={(e) => onChange("checkIn", e.target.value)}
          className="px-3 py-2 border rounded-md text-sm focus:ring-yellow-500 focus:outline-none min-h-[2.5rem] min-w-[7rem]"
        />
      </div>

      <div className="flex flex-col text-sm">
        <label htmlFor="check-out" className="mb-1 text-gray-600">
          Check-Out
        </label>
        <input
          type="date"
          id="check-out"
          value={checkOut || ""}
          onChange={(e) => onChange("checkOut", e.target.value)}
          className="px-3 py-2 border rounded-md text-sm focus:ring-yellow-500 focus:outline-none min-h-[2.5rem] min-w-[7rem]"
        />
      </div>
    </div>
  );
}
