"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";

const schema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: yup
    .string()
    .matches(/^\+?\d{7,15}$/, "Invalid phone number")
    .nullable(),
  gender: yup
    .string()
    .oneOf(["male", "female"], "Gender must be male or female")
    .required("Gender is required"),
  nationality: yup.string().nullable(),
  state: yup.string().nullable(),
  address: yup
    .string()
    .max(200, "Address must be less than 200 characters")
    .nullable(),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain an uppercase letter")
    .matches(/[a-z]/, "Must contain a lowercase letter")
    .matches(/\d/, "Must contain a number")
    .matches(/[@$!%*?&]/, "Must contain a special character")
    .required("Password is required"),
});

export default function AddSubAdminForm({ onSubAdminAdded }) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const res = await fetch("/api/subadmins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, role: "sub-admin" }),
      });

      if (!res.ok) throw new Error("Failed to create sub-admin");

      const newSubAdmin = await res.json();
      toast.success("Sub-admin created successfully");
      onSubAdminAdded(newSubAdmin);
      reset();
    } catch (err) {
      toast.error(err.message || "An error occurred while creating sub-admin");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg  space-y-4"
    >
      <h2 className="text-lg font-semibold mb-7">Add Sub Admin</h2>

      {/* Name */}
      <div>
        <input
          type="text"
          placeholder="Full Name"
          {...register("name")}
          className="w-full border rounded-lg px-3 py-2 focus:ring focus:border-blue-300"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <input
          type="email"
          placeholder="Email"
          {...register("email")}
          className="w-full border rounded-lg px-3 py-2 focus:ring focus:border-blue-300"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <input
          type="text"
          placeholder="Phone"
          {...register("phone")}
          className="w-full border rounded-lg px-3 py-2 focus:ring focus:border-blue-300"
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
        )}
      </div>

      {/* Gender */}
      <div>
        <select
          {...register("gender")}
          className="w-full border rounded-lg px-3 py-2 focus:ring focus:border-blue-300"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        {errors.gender && (
          <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
        )}
      </div>

      {/* Nationality */}
      <div>
        <input
          type="text"
          placeholder="Nationality"
          {...register("nationality")}
          className="w-full border rounded-lg px-3 py-2 focus:ring focus:border-blue-300"
        />
      </div>

      {/* State */}
      <div>
        <input
          type="text"
          placeholder="State"
          {...register("state")}
          className="w-full border rounded-lg px-3 py-2 focus:ring focus:border-blue-300"
        />
      </div>

      {/* Address */}
      <div>
        <textarea
          placeholder="Address"
          {...register("address")}
          className="w-full border rounded-lg px-3 py-2 focus:ring focus:border-blue-300"
        />
        {errors.address && (
          <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          {...register("password")}
          className="w-full border rounded-lg px-3 py-2 pr-10 focus:ring focus:border-blue-300"
        />

        {/* Toggle Icon */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-3 flex items-center text-gray-500"
          tabIndex={-1} // prevents button from stealing focus
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>

        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {isSubmitting ? "Creating..." : "Add Sub Admin"}
      </button>
    </form>
  );
}
