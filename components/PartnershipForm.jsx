"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";

export default function ParnershipForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data) => {
    try {
      const res = await fetch("/api/emails/partnership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to send email");
      setSubmitted(true);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white border border-gray-200 my-[6%] rounded-xl px-8 py-10 w-full max-w-6xl mx-auto">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Kindly fill the form
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            {...register("firstName", { required: "First name is required" })}
            className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 p-2.5"
          />
          {errors.firstName && (
            <p className="text-sm text-red-500 mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            {...register("lastName", { required: "Last name is required" })}
            className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 p-2.5"
          />
          {errors.lastName && (
            <p className="text-sm text-red-500 mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            })}
            className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 p-2.5"
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            State
          </label>
          <input
            {...register("state", { required: "State is required" })}
            className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 p-2.5"
          />
          {errors.state && (
            <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            {...register("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^\+?[0-9]{7,15}$/,
                message: "Invalid phone number",
              },
            })}
            className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 p-2.5"
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Property Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Property Location
          </label>
          <input
            {...register("location", {
              required: "Property location is required",
            })}
            className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 p-2.5"
          />
          {errors.location && (
            <p className="text-sm text-red-500 mt-1">
              {errors.location.message}
            </p>
          )}
        </div>

        {/* Apartment Description (textarea) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Apartment Description
          </label>
          <textarea
            {...register("description", {
              required: "Description is required",
            })}
            rows={4}
            className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 p-2.5"
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#0F1115] text-white px-8 py-2 rounded-md hover:bg-black transition w-full sm:w-auto"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>

        {/* Success message */}
        {submitted && (
          <div className="md:col-span-2 text-green-600 font-medium mt-2">
            ✅ Your form has been submitted successfully.
          </div>
        )}
      </form>
    </div>
  );
}
