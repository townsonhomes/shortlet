"use client";
import Image from "next/image";
import { CalendarDays, Users } from "lucide-react";
import { format } from "date-fns";
import AvailabilityTag from "./AvailabilityTag";
import RoomModal from "@/components/RoomModal";
import { useState } from "react";
import { isCurrentlyBooked, getNextAvailability } from "@/utils/bookingUtils";

export default function RoomCard({ room }) {
  const [isOpen, setIsOpen] = useState(false);

  const isBookedNow = isCurrentlyBooked(room.bookedDates || []);
  const nextAvailableDate = getNextAvailability(room.bookedDates || []);

  const availableText = isBookedNow
    ? nextAvailableDate
      ? `Available from ${format(nextAvailableDate, "dd MMM yyyy")}`
      : "Currently Unavailable"
    : "Available Now";

  return (
    <div className="flex md:flex-row bg-white shadow rounded-2xl overflow-hidden border border-gray-200 w-full h-full">
      {/* Image Section */}
      <div className="md:w-1/3 max-md:w-[55%] h-auto relative">
        <Image
          src={room.images?.[0] || "https://via.placeholder.com/600x400"}
          fill
          className="object-cover"
          alt={room.title}
        />
      </div>

      {/* Content */}
      <div className="md:w-2/3 w-full flex flex-col justify-between">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-1">
            {room.title || "Untitled Room"}
          </h2>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" /> 1 pers. min.
            </div>
          </div>

          <p className="text-lg font-semibold mb-1">
            ₦{room.pricePerDay?.toLocaleString()}
            <span className="text-base font-normal"> / Night</span>
          </p>
          <p className="text-gray-500  text-[14px] font-medium">
            {room.category}
          </p>
        </div>

        <div className="bg-gray-100 px-5 py-3 flex items-center justify-between">
          {/* <AvailabilityTag status={availableText} isNow={!isBookedNow} /> */}
          <button
            onClick={() => setIsOpen(true)}
            className="bg-neutral-900 text-white rounded px-4 py-2 text-sm hover:bg-neutral-700 transition ml-auto"
          >
            Select
          </button>
        </div>
      </div>

      <RoomModal isOpen={isOpen} onClose={() => setIsOpen(false)} room={room} />
    </div>
  );
}
