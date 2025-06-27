"use client";

import { X, Mail } from "lucide-react";
import { useState } from "react";

export default function MessageModal({ isOpen, onClose, user, onSend }) {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!message.trim()) return;
    onSend({ email: user.email, name: user.name, message });
    setMessage("");
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <X />
        </button>

        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Mail size={20} /> Message to {user.name}
        </h2>

        <textarea
          rows="5"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="w-full border px-4 py-2 rounded-lg mb-4 text-sm"
        />

        <button
          onClick={handleSubmit}
          className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 w-full text-sm font-medium"
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
