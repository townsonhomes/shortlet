"use client";

import { useMemo, useState } from "react";
import AddSubAdminForm from "./AddSubAdminForm";
import SubAdminList from "./SubAdminList";
import { Search, Plus, X } from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SubAdminSection({ subAdmins: initialSubAdmins }) {
  const [subAdmins, setSubAdmins] = useState(initialSubAdmins);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subAdmins;
    return subAdmins.filter(
      (s) =>
        s?.name?.toLowerCase().includes(q) ||
        s?.email?.toLowerCase().includes(q)
    );
  }, [search, subAdmins]);

  const handleAdded = (newSubAdmin) => {
    setSubAdmins((prev) => [...prev, newSubAdmin]);
    setOpen(false);
  };

  const handleDeleted = (id) => {
    setSubAdmins((prev) => prev.filter((s) => s._id !== id));
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Sub-Admins</h2>
          <p className="text-sm text-gray-500">
            Manage delegated access for your team.
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 rounded-xl shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Sub-Admin
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <SubAdminList subAdmins={filtered} onDelete={handleDeleted} />
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center mb-0"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-[95%] max-w-xl bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center justify-between px-6 mt-3">
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 ml-auto"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 pt-0 max-h-[85dvh] pb-7 rounded-md overflow-y-scroll custom-scrollbar">
              <AddSubAdminForm onSubAdminAdded={handleAdded} />
            </div>
          </div>
        </div>
      )}

      {/* Toasts for the form’s success/error messages */}
      <ToastContainer position="top-right" />
    </section>
  );
}
