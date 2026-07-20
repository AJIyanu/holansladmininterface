"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Skeleton } from "@/components/ui/skeleton";

import { useDashboardNotifications } from "@/hooks/use-dashboard-notifications";

import { getNotificationDestination } from "@/lib/notifications/notification-utils";

import { DashboardNotificationItem } from "../../dashboard/notifications/DashboardNotificationItem";

import type { DashboardNotification } from "@/types/notifications";

function NotificationLoadingState() {
  return (
    <div className="divide-y">
      {Array.from({
        length: 3,
      }).map((_, index) => (
        <div key={index} className="flex gap-3 px-4 py-4">
          <Skeleton className="size-9 shrink-0 rounded-full" />

          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardNotifications() {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useDashboardNotifications();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      void refresh({
        silent: true,
      });
    }
  }

  function handleNotificationSelect(notification: DashboardNotification) {
    const destination = getNotificationDestination(notification);

    const readRequest = markAsRead(notification);

    setOpen(false);
    router.push(destination);

    void readRequest.catch((readError) => {
      toast.error(
        readError instanceof Error
          ? readError.message
          : "The notification could not be marked as read.",
      );
    });
  }

  async function handleMarkAllAsRead() {
    setIsMarkingAllRead(true);

    try {
      await markAllAsRead();

      toast.success("All notifications marked as read.");
    } catch (markAllError) {
      toast.error(
        markAllError instanceof Error
          ? markAllError.message
          : "Notifications could not be marked as read.",
      );
    } finally {
      setIsMarkingAllRead(false);
    }
  }

  const badgeValue = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label={
            unreadCount > 0
              ? `Open notifications. ${unreadCount} unread.`
              : "Open notifications"
          }
        >
          <Bell className="size-5" />

          {unreadCount > 0 ? (
            <Badge className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-[#F46C0B] px-1 text-[10px] leading-none text-white">
              {badgeValue}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-1rem)] max-w-sm overflow-hidden border bg-background p-0 shadow-lg sm:w-96"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>

            <p className="text-xs text-muted-foreground">
              {unreadCount} unread
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => void refresh()}
              disabled={isRefreshing}
              aria-label="Refresh notifications"
              className="size-8"
            >
              <RefreshCw
                className={isRefreshing ? "size-4 animate-spin" : "size-4"}
              />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || isMarkingAllRead}
              className="h-8 gap-1.5 px-2 text-xs"
            >
              {isMarkingAllRead ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCheck className="size-3.5" />
              )}
              Mark all read
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator className="m-0" />

        {error ? (
          <div
            role="alert"
            className="border-b bg-destructive/5 px-4 py-2 text-xs text-destructive"
          >
            {error}
          </div>
        ) : null}

        <div className="max-h-[min(28rem,70vh)] overflow-y-auto overscroll-contain">
          {isLoading ? (
            <NotificationLoadingState />
          ) : notifications.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-6 py-8 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                <Bell className="size-6 text-muted-foreground" />
              </div>

              <p className="text-sm font-medium">No notifications</p>

              <p className="mt-1 max-w-60 text-xs leading-5 text-muted-foreground">
                Task assignments, comments and reminders will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DashboardNotificationItem
                key={notification.id}
                notification={notification}
                onSelect={handleNotificationSelect}
              />
            ))
          )}
        </div>

        {notifications.length > 0 ? (
          <>
            <DropdownMenuSeparator className="m-0" />

            <div className="px-4 py-2 text-center text-[11px] text-muted-foreground">
              Showing the latest {notifications.length} of{" "}
              {notifications.length === 1
                ? "1 notification"
                : `${notifications.length} notifications`}
            </div>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
