// components/analytics/utils/exporters.js
"use client";

import { toast } from "react-toastify";

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportDataAsCSV(data = [], filename = "chart-data.csv") {
  if (!data || !data.length) {
    toast.error("No data to export");
    return;
  }
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const v = row[h] ?? "";
        return `"${String(v).replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

export async function exportSvgToPng(svgElement, filename = "chart.png") {
  if (!svgElement) throw new Error("No SVG element found");

  const clone = svgElement.cloneNode(true);
  if (!clone.getAttribute("xmlns"))
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.crossOrigin = "anonymous";

  return new Promise((resolve, reject) => {
    img.onload = () => {
      try {
        const ratio = window.devicePixelRatio || 1;
        const width = svgElement.clientWidth || 1200;
        const height = svgElement.clientHeight || 600;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const ctx = canvas.getContext("2d");
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              downloadBlob(blob, filename);
              URL.revokeObjectURL(url);
              resolve();
            } else {
              URL.revokeObjectURL(url);
              reject(new Error("Failed to create blob from canvas"));
            }
          },
          "image/png",
          0.95
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG image for export"));
    };
    img.src = url;
  });
}
