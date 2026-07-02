import type { TaskBatchDetail, TaskStatus } from "@/types/tasks";

export type SelectableTaskStatus = Exclude<TaskStatus, "CANCELLED">;

const STATUS_TRANSITIONS: Record<TaskStatus, SelectableTaskStatus[]> = {
  TO_DO: ["IN_PROGRESS", "BLOCKED", "COMPLETED"],
  IN_PROGRESS: ["TO_DO", "BLOCKED", "COMPLETED"],
  BLOCKED: ["TO_DO", "IN_PROGRESS", "COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function getAvailableTaskStatuses(
  status: TaskStatus,
): SelectableTaskStatus[] {
  return STATUS_TRANSITIONS[status];
}

export function isFinalTaskStatus(status: TaskStatus): boolean {
  return status === "COMPLETED" || status === "CANCELLED";
}

export function canArchiveBatchState(batch: TaskBatchDetail): boolean {
  if (batch.is_archived || !batch.progress || batch.progress.total === 0) {
    return false;
  }

  const finalCount = batch.progress.completed + batch.progress.cancelled;

  return finalCount === batch.progress.total;
}

export function toDateTimeLocalValue(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);

  return localDate.toISOString().slice(0, 16);
}

export function localDateTimeToIso(value: string): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}
