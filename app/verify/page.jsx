"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import axios from "axios";
import Loader from "@/components/Loader";

function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return setMessage("Invalid or missing token");

    axios
      .get(`/api/verify?token=${token}`)
      .then(() => {
        setMessage("Account verified! Redirecting to login...");
        setTimeout(() => router.push("/login"), 3000);
      })
      .catch((err) => {
        setMessage(err.response?.data?.error || "Verification failed.");
      });
  }, []);

  return (
    <div className="min-h-screen flex justify-center items-center text-xl">
      {message}
    </div>
  );
}

export default function VerifyPageSuspense() {
  return (
    <Suspense fallback={<Loader />}>
      <VerifyPage />
    </Suspense>
  );
}
