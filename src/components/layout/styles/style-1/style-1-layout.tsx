"use client";

import { useState, type ReactNode } from "react";

import { useUser } from "@/components/UserProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { getNavigationForUser } from "../../navigation";
import StyleOneHeader from "./style-1-header";
import StyleOneSidebar from "./style-1-sidebar";

interface StyleOneLayoutProps {
  children: ReactNode;
}

export default function StyleOneLayout({ children }: StyleOneLayoutProps) {
  const user = useUser();
  const [collapsed, setCollapsed] = useState(false);

  const navigation = getNavigationForUser(user);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen bg-muted/30">
        <StyleOneSidebar
          navigation={navigation}
          collapsed={collapsed}
          onToggle={() => setCollapsed((current) => !current)}
        />

        <div
          className={cn(
            "min-w-0 flex-1 transition-all duration-300",
            "md:ml-20",
            collapsed ? "lg:ml-20" : "lg:ml-72",
          )}
        >
          <StyleOneHeader navigation={navigation} />

          <main className="min-h-[calc(100vh-5rem)]">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
