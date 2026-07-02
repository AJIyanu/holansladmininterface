import { serverFetch } from "@/lib/server-fetch";

import type {
  CancellationPayload,
  CreateTaskPayload,
  CreateTaskResponse,
  PaginatedResponse,
  TaskBatchDetail,
  TaskBatchListQuery,
  TaskBatchSummary,
  TaskDepartmentSummary,
  TaskDetail,
  TaskListItem,
  TaskListQuery,
  TaskUserSummary,
  UpdateTaskBatchPayload,
  UpdateTaskStatusPayload,
  TaskDepartmentOption,
  TaskStaffOption,
} from "@/types/tasks";

// type QueryValue = string | number | boolean | null | undefined;

interface RawTaskStaffProfile {
  id: string;
  employee_id?: string | null;
  job_title?: string | null;

  user?: TaskUserSummary;
  user_details?: TaskUserSummary;

  department?: TaskDepartmentSummary | null;
}

interface RawTaskDepartment {
  id: string;
  name: string;
  code: string;
}

type ListResponse<T> = T[] | PaginatedResponse<T>;

export class TaskApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);

    this.name = "TaskApiError";
    this.status = status;
    this.data = data;
  }
}

function createQueryString(values: TaskListQuery | TaskBatchListQuery): string {
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

function getErrorMessage(data: unknown): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "detail" in data &&
    typeof data.detail === "string"
  ) {
    return data.detail;
  }

  return "The task request could not be completed.";
}

function extractListResults<T>(response: ListResponse<T>): T[] {
  return Array.isArray(response) ? response : response.results;
}

function getStaffProfileUser(
  profile: RawTaskStaffProfile,
): TaskUserSummary | null {
  return profile.user ?? profile.user_details ?? null;
}

/**
 * Supports either version of serverFetch:
 *
 * 1. serverFetch returns a regular Response.
 * 2. serverFetch already returns parsed JSON.
 */
async function resolveServerFetchResult<T>(result: Response | T): Promise<T> {
  if (!(result instanceof Response)) {
    return result;
  }

  const contentType = result.headers.get("content-type") ?? "";

  const data: unknown = contentType.includes("application/json")
    ? await result.json()
    : await result.text();

  if (!result.ok) {
    throw new TaskApiError(getErrorMessage(data), result.status, data);
  }

  return data as T;
}

async function taskRequest<T>(
  endpoint: string,
  init?: RequestInit,
): Promise<T> {
  const result = (await serverFetch(endpoint, {
    cache: "no-store",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  })) as Response | T;

  return resolveServerFetchResult<T>(result);
}

export async function getTasks(
  query: TaskListQuery = {},
): Promise<PaginatedResponse<TaskListItem>> {
  const queryString = createQueryString(query);

  return taskRequest<PaginatedResponse<TaskListItem>>(`/tasks/${queryString}`);
}

export async function getTask(taskId: string): Promise<TaskDetail> {
  const endpoint = `/tasks/${encodeURIComponent(taskId)}/`;

  try {
    return await taskRequest<TaskDetail>(endpoint);
  } catch (error) {
    if (error instanceof TaskApiError && error.status === 404) {
      return taskRequest<TaskDetail>(`${endpoint}?archived=true`);
    }

    throw error;
  }
}

export async function createTask(
  payload: CreateTaskPayload,
): Promise<CreateTaskResponse> {
  return taskRequest<CreateTaskResponse>("/tasks/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getTaskBatches(
  query: TaskBatchListQuery = {},
): Promise<PaginatedResponse<TaskBatchSummary>> {
  const queryString = createQueryString(query);

  return taskRequest<PaginatedResponse<TaskBatchSummary>>(
    `/tasks/batches/${queryString}`,
  );
}

export async function getTaskBatch(batchId: string): Promise<TaskBatchDetail> {
  const endpoint = `/tasks/batches/${encodeURIComponent(batchId)}/`;

  try {
    return await taskRequest<TaskBatchDetail>(endpoint);
  } catch (error) {
    if (error instanceof TaskApiError && error.status === 404) {
      return taskRequest<TaskBatchDetail>(`${endpoint}?archived=true`);
    }

    throw error;
  }
}

export async function updateTaskBatch(
  batchId: string,
  payload: UpdateTaskBatchPayload,
): Promise<TaskBatchDetail> {
  return taskRequest<TaskBatchDetail>(
    `/tasks/batches/${encodeURIComponent(batchId)}/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateTaskStatus(
  taskId: string,
  payload: UpdateTaskStatusPayload,
): Promise<TaskDetail> {
  return taskRequest<TaskDetail>(
    `/tasks/${encodeURIComponent(taskId)}/status/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function cancelTask(
  taskId: string,
  payload: CancellationPayload,
): Promise<TaskDetail> {
  return taskRequest<TaskDetail>(
    `/tasks/${encodeURIComponent(taskId)}/cancel/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function archiveTask(taskId: string): Promise<TaskDetail> {
  return taskRequest<TaskDetail>(
    `/tasks/${encodeURIComponent(taskId)}/archive/`,
    {
      method: "POST",
    },
  );
}

export async function restoreTask(taskId: string): Promise<TaskDetail> {
  return taskRequest<TaskDetail>(
    `/tasks/${encodeURIComponent(taskId)}/restore/?archived=true`,
    {
      method: "POST",
    },
  );
}

export async function cancelTaskBatch(
  batchId: string,
  payload: CancellationPayload,
): Promise<
  TaskBatchDetail & {
    affected_task_count: number;
  }
> {
  return taskRequest<
    TaskBatchDetail & {
      affected_task_count: number;
    }
  >(`/tasks/batches/${encodeURIComponent(batchId)}/cancel/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function archiveTaskBatch(batchId: string): Promise<
  TaskBatchDetail & {
    archived_task_count: number;
  }
> {
  return taskRequest<
    TaskBatchDetail & {
      archived_task_count: number;
    }
  >(`/tasks/batches/${encodeURIComponent(batchId)}/archive/`, {
    method: "POST",
  });
}

export async function restoreTaskBatch(batchId: string): Promise<
  TaskBatchDetail & {
    restored_task_count: number;
  }
> {
  return taskRequest<
    TaskBatchDetail & {
      restored_task_count: number;
    }
  >(`/tasks/batches/${encodeURIComponent(batchId)}/restore/?archived=true`, {
    method: "POST",
  });
}

export async function getTaskStaffOptions(): Promise<TaskStaffOption[]> {
  const response = await taskRequest<ListResponse<RawTaskStaffProfile>>(
    "/account/profiles/?" +
      new URLSearchParams({
        is_active: "true",
        ordering: "user__first_name",
        page_size: "250",
      }).toString(),
  );

  return extractListResults(response)
    .map((profile) => {
      const user = getStaffProfileUser(profile);

      if (!user) {
        return null;
      }

      const fullName = [user.first_name, user.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

      return {
        profileId: profile.id,
        userId: user.id,
        fullName: fullName || user.username || user.email,
        email: user.email,
        employeeId: profile.employee_id ?? user.employee_id ?? null,
        jobTitle: profile.job_title ?? user.job_title ?? null,
        department: profile.department ?? user.department ?? null,
      } satisfies TaskStaffOption;
    })
    .filter((option): option is TaskStaffOption => option !== null);
}

export async function getTaskDepartmentOptions(): Promise<
  TaskDepartmentOption[]
> {
  const response = await taskRequest<ListResponse<RawTaskDepartment>>(
    "/account/departments/?" +
      new URLSearchParams({
        ordering: "name",
        page_size: "250",
      }).toString(),
  );

  return extractListResults(response).map((department) => ({
    id: department.id,
    name: department.name,
    code: department.code,
  }));
}
