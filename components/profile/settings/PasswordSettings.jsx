"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function PasswordSettings() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({
    //current: false,
    new: false,
    confirm: false,
  });

  const toggleShow = (field) => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validate = () => {
    const err = {};

    if (newPass.length < 8) {
      err.newPass = "Password must be at least 8 characters.";
    }
    if (newPass !== confirm) {
      err.confirm = "New passwords do not match.";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // currentPassword: current,
          newPassword: newPass,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error updating password");

      setSuccess("Password updated. Redirecting to login...");
      setTimeout(() => signOut({ callbackUrl: "/login" }), 2000);
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-sm max-w-md w-full">
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>

      {errors.form && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
          {errors.form}
        </p>
      )}
      {success && (
        <p className="mb-4 text-sm text-green-700 bg-green-50 px-3 py-2 rounded">
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        {/* <div className="relative">
          <label className="block text-sm mb-1">Current Password</label>
          <input
            type={show.current ? "text" : "password"}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded pr-10"
          />
          <div
            onClick={() => toggleShow("current")}
            className="absolute right-3 top-9 text-gray-600 cursor-pointer"
          >
            {show.current ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div> */}

        {/* New Password */}
        <div className="relative">
          <label className="block text-sm mb-1">New Password</label>
          <input
            type={show.new ? "text" : "password"}
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded pr-10"
          />
          <div
            onClick={() => toggleShow("new")}
            className="absolute right-3 top-9 text-gray-600 cursor-pointer"
          >
            {show.new ? <FaEyeSlash /> : <FaEye />}
          </div>
          {errors.newPass && (
            <p className="text-xs text-red-600 mt-1">{errors.newPass}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <label className="block text-sm mb-1">Confirm New Password</label>
          <input
            type={show.confirm ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded pr-10"
          />
          <div
            onClick={() => toggleShow("confirm")}
            className="absolute right-3 top-9 text-gray-600 cursor-pointer"
          >
            {show.confirm ? <FaEyeSlash /> : <FaEye />}
          </div>
          {errors.confirm && (
            <p className="text-xs text-red-600 mt-1">{errors.confirm}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !newPass || !confirm}
          className={`w-full px-4 py-2 rounded text-white transition ${
            loading || !newPass || !confirm
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gray-800 hover:bg-gray-900"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
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
              Updating...
            </span>
          ) : (
            "Update Password"
          )}
        </button>
      </form>
    </div>
  );
}
