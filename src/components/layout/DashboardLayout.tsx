import type React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import { Breadcrumb } from "./Breadcrumb";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/login_bg.webp')" }}
    >
      {/* Header */}
      <Header />

      <div className="flex">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 z-0 lg:mr-80">
          <div className="p-4 lg:p-6">
            <Breadcrumb className="bg-white/40 backdrop-blur-sm mb-2 ps-4 hidden lg:flex" />
            <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 min-h-[600px]">
              {children}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
}
