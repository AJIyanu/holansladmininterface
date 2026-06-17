"use client";

import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardNotifications() {
  const unreadCount = 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label="Open notifications"
        >
          <Bell className="size-5" />

          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#F46C0B] p-0 text-[10px] text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 bg-blue-300 shadow-sm backdrop-blur-md border-blue-900 border-2"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <span className="text-xs font-normal text-muted-foreground">
            {unreadCount} unread
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="flex min-h-32 flex-col items-center justify-center px-6 py-8 text-center">
          <Bell className="mb-3 size-8 text-muted-foreground" />

          <p className="text-sm font-medium">No new notifications</p>

          <p className="mt-1 text-xs text-muted-foreground">
            Updates and assigned activities will appear here.
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
