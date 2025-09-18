import Image from "next/image";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import MobileMenu from "./MobileMenu";
import { UserMenu } from "../user/UserMenu";
import { getCurrentUser } from "@/lib/auth-server";

export default async function Header() {
  const { user } = await getCurrentUser();
  // console.log(user);
  return (
    <header className="bg-white/20 backdrop-blur-sm mb-5 px-4 py-3 z-10 relative">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/HolanSL_logo_Full_color_Horizontal.webp"
            alt="Logo"
            width={120}
            height={60}
          />
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search"
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Desktop Right Section */}
        <div className="me-6 lg:flex hidden items-center gap-4">
          <UserMenu
            name={`${user ? user.first_name : "please"} ${
              user ? user.last_name : "reload"
            }`}
            email={user ? user.email : "pleasereload@page"}
          />
        </div>

        {/* Mobile Section (client) */}
        <MobileMenu />
      </div>
    </header>
  );
}
