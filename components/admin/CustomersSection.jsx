"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail } from "lucide-react";
import SearchBar from "../SearchBar";
import MessageModal from "@/components/admin/MessageModal";
import toast from "react-hot-toast";
import Image from "next/image";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import { useSession } from "next-auth/react";

/**
 * GuestsTable
 * - props:
 *    users: array of user objects (server-provided)
 *
 * Integrations:
 * - GET /api/admin/customers/with-bookings  => { map: { userId: count }, list: [...] }
 * - GET /api/admin/customers/export?haveBooked=true|false  => returns CSV blob
 */
export default function GuestsTable({ users = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageURL, setImageURL] = useState("");
  const { data: session } = useSession();
  const role = session?.user.role;
  // Filter: "all" | "haveBooked"
  const [customerFilter, setCustomerFilter] = useState("all");

  // booking map loaded from server: { userId: count }
  const [bookedMap, setBookedMap] = useState(null);
  const [loadingBookedMap, setLoadingBookedMap] = useState(false);

  // for export button
  const [exportLoading, setExportLoading] = useState(false);

  // Load bookedMap on mount (one aggregate call)
  useEffect(() => {
    let mounted = true;
    async function loadBookedMap() {
      setLoadingBookedMap(true);
      try {
        const res = await fetch("/api/admin/customers/with-bookings");
        const json = await res.json();
        if (!res.ok) {
          console.error("with-bookings error", json);
          throw new Error(json?.error || "Failed to load booking map");
        }
        if (!mounted) return;
        setBookedMap(json.map || {});
      } catch (err) {
        console.error("Failed to load bookings map", err);
        toast.error("Failed to load booking counts");
        // leave bookedMap as null to indicate failure / not loaded
      } finally {
        if (mounted) setLoadingBookedMap(false);
      }
    }
    loadBookedMap();
    return () => {
      mounted = false;
    };
  }, []);

  // filtered users
  const filteredUsers = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    return (users || [])
      .filter((u) => {
        // filter by search
        const matchesSearch =
          !q ||
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q));
        if (!matchesSearch) return false;

        // filter by booking presence if required
        if (customerFilter === "haveBooked") {
          // If bookedMap is null -> we haven't loaded counts (or failed) -> show none
          if (!bookedMap) return false;
          return Boolean(bookedMap[String(u._id)]);
        }
        return true;
      })
      .sort((a, b) => {
        // prefer users with bookings first (if we have the map)
        const aHas = !!(bookedMap && bookedMap[String(a._id)]);
        const bHas = !!(bookedMap && bookedMap[String(b._id)]);
        if (aHas && !bHas) return -1;
        if (!aHas && bHas) return 1;
        // fallback alphabetical
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [users, searchQuery, customerFilter, bookedMap]);

  // Display helpers
  const formatDateNice = (d) => {
    if (!d) return "-";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }); // e.g. 28 Jun 2025
  };

  // Export CSV (server-side)
  const exportCSV = async () => {
    setExportLoading(true);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const url = new URL("/api/admin/customers/export", origin);
      if (customerFilter === "haveBooked")
        url.searchParams.set("haveBooked", "true");
      // optionally add search param if you want server-side search: url.searchParams.set("q", searchQuery)
      const res = await fetch(url.toString());
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to export CSV");
      }
      const blob = await res.blob();
      const filename = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
      const a = document.createElement("a");
      const urlBlob = URL.createObjectURL(blob);
      a.href = urlBlob;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(urlBlob);
      toast.success("CSV export started");
    } catch (err) {
      console.error("Export CSV failed", err);
      toast.error("Failed to export CSV");
    } finally {
      setExportLoading(false);
    }
  };

  // message handlers
  function handleSendMessage(user) {
    setSelectedUser(user);
    setIsMessageOpen(true);
  }
  async function handleSend({ email, name, message }) {
    try {
      const res = await fetch("/api/admin/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, message }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to send message");
      toast.success("Message sent successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error sending message");
    }
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header: split left (title + badge) and right (search + controls).
          Right side items can wrap on small screens. */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex flex-col gap-3">
          <div className="flex items-center mb-5 gap-4 min-w-0">
            <h2 className="text-lg font-semibold text-gray-700 truncate">
              Customers
            </h2>
            <div className="px-4 py-1 text-sm text-gray-900 font-bold rounded-xl bg-amber-200 whitespace-nowrap">
              Registered Customers: {users.length}
            </div>
          </div>

          {/* Right controls — allow wrapping */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            {/* search: allow shrink with min-w-0 so it doesn't overflow */}
            <div className="flex-1 min-w-0 sm:min-w-[220px]">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search Name or Email"
              />
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-sm text-gray-600 mr-2 hidden sm:block">
                Show:
              </div>
              <div className="flex items-center rounded-md bg-gray-100 p-1 text-sm">
                <button
                  className={`px-3 py-1 rounded-md font-medium transition ${
                    customerFilter === "all"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 shadow hover:bg-white/50"
                  }`}
                  onClick={() => setCustomerFilter("all")}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1 rounded-md font-medium transition ${
                    customerFilter === "haveBooked"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 shadow hover:bg-white/50"
                  }`}
                  onClick={() => setCustomerFilter("haveBooked")}
                >
                  Have booked
                </button>
              </div>
              {role === "admin" ? (
                <button
                  onClick={exportCSV}
                  className="ml-1 px-3 py-2 border rounded  bg-yellow-500 text-white text-sm font-semibold hover:bg-yellow-600 flex items-center gap-2"
                  disabled={exportLoading}
                  title="Export visible customers (server CSV)"
                >
                  {exportLoading ? (
                    <svg
                      className="animate-spin h-4 w-4 text-gray-600"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="opacity-25"
                      />
                      <path
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                        className="opacity-75"
                      />
                    </svg>
                  ) : (
                    "Export CSV"
                  )}
                </button>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table (horizontal scroll allowed) */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="w-8 px-4 py-3 text-left">#</th>
              <th className="w-48 px-4 py-3 text-left">Name</th>
              <th className="w-56 px-4 py-3 text-left">Email</th>
              <th className="w-36 px-4 py-3 text-left">Phone</th>
              <th className="w-24 px-4 py-3 text-left">Gender</th>
              <th className="w-36 px-4 py-3 text-left">Nationality</th>
              <th className="w-48 px-4 py-3 text-left">Address</th>
              <th className="w-28 px-4 py-3 text-left">Identity</th>
              <th className="w-28 px-4 py-3 text-left">ID image</th>
              <th className="w-28 px-4 py-3 text-left">Bookings</th>
              <th className="w-28 px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-gray-700">
            {customerFilter === "haveBooked" && loadingBookedMap ? (
              <tr>
                <td colSpan="11" className="text-center py-8">
                  Loading booking data...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user, i) => {
                const uid = String(user._id);
                const bookingCount = bookedMap ? bookedMap[uid] || 0 : 0;
                return (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 align-top">{i + 1}</td>

                    {/* Name */}
                    <td className="px-4 py-3 align-top">
                      <div className="max-w-[230px] truncate">{user.name}</div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 align-top">
                      <div className="max-w-[320px] truncate">{user.email}</div>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 align-top">
                      <div className="max-w-[170px] truncate">
                        {user.phone || "-"}
                      </div>
                    </td>

                    {/* Gender */}
                    <td className="px-4 py-3 align-top capitalize">
                      {user.gender || "-"}
                    </td>

                    {/* Nationality */}
                    <td className="px-4 py-3 align-top">
                      <div className="max-w-[170px] truncate">
                        {user.nationality || "-"}
                      </div>
                    </td>

                    {/* Address */}
                    <td className="px-4 py-3 align-top">
                      <div className="max-w-[260px] truncate">
                        {user.address || "-"}
                      </div>
                    </td>

                    {/* Identity */}
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.isIdVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.isIdVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>

                    {/* ID image */}
                    <td className="px-4 py-3 align-top">
                      <div
                        className="relative w-20 h-10 cursor-pointer"
                        onClick={() => {
                          if (user.idImage) {
                            setImageURL(user.idImage);
                            setModalOpen(true);
                          }
                        }}
                      >
                        {user.idImage ? (
                          <div className="w-20 h-10 relative rounded overflow-hidden border">
                            <Image
                              src={user.idImage}
                              alt="ID Preview"
                              fill
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">—</div>
                        )}
                      </div>
                    </td>

                    {/* Bookings badge */}
                    <td className="px-4 py-3 align-top">
                      {bookingCount > 0 && (
                        <div className="px-2 py-1 rounded bg-amber-100 text-amber-800 text-xs font-medium whitespace-nowrap">
                          {bookingCount} booking{bookingCount > 1 ? "s" : ""}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 align-top">
                      <div className="flex gap-2 items-center">
                        <button
                          className="p-2 rounded-full hover:bg-yellow-100 text-yellow-600"
                          title="Send Message"
                          onClick={() => handleSendMessage(user)}
                        >
                          <Mail size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="11"
                  className="text-center px-4 py-8 text-gray-500 italic"
                >
                  No guests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <MessageModal
        isOpen={isMessageOpen}
        onClose={() => setIsMessageOpen(false)}
        user={selectedUser}
        onSend={handleSend}
      />
      {modalOpen && (
        <ImagePreviewModal
          previewUrl={imageURL}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
