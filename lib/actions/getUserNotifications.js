import Notification from "@/models/Notification";
import dbConnect from "@/lib/dbConnect";

export async function getUserNotifications(userId) {
  await dbConnect();

  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();

  return notifications.map((n) => ({
    _id: n._id.toString(),
    message: n.message,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));
}
