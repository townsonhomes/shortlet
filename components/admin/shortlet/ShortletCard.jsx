"use client";

import Image from "next/image";
import { Pencil } from "lucide-react";
import { motion } from "framer-motion";
import ShortletDetailsModal from "./ShortletDetailsModal";
import BookingFormModal from "./BookingFormModal";
import { useState } from "react";

export default function ShortletCard({
  shortlet,
  onEdit,
  onDelete,
  isDeleting,
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`bg-white shadow-md rounded-2xl overflow-hidden relative group ${
          isDeleting ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {/* Image */}
        <div className="relative w-full h-48 bg-gray-100">
          <Image
            src={shortlet.images?.[0] || "/images/house1.png"}
            alt={shortlet.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-2xl"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority
          />
        </div>

        {/* Content */}
        <div className="p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              {shortlet.title}
            </h3>
            <span className="text-sm text-gray-500">{shortlet.category}</span>
          </div>
          <div className="flex">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-600">{shortlet.location}</p>

              <div className="text-base font-bold text-green-400">
                ₦{shortlet.pricePerDay.toLocaleString()} / night
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-auto">
                {shortlet.amenities?.slice(0, 3).map((amenity, index) => (
                  <span
                    key={index}
                    className={`bg-gray-100 px-2 py-1 rounded-full border text-gray-600 ${
                      !amenity && "hidden"
                    }`}
                  >
                    {amenity}
                  </span>
                ))}
                {shortlet.amenities?.length > 3 && (
                  <span className="text-gray-400">
                    +{shortlet.amenities.length - 3} more
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col ml-auto justify-end gap-3">
              <div className="flex justify-between items-center pb-4 mt-2 ml-auto">
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-sm px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 shadow-sm"
                >
                  View More
                </button>
              </div>

              <button
                onClick={() => setShowBookingModal(true)}
                className="px-0.5 py-1.5 bg-green-500 text-white rounded text-[12px] hover:bg-green-600"
              >
                + Add Booking
              </button>

              {/* Delete Trigger */}
              <div className="flex ml-auto self-end pt-1">
                <button
                  onClick={() => onDelete(shortlet._id)}
                  disabled={isDeleting}
                  className={`w-22 h-8 inline-flex items-center justify-center gap-2 text-sm font-medium rounded-md border border-red-500 text-red-600 hover:bg-red-100 transition-all duration-200 ${
                    isDeleting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  {isDeleting ? "..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={() => onEdit(shortlet)}
          className="absolute top-3 right-3 bg-white text-gray-700 p-1.5 rounded-full shadow hover:bg-yellow-100 z-10"
          aria-label="Edit Apartment"
        >
          <Pencil size={16} />
        </button>
      </motion.div>
      {showDetails && (
        <ShortletDetailsModal
          shortlet={shortlet}
          onClose={() => setShowDetails(false)}
        />
      )}
      {showBookingModal && (
        <BookingFormModal
          shortlet={shortlet}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {}}
        />
      )}
    </>
  );
}
