import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Notification from "@/models/Notification";
import User from "@/models/User";
import Service from "@/models/Service";
import Shortlet from "@/models/Shortlet";
import ProfileLayout from "@/components/profile/ProfileLayout";
import { Suspense } from "react";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await dbConnect();

  const userId = session.user.id;

  const [user, bookings, services, notifications] = await Promise.all([
    User.findById(userId).lean(),
    Booking.find({ user: userId })
      .populate("shortlet")
      .sort({ checkInDate: -1 })
      .lean(),
    Service.find({ user: userId }).sort({ createdAt: -1 }).lean(),
    Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  const book = JSON.parse(JSON.stringify(bookings));
  return (
    <Suspense fallback={<Loader />}>
      <ProfileLayout
        user={JSON.parse(JSON.stringify(user))}
        bookings={JSON.parse(JSON.stringify(bookings))}
        services={JSON.parse(JSON.stringify(services))}
        notifications={JSON.parse(JSON.stringify(notifications))}
      />
    </Suspense>
  );
}

// Loading spinner component
function Loader() {
  return (
    <div className="flex flex-col items-center min-h-[70vh] justify-center py-20 text-center">
      <svg
        className="animate-spin h-8 w-8 text-blue-500 mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
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
    </div>
  );
}
