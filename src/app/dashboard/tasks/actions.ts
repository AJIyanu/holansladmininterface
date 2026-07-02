"use server";

import { revalidatePath } from "next/cache";

import {
  archiveTask,
  archiveTaskBatch,
  cancelTask,
  cancelTaskBatch,
  restoreTask,
  restoreTaskBatch,
  TaskApiError,
  updateTaskBatch,
  updateTaskStatus,
} from "@/lib/api/tasks";

import type {
  TaskPriority,
  TaskStatus,
  UpdateTaskBatchPayload,
} from "@/types/tasks";

export interface TaskMutationResult {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

function extractFieldErrors(
  value: unknown,
): Record<string, string[]> | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const errors: Record<string, string[]> = {};

  Object.entries(value).forEach(([key, item]) => {
    if (typeof item === "string") {
      errors[key] = [item];
      return;
    }

    if (
      Array.isArray(item) &&
      item.every((entry) => typeof entry === "string")
    ) {
      errors[key] = item;
    }
  });

  return Object.keys(errors).length ? errors : undefined;
}

function failureResult(error: unknown, fallback: string): TaskMutationResult {
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

function revalidateTaskRoutes(taskId?: string, batchId?: string) {
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/tasks/created");
  revalidatePath("/dashboard/tasks/department");
  revalidatePath("/dashboard/tasks/all");

  if (taskId) {
    revalidatePath(`/dashboard/tasks/${taskId}`);
  }

  if (batchId) {
    revalidatePath(`/dashboard/tasks/batches/${batchId}`);
  }
}

export async function updateTaskStatusAction(
  taskId: string,
  status: Exclude<TaskStatus, "CANCELLED">,
): Promise<TaskMutationResult> {
  try {
    const task = await updateTaskStatus(taskId, { status });

    revalidateTaskRoutes(task.id, task.batch.id);

    return {
      success: true,
      message: "Task status updated.",
    };
  } catch (error) {
    return failureResult(error, "The task status could not be updated.");
  }
}

export async function cancelTaskAction(
  taskId: string,
  reason: string,
): Promise<TaskMutationResult> {
  if (!reason.trim()) {
    return {
      success: false,
      message: "A cancellation reason is required.",
      fieldErrors: {
        reason: ["A cancellation reason is required."],
      },
    };
  }

  try {
    const task = await cancelTask(taskId, {
      reason: reason.trim(),
    });

    revalidateTaskRoutes(task.id, task.batch.id);

    return {
      success: true,
      message: "Task cancelled.",
    };
  } catch (error) {
    return failureResult(error, "The task could not be cancelled.");
  }
}

export async function archiveTaskAction(
  taskId: string,
): Promise<TaskMutationResult> {
  try {
    const task = await archiveTask(taskId);

    revalidateTaskRoutes(task.id, task.batch.id);

    return {
      success: true,
      message: "Task archived.",
    };
  } catch (error) {
    return failureResult(error, "The task could not be archived.");
  }
}

export async function restoreTaskAction(
  taskId: string,
): Promise<TaskMutationResult> {
  try {
    const task = await restoreTask(taskId);

    revalidateTaskRoutes(task.id, task.batch.id);

    return {
      success: true,
      message: "Task restored.",
    };
  } catch (error) {
    return failureResult(error, "The task could not be restored.");
  }
}

interface UpdateBatchActionInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  start_at?: string | null;
  due_at?: string | null;
}

export async function updateTaskBatchAction(
  batchId: string,
  values: UpdateBatchActionInput,
): Promise<TaskMutationResult> {
  const payload: UpdateTaskBatchPayload = {};

  if (values.title !== undefined) {
    const title = values.title.trim();

    if (!title) {
      return {
        success: false,
        message: "Task title is required.",
        fieldErrors: {
          title: ["Task title is required."],
        },
      };
    }

    payload.title = title;
  }

  if (values.description !== undefined) {
    payload.description = values.description.trim();
  }

  if (values.priority !== undefined) {
    payload.priority = values.priority;
  }

  if (values.start_at !== undefined) {
    payload.start_at = values.start_at;
  }

  if (values.due_at !== undefined) {
    payload.due_at = values.due_at;
  }

  try {
    const batch = await updateTaskBatch(batchId, payload);

    revalidateTaskRoutes(undefined, batch.id);

    return {
      success: true,
      message: "Task details updated.",
    };
  } catch (error) {
    return failureResult(error, "The task details could not be updated.");
  }
}

export async function cancelTaskBatchAction(
  batchId: string,
  reason: string,
): Promise<TaskMutationResult> {
  if (!reason.trim()) {
    return {
      success: false,
      message: "A cancellation reason is required.",
      fieldErrors: {
        reason: ["A cancellation reason is required."],
      },
    };
  }

  try {
    await cancelTaskBatch(batchId, {
      reason: reason.trim(),
    });

    revalidateTaskRoutes(undefined, batchId);

    return {
      success: true,
      message: "Task assignment cancelled.",
    };
  } catch (error) {
    return failureResult(error, "The task assignment could not be cancelled.");
  }
}

export async function archiveTaskBatchAction(
  batchId: string,
): Promise<TaskMutationResult> {
  try {
    await archiveTaskBatch(batchId);

    revalidateTaskRoutes(undefined, batchId);

    return {
      success: true,
      message: "Task assignment archived.",
    };
  } catch (error) {
    return failureResult(error, "The task assignment could not be archived.");
  }
}

export async function restoreTaskBatchAction(
  batchId: string,
): Promise<TaskMutationResult> {
  try {
    await restoreTaskBatch(batchId);

    revalidateTaskRoutes(undefined, batchId);

    return {
      success: true,
      message: "Task assignment restored.",
    };
  } catch (error) {
    return failureResult(error, "The task assignment could not be restored.");
  }
}
