"use client";

import { useEffect, useState } from "react";
import ShortletCard from "./ShortletCard";
import ShortletForm from "./ShortletForm";
import ConfirmModal from "../../ConfirmModal";
import { AnimatePresence, motion } from "framer-motion";

export default function ShortletsSection() {
  const [shortlets, setShortlets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingShortlet, setEditingShortlet] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Fetch shortlets from DB
  const fetchShortlets = async () => {
    try {
      const res = await fetch("/api/admin/shortlets/read");
      const data = await res.json();
      setShortlets(data);
    } catch (err) {
      console.error("Failed to fetch shortlets", err);
    }
  };

  useEffect(() => {
    fetchShortlets();
  }, []);

  // Edit flow
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

  // Confirm + delete
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

      // Animate remove from grid
      setShortlets((prev) => prev.filter((item) => item._id !== selectedId));
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeletingId(null);
      setSelectedId(null);
      setShowConfirm(false);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Manage Shortlets
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-yellow-500 text-white rounded font-semibold hover:bg-yellow-600 text-sm"
        >
          + Add Shortlet
        </button>
      </div>

      {/* Shortlet Cards Grid */}
      <AnimatePresence mode="sync">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shortlets.map((shortlet) => (
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
