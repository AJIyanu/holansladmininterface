"use client";

import {
  Bell,
  CircleAlert,
  ListTodo,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type {
  DashboardNotification,
} from "@/types/notifications";

interface DashboardNotificationItemProps {
  notification: DashboardNotification;

  onSelect: (
    notification: DashboardNotification,
  ) => void;
}

function formatRelativeTime(
  value: string,
): string {
  const createdAt = new Date(value);

  if (
    Number.isNaN(createdAt.getTime())
  ) {
    return "";
  }

  const difference =
    createdAt.getTime() - Date.now();

  const absoluteDifference =
    Math.abs(difference);

  const formatter =
    new Intl.RelativeTimeFormat("en", {
      numeric: "auto",
    });

  if (absoluteDifference < 60_000) {
    return "just now";
  }

  if (
    absoluteDifference <
    60 * 60_000
  ) {
    return formatter.format(
      Math.round(
        difference / 60_000,
      ),
      "minute",
    );
  }

  if (
    absoluteDifference <
    24 * 60 * 60_000
  ) {
    return formatter.format(
      Math.round(
        difference /
          (60 * 60_000),
      ),
      "hour",
    );
  }

  if (
    absoluteDifference <
    7 * 24 * 60 * 60_000
  ) {
    return formatter.format(
      Math.round(
        difference /
          (24 * 60 * 60_000),
      ),
      "day",
    );
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(createdAt);
}

function getNotificationIcon(
  notification: DashboardNotification,
) {
  const category =
    notification.category
      .trim()
      .toLowerCase();

  const severity =
    notification.severity
      .trim()
      .toUpperCase();

  if (
    severity === "ERROR" ||
    severity === "WARNING" ||
    severity === "CRITICAL"
  ) {
    return CircleAlert;
  }

  if (
    category === "task" ||
    notification.notification_type
      .toLowerCase()
      .includes("task")
  ) {
    return ListTodo;
  }

  return Bell;
}

export function DashboardNotificationItem({
  notification,
  onSelect,
}: DashboardNotificationItemProps) {
  const Icon =
    getNotificationIcon(notification);

  return (
    <button
      type="button"
      onClick={() =>
        onSelect(notification)
      }
      className={cn(
        "group relative flex w-full gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0",
        "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        !notification.is_read &&
          "bg-primary/5",
      )}
      aria-label={`${notification.title}. ${notification.message}`}
    >
      {!notification.is_read ? (
        <span
          className="absolute left-1.5 top-5 size-2 rounded-full bg-[#F46C0B]"
          aria-label="Unread"
        />
      ) : null}

      <div
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border bg-background",
          !notification.is_read &&
            "border-primary/30 bg-primary/10",
        )}
      >
        <Icon className="size-4 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p
            className={cn(
              "line-clamp-1 text-sm",
              notification.is_read
                ? "font-medium"
                : "font-semibold",
            )}
          >
            {notification.title}
          </p>

          <time className="shrink-0 text-[11px] text-muted-foreground">
            {formatRelativeTime(
              notification.created_at,
            )}
          </time>
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {notification.message}
        </p>

        {notification.action_label ? (
          <p className="mt-1.5 text-xs font-medium text-primary">
            {notification.action_label}
          </p>
        ) : null}
      </div>
    </button>
  );
}