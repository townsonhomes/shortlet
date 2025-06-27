import Booking from "@/models/Booking";
import User from "@/models/User";
import Shortlet from "@/models/Shortlet";

export const getAllBookings = async () => {
  const bookings = await Booking.find()
    .populate("user")
    .populate("shortlet")
    .sort({ createdAt: -1 })
    .lean(); // This flattens everything into plain JSON-safe objects

  return bookings.map((booking) => ({
    _id: booking._id.toString(),
    shortlet: {
      _id: booking.shortlet?._id?.toString() || "",
      title: booking.shortlet?.title || "",
    },
    user: {
      _id: booking.user?._id?.toString() || "",
      name: booking.user?.name || "",
      email: booking.user?.email || "",
    },
    checkInDate: booking.checkInDate.toISOString(),
    checkOutDate: booking.checkOutDate.toISOString(),
    totalAmount: booking.totalAmount || 0,
    status: booking.status,
    createdAt: booking.createdAt.toISOString(),
  }));
};
