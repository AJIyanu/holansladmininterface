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
      className="min-h-screen bg-cover bg-center bg-no-repeat w-full"
      style={{ backgroundImage: "url('/login_bg.webp')" }}
    >
      {/* Header */}
      <Header />

      <div className="flex h-full w-full">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="z-0 lg:mr-80 min-h-[calc(100vh-100px)] flex-1 w-full">
          <div className="p-4 lg:p-6 h-full">
            <Breadcrumb className="bg-white/40 backdrop-blur-sm mb-2 ps-4 hidden lg:flex" />
            <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 h-full">
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
