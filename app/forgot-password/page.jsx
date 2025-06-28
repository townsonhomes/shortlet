"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setMsg("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to send e-mail");
      setMsg("Check your inbox for the reset link.");
    } catch (e) {
      setErr(e.message);
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
        <h1 className="text-2xl font-bold mb-6 text-center">Forgot Password</h1>

        {msg && <p className="text-green-600 mb-4 text-sm">{msg}</p>}
        {err && <p className="text-red-600 mb-4 text-sm">{err}</p>}

        <input
          className="w-full border px-3 py-2 rounded mb-4"
          type="email"
          placeholder="Your e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>

        <p
          onClick={() => router.push("/login")}
          className="text-center text-sm mt-4 cursor-pointer text-blue-600 hover:underline"
        >
          Back to login
        </p>
      </form>
    </div>
  );
}
