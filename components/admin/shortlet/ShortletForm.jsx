"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  X,
  ImagePlus,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash,
} from "lucide-react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";

export default function ShortletForm({ shortlet, onClose, onRefresh }) {
  const [localImages, setLocalImages] = useState([]);
  const [cloudinaryUrls, setCloudinaryUrls] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState("");
  const [customOwnership, setCustomOwnership] = useState("");
  const [ownershipError, setOwnershipError] = useState("");
  const [showOwnerList, setShowOwnerList] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      category: "",
      pricePerDay: "",
      amenities: ["24/7 support"],
    },
  });

  const {
    fields: amenityFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "amenities",
  });

  useEffect(() => {
    if (shortlet) {
      reset({
        title: shortlet.title,
        description: shortlet.description,
        location: shortlet.location,
        category: shortlet.category,
        pricePerDay: shortlet.pricePerDay,
        amenities: shortlet.amenities.length ? shortlet.amenities : [""],
      });
      setCloudinaryUrls(shortlet.images || []);
    }
  }, [shortlet, reset]);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await fetch("/api/admin/shortlets/owners");
        const data = await res.json();
        const all = Array.isArray(data)
          ? ["Towson Homes", ...data.filter((o) => o !== "Towson Homes")]
          : ["Towson Homes"];
        setOwners([...new Set(all)]);
      } catch (err) {
        console.error("Failed to fetch owners:", err);
      }
    };

    fetchOwners();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      setLocalImages((prev) => [...prev, ...files]);
      setImageError("");
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setStatus(null);

    // Ownership validation
    const finalOwnership =
      selectedOwner === "New" ? customOwnership.trim() : selectedOwner;

    if (!finalOwnership) {
      setOwnershipError("Ownership must be set");
      setLoading(false);
      return;
    }

    try {
      let uploadedUrls = cloudinaryUrls;

      const validAmenities = data.amenities?.filter(
        (a) => a && a.trim() !== ""
      );
      if (!validAmenities.length) {
        setError("amenitiesGroup", {
          type: "manual",
          message: "Please enter at least one amenity.",
        });
        setLoading(false);
        return;
      } else {
        clearErrors("amenitiesGroup");
      }

      if (!uploadedUrls.length && !localImages.length) {
        setImageError("Please upload at least one image.");
        setLoading(false);
        return;
      }

      if (localImages.length > 0) {
        setUploading(true);
        const formData = new FormData();
        localImages.forEach((file) => formData.append("images", file));

        const res = await fetch("/api/upload-shortlet", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();
        if (!res.ok || !result.urls?.length) {
          throw new Error(result.error || "Image upload failed");
        }

        uploadedUrls = [...cloudinaryUrls, ...result.urls];
        setUploading(false);
      }

      const payload = {
        ...data,
        ownership: finalOwnership,
        pricePerDay: Number(data.pricePerDay),
        images: uploadedUrls,
      };

      const endpoint = shortlet
        ? `/api/admin/shortlets/update/${shortlet._id}`
        : "/api/admin/shortlets/create";

      const saveRes = await fetch(endpoint, {
        method: shortlet ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!saveRes.ok) throw new Error("Failed to save shortlet");

      if (!shortlet) window.location.reload();
      setStatus("success");
      onRefresh();
      setTimeout(onClose, 1000);
    } catch (err) {
      console.error("Form error:", err);
      setStatus("error");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="fixed px-[5%] inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-start py-20 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative space-y-4 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-black"
        >
          <X />
        </button>

        <h2 className="text-xl font-semibold text-gray-800">
          {shortlet ? "Edit Apartment" : "Add New Apartment"}
        </h2>

        {status === "success" && (
          <div className="flex items-center gap-2 bg-green-100 text-green-700 p-3 rounded">
            <CheckCircle size={18} /> Apartment saved successfully!
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 p-3 rounded">
            <AlertCircle size={18} /> Something went wrong. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register("title", { required: "Title is required" })}
            placeholder="Title"
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}

          <textarea
            {...register("description")}
            placeholder="Description (optional)"
            className="w-full px-4 py-2 border rounded-lg"
            rows={3}
          />
          {/* Ownership Dropdown */}
          <div>
            <label className="text-sm font-medium">Ownership</label>
            <div className="relative">
              <div
                className="w-full border rounded-lg px-4 py-2 cursor-pointer bg-white flex justify-between items-center"
                onClick={() => setShowOwnerList((prev) => !prev)}
              >
                <span
                  className={
                    selectedOwner ? "text-gray-800" : "text-gray-400 italic"
                  }
                >
                  {selectedOwner
                    ? selectedOwner
                    : shortlet?.ownership || "Select owner"}
                </span>
                <ChevronUpDownIcon className="w-4 h-4 text-gray-500" />
              </div>

              {showOwnerList && (
                <div className="absolute z-10 mt-1 bg-white border rounded-lg shadow w-full max-h-40 overflow-y-auto">
                  {owners.map((owner, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setSelectedOwner(owner);
                        setShowOwnerList(false);
                        setOwnershipError("");
                      }}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                        selectedOwner === owner ? "bg-gray-100" : ""
                      }`}
                    >
                      {owner}
                    </div>
                  ))}
                  <div
                    onClick={() => {
                      setSelectedOwner("New");
                      setShowOwnerList(false);
                      setOwnershipError("");
                    }}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                      selectedOwner === "New" ? "bg-gray-100" : ""
                    }`}
                  >
                    + New
                  </div>
                </div>
              )}
            </div>

            {selectedOwner === "New" && (
              <input
                value={customOwnership}
                onChange={(e) => setCustomOwnership(e.target.value)}
                placeholder="Enter new ownership"
                className="mt-2 w-full px-4 py-2 border rounded-lg"
              />
            )}

            {ownershipError && (
              <p className="text-sm text-red-500 mt-1">{ownershipError}</p>
            )}
          </div>

          <input
            {...register("location")}
            placeholder="Location"
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input
            {...register("category", { required: "Category is required" })}
            placeholder="Category (e.g. Duplex, 3 Bedrooms)"
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category.message}</p>
          )}

          <input
            type="number"
            {...register("pricePerDay", {
              required: "Price is required",
              min: { value: 100, message: "Must be a positive number" },
            })}
            placeholder="Price Per Day"
            className="w-full px-4 py-2 border rounded-lg"
          />
          {errors.pricePerDay && (
            <p className="text-sm text-red-500">{errors.pricePerDay.message}</p>
          )}

          {/* Image Upload */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <ImagePlus size={18} /> Upload Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm file:bg-yellow-500 file:text-white file:px-4 file:py-2 file:rounded file:border-0"
            />
            {imageError && (
              <p className="text-sm text-red-500 mt-1">{imageError}</p>
            )}

            {(localImages.length > 0 || cloudinaryUrls.length > 0) && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {cloudinaryUrls.map((url, i) => (
                  <img
                    key={`url-${i}`}
                    src={url}
                    alt={`cloud-${i}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                ))}
                {localImages.map((file, i) => (
                  <img
                    key={`local-${i}`}
                    src={URL.createObjectURL(file)}
                    alt={`preview-${i}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div>
            <label className="text-sm font-medium">Amenities</label>
            {amenityFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 mb-2">
                <input
                  {...register(`amenities.${index}`, {
                    required: "Amenity cannot be empty",
                    validate: (value) =>
                      value.trim() !== "" ||
                      "Amenity cannot be just whitespace",
                  })}
                  placeholder={`Amenity ${index + 1}`}
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:underline text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            {errors.amenitiesGroup && (
              <p className="text-sm text-red-500 mt-1">
                {errors.amenitiesGroup.message}
              </p>
            )}
            <button
              type="button"
              onClick={() => append("")}
              className="text-blue-600 hover:underline text-sm"
            >
              + Add Amenity
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center justify-center gap-2"
          >
            {(loading || uploading) && (
              <Loader2 className="animate-spin" size={18} />
            )}
            {loading || uploading
              ? shortlet
                ? "Updating..."
                : "Creating..."
              : shortlet
              ? "Update Apartment"
              : "Create Apartment"}
          </button>
        </form>
      </div>
    </div>
  );
}
