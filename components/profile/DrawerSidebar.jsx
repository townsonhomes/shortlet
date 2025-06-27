"use client";
import { useProfileDrawer } from "@/context/ProfileDrawerContext";
import Sidebar from "./Sidebar";

export default function DrawerSidebar({ activeTab, onTabChange }) {
  const { isDrawerOpen, closeDrawer } = useProfileDrawer();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Translucent dark overlay */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={closeDrawer} // Closes drawer on background click
      />

      {/* Drawer content */}
      <div
        className="relative w-64 bg-white h-full z-50 shadow-lg"
        onClick={(e) => e.stopPropagation()} // Prevents overlay from closing drawer when clicking inside
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">Menu</h2>
          <button onClick={closeDrawer} className="text-gray-600 text-xl">
            &times;
          </button>
        </div>

        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            closeDrawer();
            onTabChange(tab);
          }}
        />
      </div>
    </div>
  );
}
