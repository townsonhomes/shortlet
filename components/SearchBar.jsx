// components/SearchBar.jsx
"use client";
"use client";

import { useEffect, useMemo, useRef } from "react";
import { throttle } from "lodash";

export default function SearchBar({ value, onChange, placeholder }) {
  const throttledOnChange = useRef();

  // memoize the throttled function so it's stable across renders
  useEffect(() => {
    throttledOnChange.current = throttle((val) => {
      onChange(val);
    }, 500); // throttle delay (ms)

    return () => {
      throttledOnChange.current.cancel(); // clean up
    };
  }, [onChange]);

  const handleChange = (e) => {
    const val = e.target.value || "";
    throttledOnChange.current(val);
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder || "Search..."}
      maxLength={50}
      className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
    />
  );
}

// export default function SearchBar({ value, onChange, placeholder }) {
//   return (
//     <input
//       type="text"
//       value={value}
//       onChange={(e) => onChange(e.target.value || "")}
//       placeholder={placeholder || "Search..."}
//       className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
//     />
//   );
// }
