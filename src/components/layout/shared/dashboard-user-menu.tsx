"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  LogOut,
  Settings,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import { useUser } from "@/components/UserProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getPrimaryRole, getUserDisplayName } from "@/types/auth";

function getInitials(firstName: string, lastName: string): string {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

  return initials.toUpperCase() || "US";
}

export default function DashboardUserMenu() {
  const user = useUser();
  const router = useRouter();

  const displayName = getUserDisplayName(user);
  const primaryRole = getPrimaryRole(user);

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.replace("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full p-1 hover:bg-muted"
          aria-label="Open user menu"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-[#0B4F8A] text-xs font-semibold text-white">
              {getInitials(user.first_name, user.last_name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 bg-blue-300 shadow-sm backdrop-blur-md pb-5 border-blue-900 border-2"
      >
        <DropdownMenuLabel>
          <p className="truncate font-medium">{displayName}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </p>
          <p className="mt-1 truncate text-xs font-normal text-[#F46C0B]">
            {primaryRole}
          </p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard/account/profile">
            <UserRound className="size-4" />
            My profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/account/settings">
            <Settings className="size-4" />
            Account settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/preferences">
            <SlidersHorizontal className="size-4" />
            Preferences
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/notifications">
            <Bell className="size-4" />
            Notifications
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/help">
            <CircleHelp className="size-4" />
            Help and support
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
