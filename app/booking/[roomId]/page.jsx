"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";
import { usePaystack } from "@/hooks/usePaystack";
import Loader from "@/components/Loader";

function BookingPage() {
  const { roomId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { initializePayment } = usePaystack();
  const { data: session, status } = useSession();

  const checkInDateRaw = searchParams.get("checkInDate");
  const checkOutDateRaw = searchParams.get("checkOutDate");

  const checkInDate = checkInDateRaw === "null" ? null : checkInDateRaw;
  const checkOutDate = checkOutDateRaw === "null" ? null : checkOutDateRaw;

  const [room, setRoom] = useState(null);

  const email = session?.user?.email;
  const name = session?.user?.name || "Guest";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login`);
    }
  }, [status]);

  useEffect(() => {
    // Redirect if dates are not available
    if (!checkInDate || !checkOutDate) {
      router.replace("/search");
      return;
    }
    localStorage.removeItem("bookingData");
    async function fetchRoom() {
      try {
        const res = await fetch(`/api/shortlets/read/${roomId}`);
        const data = await res.json();
        setRoom(data);
      } catch (err) {
        console.error("Error fetching room:", err);
        toast.error("Failed to load room details.");
      }
    }

    if (roomId) fetchRoom();
  }, [roomId, checkInDate, checkOutDate]);

  if (status === "loading" || !room) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const nights = Math.max(
    1,
    Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
  );
  const total = nights * room.pricePerDay;

  const paymentHandler = async () => {
    try {
      /* 1️⃣  create a pending booking --------------------------------------*/
      const pendingRes = await fetch("/api/bookings/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shortlet: roomId,
          user: session.user.id,
          checkInDate,
          checkOutDate,
          totalAmount: total,
          guests: { adults: 1, children: 0 },
          channel: "checkout",
        }),
      });

      if (!pendingRes.ok) {
        const err = await pendingRes.json();
        toast.error(err.error || "Could not start payment.");
        return;
      }

      const { pendingId } = await pendingRes.json();

      /* 2️⃣  start Paystack checkout ---------------------------------------*/
      initializePayment({
        email,
        amount: total, // Paystack expects kobo if NGN – multiply by 100 if needed
        metadata: {
          pendingId,
          reason: "booking",
          name,
          roomId,
          checkInDate,
          checkOutDate,
          userId: session.user.id,
        },
        onSuccess: async (response) => {
          try {
            const verify = await fetch("/api/payment/verify-transaction", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reference: response.reference }),
            }).then((r) => r.json());

            if (verify.status === "success") {
              toast.success(
                "Payment verified! Your order will be confirmed shortly."
              );
              router.push("/profile");
            } else {
              toast.error("Payment verification failed.");
            }
          } catch (err) {
            console.error(err);
            toast.error("Error verifying payment.");
          }
        },
        onClose: () => toast("Payment window closed"),
      });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-yellow-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <BookingSummary
          room={room}
          nights={nights}
          paymentHandler={paymentHandler}
          total={total}
          checkIn={checkIn}
          checkOut={checkOut}
        />
      </div>
    </div>
  );
}

function BookingSummary({
  room,
  total,
  checkIn,
  checkOut,
  nights,
  paymentHandler,
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-8 text-neutral-800">
        Confirm Your Booking
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white shadow-xl rounded-2xl p-6 md:p-8">
        <div>
          <div className="relative w-full h-64 md:h-72 rounded-lg overflow-hidden">
            <Image
              src={room.images?.[0] || "/images/house1.png"}
              alt={room.title}
              fill
              className="object-cover"
            />
          </div>
          <h2 className="text-xl font-semibold mt-4 text-neutral-900">
            {room.title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{room.location}</p>
          <p className="text-gray-700 text-sm mt-4 leading-relaxed">
            {room.description}
          </p>
        </div>

        <div className="bg-gray-50 p-5 rounded-lg space-y-4 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-700">
            Booking Summary
          </h3>
          <div className="flex justify-between border-b pb-2 text-sm text-gray-700">
            <span>Check-in</span>
            <span>{checkIn.toDateString()}</span>
          </div>
          <div className="flex justify-between border-b pb-2 text-sm text-gray-700">
            <span>Check-out</span>
            <span>{checkOut.toDateString()}</span>
          </div>
          <div className="flex justify-between border-b pb-2 text-sm text-gray-700">
            <span>Nights</span>
            <span>{nights}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-700">
            <span>Price per night</span>
            <span>₦{room.pricePerDay.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-4 border-t font-bold text-lg text-neutral-800">
            <span>Total</span>
            <span>₦{total.toLocaleString()}</span>
          </div>

          <button
            onClick={paymentHandler}
            className="w-full bg-neutral-900 hover:bg-neutral-700 text-white py-3 rounded-lg transition-colors"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingPageSuspense() {
  return (
    <Suspense fallback={<Loader />}>
      <BookingPage />
    </Suspense>
  );
}
