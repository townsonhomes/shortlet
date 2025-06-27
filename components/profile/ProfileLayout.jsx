"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import TabContent from "./TabContent";
import { signOut } from "next-auth/react";
import LogoutConfirmModal from "@/components/ConfirmModal";
import DrawerSidebar from "./DrawerSidebar"; // Make sure this is imported
import { FaBars } from "react-icons/fa";

const tabs = ["details", "history", "password", "notifications", "logout"];

function ProfileLayout({ bookings, notifications, services, user }) {
  const [activeTab, setActiveTab] = useState("details");
  const [showDrawer, setShowDrawer] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const handleTabChange = (tab) => {
    if (tab === "logout") {
      setShowLogoutModal(true);
    } else {
      setActiveTab(tab);
    }
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* ⬅️ Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        className="hidden lg:block"
      />

      {/* 📱 Mobile Drawer */}
      <DrawerSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
      />

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-6">
        <TabContent
          activeTab={activeTab}
          services={services}
          bookings={bookings}
          user={user}
        />
        <LogoutConfirmModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={confirmLogout}
          title="Confirm Logout"
          description="Are you sure you want to log out? You’ll need to log in again to access your account."
          confirmText="Yes, Logout"
        />
      </main>
    </div>
  );
}

export default function ProfileLayoutWrapper({
  bookings,
  notifications,
  services,
  user,
}) {
  return (
    <ProfileLayout
      bookings={bookings}
      notifications={notifications}
      services={services}
      user={user}
    />
  );
}
