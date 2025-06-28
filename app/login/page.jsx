"use client";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (res.ok) {
      router.push("/");
    } else {
      setError("Invalid email or password.");
    }

    setLoading(false);
  };

  return (
    <div
      className="flex relative items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url(/images/house1.png)" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[5px]"></div>
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl space-y-6 relative z-30">
        <h2 className="text-2xl font-bold text-center">Welcome back</h2>

        {error && <p className="text-red-500 text-center text-sm">{error}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register("email", { required: "Email is required" })}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Password with eye toggle */}
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Password"
              {...register("password", { required: "Password is required" })}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPw((prev) => !prev)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600"
            >
              {showPw ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center justify-center space-x-2">
          <span className="h-px w-1/3 bg-gray-300" />
          <span className="text-gray-500 text-sm">or</span>
          <span className="h-px w-1/3 bg-gray-300" />
        </div>

        {/* Google Sign-In */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full py-2 px-4 border border-gray-300 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100"
        >
          <img src="/images/google.png" alt="Google" className="w-5 h-5" />
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
}
