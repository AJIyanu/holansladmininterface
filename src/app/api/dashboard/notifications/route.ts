import { NextResponse } from "next/server";

import { serverFetch } from "@/lib/server-fetch";
import { readServerFetchResult } from "@/lib/api/read-server-fetch-result";
import { normalizeNotification } from "@/lib/notifications/notification-utils";

import type {
  DashboardNotificationsResponse,
  PaginatedNotificationResponse,
} from "@/types/notifications";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractUnreadCount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, value);
  }

  if (!isRecord(value)) {
    return null;
  }

  const possibleKeys = ["unread_count", "count", "unread", "total"];

  for (const key of possibleKeys) {
    const candidate = value[key];

    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return Math.max(0, candidate);
    }

    if (
      typeof candidate === "string" &&
      candidate.trim() &&
      !Number.isNaN(Number(candidate))
    ) {
      return Math.max(0, Number(candidate));
    }
  }

  if ("data" in value) {
    return extractUnreadCount(value.data);
  }

  return null;
}

function errorResponse(status: number, data: unknown) {
  const detail =
    isRecord(data) && typeof data.detail === "string"
      ? data.detail
      : "Notifications could not be loaded.";

  return NextResponse.json(
    { detail },
    {
      status,
      headers: NO_STORE_HEADERS,
    },
  );
}

export async function GET() {
  const [listRequest, countRequest] = await Promise.allSettled([
    serverFetch<PaginatedNotificationResponse>(
      "/notifications/?page_size=20&ordering=-created_at",
      {
        method: "GET",
        cache: "no-store",
      },
    ),

    serverFetch<PaginatedNotificationResponse>("/notifications/unread-count/", {
      method: "GET",
      cache: "no-store",
    }),
  ]);

  if (listRequest.status === "rejected") {
    // console.error("Failed to fetch notifications list:", listRequest.reason);
    return NextResponse.json(
      {
        detail: "Notifications could not be loaded.",
      },
      {
        status: 502,
        headers: NO_STORE_HEADERS,
      },
    );
  }

  const listResult = await readServerFetchResult<PaginatedNotificationResponse>(
    listRequest.value,
  );
  // console.log(listResult);

  if (!listResult.ok || !listResult.data) {
    return errorResponse(listResult.status, listResult.data);
  }

  const notifications = listResult.data.results.map(normalizeNotification);

  let unreadCount: number | null = null;

  if (countRequest.status === "fulfilled") {
    const countResult = await readServerFetchResult<unknown>(
      countRequest.value,
    );

    if (countResult.ok) {
      unreadCount = extractUnreadCount(countResult.data);
    }
  }

  // Temporary fallback when the unread endpoint
  // has an undocumented response shape.
  if (unreadCount === null) {
    unreadCount = notifications.filter(
      (notification) => !notification.is_read,
    ).length;
  }

  const response: DashboardNotificationsResponse = {
    count: listResult.data.count,
    next: listResult.data.next,
    previous: listResult.data.previous,
    unread_count: unreadCount,
    results: notifications,
  };

  return NextResponse.json(response, {
    headers: NO_STORE_HEADERS,
  });
}
