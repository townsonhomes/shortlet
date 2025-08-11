"use client";

import Image from "next/image";
import { X } from "lucide-react";

export default function ImagePreviewModal({ previewUrl, onClose }) {
  return (
    <div className="fixed inset-0 py-[7%] px-[5%] bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-white p-4 rounded shadow-md max-w-lg w-full">
        <button
          onClick={onClose}
          className="absolute top-2 h-5 w-5 z-10 p-4 right-5 text-gray-500 hover:text-black"
        >
          <X size={20} />
        </button>
        <div className="relative w-full h-[60vh]">
          <Image
            src={previewUrl}
            alt="Full ID Preview"
            fill
            className="object-contain rounded"
          />
        </div>
      </div>
    </div>
  );
}
