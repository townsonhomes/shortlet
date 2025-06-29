"use client";

import React, { useState, useEffect, useRef } from "react";
import { DateRange } from "react-date-range";
import { FaSearch, FaBuilding, FaCalendarAlt } from "react-icons/fa";
import { MdExpandMore } from "react-icons/md";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const SearchCard = ({ className }) => {
  const [openCheckIn, setOpenCheckIn] = useState(false);
  const [openCheckOut, setOpenCheckOut] = useState(false);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [shortletType, setShortletType] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const dropdownRef = useRef();
  const checkInRef = useRef();
  const checkOutRef = useRef();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/shortlets/categories");
        const data = await res.json();
        data.length && setCategories(["All", ...data]); // <-- Add "All" at the top
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    fetchCategories();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (checkInRef.current && !checkInRef.current.contains(event.target)) {
        setOpenCheckIn(false);
      }
      if (checkOutRef.current && !checkOutRef.current.contains(event.target)) {
        setOpenCheckOut(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    setLoading(true);
    try {
      const hasCategory = !!shortletType;
      const hasCheckIn = !!checkInDate;
      const hasCheckOut = !!checkOutDate;
      const isAllCategory = shortletType === "All";

      if (hasCheckIn && hasCheckOut) {
        if (
          format(checkInDate, "yyyy-MM-dd") ===
          format(checkOutDate, "yyyy-MM-dd")
        ) {
          toast.error("Check-in and check-out cannot be the same day.", {
            style: {
              background: "#fef2f2",
              color: "#991b1b",
              fontWeight: "600",
              border: "1px solid #fecaca",
            },
          });
          return setLoading(false);
        }

        if (checkOutDate < checkInDate) {
          toast.error("Check-out cannot be before check-in.", {
            style: {
              background: "#fef2f2",
              color: "#991b1b",
              fontWeight: "600",
              border: "1px solid #fecaca",
            },
          });
          return setLoading(false);
        }

        if (
          format(checkInDate, "yyyy-MM-dd") <
            format(new Date(), "yyyy-MM-dd") ||
          format(checkInDate, "yyyy-MM-dd") < format(new Date(), "yyyy-MM-dd")
        ) {
          toast.error("Input Valid Dates", {
            style: {
              background: "#fef2f2",
              color: "#991b1b",
              fontWeight: "600",
              border: "1px solid #fecaca",
            },
          });
          return setLoading(false);
        }
      }

      if (!hasCategory && !hasCheckIn && !hasCheckOut) {
        // allow showing all results
        router.push(`/search`);
        return;
      }

      const params = new URLSearchParams();
      if (shortletType && shortletType !== "All") {
        params.set("category", shortletType);
      }
      if (hasCheckIn)
        params.set("checkInDate", format(checkInDate, "yyyy-MM-dd"));
      if (hasCheckOut)
        params.set("checkOutDate", format(checkOutDate, "yyyy-MM-dd"));
      if (!isAllCategory) {
        params.set("category", shortletType);
      }
      router.push(`/search?${params.toString()}`);
    } finally {
      setTimeout(() => setLoading(false), 800); // small delay for UX polish
    }
  };

  return (
    <div
      className={`-mb-30 w-11/12 md:w-[90%] lg:w-[80%] rounded-3xl bg-gray-100 p-4 z-20 ${className}`}
    >
      <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Shortlet Type Dropdown */}
        <div
          ref={dropdownRef}
          className="relative w-full md:w-1/4 border-l md:border-l-0 md:border-r flex items-center gap-2 px-3 py-2"
        >
          <FaBuilding className="text-gray-400" />
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full text-left flex justify-between items-center focus:outline-none"
          >
            <span className="text-gray-500">
              {shortletType || "Shortlet Type"}
            </span>
            <MdExpandMore className="text-gray-400" />
          </button>
          {dropdownOpen && (
            <ul className="absolute top-full left-0 w-full mt-1 bg-white shadow-md rounded-md z-50">
              {categories.length === 0 ? (
                <li className="px-4 py-2 flex items-center justify-center gap-2 text-sm text-gray-400 italic">
                  <Loader2 className="animate-spin h-4 w-4 text-gray-400" />
                </li>
              ) : (
                categories.map((type) => (
                  <li
                    key={type}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      setShortletType(type);
                      setDropdownOpen(false);
                    }}
                  >
                    <span className="text-gray-500">
                      {type || "All Shortlets"}
                    </span>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {/* Check-In Picker */}
        <div
          ref={checkInRef}
          className="relative w-full md:w-1/4 border-l md:border-r md:border-l-0 flex items-center gap-2 px-3 py-2"
        >
          <FaCalendarAlt className="text-gray-400" />
          <div
            onClick={() => setOpenCheckIn(!openCheckIn)}
            className="cursor-pointer text-gray-500"
          >
            {checkInDate ? format(checkInDate, "MM/dd/yyyy") : "Check-In"}
          </div>
          {openCheckIn && (
            <div className="absolute top-full left-0 mt-2 z-50">
              <DateRange
                editableDateInputs={true}
                onChange={(item) => {
                  setCheckInDate(item.selection.startDate);
                  setOpenCheckIn(false);
                }}
                moveRangeOnFirstSelection={false}
                ranges={[
                  {
                    startDate: checkInDate || new Date(),
                    endDate: checkInDate || new Date(),
                    key: "selection",
                  },
                ]}
              />
            </div>
          )}
        </div>

        {/* Check-Out Picker */}
        <div
          ref={checkOutRef}
          className="relative w-full md:w-1/4 border-l md:border-l-0 flex items-center gap-2 px-3 py-2"
        >
          <FaCalendarAlt className="text-gray-400" />
          <div
            onClick={() => setOpenCheckOut(!openCheckOut)}
            className="cursor-pointer text-gray-500"
          >
            {checkOutDate ? format(checkOutDate, "MM/dd/yyyy") : "Check-Out"}
          </div>
          {openCheckOut && (
            <div className="absolute top-full left-0 mt-2 z-50">
              <DateRange
                editableDateInputs={true}
                onChange={(item) => {
                  setCheckOutDate(item.selection.endDate);
                  setOpenCheckOut(false);
                }}
                moveRangeOnFirstSelection={false}
                ranges={[
                  {
                    startDate: checkOutDate || new Date(),
                    endDate: checkOutDate || new Date(),
                    key: "selection",
                  },
                ]}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSearch}
          className="bg-gray-900 text-white px-6 py-3 rounded-md flex items-center gap-2 w-full md:w-auto justify-center text-sm hover:bg-gray-800 transition"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
            </>
          ) : (
            <>
              <FaSearch /> Search
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SearchCard;
