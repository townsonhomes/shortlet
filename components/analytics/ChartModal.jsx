// components/analytics/ChartModal.jsx
"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { exportDataAsCSV, exportSvgToPng } from "./utils/exporters";

export default function ChartModal({
  open,
  onClose,
  title,
  children,
  chartRef,
  csvData,
  csvFilename,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full h-full p-4">
        <div className="h-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-3 border-b">
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-gray-500">
                Export a PNG snapshot or download CSV data
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    const svg = chartRef?.current?.querySelector("svg");
                    if (!svg) throw new Error("Chart SVG not found");
                    await exportSvgToPng(
                      svg,
                      `${title.replace(/\s+/g, "-").toLowerCase()}.png`
                    );
                    toast.success("PNG downloaded");
                  } catch (err) {
                    console.error("Export PNG error:", err);
                    toast.error(err.message || "Failed to export PNG");
                  }
                }}
                className="px-3 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200"
              >
                Export PNG
              </button>

              {/* <button
                onClick={() => {
                  try {
                    exportDataAsCSV(
                      csvData,
                      csvFilename ||
                        `${title.replace(/\s+/g, "-").toLowerCase()}.csv`
                    );
                    toast.success("CSV downloaded");
                  } catch (err) {
                    console.error("Export CSV error:", err);
                    toast.error(err.message || "Failed to export CSV");
                  }
                }}
                className="px-3 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200"
              >
                Export CSV
              </button> */}

              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-auto" ref={chartRef}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
