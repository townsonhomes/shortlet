import {
  FaUser,
  FaHistory,
  FaLock,
  FaConciergeBell,
  FaBell,
  FaSignOutAlt,
} from "react-icons/fa";

const tabs = [
  { key: "details", label: "Personal Details", icon: <FaUser /> },
  { key: "history", label: "Booking History", icon: <FaHistory /> },
  { key: "notifications", label: "Notifications", icon: <FaBell /> },
  { key: "services", label: "Services", icon: <FaConciergeBell /> },
  { key: "password", label: "Password Settings", icon: <FaLock /> },
  { key: "logout", label: "Logout", icon: <FaSignOutAlt /> },
];

export default function Sidebar({ activeTab, onTabChange, className }) {
  return (
    <aside className={`w-full lg:w-64 pt-[2%] bg-white shadow ${className}`}>
      <nav className="flex flex-col p-4 space-y-2">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`flex items-center gap-3 px-4 py-2 rounded text-left transition-all ${
              activeTab === key
                ? "bg-yellow-100 text-yellow-800 font-medium"
                : "hover:bg-gray-100 text-gray-800"
            }`}
          >
            <span>{icon}</span> {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
