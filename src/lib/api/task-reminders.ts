import { taskRequest } from "@/lib/api/tasks";

import type {
  CancelTaskReminderPayload,
  CreateTaskReminderPayload,
  PaginatedResponse,
  TaskReminder,
  TaskReminderCapabilities,
  TaskReminderListQuery,
  UpdateTaskReminderPayload,
} from "@/types/tasks";

type QueryValue = string | number | boolean | null | undefined;

function createQueryString(values: Record<string, QueryValue>): string {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    params.set(key, String(value));
  });

  const query = params.toString();

  return query ? `?${query}` : "";
}

export async function getTaskReminderCapabilities(): Promise<TaskReminderCapabilities> {
  return taskRequest<TaskReminderCapabilities>(
    "/tasks/reminders/capabilities/",
  );
}

export async function getTaskReminders(
  query: TaskReminderListQuery = {},
): Promise<PaginatedResponse<TaskReminder>> {
  const queryString = createQueryString(
    query as TaskReminderListQuery & Record<string, QueryValue>,
  );

  return taskRequest<PaginatedResponse<TaskReminder>>(
    `/tasks/reminders/${queryString}`,
  );
}

export async function createTaskReminder(
  payload: CreateTaskReminderPayload,
): Promise<TaskReminder> {
  return taskRequest<TaskReminder>("/tasks/reminders/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTaskReminder(
  reminderId: string,
  payload: UpdateTaskReminderPayload,
): Promise<TaskReminder> {
  return taskRequest<TaskReminder>(
    `/tasks/reminders/${encodeURIComponent(reminderId)}/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function cancelTaskReminder(
  reminderId: string,
  payload: CancelTaskReminderPayload = {},
): Promise<TaskReminder> {
  return taskRequest<TaskReminder>(
    `/tasks/reminders/${encodeURIComponent(reminderId)}/cancel/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
