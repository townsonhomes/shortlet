// components/DateRangePicker.jsx
"use client";

import { useState } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { FaCalendarAlt } from "react-icons/fa";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function DateRangePicker({ value, onChange }) {
  const [showPicker, setShowPicker] = useState(false);

  const formattedRange =
    value?.startDate && value?.endDate
      ? `${format(value.startDate, "dd MMM yyyy")} - ${format(
          value.endDate,
          "dd MMM yyyy"
        )}`
      : "Select date range";

  return (
    <div className="relative w-full sm:min-w-[200px] max-w-xs text-sm">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="flex items-center justify-between w-full px-4 py-[10px] border rounded-md bg-white shadow-sm text-gray-700 hover:border-yellow-500"
      >
        <span className="truncate">{formattedRange}</span>
        <FaCalendarAlt className="ml-2 text-yellow-600" />
      </button>

      {showPicker && (
        <div className="absolute mt-2 z-50 right-0 sm:left-0 max-w-[90vw] sm:max-w-md bg-white border rounded-md shadow-lg overflow-auto">
          <DateRange
            ranges={[value]}
            onChange={(ranges) => {
              onChange(ranges.selection);
            }}
            moveRangeOnFirstSelection={false}
            rangeColors={["#facc15"]}
            maxDate={new Date()}
            editableDateInputs={true}
            showMonthAndYearPickers={true}
          />
        </div>
      )}
    </div>
  );
}
