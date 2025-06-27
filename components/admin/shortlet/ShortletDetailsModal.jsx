"use client";

import Image from "next/image";
import { X } from "lucide-react";

export default function ShortletDetailsModal({ shortlet, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-start pt-20 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 relative animate-fadeIn space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-black"
        >
          <X />
        </button>

        <div className="flex mt-8">
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-gray-800">
              {shortlet.title}
            </h2>

            <p className="text-sm text-gray-600">{shortlet.location}</p>
            <p className="text-sm text-gray-500">{shortlet.category}</p>

            <div className="text-yellow-600 font-semibold text-base">
              ₦{shortlet.pricePerDay.toLocaleString()} / night
            </div>

            {shortlet.description && (
              <p className="text-sm text-gray-700">{shortlet.description}</p>
            )}
          </div>
          <div className="ml-auto md:ml-[30%] flex flex-col justify-center items-start">
            {/* Amenities */}
            {shortlet.amenities?.length > 0 && (
              <div className="flex flex-col justify-end items-end">
                <h4 className="mt-4 text-sm font-medium text-gray-800 mr-auto">
                  Amenities
                </h4>
                <div className="flex flex-wrap gap-2 mt-6 text-xs">
                  {shortlet.amenities.map((a, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 rounded-full border text-gray-700"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {shortlet.images.map((url, i) => (
            <div
              key={i}
              className="relative w-full aspect-square bg-gray-100 rounded overflow-hidden"
            >
              <Image
                src={url}
                alt={`shortlet-${i}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
