export default function UpcomingCheckList({ bookings }) {
  const today = new Date();
  const upcoming = bookings
    .filter((b) => new Date(b.checkInDate) > today)
    .slice(0, 5);

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Upcoming Check-ins</h2>
      <ul className="divide-y">
        {upcoming.length === 0 ? (
          <li className="py-3 text-gray-500">No upcoming check-ins.</li>
        ) : (
          upcoming.map((b) => (
            <li key={b._id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{b.user?.name || "—"}</p>
                <p className="text-sm text-gray-500">
                  {b.shortlet?.title || "—"}
                </p>
              </div>
              <p className="text-sm text-gray-700">
                {new Date(b.checkInDate).toLocaleDateString()}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
