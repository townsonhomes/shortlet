"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmModal from "../ConfirmModal";

export default function SubAdminList({ subAdmins, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleOpenModal = (id) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(`/api/subadmins/${selectedId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete sub-admin");

      toast.success("Sub-admin deleted successfully");
      onDelete(selectedId);
    } catch (err) {
      toast.error(err.message || "An error occurred while deleting sub-admin");
    } finally {
      setIsModalOpen(false);
      setSelectedId(null);
    }
  };

  if (!subAdmins || subAdmins.length === 0) {
    return (
      <p className="text-gray-500 text-center py-6">No sub-admins found.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-sm">
      <table className="w-full border-collapse cursor-default">
        <thead>
          <tr className="bg-gray-100 text-left text-sm">
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Gender</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subAdmins.map((sa, idx) => (
            <tr
              key={sa._id}
              className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} text-sm`}
            >
              <td className="p-3">{sa.name}</td>
              <td className="p-3">{sa.email}</td>
              <td className="p-3">{sa.phone || "—"}</td>
              <td className="p-3 capitalize">{sa.gender || "—"}</td>
              <td className="p-3">
                <button
                  onClick={() => handleOpenModal(sa._id)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Sub Admin"
        description="Are you sure you want to delete this sub-admin? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
