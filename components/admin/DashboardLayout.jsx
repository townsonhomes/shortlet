"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/Sidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-56">
        {/* Mobile Nav Toggle Button */}
        <div className="lg:hidden p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-white border rounded shadow"
          >
            <Menu size={20} />
          </button>
        </div>

        <main className="p-4 max-w-screen">{children}</main>
      </div>
    </div>
  );
}
