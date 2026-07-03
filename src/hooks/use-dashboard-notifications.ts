"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type {
  DashboardNotification,
  DashboardNotificationsResponse,
} from "@/types/notifications";

const NOTIFICATION_POLL_INTERVAL = 5 * 60 * 1000;

interface RefreshOptions {
  silent?: boolean;
}

interface UseDashboardNotificationsResult {
  notifications: DashboardNotification[];
  unreadCount: number;

  isLoading: boolean;
  isRefreshing: boolean;

  error: string | null;

  refresh: (options?: RefreshOptions) => Promise<void>;

  markAsRead: (notification: DashboardNotification) => Promise<void>;

  markAllAsRead: () => Promise<void>;
}

async function getResponseError(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = (await response.json()) as {
      detail?: string;
    };

    return data.detail || fallback;
  } catch {
    return fallback;
  }
}

export function useDashboardNotifications(): UseDashboardNotificationsResult {
  const [notifications, setNotifications] = useState<DashboardNotification[]>(
    [],
  );

  const [unreadCount, setUnreadCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const hasLoadedRef = useRef(false);

  const inFlightRequestRef = useRef<Promise<void> | null>(null);

  const refresh = useCallback(
    async (options: RefreshOptions = {}): Promise<void> => {
      if (inFlightRequestRef.current) {
        return inFlightRequestRef.current;
      }

      const request = (async () => {
        if (!hasLoadedRef.current) {
          setIsLoading(true);
        } else if (!options.silent) {
          setIsRefreshing(true);
        }

        try {
          const response = await fetch("/api/dashboard/notifications", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
          });

          if (!response.ok) {
            throw new Error(
              await getResponseError(
                response,
                "Notifications could not be refreshed.",
              ),
            );
          }

          const data =
            (await response.json()) as DashboardNotificationsResponse;

          setNotifications(data.results);
          setUnreadCount(Math.max(0, data.unread_count));

          setError(null);
          hasLoadedRef.current = true;
        } catch (refreshError) {
          const message =
            refreshError instanceof Error
              ? refreshError.message
              : "Notifications could not be refreshed.";

          // Existing successful data remains visible.
          setError(message);
        } finally {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      })();

      inFlightRequestRef.current = request;

      await request;

      inFlightRequestRef.current = null;
    },
    [],
  );

  const markAsRead = useCallback(
    async (notification: DashboardNotification): Promise<void> => {
      if (notification.is_read) {
        return;
      }

      const previousNotifications = notifications;

      const previousUnreadCount = unreadCount;

      const readAt = new Date().toISOString();

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                is_read: true,
                read_at: readAt,
              }
            : item,
        ),
      );

      setUnreadCount((current) => Math.max(0, current - 1));

      try {
        const response = await fetch(
          `/api/dashboard/notifications/${encodeURIComponent(
            notification.id,
          )}/read`,
          {
            method: "POST",
            credentials: "same-origin",
            keepalive: true,
          },
        );

        if (!response.ok) {
          throw new Error(
            await getResponseError(
              response,
              "The notification could not be marked as read.",
            ),
          );
        }
      } catch (readError) {
        setNotifications(previousNotifications);

        setUnreadCount(previousUnreadCount);

        throw readError;
      }
    },
    [notifications, unreadCount],
  );

  const markAllAsRead = useCallback(async (): Promise<void> => {
    if (unreadCount === 0) {
      return;
    }

    const previousNotifications = notifications;

    const previousUnreadCount = unreadCount;

    const readAt = new Date().toISOString();

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        is_read: true,
        read_at: notification.read_at ?? readAt,
      })),
    );

    setUnreadCount(0);

    try {
      const response = await fetch("/api/dashboard/notifications/read-all", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error(
          await getResponseError(
            response,
            "Notifications could not be marked as read.",
          ),
        );
      }
    } catch (markAllError) {
      setNotifications(previousNotifications);

      setUnreadCount(previousUnreadCount);

      throw markAllError;
    }
  }, [notifications, unreadCount]);

  useEffect(() => {
    void refresh();

    const pollNotifications = () => {
      if (document.visibilityState === "visible") {
        void refresh({
          silent: true,
        });
      }
    };

    const handleWindowFocus = () => {
      void refresh({
        silent: true,
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refresh({
          silent: true,
        });
      }
    };

    const intervalId = window.setInterval(
      pollNotifications,
      NOTIFICATION_POLL_INTERVAL,
    );

    window.addEventListener("focus", handleWindowFocus);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);

      window.removeEventListener("focus", handleWindowFocus);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refresh]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
  };
}
