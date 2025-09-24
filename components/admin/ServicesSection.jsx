"use client";

import { useState, useMemo, useEffect } from "react";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import SearchBar from "../SearchBar";
import MessageModal from "@/components/admin/MessageModal";
import toast from "react-hot-toast";

export default function ServicesSection({ services: initialServices }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  // Local copy so we can update UI locally without mutating props
  const [services, setServices] = useState(initialServices || []);
  // map of serviceId => boolean (updating)
  const [updatingMap, setUpdatingMap] = useState({});

  // keep local copy in sync if prop changes
  useEffect(() => {
    setServices(initialServices || []);
  }, [initialServices]);

  const filteredServices = useMemo(() => {
    const q = (searchQuery || "").toLowerCase();
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

  // Toggle payment status for a service (paid <-> unpaid)
  async function handleTogglePayment(service) {
    const id = service._id;
    if (!id) {
      toast.error("Service id missing");
      return;
    }

    // optimistic update: flip status locally
    const current = service.paymentStatus === "paid" ? "paid" : "unpaid";
    const newStatus = current === "paid" ? "unpaid" : "paid";

    // mark updating
    setUpdatingMap((m) => ({ ...m, [id]: true }));

    // update UI optimistically
    setServices((prev) =>
      prev.map((s) => (s._id === id ? { ...s, paymentStatus: newStatus } : s))
    );

    try {
      const res = await fetch("/api/admin/service/toggle-payment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ serviceId: id, paymentStatus: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update service");
      }

      // on success: merge returned service if provided
      if (data?.service) {
        setServices((prev) =>
          prev.map((s) => (s._id === id ? { ...s, ...data.service } : s))
        );
      }

      toast.success(`Service marked ${newStatus}`);
    } catch (err) {
      console.error("toggle payment error:", err);
      // revert optimistic change on error
      setServices((prev) =>
        prev.map((s) => (s._id === id ? { ...s, paymentStatus: current } : s))
      );
      toast.error(err.message || "Failed to update payment status");
    } finally {
      setUpdatingMap((m) => {
        const copy = { ...m };
        delete copy[id];
        return copy;
      });
    }
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

  function handleSendMessage(user) {
    setSelectedUser(user);
    setIsMessageOpen(true);
  }

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
              filteredServices.map((service, i) => {
                const isUpdating = Boolean(updatingMap[service._id]);
                return (
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
                    <td className="px-4 py-3">
                      {formatCurrency(service.price)}
                    </td>

                    {/* Payment column left unchanged */}
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

                    <td className="px-4 py-3">
                      {formatDate(service.createdAt)}
                    </td>

                    {/* ACTIONS column: new standalone control here */}
                    <td className="px-4 py-3 flex gap-2 items-center">
                      <button
                        className="p-2 rounded-full hover:bg-yellow-100 text-yellow-600"
                        title="Send Message"
                        onClick={() => handleSendMessage(service.user)}
                      >
                        <Mail size={16} />
                      </button>

                      <button
                        onClick={() => handleTogglePayment(service)}
                        disabled={isUpdating}
                        title={
                          service.paymentStatus === "paid"
                            ? "Mark as unpaid"
                            : "Mark as paid"
                        }
                        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                      >
                        {isUpdating ? (
                          <Loader2
                            className="animate-spin text-gray-500"
                            size={18}
                          />
                        ) : service.paymentStatus === "paid" ? (
                          <XCircle className="text-red-600" size={18} />
                        ) : (
                          <CheckCircle className="text-green-600" size={18} />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
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
}
