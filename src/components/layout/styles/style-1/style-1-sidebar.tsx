"use client";

import Image from "next/image";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { NavigationSection } from "../../types";
import StyleOneNavigation from "./style-1-navigation";

interface StyleOneSidebarProps {
  navigation: NavigationSection[];
  collapsed: boolean;
  onToggle: () => void;
}

export default function StyleOneSidebar({
  navigation,
  collapsed,
  onToggle,
}: StyleOneSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden min-h-screen flex-col bg-[#0B4F8A] transition-[width] duration-300 md:flex",
        collapsed ? "w-20" : "w-20 lg:w-72",
      )}
    >
      <div className="flex h-20 shrink-0 items-center justify-start border-white/10 bg-white/20 shadow-lg px-3">
        <Image
          src={
            collapsed
              ? "/HolanSL_logo.png"
              : "/HolanSL_logo_Full_color_Horizontal.webp"
          }
          alt="Holan Integrated Services Limited"
          width={collapsed ? 48 : 120}
          height={collapsed ? 48 : 50}
          priority
          className={cn(
            "h-auto w-auto object-contain",
            !collapsed && "hidden lg:block",
          )}
        />

        {!collapsed && (
          <Image
            src="/HolanSL_logo.png"
            alt="Holan Integrated Services Limited"
            width={48}
            height={48}
            priority
            className="h-auto object-contain lg:hidden"
          />
        )}
      </div>

      <div className="relative flex-1 px-3 pb-6 pt-14">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute right-3 top-3 hidden rounded-lg text-white/75 hover:bg-white/10 hover:text-white lg:inline-flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-5" />
          ) : (
            <PanelLeftClose className="size-5" />
          )}
        </Button>

        <StyleOneNavigation navigation={navigation} collapsed={collapsed} />
      </div>
    </aside>
  );
}
