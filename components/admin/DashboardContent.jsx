// components/admin/DashboardContent.jsx
"use client";

import { useSearchParams } from "next/navigation";
import RecentReservationsTable from "./RecentReservationsTable";
import ApartmentsSection from "./shortlet/ApartmentsSection";
import CustomersSection from "./CustomersSection";
import SettingsSection from "./SettingsSection";
import ServicesSection from "./ServicesSection";

export default function DashboardContent({ bookings, users, services }) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "bookings";

  if (view === "bookings" || !view)
    return <RecentReservationsTable bookings={bookings} />;
  if (view === "apartments") return <ApartmentsSection />;
  if (view === "guests") return <CustomersSection users={users} />;
  if (view === "services") return <ServicesSection services={services} />;
  if (view === "settings") return <SettingsSection />;

  //   return <p className="text-gray-600">Please select a section.</p>;
}
