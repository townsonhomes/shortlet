"use client";

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { ChevronUpDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
const ID_TYPES = ["Passport", "Driver's License", "National ID"];
import ImagePreviewModal from "@/components/ImagePreviewModal";

export default function PersonalDetailsForm({ user }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [idTypeError, setIdTypeError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(user?.idImage || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(false);
  const [idImageError, setIdImageError] = useState("");
  const [hasChangedIdType, setHasChangedIdType] = useState(false);
  const [hasUploadedNewImage, setHasUploadedNewImage] = useState(false);

  const dropdownRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [formData, setFormData] = useState({
    phone: user?.phone || "",
    nationality: user?.nationality || "",
    state: user?.state || "",
    address: user?.address || "",
    gender: user?.gender || "",
    idType: user?.idType || "",
    idImage: user?.idImage || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataImage = new FormData();
    formDataImage.append("image", file);
    setUploading(true);

    try {
      const res = await fetch("/api/upload-id", {
        method: "POST",
        body: formDataImage,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFormData((prev) => ({ ...prev, idImage: data.url }));
      setPreviewUrl(data.url);
      setHasUploadedNewImage(true);
      toast.success("ID uploaded");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;

    if (hasChangedIdType && !hasUploadedNewImage) {
      setIdImageError("Please upload the new ID image for the selected type.");
      hasError = true;
    } else {
      setIdImageError("");
    }

    if (!formData.idType && formData.idImage) {
      setIdTypeError("Please select the type of ID you uploaded.");
      hasError = true;
    } else {
      setIdTypeError("");
    }

    if (hasError) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user");

      toast.success("Profile updated successfully");
      window.location.reload();
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-6">Your Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Name
          </label>
          <input
            type="text"
            value={user?.name || ""}
            readOnly
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Email
          </label>
          <input
            type="email"
            value={user?.email || ""}
            readOnly
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Phone
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. +23400000000"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* Nationality */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Nationality
          </label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            placeholder="e.g. Nigerian"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* State */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            State
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="e.g. Lagos"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* Address */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street, city, ZIP code..."
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* ID Type */}
        <div ref={dropdownRef}>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            ID Type
          </label>

          <div className="relative">
            <input
              name="idType"
              readOnly
              value={formData.idType}
              onClick={() => setDropdownOpen((prev) => !prev)}
              placeholder="Select ID Type"
              className={`w-full border ${
                idTypeError ? "border-red-500" : "border-gray-300"
              } rounded px-3 py-2 cursor-pointer bg-white`}
            />

            {/* Icon */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              {dropdownOpen ? (
                <ChevronUpIcon className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronUpDownIcon className="w-4 h-4 text-gray-500" />
              )}
            </div>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded shadow z-10">
                {ID_TYPES.map((type) => (
                  <div
                    key={type}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, idType: type }));
                      setHasChangedIdType(type !== user?.idType);
                      setDropdownOpen(false);
                      setIdTypeError("");
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {idTypeError && (
            <p className="text-red-500 text-sm mt-1">{idTypeError}</p>
          )}
        </div>

        {/* Upload ID */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload ID
          </label>

          <label className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded cursor-pointer hover:bg-gray-200 transition border border-gray-300">
            Choose File
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {uploading && (
            <div className="text-sm text-blue-600 mt-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
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
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              Uploading...
            </div>
          )}
          {idImageError && (
            <p className="text-red-500 text-sm mt-2">{idImageError}</p>
          )}
          {previewUrl && (
            <div
              className="relative w-32 h-20 mt-4 cursor-pointer"
              onClick={() => setModalOpen(true)}
            >
              <Image
                src={previewUrl}
                alt="ID Preview"
                layout="fill"
                objectFit="cover"
                className="rounded border"
              />
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-black flex items-center gap-2 disabled:opacity-60"
        >
          {isSubmitting && (
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
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
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
          )}
          {isSubmitting ? "Updating..." : "Update"}
        </button>
      </div>

      {/* Modal Preview */}
      {modalOpen && (
        <ImagePreviewModal
          previewUrl={formData.idImage}
          onClose={() => setModalOpen(false)}
        />
      )}
    </form>
  );
}
