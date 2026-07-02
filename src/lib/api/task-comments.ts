import { taskRequest } from "@/lib/api/tasks";

import type {
  PaginatedResponse,
  TaskActivity,
  TaskActivityListQuery,
  TaskComment,
  TaskCommentListQuery,
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

export async function getTaskComments(
  taskId: string,
  query: TaskCommentListQuery = {},
): Promise<PaginatedResponse<TaskComment>> {
  const queryString = createQueryString(
    query as TaskCommentListQuery & Record<string, QueryValue>,
  );

  return taskRequest<PaginatedResponse<TaskComment>>(
    `/tasks/${encodeURIComponent(taskId)}/comments/${queryString}`,
  );
}

export async function createTaskComment(
  taskId: string,
  body: string,
): Promise<TaskComment> {
  return taskRequest<TaskComment>(
    `/tasks/${encodeURIComponent(taskId)}/comments/`,
    {
      method: "POST",
      body: JSON.stringify({
        body,
      }),
    },
  );
}

export async function updateTaskComment(
  taskId: string,
  commentId: string,
  body: string,
): Promise<TaskComment> {
  return taskRequest<TaskComment>(
    `/tasks/${encodeURIComponent(taskId)}/comments/${encodeURIComponent(
      commentId,
    )}/`,
    {
      method: "PATCH",
      body: JSON.stringify({
        body,
      }),
    },
  );
}

export async function removeTaskComment(
  taskId: string,
  commentId: string,
  reason: string,
): Promise<TaskComment> {
  return taskRequest<TaskComment>(
    `/tasks/${encodeURIComponent(taskId)}/comments/${encodeURIComponent(
      commentId,
    )}/remove/`,
    {
      method: "POST",
      body: JSON.stringify({
        reason,
      }),
    },
  );
}

export async function getTaskActivity(
  taskId: string,
  query: TaskActivityListQuery = {},
): Promise<PaginatedResponse<TaskActivity>> {
  const queryString = createQueryString({
    page: query.page,
    archived: query.archived,
    activity_type: query.activity_type,
  });

  return taskRequest<PaginatedResponse<TaskActivity>>(
    `/tasks/${encodeURIComponent(taskId)}/activity/${queryString}`,
  );
}

export async function getTaskBatchActivity(
  batchId: string,
  query: TaskActivityListQuery = {},
): Promise<PaginatedResponse<TaskActivity>> {
  const queryString = createQueryString({
    page: query.page,
    archived: query.archived,
    activity_type: query.activity_type,
    include_task_activity: query.include_task_activity,
  });

  return taskRequest<PaginatedResponse<TaskActivity>>(
    `/tasks/batches/${encodeURIComponent(batchId)}/activity/${queryString}`,
  );
}
