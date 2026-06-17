"use client";

import Image from "next/image";
import { Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import DashboardBreadcrumbs from "../../shared/dashboard-breadcrumbs";
import DashboardNotifications from "../../shared/dashboard-notifications";
import DashboardSearch from "../../shared/dashboard-search";
import DashboardUserMenu from "../../shared/dashboard-user-menu";
import type { NavigationSection } from "../../types";
import StyleOneNavigation from "./style-1-navigation";

interface StyleOneHeaderProps {
  navigation: NavigationSection[];
}

export default function StyleOneHeader({ navigation }: StyleOneHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-20 items-center gap-3 px-4 sm:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-80 border-none bg-[#0B4F8A] p-0 text-white overflow-scroll"
          >
            <SheetHeader className="flex h-20 justify-center bg-blue-400 p-4">
              <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>

              <Image
                src="/HolanSL_logo_Full_color_Horizontal.webp"
                alt="Holan Integrated Services Limited"
                width={120}
                height={50}
                priority
              />
            </SheetHeader>

            <div className="min-h-[calc(100vh-5rem)] p-4">
              <StyleOneNavigation navigation={navigation} />
            </div>
          </SheetContent>
        </Sheet>

        <div className="min-w-0 flex-1">
          <DashboardBreadcrumbs />
        </div>

        <div className="hidden w-full max-w-md md:block">
          <DashboardSearch />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full md:hidden"
          aria-label="Search"
        >
          <Search className="size-5" />
        </Button>

        <div className="flex items-center rounded-full border bg-background p-1 shadow-sm">
          <DashboardNotifications />

          <div className="mx-1 h-6 border-l" aria-hidden="true" />

          <DashboardUserMenu />
        </div>
      </div>
    </header>
  );
}
