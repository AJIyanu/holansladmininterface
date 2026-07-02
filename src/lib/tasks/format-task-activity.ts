import { getTaskStatusLabel } from "@/lib/tasks/format-task";

import type { JsonValue, TaskActivity, TaskStatus } from "@/types/tasks";

function isRecord(value: JsonValue): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStringValue(value: JsonValue, key: string): string | null {
  if (!isRecord(value)) {
    return null;
  }

  const item = value[key];

  return typeof item === "string" ? item : null;
}

function getStringArray(value: JsonValue, key: string): string[] {
  if (!isRecord(value)) {
    return [];
  }

  const item = value[key];

  if (!Array.isArray(item)) {
    return [];
  }

  return item.filter((entry): entry is string => typeof entry === "string");
}

function formatStatus(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const supportedStatuses: TaskStatus[] = [
    "TO_DO",
    "IN_PROGRESS",
    "BLOCKED",
    "COMPLETED",
    "CANCELLED",
  ];

  if (supportedStatuses.includes(value as TaskStatus)) {
    return getTaskStatusLabel(value as TaskStatus);
  }

  return value;
}

export interface TaskActivityPresentation {
  title: string;
  description: string | null;
}

export function getTaskActivityPresentation(
  activity: TaskActivity,
): TaskActivityPresentation {
  switch (activity.activity_type) {
    case "BATCH_CREATED":
      return {
        title: "Task assignment created",
        description: "The shared task assignment was created.",
      };

    case "BATCH_UPDATED": {
      const fields = getStringArray(activity.metadata, "changed_fields");

      return {
        title: "Assignment details updated",
        description: fields.length ? `Updated: ${fields.join(", ")}.` : null,
      };
    }

    case "BATCH_CANCELLED":
      return {
        title: "Task assignment cancelled",
        description:
          getStringValue(activity.new_value, "cancellation_reason") ?? null,
      };

    case "BATCH_ARCHIVED":
      return {
        title: "Task assignment archived",
        description: null,
      };

    case "BATCH_RESTORED":
      return {
        title: "Task assignment restored",
        description: null,
      };

    case "TASK_CREATED":
      return {
        title: "Task created",
        description: null,
      };

    case "TASK_ASSIGNED":
      return {
        title: "Task assigned",
        description: null,
      };

    case "TASK_DETAILS_UPDATED":
      return {
        title: "Task details updated",
        description: null,
      };

    case "STATUS_CHANGED": {
      const previousStatus = formatStatus(
        getStringValue(activity.previous_value, "status"),
      );

      const newStatus = formatStatus(
        getStringValue(activity.new_value, "status"),
      );

      return {
        title: "Task status changed",
        description:
          previousStatus && newStatus
            ? `${previousStatus} → ${newStatus}`
            : null,
      };
    }

    case "TASK_CANCELLED":
      return {
        title: "Task cancelled",
        description:
          getStringValue(activity.new_value, "cancellation_reason") ??
          getStringValue(activity.new_value, "reason"),
      };

    case "TASK_ARCHIVED":
      return {
        title: "Task archived",
        description: null,
      };

    case "TASK_RESTORED":
      return {
        title: "Task restored",
        description: null,
      };

    case "COMMENT_ADDED":
      return {
        title: "Comment added",
        description: null,
      };

    case "COMMENT_EDITED":
      return {
        title: "Comment edited",
        description: null,
      };

    case "COMMENT_REMOVED":
      return {
        title: "Comment removed",
        description: getStringValue(activity.new_value, "removal_reason"),
      };

    case "REMINDER_CREATED":
      return {
        title: "Reminder created",
        description: getStringValue(activity.new_value, "remind_at"),
      };

    case "REMINDER_UPDATED":
      return {
        title: "Reminder rescheduled",
        description: getStringValue(activity.new_value, "remind_at"),
      };

    case "REMINDER_CANCELLED":
      return {
        title: "Reminder cancelled",
        description: getStringValue(activity.new_value, "reason"),
      };

    default:
      return {
        title:
          activity.activity_display ||
          activity.activity_type
            .toLowerCase()
            .replaceAll("_", " ")
            .replace(/^\w/, (character) => character.toUpperCase()),
        description: null,
      };
  }
}

export function getActivityActorName(activity: TaskActivity): string {
  if (!activity.actor) {
    return "System";
  }

  const fullName = [activity.actor.first_name, activity.actor.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || activity.actor.username || activity.actor.email;
}
