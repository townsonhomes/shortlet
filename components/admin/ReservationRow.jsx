import { PlusCircle } from "lucide-react";

export default function ReservationRow({
  booking,
  onCancelClick,
  onAddServiceClick,
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
    }).format(amount || 0);

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
        <span
          className={`text-xs font-semibold capitalize ${
            status === "confirmed"
              ? "text-green-600"
              : status === "pending"
              ? "text-blue-500"
              : "text-gray-400"
          }`}
        >
          {status}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          {status === "confirmed" && (
            <>
              <button
                onClick={() => onCancelClick(booking)}
                className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full hover:bg-red-200"
              >
                Cancel
              </button>

              <button
                className="p-2 rounded-full hover:bg-blue-100 text-blue-600"
                title="Add Service"
                onClick={() => onAddServiceClick(booking)}
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
