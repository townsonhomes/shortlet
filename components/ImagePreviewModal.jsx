"use client";

import Image from "next/image";
import { X, Download } from "lucide-react";
import { useState } from "react";

export default function ImagePreviewModal({ previewUrl, onClose }) {
  const [downloading, setDownloading] = useState(false);

  const getFileNameFromUrl = (url) => {
    try {
      const pathname = new URL(url).pathname;
      const name = pathname.split("/").pop();
      return name || "image.jpg";
    } catch {
      const parts = url.split("/").pop().split("?")[0];
      return parts || "image.jpg";
    }
  };

  const handleDownload = async () => {
    if (!previewUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(previewUrl, { mode: "cors" });
      if (!res.ok) throw new Error(`Network error: ${res.status}`);
      const blob = await res.blob();
      const filename = getFileNameFromUrl(previewUrl);

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      alert("Failed to download image: " + (err?.message || err));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 py-[7%] px-[5%] bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-white p-4 rounded shadow-md max-w-3xl w-full">
        {/* Top controls: download + close */}
        <div className="absolute top-3 right-4 z-10 flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`flex items-center gap-2 px-3 py-2 rounded-md shadow-sm border transition-colors text-sm
              ${
                downloading
                  ? "bg-emerald-400 cursor-wait opacity-80"
                  : "bg-emerald-600 hover:bg-emerald-500"
              }
              focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-white`}
            aria-label="Download image"
            title="Download image"
          >
            {downloading ? (
              <svg
                className="animate-spin w-4 h-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : (
              <Download size={16} className="text-white" />
            )}
            <span className="text-white">
              {downloading ? "Downloading..." : "Download"}
            </span>
          </button>

          <button
            onClick={onClose}
            className="h-8 w-8 z-10 p-2 text-gray-500 hover:text-black bg-white rounded-full shadow-sm border border-gray-200"
            aria-label="Close preview"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative w-full h-[60vh]">
          <Image
            src={previewUrl}
            alt="Full ID Preview"
            fill
            className="object-contain rounded"
            priority
          />
        </div>
      </div>
    </div>
  );
}
