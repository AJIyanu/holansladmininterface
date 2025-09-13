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

export default function MobileMenu() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Research
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Plan & Reports
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Truck className="h-4 w-4 mr-2" />
                  Deliverables
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Scale className="h-4 w-4 mr-2" />
                  Legal
                </Button>
              </div>
            </div>
            {/* User Section */}
            <div className="pt-4 mt-auto">
              <UserMenu name="Joseph Aderemi" mobile />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
