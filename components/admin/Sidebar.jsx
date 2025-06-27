"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
  FaHome,
  FaBed,
  FaFileInvoice,
  FaCog,
  FaSignOutAlt,
  FaConciergeBell,
  FaUsers,
  FaClipboardList,
} from "react-icons/fa";
import { X } from "lucide-react";
import LogoutConfirmModal from "@/components/ConfirmModal";
import { signOut } from "next-auth/react";
import { useState } from "react";

const links = [
  { label: "Bookings", icon: <FaClipboardList />, view: "bookings" },
  { label: "Shortlets", icon: <FaBed />, view: "apartments" },
  { label: "Guests", icon: <FaUsers />, view: "guests" },
  { label: "Services", icon: <FaConciergeBell />, view: "services" },
  { label: "Settings", icon: <FaCog />, view: "settings" },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "bookings";
  const router = useRouter();

  const handleClick = (view) => {
    router.push(`/admin/dashboard?view=${view}`);
    onClose?.(); // Close drawer if on mobile
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0  left-0 w-56 h-screen bg-white shadow px-4 py-6 pt-[8%] overflow-y-auto z-30">
        <SidebarContent currentView={currentView} handleClick={handleClick} />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Sidebar content */}
          <div className="w-64 h-full bg-white shadow-lg p-6 pt-20 relative z-10">
            <button
              className="absolute top-4 right-4 text-gray-500"
              onClick={onClose}
            >
              <X />
            </button>
            <SidebarContent
              currentView={currentView}
              handleClick={handleClick}
            />
          </div>

          {/* Overlay */}
          <div
            className="flex-1 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          ></div>
        </div>
      )}
    </>
  );
}

function SidebarContent({ currentView, handleClick }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const confirmLogout = () => {
    setShowLogoutModal(false);
    signOut({ callbackUrl: "/login" });
  };
  return (
    <>
      <ul className="space-y-4 mb-6">
        {links.map(({ label, icon, view }) => {
          const isActive = currentView === view;

          return (
            <li key={label}>
              <button
                onClick={() => handleClick(view)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-yellow-100 text-yellow-800 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        onClick={() => setShowLogoutModal(true)}
        className="flex items-center gap-3 text-gray-600 hover:bg-red-50 hover:text-red-500 px-3 py-2 rounded-lg"
      >
        <FaSignOutAlt /> Logout
      </button>
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        description="Are you sure you want to log out? You’ll need to log in again to access your account."
        confirmText="Yes, Logout"
      />
    </>
  );
}
