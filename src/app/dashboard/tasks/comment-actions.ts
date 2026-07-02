"use server";

import { revalidatePath } from "next/cache";

import {
  createTaskComment,
  removeTaskComment,
  updateTaskComment,
} from "@/lib/api/task-comments";

import { TaskApiError } from "@/lib/api/tasks";

export interface TaskCommentActionResult {
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

  Object.entries(value).forEach(([field, fieldValue]) => {
    if (typeof fieldValue === "string") {
      errors[field] = [fieldValue];
      return;
    }

    if (
      Array.isArray(fieldValue) &&
      fieldValue.every((item) => typeof item === "string")
    ) {
      errors[field] = fieldValue;
    }
  });

  return Object.keys(errors).length ? errors : undefined;
}

function failureResult(
  error: unknown,
  fallback: string,
): TaskCommentActionResult {
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

function revalidateCommentRoutes(taskId: string, batchId: string) {
  revalidatePath(`/dashboard/tasks/${taskId}`);

  revalidatePath(`/dashboard/tasks/batches/${batchId}`);

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/tasks/created");
  revalidatePath("/dashboard/tasks/department");
  revalidatePath("/dashboard/tasks/all");
}

export async function createTaskCommentAction(
  taskId: string,
  batchId: string,
  body: string,
): Promise<TaskCommentActionResult> {
  const cleanedBody = body.trim();

  if (!cleanedBody) {
    return {
      success: false,
      message: "A comment cannot be empty.",
      fieldErrors: {
        body: ["A comment cannot be empty."],
      },
    };
  }

  if (cleanedBody.length > 10_000) {
    return {
      success: false,
      message: "A comment cannot exceed 10,000 characters.",
      fieldErrors: {
        body: ["A comment cannot exceed 10,000 characters."],
      },
    };
  }

  try {
    await createTaskComment(taskId, cleanedBody);

    revalidateCommentRoutes(taskId, batchId);

    return {
      success: true,
      message: "Comment added.",
    };
  } catch (error) {
    return failureResult(error, "The comment could not be added.");
  }
}

export async function updateTaskCommentAction(
  taskId: string,
  batchId: string,
  commentId: string,
  body: string,
): Promise<TaskCommentActionResult> {
  const cleanedBody = body.trim();

  if (!cleanedBody) {
    return {
      success: false,
      message: "A comment cannot be empty.",
      fieldErrors: {
        body: ["A comment cannot be empty."],
      },
    };
  }

  if (cleanedBody.length > 10_000) {
    return {
      success: false,
      message: "A comment cannot exceed 10,000 characters.",
    };
  }

  try {
    await updateTaskComment(taskId, commentId, cleanedBody);

    revalidateCommentRoutes(taskId, batchId);

    return {
      success: true,
      message: "Comment updated.",
    };
  } catch (error) {
    return failureResult(error, "The comment could not be updated.");
  }
}

export async function removeTaskCommentAction(
  taskId: string,
  batchId: string,
  commentId: string,
  reason: string,
): Promise<TaskCommentActionResult> {
  const cleanedReason = reason.trim();

  if (!cleanedReason) {
    return {
      success: false,
      message: "A removal reason is required.",
      fieldErrors: {
        reason: ["A removal reason is required."],
      },
    };
  }

  try {
    await removeTaskComment(taskId, commentId, cleanedReason);

    revalidateCommentRoutes(taskId, batchId);

    return {
      success: true,
      message: "Comment removed.",
    };
  } catch (error) {
    return failureResult(error, "The comment could not be removed.");
  }
}
