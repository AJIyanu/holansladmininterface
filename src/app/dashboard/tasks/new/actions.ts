"use server";

import { revalidatePath } from "next/cache";

import { createTask, TaskApiError } from "@/lib/api/tasks";
import { taskFormSchema, type TaskFormValues } from "@/lib/validation/task";

import type { CreateTaskPayload, TaskAssignment } from "@/types/tasks";

export interface CreateTaskActionResult {
  success: boolean;
  message: string;
  taskId?: string;
  batchId?: string;
  redirectTo?: string;
  fieldErrors?: Record<string, string[]>;
}

function toIsoDateTime(value: string): string | null {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

function createAssignment(values: TaskFormValues): TaskAssignment {
  switch (values.assignmentType) {
    case "PERSONAL":
      return {
        type: "PERSONAL",
      };

    case "USERS":
      return {
        type: "USERS",
        user_ids: values.userIds,
      };

    case "DEPARTMENT":
      return {
        type: "DEPARTMENT",
        department_id: values.departmentId,
        include_assigner: values.includeAssigner,
      };
  }
}

function extractBackendFieldErrors(
  data: unknown,
): Record<string, string[]> | undefined {
  if (typeof data !== "object" || data === null) {
    return undefined;
  }

  const errors: Record<string, string[]> = {};

  Object.entries(data).forEach(([field, value]) => {
    if (typeof value === "string") {
      errors[field] = [value];
      return;
    }

    if (
      Array.isArray(value) &&
      value.every((item) => typeof item === "string")
    ) {
      errors[field] = value;
    }
  });

  return Object.keys(errors).length ? errors : undefined;
}

export async function createTaskAction(
  input: TaskFormValues,
): Promise<CreateTaskActionResult> {
  const validation = taskFormSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: "Review the highlighted task details.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const values = validation.data;

  const payload: CreateTaskPayload = {
    title: values.title,
    description: values.description,
    priority: values.priority,
    start_at: toIsoDateTime(values.startAt),
    due_at: toIsoDateTime(values.dueAt),
    assignment: createAssignment(values),
  };

  if (values.assignmentType !== "PERSONAL") {
    payload.notification_channels = values.notificationChannels;

    payload.notification_event_mode = "SHARED";
  }

  try {
    const response = await createTask(payload);

    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard/tasks/created");
    revalidatePath("/dashboard/tasks/department");
    revalidatePath("/dashboard/tasks/all");

    const firstTask = response.tasks[0];

    return {
      success: true,
      message: response.detail,
      taskId: firstTask?.id,
      batchId: response.batch.id,
      redirectTo:
        values.assignmentType === "PERSONAL"
          ? "/dashboard/tasks"
          : "/dashboard/tasks/created",
    };
  } catch (error) {
    if (error instanceof TaskApiError) {
      return {
        success: false,
        message: error.message,
        fieldErrors: extractBackendFieldErrors(error.data),
      };
    }

    return {
      success: false,
      message: "The task could not be created. Please try again.",
    };
  }
}
