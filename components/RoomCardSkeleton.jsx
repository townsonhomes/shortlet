export default function RoomCardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-xl shadow-md p-4 space-y-4">
      <div className="h-40 bg-gray-200 rounded-lg w-full" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-5/6" />
      <div className="h-10 bg-gray-200 rounded mt-4 w-full" />
    </div>
  );
}
