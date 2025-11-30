import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children, userRole, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">

      {/* Tombol hamburger — hanya tampil di mobile */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 bg-slate-900 text-white p-2 rounded-lg"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <Sidebar
        currentRole={userRole}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6">
        {children}
      </main>
    </div>
  );
}
