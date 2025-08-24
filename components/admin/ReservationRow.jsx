// components/bookings/ReservationRow.jsx
"use client";
import { PlusCircle, Eye } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ReservationRow({
  booking,
  onCancelClick,
  onAddServiceClick,
  onViewDetails, // new prop
}) {
  const {
    _id,
    user,
    shortlet,
    checkInDate,
    checkOutDate,
    totalAmount,
    status,
  } = booking;
  const { data: session } = useSession();
  const role = session?.user.role;
  const guestName = user?.name || "Unknown";
  const roomType = shortlet?.title || "Unknown Room";
  const shortRoomType =
    roomType.length > 25 ? `${roomType.slice(0, 25)}...` : roomType;

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
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const statusColor =
    status === "confirmed"
      ? "text-green-600"
      : status === "pending"
      ? "text-blue-500"
      : "text-gray-400";

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 font-medium whitespace-nowrap">{_id}</td>
      <td className="px-4 py-3 whitespace-nowrap">{guestName}</td>
      <td className="px-4 py-3">{shortRoomType}</td>
      <td className="px-4 py-3 whitespace-nowrap">{formatDate(checkInDate)}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        {formatDate(checkOutDate)}
      </td>
      <td className="px-4 py-3">{formatCurrency(totalAmount)}</td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold capitalize ${statusColor}`}>
          {status}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {/* View details (always available) */}
          {role === "admin" ? (
            <button
              onClick={() => onViewDetails && onViewDetails(booking)}
              title="View details"
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              aria-label={`View booking ${_id} details`}
            >
              <Eye size={16} />
            </button>
          ) : (
            <></>
          )}

          {/* Only show actions for confirmed bookings */}
          {status === "confirmed" && (
            <>
              <button
                onClick={() => onCancelClick && onCancelClick(booking)}
                className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full hover:bg-red-200"
                title="Cancel booking"
              >
                Cancel
              </button>

              <button
                className="p-2 rounded-full hover:bg-blue-100 text-blue-600"
                title="Add Service"
                onClick={() => onAddServiceClick && onAddServiceClick(booking)}
              >
                <PlusCircle size={16} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
