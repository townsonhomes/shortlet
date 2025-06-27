import DashboardLayout from "@/components/admin/DashboardLayout";
import StatCard from "@/components/admin/StatCard";
import {
  FaCalendarCheck,
  FaCalendarTimes,
  FaBed,
  FaClipboardList,
} from "react-icons/fa";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Shortlet from "@/models/Shortlet";
import { format } from "date-fns";
import { getAllBookings } from "@/lib/actions/getAllBookings";
import { getAllUsers } from "@/lib/actions/getAllUsers";
import { getAllServices } from "@/lib/actions/getAllServices";
import DashboardContent from "@/components/admin/DashboardContent";

export default async function AdminDashboardPage(context) {
  const { view } = await context.searchParams;
  await dbConnect();

  const today = new Date();

  const [
    allBookings,
    allUsers,
    allServices,
    checkIns,
    checkOuts,
    reservations,
    shortlets,
  ] = await Promise.all([
    getAllBookings(),
    getAllUsers(),
    getAllServices(),
    Booking.countDocuments({
      status: "confirmed",
      checkInDate: {
        $lte: new Date(today.setHours(23, 59, 59)),
        $gte: new Date(today.setHours(0, 0, 0)),
      },
    }),
    Booking.countDocuments({
      status: "confirmed",
      checkOutDate: {
        $lte: new Date(today.setHours(23, 59, 59)),
        $gte: new Date(today.setHours(0, 0, 0)),
      },
    }),
    Booking.countDocuments({ status: "confirmed" }),
    Shortlet.find().lean(),
  ]);

  const totalRooms = shortlets.length;
  const availableRooms = totalRooms - reservations;

  const stats = [
    { icon: <FaBed />, label: "Total Shortlets", value: totalRooms },
    {
      icon: <FaClipboardList />,
      label: "Number of Bookings",
      value: reservations,
    },
  ];

  const todayFormatted = format(new Date(), "EEEE, MMMM do yyyy");

  return (
    <DashboardLayout>
      {["bookings", "apartments"].includes(view) && (
        <>
          <div className="flex flex-col px-6 max-sm:px-0 justify-between mb-6">
            <p className="text-gray-600 text-md font-semibold">
              {todayFormatted}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 px-6 max-sm:px-0 gap-4 mb-6">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        </>
      )}

      <div className="p-0 sm:p-6 space-y-6 max-w-screen">
        <DashboardContent
          bookings={allBookings}
          users={allUsers}
          services={allServices}
        />
      </div>
    </DashboardLayout>
  );
}
