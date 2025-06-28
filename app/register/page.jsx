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
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegisterPage() {
  const { data: session } = useSession();
  const [show, setShow] = useState({
    password: false,
    confirm: false,
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const router = useRouter();

  const toggle = (field) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const onSubmit = async (data) => {
    setValue("phone", phone);

    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(data.password)) {
      setError("password", {
        type: "manual",
        message:
          "Password must be 8+ characters, include uppercase, lowercase, number, and symbol.",
      });
      return;
    }

    if (!phone) {
      setError("phone", {
        type: "manual",
        message: "Phone number is required",
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/verify-request", { ...data, phone });
      router.push("/verify-email");
    } catch (err) {
      if (err.response?.status === 400) {
        if (err.response.data.message?.toLowerCase().includes("email")) {
          setError("email", {
            type: "manual",
            message: err.response.data.message || "Email already in use",
          });
        }
      } else {
        // fallback error
        setError("email", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center bg-cover bg-center py-20"
      style={{ backgroundImage: "url(/images/house1.png)" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[5px]"></div>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl overflow-hidden relative z-30">
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

          <div>
            <PhoneInput
              defaultCountry="NG"
              value={phone}
              onChange={(value) => {
                setPhone(value);
                clearErrors("phone"); // clear manual error on change
              }}
              className="w-full border border-gray-300 rounded p-2"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="relative">
            <input
              type={show.password ? "text" : "password"}
              {...register("password", { required: "Password is required" })}
              placeholder="Password"
              className="w-full p-2 border border-gray-300 rounded pr-10"
            />
            <button
              type="button"
              onClick={() => toggle("password")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
            >
              {show.password ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <div className="relative mt-4">
            <input
              type={show.confirm ? "text" : "password"}
              {...register("confirmPassword", {
                required: "Please confirm your password",
              })}
              placeholder="Confirm Password"
              className="w-full p-2 border border-gray-300 rounded pr-10"
            />
            <button
              type="button"
              onClick={() => toggle("confirm")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
            >
              {show.confirm ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition"
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
