"use client";

import { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import NotificationModal from "./NotificationModal";
import { toast } from "react-hot-toast";

export default function NotificationsSection({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch(`/api/profile/notifications/${userId}`);
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        toast.error("Failed to fetch notifications");
      }
    }

    fetchNotifications();
  }, [userId]);

  const handleOpen = async (notification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      await fetch("/api/profile/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notification._id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
      );
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <FaBell className="text-yellow-500" />
          Notifications
        </h2>
        <div className="text-sm text-gray-500">
          {notifications.length} total
        </div>
      </div>

      <ul className="divide-y text-sm text-gray-800 max-h-[400px] overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <li
              key={n._id}
              onClick={() => handleOpen(n)}
              className={`cursor-pointer px-6 py-4 hover:bg-gray-50 transition group ${
                !n.read ? "bg-yellow-50 border-l-4 border-yellow-400" : ""
              }`}
            >
              <p
                className={`text-sm ${
                  !n.read ? "font-semibold" : "text-gray-600"
                }`}
              >
                {n.message.length > 100
                  ? n.message.slice(0, 100) + "..."
                  : n.message}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </li>
          ))
        ) : (
          <li className="px-6 py-8 text-gray-400 text-center italic">
            No notifications yet.
          </li>
        )}
      </ul>

      <NotificationModal
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        notification={selectedNotification}
      />
    </div>
  );
}
