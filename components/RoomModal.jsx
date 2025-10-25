"use client";

import Image from "next/image";
import { X, Users, Ruler, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { useSession } from "next-auth/react";
import DateSelectionModal from "@/components/DateSelectionModal";
import { toast } from "react-hot-toast";

export default function RoomModal({ isOpen, onClose, room }) {
  const images =
    Array.isArray(room?.images) && room.images.length ? room.images : [];
  const [previewIndex, setPreviewIndex] = useState(null); // null = closed
  const [showDateModal, setShowDateModal] = useState(false);
  const { bookingDates } = useBooking();
  const router = useRouter();
  const { data: session } = useSession();

  const handleBookClick = () => {
    const { _id: roomId } = room;
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
      router.push("/register");
    }
  };

  const handleConfirmDates = (newCheckIn, newCheckOut) => {
    setShowDateModal(false);
    const { _id: roomId } = room;
    const bookingData = {
      roomId,
      checkInDate: newCheckIn,
      checkOutDate: newCheckOut,
    };

    if (session?.user) {
      router.push(
        `/booking/${roomId}?checkInDate=${newCheckIn}&checkOutDate=${newCheckOut}`
      );
    } else {
      localStorage.setItem("bookingData", JSON.stringify(bookingData));
      router.push("/register");
    }
  };

  // Slider controls
  const openPreviewAt = (index) => {
    if (!images.length) return;
    setPreviewIndex(index);
  };

  const closePreview = () => setPreviewIndex(null);

  const next = useCallback(() => {
    if (images.length === 0) return;
    setPreviewIndex((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % images.length;
    });
  }, [images.length]);

  const prev = useCallback(() => {
    if (images.length === 0) return;
    setPreviewIndex((prev) => {
      if (prev === null) return images.length - 1;
      return (prev - 1 + images.length) % images.length;
    });
  }, [images.length]);

  // keyboard navigation
  useEffect(() => {
    if (previewIndex === null) return;
    function onKey(e) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") closePreview();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewIndex, next, prev]);

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
                {/* Main image - clicking opens slider at index 0 */}
                <div
                  className="relative h-56 md:h-72 w-full cursor-pointer"
                  onClick={() => openPreviewAt(0)}
                >
                  {images[0] ? (
                    <Image
                      src={images[0]}
                      alt="Main"
                      fill
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded" />
                  )}
                </div>

                {/* Thumbnails - show up to 5 more (same slice but we'll include all clickable) */}
                <div className="grid grid-cols-3 gap-2">
                  {images.slice(1, 7).map((img, i) => (
                    <div
                      key={i + 1}
                      className="relative w-full h-24 cursor-pointer"
                      onClick={() => openPreviewAt(i + 1)}
                    >
                      <Image
                        src={img}
                        alt={`img-${i + 1}`}
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

      {/* Slider preview dialog */}
      <Dialog
        open={previewIndex !== null}
        onClose={closePreview}
        className="fixed inset-0 z-[60]"
      >
        <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="relative max-w-6xl w-full">
            {/* Close button */}
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 z-30 text-white hover:text-gray-300"
              aria-label="Close preview"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev / Next buttons */}
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/40 p-2 hover:bg-black/60"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/40 p-2 hover:bg-black/60"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Main image area */}
            <div className="relative w-full h-[80vh] flex items-center justify-center bg-black/60 rounded">
              {previewIndex !== null && images[previewIndex] ? (
                <div className="relative w-full h-[80vh]">
                  <Image
                    src={images[previewIndex]}
                    alt={`preview-${previewIndex}`}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="text-white">No image</div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="mt-4 flex items-center justify-center gap-3 overflow-x-auto py-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setPreviewIndex(i)}
                  className={`relative w-20 h-14 flex-shrink-0 rounded overflow-hidden ring-2 ${
                    i === previewIndex ? "ring-white" : "ring-transparent"
                  }`}
                  aria-label={`Open image ${i + 1}`}
                >
                  <Image
                    src={img}
                    alt={`thumb-${i}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <DateSelectionModal
        isOpen={showDateModal}
        onClose={() => setShowDateModal(false)}
        onConfirm={handleConfirmDates}
        room={room}
      />
    </Dialog>
  );
}
