export default function NotificationList({ notifications }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">Notifications</h2>
      {notifications?.length === 0 && <p>No notifications yet.</p>}
      {notifications?.map((n) => (
        <div
          key={n._id}
          className="bg-white p-4 rounded border shadow-sm flex items-start gap-3"
        >
          <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500" />
          <div>
            <p className="text-sm">{n.message}</p>
            <p className="text-xs text-gray-500">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
