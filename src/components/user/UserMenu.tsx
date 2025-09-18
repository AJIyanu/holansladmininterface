"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, LogOut, Settings, User, ChevronDown } from "lucide-react";
import LogoutButton from "./LogoutButton";
import { useUser } from "@/components/UserProvider";

interface UserMenuProps {
  name: string;
  email?: string;
  avatarUrl?: string;
  notificationsCount?: number;
  mobile?: boolean;
  links?: {
    profile: string;
    settings: string;
    logout: string;
  };
}

export function UserMenu({
  name,
  email,
  avatarUrl,
  notificationsCount = 0,
  mobile = false,
  links = {
    profile: "/profile",
    settings: "/settings",
    logout: "/logout",
  },
}: UserMenuProps) {
  if (mobile) {
    return (
      <Collapsible className="w-full px-4">
        <div className="space-y-3">
          {/* Mobile Trigger */}
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3 justify-between w-full">
                <span className="font-medium text-gray-900">{name}</span>
                <Avatar className="h-10 w-10 border border-gray-300 shadow-sm">
                  <AvatarImage src={avatarUrl} alt={name} />
                  <AvatarFallback>
                    {name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              {/* <ChevronDown className="h-4 w-4 text-gray-500" /> */}
            </div>
          </CollapsibleTrigger>

          {/* Notifications section - always visible on mobile */}
          <div className="flex items-center gap-2 px-3">
            <Bell className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">Notifications</span>
            {notificationsCount > 0 && (
              <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs ml-auto">
                {notificationsCount}
              </Badge>
            )}
          </div>

          {/* Collapsible Content */}
          <CollapsibleContent className="space-y-2">
            <div className="border-t pt-2">
              {email && (
                <div className="px-3 py-1">
                  <span className="text-sm text-gray-500">{email}</span>
                </div>
              )}

              <a
                href={links.profile}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <User className="h-4 w-4" />
                Profile
              </a>

              <a
                href={links.settings}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </a>

              <div className="border-t my-2"></div>

              {/* <a
                href={links.logout}
                className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </a> */}
              <LogoutButton />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  // Desktop version (original dropdown)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer border-1 rounded-full px-3 py-1 border-gray-300 hover:bg-brand-blue transition">
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative shadow-sm rounded-full"
          >
            <Bell className="h-5 w-5" />
            {notificationsCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {notificationsCount}
              </Badge>
            )}
          </Button>

          {/* Avatar */}
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>
              {name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 bg-blue-50" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            {email && <span className="text-sm text-gray-500">{email}</span>}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a href={links.profile} className="flex items-center gap-2">
            <User className="h-4 w-4" /> Profile
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a href={links.settings} className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Settings
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          {/* <a
            href={links.logout}
            className="flex items-center gap-2 text-red-500"
          >
            <LogOut className="h-4 w-4" /> Log out
          </a> */}
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
