export default function AvailabilityTag({ status, isNow }) {
  return (
    <div className="flex items-center justify-center gap-2 text-sm">
      {/* Colored Dot */}
      <span
        className={`w-3 h-3 rounded-full ${
          isNow ? "bg-green-500" : "bg-yellow-500"
        }`}
      ></span>

      {/* Status Text */}
      <span
        className={`text-[12px] ${
          isNow ? "text-green-700 font-semibold" : "text-gray-700"
        }`}
      >
        {status}
      </span>
    </div>
  );
}
