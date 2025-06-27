import Service from "@/models/Service";
import User from "@/models/User";
import Shortlet from "@/models/Shortlet";
import Booking from "@/models/Booking";

export const getAllServices = async () => {
  const services = await Service.find()
    .populate("user")
    .populate("shortlet")
    .populate("booking")
    .sort({ createdAt: -1 })
    .lean(); // Flatten to plain JS objects

  return services.map((service) => ({
    _id: service._id.toString(),
    user: {
      _id: service.user?._id?.toString() || "",
      name: service.user?.name || "",
      email: service.user?.email || "",
    },
    shortlet: {
      _id: service.shortlet?._id?.toString() || "",
      title: service.shortlet?.title || "",
    },
    bookingId: service.booking?._id?.toString() || null,
    description: service.description || "",
    price: service.price || 0,
    paymentStatus: service.paymentStatus || "unpaid",
    createdAt: service.createdAt?.toISOString() || null,
  }));
};
