"use client";

import { useState, useMemo } from "react";
import { usePaystack } from "@/hooks/usePaystack";
import { FileDown, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import SearchBar from "@/components/SearchBar";

export default function UserServicesSection({ services, user }) {
  const [loadingId, setLoadingId] = useState(null);
  const { initializePayment } = usePaystack();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return services.filter((s) => s.description.toLowerCase().includes(q));
  }, [services, searchQuery]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount || 0);

  const handlePayment = (service) => {
    initializePayment({
      email: user.email,
      amount: service.price, // in kobo already?
      metadata: {
        userId: user._id,
        serviceId: service._id,
      },
      onSuccess: async (response) => {
        try {
          // 1. Verify transaction
          const verifyRes = await fetch("/api/payment/verify-transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: response.reference }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.status === "success") {
            // 2. Update service record
            const updateRes = await fetch("/api/admin/service/mark-paid", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reference: response.reference,
                serviceId: service._id,
              }),
            });

            const updateData = await updateRes.json();

            if (!updateRes.ok) {
              throw new Error(updateData.error || "Failed to update service");
            }

            toast.success("Payment successful");
            window.location.reload();
          } else {
            toast.error("Payment verification failed");
          }
        } catch (err) {
          console.error(err);
          toast.error("Error verifying transaction");
        }
      },
      onClose: () => toast.error("Payment closed"),
    });
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-700">Your Services</h2>
        <div className="px-4 py-1 text-sm text-gray-900 font-bold mx-auto rounded-xl bg-blue-100">
          Total: {services.length}
        </div>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search service"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Payment Status</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y text-gray-700">
            {filteredServices.length > 0 ? (
              filteredServices.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{s.description}</td>
                  <td className="px-4 py-3">{formatCurrency(s.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                        s.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatDate(s.createdAt)}</td>
                  <td className="px-4 py-3">
                    {s.paymentStatus === "unpaid" && (
                      <button
                        onClick={() => handlePayment(s)}
                        className="bg-neutral-800 text-white px-3 py-1 text-xs rounded hover:bg-neutral-700"
                      >
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center px-4 py-8 text-gray-500 italic"
                >
                  No services found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
