"use client";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url(/images/house1.png)" }}
    >
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-bold text-center">Welcome back</h2>

        {error && <p className="text-red-500 text-center text-sm">{error}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div>
            <input
              type="password"
              placeholder="Password"
              {...register("password", { required: "Password is required" })}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex items-center justify-center space-x-2">
          <span className="h-px w-1/3 bg-gray-300"></span>
          <span className="text-gray-500 text-sm">or</span>
          <span className="h-px w-1/3 bg-gray-300"></span>
        </div>

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
