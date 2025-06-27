import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function BookingTable({ bookings }) {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="overflow-x-auto bg-white border border-amber-50 rounded-md">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th className="p-3">Booking ID</th>
            <th className="p-3">Shortlet</th>
            <th className="p-3">Apartment Type</th>
            <th className="p-3">Check-in</th>
            <th className="p-3">Check-out</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {bookings.map((b) => (
            <tr key={b._id} className="hover:bg-gray-50">
              <td className="p-3 text-blue-600 font-medium">{b._id}</td>
              <td className="p-3">{b.shortlet?.title || "—"}</td>
              <td className="p-3">{b.shortlet?.category || "—"}</td>
              <td className="p-3">{formatDate(b.checkInDate)}</td>
              <td className="p-3">{formatDate(b.checkOutDate)}</td>
              <td className="p-3 text-gray-900 font-semibold">
                ₦{b.totalAmount?.toLocaleString()}
              </td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    b.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : b.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {b.status}
                </span>
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td
                colSpan="7"
                className="p-4 text-center text-gray-500 italic text-sm"
              >
                No bookings found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
