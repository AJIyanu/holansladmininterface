"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Bell,
  Search,
  Menu,
  X,
  FileText,
  Truck,
  Scale,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "../user/UserMenu";
import { useUser } from "../UserProvider";
import { NavigationBreakdown } from "./NavBreakDown";
import { sampleNavigationData } from "./Sidebar";

export default function MobileMenu() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();

  return (
    <>
      {/* Mobile Buttons */}
      <div className="lg:hidden flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50">
          <div className="fixed right-0 top-0 h-screen w-80 bg-blue-100 shadow-xl flex flex-col z-50">
            <div className="p-4 flex items-center justify-between">
              <Image
                src="/HolanSL_logo.png"
                alt="logo"
                width={60}
                height={60}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {/* Mobile Nav */}
            <div className="p-4 space-y-4">
              <NavigationBreakdown navigationData={sampleNavigationData} />
            </div>
            {/* User Section */}
            <div className="pt-4 mt-auto">
              <UserMenu
                name={`${user ? user.first_name : "please"} ${
                  user ? user.last_name : "reload"
                }`}
                email={user ? user.email : "pleasereload@page"}
                mobile
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
