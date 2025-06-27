"use client";

import { signIn } from "next-auth/react";

export default function GoogleLoginButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="w-full flex items-center justify-center gap-2 border border-gray-300 p-2 rounded hover:bg-gray-100 transition"
    >
      <img src="/images/google.png" alt="Google" className="w-5 h-5" />
      Continue with Google
    </button>
  );
}
