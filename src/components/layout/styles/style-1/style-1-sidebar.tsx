"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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

function useTabletScreen() {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(min-width: 768px) and (max-width: 1023px)",
    );

    const update = () => setIsTablet(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  return isTablet;
}

export default function StyleOneSidebar({
  navigation,
  collapsed,
  onToggle,
}: StyleOneSidebarProps) {
  const isTablet = useTabletScreen();
  const effectiveCollapsed = collapsed || isTablet;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden min-h-screen flex-col bg-[#0B4F8A] transition-[width] duration-300 md:flex",
        effectiveCollapsed ? "w-20" : "w-72",
      )}
    >
      <div className="flex h-20 shrink-0 items-center justify-start bg-blue-400 px-3">
        <Image
          src={
            effectiveCollapsed
              ? "/HolanSL_logo.png"
              : "/HolanSL_logo_Full_color_Horizontal.webp"
          }
          alt="Holan Integrated Services Limited"
          width={effectiveCollapsed ? 48 : 120}
          height={effectiveCollapsed ? 48 : 50}
          priority
          className="h-auto w-auto"
        />
      </div>

      <div className="relative flex-1 px-3 pb-6 pt-14 overflow-y-auto">
        {!isTablet && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="absolute right-3 top-3 rounded-lg text-white/75 hover:bg-white/10 hover:text-white"
            aria-label={
              effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {effectiveCollapsed ? (
              <PanelLeftOpen className="size-5" />
            ) : (
              <PanelLeftClose className="size-5" />
            )}
          </Button>
        )}

        <StyleOneNavigation
          navigation={navigation}
          collapsed={effectiveCollapsed}
        />
      </div>
    </aside>
  );
}
