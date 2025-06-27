"use client";

import { useState, useMemo } from "react";
import { Mail } from "lucide-react";
import SearchBar from "../SearchBar";
import MessageModal from "@/components/admin/MessageModal";
import toast from "react-hot-toast";

export default function ServicesSection({ services }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  const filteredServices = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return services.filter((s) => {
      const guestName = s.user?.name?.toLowerCase() || "";
      const guestEmail = s.user?.email?.toLowerCase() || "";
      return guestName.includes(q) || guestEmail.includes(q);
    });
  }, [services, searchQuery]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount || 0);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Service Requests
        </h2>
        <div className="px-4 py-1 text-sm text-gray-900 font-bold mx-auto rounded-xl bg-blue-100">
          Total Services: {services.length}
        </div>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search Guest Name or Email"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Guest Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Room</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Payment</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-gray-700">
            {filteredServices.length > 0 ? (
              filteredServices.map((service, i) => (
                <tr key={service._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">
                    {service.user?.name}
                  </td>
                  <td className="px-4 py-3">{service.user?.email}</td>
                  <td className="px-4 py-3">
                    {service.shortlet?.title || "-"}
                  </td>
                  <td className="px-4 py-3">{service.description}</td>
                  <td className="px-4 py-3">{formatCurrency(service.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        service.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {service.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatDate(service.createdAt)}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      className="p-2 rounded-full hover:bg-yellow-100 text-yellow-600"
                      title="Send Message"
                      onClick={() => handleSendMessage(service.user)}
                    >
                      <Mail size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="text-center px-4 py-8 text-gray-500 italic"
                >
                  No service records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <MessageModal
        isOpen={isMessageOpen}
        onClose={() => setIsMessageOpen(false)}
        user={selectedUser}
        onSend={handleSend}
      />
    </div>
  );

  function handleSendMessage(user) {
    setSelectedUser(user);
    setIsMessageOpen(true);
  }

  async function handleSend({ email, name, message }) {
    try {
      const res = await fetch("/api/admin/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, message }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to send message");

      toast.success("Message sent successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error sending message");
    }
  }
}
