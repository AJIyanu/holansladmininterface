import type {
  DashboardNotification,
  NotificationInboxApiItem,
  NotificationMetadata,
} from "@/types/notifications";

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    return ["true", "1", "yes"].includes(value.trim().toLowerCase());
  }

  return false;
}

function toMetadata(value: unknown): NotificationMetadata {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as NotificationMetadata;
  }

  return {};
}

function getMetadataString(
  metadata: NotificationMetadata,
  key: string,
): string | null {
  const value = metadata[key];

  return typeof value === "string" && value.trim() ? value : null;
}

export function normalizeNotification(
  notification: NotificationInboxApiItem,
): DashboardNotification {
  return {
    ...notification,
    is_mandatory: toBoolean(notification.is_mandatory),
    is_seen: toBoolean(notification.is_seen),
    is_read: toBoolean(notification.is_read),
    is_archived: toBoolean(notification.is_archived),
  };
}

export function getNotificationDestination(
  notification: DashboardNotification,
): string {
  const directUrl = notification.action_url?.trim();

  // Only allow internal dashboard navigation.
  if (directUrl === "/dashboard" || directUrl?.startsWith("/dashboard/")) {
    return directUrl;
  }

  const metadata = {
    ...toMetadata(notification.notification_metadata),
    ...toMetadata(notification.metadata),
  };

  const metadataActionUrl = getMetadataString(metadata, "action_url");

  if (
    metadataActionUrl === "/dashboard" ||
    metadataActionUrl?.startsWith("/dashboard/")
  ) {
    return metadataActionUrl;
  }

  const taskId = getMetadataString(metadata, "task_id");

  if (taskId) {
    const section = getMetadataString(metadata, "task_section");

    const hash =
      section === "comments"
        ? "#task-comments"
        : section === "reminders"
          ? "#task-reminders"
          : section === "activity"
            ? "#task-activity"
            : "";

    return `/dashboard/tasks/${taskId}${hash}`;
  }

  const batchId =
    getMetadataString(metadata, "task_batch_id") ??
    getMetadataString(metadata, "batch_id");

  if (batchId) {
    return `/dashboard/tasks/batches/${batchId}`;
  }

  return "/dashboard/tasks";
}
