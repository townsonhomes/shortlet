"use client";

import Image from "next/image";
import { X, Users, Ruler } from "lucide-react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { useSession } from "next-auth/react";
import DateSelectionModal from "@/components/DateSelectionModal";
import { toast } from "react-hot-toast";

export default function RoomModal({ isOpen, onClose, room }) {
  const [previewImg, setPreviewImg] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const { bookingDates } = useBooking();
  const router = useRouter();
  const { data: session } = useSession();

  const handleBookClick = () => {
    const { _id: roomId, bookedDates } = room;
    const { checkInDate: checkInDateRaw, checkOutDate: checkOutDateRaw } =
      bookingDates;
    const checkInDate = checkInDateRaw === "null" ? null : checkInDateRaw;
    const checkOutDate = checkOutDateRaw === "null" ? null : checkOutDateRaw;

    if (!checkInDate || !checkOutDate) {
      setShowDateModal(true);
      return;
    }

    const bookingData = {
      roomId,
      checkInDate,
      checkOutDate,
    };

    if (session?.user) {
      router.push(
        `/booking/${roomId}?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
      );
    } else {
      if (checkInDate && checkOutDate) {
        localStorage.setItem("bookingData", JSON.stringify(bookingData));
      }
      router.push("/login");
    }
  };

  const handleConfirmDates = (newCheckIn, newCheckOut) => {
    setShowDateModal(false);

    // Optional: Update context or bookingDates here
    router.push(
      `/booking/${room._id}?checkInDate=${newCheckIn}&checkOutDate=${newCheckOut}`
    );
  };

  const facilities = room.amenities;
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Modal panel */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="bg-white max-w-5xl w-full rounded-xl overflow-hidden shadow-lg">
            <div className="p-6 border-b border-gray-200 flex justify-between items-start">
              <h2 className="text-xl font-semibold">{room.title}</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="space-y-4">
                <div className="relative h-56 md:h-72 w-full">
                  <Image
                    onClick={() => setPreviewImg(room.images[0])}
                    src={room.images[0]}
                    alt="Main"
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {room.images.slice(1, 6).map((img, i) => (
                    <div
                      key={i}
                      className="relative w-full h-24 cursor-pointer"
                      onClick={() => setPreviewImg(img)}
                    >
                      <Image
                        src={img}
                        alt={`img-${i}`}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between h-full space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-700">
                      Room Description
                    </h3>
                    <p className="text-sm text-gray-600">
                      {room.description || "Shortlet Apartment"}
                    </p>
                  </div>

                  <hr className="border-gray-200" />

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> 1 pers. min.
                    </div>
                    <div className="flex items-center gap-1">
                      <Ruler className="w-4 h-4" /> Size: Spacious
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">
                      Room Facilities
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {facilities?.map((item, i) => (
                        <div
                          key={i}
                          className="bg-gray-100 px-3 py-2 rounded-full text-sm text-gray-700"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleBookClick}
                    className="bg-neutral-900 hover:bg-neutral-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Book This Room
                  </button>
                  <p className="text-xl font-semibold">
                    ₦{room.pricePerDay?.toLocaleString()}{" "}
                    <span className="text-sm font-normal text-gray-500">
                      / night
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>

      {previewImg && (
        <Dialog
          open={true}
          onClose={() => setPreviewImg(null)}
          className="fixed inset-0 z-[60]"
        >
          <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="relative max-w-5xl w-full">
              <button
                onClick={() => setPreviewImg(null)}
                className="absolute top-4 right-4 z-10 text-white hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="relative w-full h-[80vh]">
                <Image
                  src={previewImg}
                  alt="Preview"
                  fill
                  className="object-contain rounded"
                />
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}

      <DateSelectionModal
        isOpen={showDateModal}
        onClose={() => setShowDateModal(false)}
        onConfirm={handleConfirmDates}
        room={room}
      />
    </Dialog>
  );
}
