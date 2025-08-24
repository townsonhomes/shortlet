"use client";

import { useEffect, useState, useCallback } from "react";
import ShortletCard from "./ShortletCard";
import ShortletForm from "./ShortletForm";
import ConfirmModal from "../../ConfirmModal";
import { AnimatePresence, motion } from "framer-motion";
import {
  Listbox,
  ListboxOption,
  ListboxOptions,
  ListboxButton,
} from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { toast, ToastContainer } from "react-toastify";

/**
 * ShortletsSection
 * - Shows shortlets, filtering by owner
 * - Allows add/edit/delete
 * - Includes Export CSV button which exports filteredShortlets
 *   and attempts to include optional per-shortlet metrics from
 *   GET /api/admin/shortlets/:id/metrics (server endpoint optional).
 */
export default function ShortletsSection() {
  const [shortlets, setShortlets] = useState([]);
  const [filteredShortlets, setFilteredShortlets] = useState([]);
  const [uniqueOwners, setUniqueOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState("All Owners");

  const [showForm, setShowForm] = useState(false);
  const [editingShortlet, setEditingShortlet] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [exportLoading, setExportLoading] = useState(false);

  const fetchShortlets = async () => {
    try {
      const res = await fetch("/api/admin/shortlets/read");
      const data = await res.json();
      setShortlets(data || []);

      const owners = [
        "All Owners",
        ...Array.from(
          new Set(
            (data || [])
              .map((s) => s.ownership)
              .filter((o) => typeof o === "string" && o.trim().length > 0)
          )
        ),
      ];
      setUniqueOwners(owners);
      setFilteredShortlets(data || []);
    } catch (err) {
      console.error("Failed to fetch shortlets", err);
    }
  };

  useEffect(() => {
    fetchShortlets();
  }, []);

  // Filter logic
  useEffect(() => {
    if (selectedOwner === "All Owners") {
      setFilteredShortlets(shortlets);
    } else {
      setFilteredShortlets(
        shortlets.filter((s) => s.ownership === selectedOwner)
      );
    }
  }, [selectedOwner, shortlets]);

  const handleEdit = (shortlet) => {
    setEditingShortlet(shortlet);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingShortlet(null);
    setShowForm(false);
  };

  const handleRefresh = async () => {
    await fetchShortlets();
  };

  const confirmDelete = (id) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    setDeletingId(selectedId);
    try {
      const res = await fetch(`/api/admin/shortlets/delete/${selectedId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete shortlet");

      setShortlets((prev) => prev.filter((item) => item._id !== selectedId));
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeletingId(null);
      setSelectedId(null);
      setShowConfirm(false);
      // refresh to ensure consistent state
      fetchShortlets();
    }
  };

  // --- CSV export helpers ---

  const csvSafe = (v) => {
    if (v === null || v === undefined) return '""';
    const s = String(v);
    // Escape double quotes by doubling them
    const escaped = s.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const formatDateNice = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Optional: try fetch metrics for a shortlet. Endpoint is optional.
  const fetchShortletMetrics = async (id) => {
    try {
      const res = await fetch(`/api/admin/shortlets/${id}/metrics`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  };

  async function exportShortletsCSV() {
    try {
      setExportLoading(true);

      const res = await fetch("/api/admin/shortlets/metrics");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to fetch metrics");

      const items = json.items || [];
      console.log(items);
      // helpers
      const formatDate = (d) => {
        if (!d) return "";
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return "";
        const dd = String(dt.getDate()).padStart(2, "0");
        const mm = String(dt.getMonth() + 1).padStart(2, "0");
        const yy = dt.getFullYear();
        return `${dd}/${mm}/${yy}`; // 28/06/2025
      };

      const currency = (n) =>
        n === "" || n === null || n === undefined
          ? "₦0"
          : `₦${new Intl.NumberFormat("en-NG").format(Number(n) || 0)}`;

      // map booking.status -> nice label
      const niceBookingStatus = (s) =>
        s === "confirmed"
          ? "Checked in"
          : s === "cancelled"
          ? "Checked out"
          : s;

      // convert a booking into a compact multiline string with numbering
      const bookingToStr = (b, idx) => {
        const lines = [];
        lines.push(`${idx + 1}. ID: ${b._id}`);
        lines.push(`   Guest: ${b.userName || "Unknown"}`);
        lines.push(`   Email: ${b.userEmail || ""}`);
        lines.push(
          `   Dates: ${formatDate(b.checkInDate)} → ${formatDate(
            b.checkOutDate
          )}`
        );
        lines.push(
          `   Amount: ${currency(b.totalAmount)} • ${
            b.paid ? "Paid" : "Unpaid"
          }`
        );
        lines.push(`   Status: ${niceBookingStatus(b.status)}`);
        return lines.join("\n");
      };

      // CSV header
      const headers = [
        "Title",
        "Ownership",
        "Address",
        "Price",
        // "Rooms",
        // "Active",
        "Bookings Count",
        "Bookings ",
        "Bookings Revenue",
        "Services Revenue",
        "Total Revenue",
      ];

      const rows = items.map((it) => {
        const bookingsGrouped = (it.bookings || [])
          .map((b, i) => bookingToStr(b, i))
          .join("\n\n"); // double newline between numbered entries

        return [
          it.title ?? "",
          it.ownership ?? "",
          it.address ?? "",
          it.price ? `#${it.price}` : "",
          // it.rooms ?? "",
          // it.active ? "Yes" : "No",
          it.bookingsCount ?? 0,
          bookingsGrouped,
          it.bookingsRevenue ? `#${it.bookingsRevenue}` : "",
          it.servicesRevenue ? `#${it.servicesRevenue}` : "",
          it.totalRevenue ? `#${it.totalRevenue}` : "",
        ];
      });

      // CSV escaping: wrap in quotes if necessary and escape internal quotes
      const escapeCell = (value) => {
        if (value === null || value === undefined) return "";
        const str = String(value);
        // if contains " or , or newline, wrap in quotes and escape existing quotes
        if (/[",\n]/.test(str)) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // build CSV with BOM so Excel picks up UTF-8
      const bom = "\uFEFF";
      const csv =
        bom +
        [
          headers.map(escapeCell).join(","),
          ...rows.map((r) => r.map(escapeCell).join(",")),
        ].join("\r\n");

      // download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const now = new Date();
      const localDateStr = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const filename = `shortlets-metrics-${localDateStr}.csv`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
      toast.error("Failed to export CSV: " + (err.message || err));
    } finally {
      setExportLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" />
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Manage Shortlets
        </h2>
        <div className="flex gap-4 items-center">
          {/* Owner Filter Dropdown */}
          <div className="w-48 text-sm">
            <Listbox value={selectedOwner} onChange={setSelectedOwner}>
              <div className="relative mt-1">
                <ListboxButton className="relative w-full cursor-pointer rounded border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:border-yellow-500">
                  <span className="block truncate">{selectedOwner}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </ListboxButton>

                <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                  {uniqueOwners.map((owner, idx) => (
                    <ListboxOption
                      key={idx}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                          active
                            ? "bg-yellow-100 text-yellow-800"
                            : "text-gray-900"
                        }`
                      }
                      value={owner}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? "font-medium" : "font-normal"
                            }`}
                          >
                            {owner}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-yellow-600">
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-yellow-500 text-white rounded font-semibold hover:bg-yellow-600 text-sm"
          >
            + Add Shortlet
          </button>

          <button
            onClick={exportShortletsCSV}
            className={`px-3 py-2 border bg-yellow-500 text-white rounded text-sm font-semibold hover:bg-yellow-600 flex items-center gap-2 ${
              exportLoading ? "opacity-70 pointer-events-none" : ""
            }`}
            title="Export shortlets to CSV (includes bookings metrics if available)"
          >
            {exportLoading ? (
              <svg
                className="animate-spin h-4 w-4 text-gray-600"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            ) : (
              "Export CSV"
            )}
          </button>
        </div>
      </div>

      {/* Shortlet Cards Grid */}
      <AnimatePresence mode="sync">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShortlets.map((shortlet) => (
            <motion.div
              key={shortlet._id}
              layout
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <ShortletCard
                shortlet={shortlet}
                onEdit={handleEdit}
                onDelete={confirmDelete}
                isDeleting={deletingId === shortlet._id}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Add/Edit Form */}
      {showForm && (
        <ShortletForm
          shortlet={editingShortlet}
          onClose={handleCloseForm}
          onRefresh={handleRefresh}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete an Apartment"
        description="Are you sure you want to delete this shortlet? This action cannot be undone."
      />
    </div>
  );
}
