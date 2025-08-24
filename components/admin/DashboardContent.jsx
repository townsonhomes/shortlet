"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import RecentReservationsTable from "./RecentReservationsTable"; //bookings table with list of bookings
import ApartmentsSection from "./shortlet/ApartmentsSection";
import CustomersSection from "./CustomersSection";
import SettingsSection from "./SettingsSection";
import ServicesSection from "./ServicesSection";
import AnalyticsSection from "../analytics/AnalyticsSection";
import SubAdminSection from "./SubAdminSection";
import Loader from "@/components/Loader";
import { useSession } from "next-auth/react";

function DashboardContent({ bookings, users, services, subAdmins }) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "bookings";
  const role = session?.user?.role;

  // Whitelist allowed views based on role
  const allowedViews =
    role === "admin"
      ? [
          "bookings",
          "guests",
          "services",
          "settings",
          "apartments",
          "sub-admin",
          "analytics",
        ]
      : ["bookings", "guests", "services", "settings"];

  // If user tries to access a view they don't have permission for, default to bookings
  const safeView = allowedViews.includes(view) ? view : "bookings";

  switch (safeView) {
    case "bookings":
      return <RecentReservationsTable bookings={bookings} />;
    case "guests":
      return <CustomersSection users={users} />;
    case "services":
      return <ServicesSection services={services} />;
    case "settings":
      return <SettingsSection />;
    case "apartments":
      return <ApartmentsSection />;
    case "sub-admin":
      return <SubAdminSection subAdmins={subAdmins} />;
    case "analytics":
      return <AnalyticsSection />;
    default:
      return <RecentReservationsTable bookings={bookings} />;
  }
}

export default function PageSuspense({ bookings, users, services, subAdmins }) {
  return (
    <Suspense fallback={<Loader />}>
      <DashboardContent
        bookings={bookings}
        users={users}
        services={services}
        subAdmins={subAdmins}
      />
    </Suspense>
  );
}
