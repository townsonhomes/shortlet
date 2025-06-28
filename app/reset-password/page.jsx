"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Loader from "@/components/Loader";

function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) return <div className="p-10 text-center">Invalid link.</div>;

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8) return setError("Password too short");
    if (password !== confirm) return setError("Passwords do not match");

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setOk(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl w-full max-w-md shadow"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          Set a new password
        </h1>

        {ok && (
          <p className="text-green-600 text-sm mb-4">
            Password updated! Redirecting to login…
          </p>
        )}
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
          required
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-6"
          required
        />

        <button
          disabled={loading || ok}
          className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}

export default function PageSuspense() {
  return (
    <Suspense fallback={<Loader />}>
      <ResetPasswordPage />
    </Suspense>
  );
}
