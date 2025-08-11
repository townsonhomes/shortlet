"use client";

import { useEffect, useState } from "react";
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

  const fetchShortlets = async () => {
    try {
      const res = await fetch("/api/admin/shortlets/read");
      const data = await res.json();
      setShortlets(data);

      const owners = [
        "All Owners",
        ...Array.from(
          new Set(
            data
              .map((s) => s.ownership)
              .filter((o) => typeof o === "string" && o.trim().length > 0)
          )
        ),
      ];
      setUniqueOwners(owners);
      setFilteredShortlets(data);
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
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
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
