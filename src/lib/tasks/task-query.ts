import type {
  TaskAssignmentType,
  TaskListQuery,
  TaskOrdering,
  TaskPriority,
  TaskScope,
  TaskStatus,
} from "@/types/tasks";

export type RawTaskSearchParams = Record<string, string | string[] | undefined>;

const TASK_STATUSES: TaskStatus[] = [
  "TO_DO",
  "IN_PROGRESS",
  "BLOCKED",
  "COMPLETED",
  "CANCELLED",
];

const TASK_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const ASSIGNMENT_TYPES: TaskAssignmentType[] = [
  "PERSONAL",
  "USERS",
  "DEPARTMENT",
];

const TASK_ORDERING: TaskOrdering[] = [
  "created_at",
  "-created_at",
  "updated_at",
  "-updated_at",
  "status",
  "-status",
  "title",
  "-title",
  "priority",
  "-priority",
  "start_at",
  "-start_at",
  "due_at",
  "-due_at",
  "assignee",
  "-assignee",
  "department",
  "-department",
];

export function getFirstSearchValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseEnum<T extends string>(
  value: string | undefined,
  allowedValues: readonly T[],
): T | undefined {
  if (!value) {
    return undefined;
  }

  return allowedValues.includes(value as T) ? (value as T) : undefined;
}

export function parseBooleanSearchValue(
  value: string | undefined,
): boolean | undefined {
  if (!value) {
    return undefined;
  }

  if (["true", "1", "yes", "on"].includes(value)) {
    return true;
  }

  if (["false", "0", "no", "off"].includes(value)) {
    return false;
  }

  return undefined;
}

export function parseTaskPage(value: string | undefined): number {
  const page = Number.parseInt(value ?? "1", 10);

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return page;
}

export function flattenTaskSearchParams(
  searchParams: RawTaskSearchParams,
): Record<string, string> {
  const result: Record<string, string> = {};

  Object.entries(searchParams).forEach(([key, value]) => {
    const firstValue = getFirstSearchValue(value);

    if (firstValue !== undefined) {
      result[key] = firstValue;
    }
  });

  return result;
}

export function buildTaskListQuery(
  searchParams: RawTaskSearchParams,
  scope: TaskScope,
): TaskListQuery {
  const search = getFirstSearchValue(searchParams.search)?.trim();

  return {
    scope,
    archived:
      parseBooleanSearchValue(getFirstSearchValue(searchParams.archived)) ??
      false,

    status: parseEnum(getFirstSearchValue(searchParams.status), TASK_STATUSES),

    priority: parseEnum(
      getFirstSearchValue(searchParams.priority),
      TASK_PRIORITIES,
    ),

    assignment_type: parseEnum(
      getFirstSearchValue(searchParams.assignment_type),
      ASSIGNMENT_TYPES,
    ),

    overdue: parseBooleanSearchValue(getFirstSearchValue(searchParams.overdue)),

    has_due_date: parseBooleanSearchValue(
      getFirstSearchValue(searchParams.has_due_date),
    ),

    search: search || undefined,

    ordering:
      parseEnum(getFirstSearchValue(searchParams.ordering), TASK_ORDERING) ??
      "due_at",

    page: parseTaskPage(getFirstSearchValue(searchParams.page)),
  };
}
