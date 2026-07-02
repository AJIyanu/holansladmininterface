"use server";

import { revalidatePath } from "next/cache";

import {
  cancelTaskReminder,
  createTaskReminder,
  updateTaskReminder,
} from "@/lib/api/task-reminders";

import { TaskApiError } from "@/lib/api/tasks";

import type { TaskNotificationChannel } from "@/types/tasks";

export interface TaskReminderActionResult {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

function extractFieldErrors(
  data: unknown,
): Record<string, string[]> | undefined {
  if (typeof data !== "object" || data === null) {
    return undefined;
  }

  const fieldErrors: Record<string, string[]> = {};

  Object.entries(data).forEach(([field, value]) => {
    if (typeof value === "string") {
      fieldErrors[field] = [value];
      return;
    }

    if (
      Array.isArray(value) &&
      value.every((item) => typeof item === "string")
    ) {
      fieldErrors[field] = value;
    }
  });

  return Object.keys(fieldErrors).length ? fieldErrors : undefined;
}

function failureResult(
  error: unknown,
  fallback: string,
): TaskReminderActionResult {
  if (error instanceof TaskApiError) {
    return {
      success: false,
      message: error.message,
      fieldErrors: extractFieldErrors(error.data),
    };
  }

  return {
    success: false,
    message: fallback,
  };
}

function revalidateReminderRoutes(taskId?: string, batchId?: string) {
  revalidatePath("/dashboard/tasks/reminders");

  revalidatePath("/dashboard/tasks");

  if (taskId) {
    revalidatePath(`/dashboard/tasks/${taskId}`);
  }

  if (batchId) {
    revalidatePath(`/dashboard/tasks/batches/${batchId}`);
  }
}

export async function createTaskReminderAction(
  taskId: string,
  batchId: string,
  remindAt: string,
  channels: TaskNotificationChannel[],
): Promise<TaskReminderActionResult> {
  if (!remindAt) {
    return {
      success: false,
      message: "Select a reminder date and time.",
    };
  }

  if (channels.length === 0) {
    return {
      success: false,
      message: "Select at least one reminder channel.",
    };
  }

  const reminderDate = new Date(remindAt);

  if (
    Number.isNaN(reminderDate.getTime()) ||
    reminderDate.getTime() <= Date.now()
  ) {
    return {
      success: false,
      message: "The reminder must be scheduled in the future.",
    };
  }

  try {
    await createTaskReminder({
      task_id: taskId,
      remind_at: reminderDate.toISOString(),
      channels,
    });

    revalidateReminderRoutes(taskId, batchId);

    return {
      success: true,
      message: "Reminder created.",
    };
  } catch (error) {
    return failureResult(error, "The reminder could not be created.");
  }
}

export async function updateTaskReminderAction(
  reminderId: string,
  taskId: string,
  remindAt: string,
  channels: TaskNotificationChannel[],
  batchId?: string,
): Promise<TaskReminderActionResult> {
  const reminderDate = new Date(remindAt);

  if (
    Number.isNaN(reminderDate.getTime()) ||
    reminderDate.getTime() <= Date.now()
  ) {
    return {
      success: false,
      message: "The reminder must be scheduled in the future.",
    };
  }

  if (channels.length === 0) {
    return {
      success: false,
      message: "Select at least one reminder channel.",
    };
  }

  try {
    await updateTaskReminder(reminderId, {
      remind_at: reminderDate.toISOString(),
      channels,
    });

    revalidateReminderRoutes(taskId, batchId);

    return {
      success: true,
      message: "Reminder updated.",
    };
  } catch (error) {
    return failureResult(error, "The reminder could not be updated.");
  }
}

export async function cancelTaskReminderAction(
  reminderId: string,
  taskId: string,
  reason: string,
  batchId?: string,
): Promise<TaskReminderActionResult> {
  try {
    await cancelTaskReminder(reminderId, {
      reason: reason.trim() || "Cancelled by user.",
    });

    revalidateReminderRoutes(taskId, batchId);

    return {
      success: true,
      message: "Reminder cancelled.",
    };
  } catch (error) {
    return failureResult(error, "The reminder could not be cancelled.");
  }
}
