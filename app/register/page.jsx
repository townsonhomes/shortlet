// app/(auth|register)/page.jsx
"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";
import Link from "next/link";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useSession } from "next-auth/react";

export default function RegisterPage() {
  const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const router = useRouter();
  useEffect(() => {
    const bookingData = localStorage.getItem("bookingData");

    if (session?.user && bookingData) {
      const { roomId, checkInDate, checkOutDate } = JSON.parse(bookingData);
      router.push(
        `/booking/${roomId}?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
      );
    }
  }, [session]);
  const onSubmit = async (data) => {
    //console.log(data);
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(data.password)) {
      toast.error(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (!phone) {
      toast.error("Phone number is required");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/verify-request", { ...data, phone });
      router.push("/verify-email"); // Better than redirecting to login
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center py-20"
      style={{ backgroundImage: "url(/images/house1.png)" }}
    >
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md overflow-hidden">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create an Account
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register("name", { required: "First name is required" })}
            placeholder="First Name"
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}

          <input
            {...register("lastName", { required: "Last name is required" })}
            placeholder="Last Name"
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm">{errors.lastName.message}</p>
          )}

          <input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Invalid email address",
              },
            })}
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}

          <PhoneInput
            defaultCountry="NG"
            value={phone}
            onChange={setPhone}
            className="w-full border border-gray-300 rounded p-2"
          />

          <input
            type="password"
            {...register("password", { required: "Password is required" })}
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          <input
            type="password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
            })}
            placeholder="Confirm Password"
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">
              {errors.confirmPassword.message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 transition"
          >
            {loading ? "Creating..." : "Create an Account"}
          </button>
        </form>

        <div className="my-4 text-center text-gray-500">or</div>
        <GoogleLoginButton />

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
