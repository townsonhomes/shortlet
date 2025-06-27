"use client";
import { X } from "lucide-react";

export default function NotificationModal({ isOpen, onClose, notification }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-black"
        >
          <X />
        </button>
        <h2 className="text-lg font-semibold mb-2 text-gray-800">
          Notification
        </h2>
        <p className="text-gray-700 whitespace-pre-wrap">
          {notification.message}
        </p>
        <p className="mt-4 text-xs text-gray-400">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
