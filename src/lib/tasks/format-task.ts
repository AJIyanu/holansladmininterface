import type {
  TaskAssignmentType,
  TaskPriority,
  TaskStatus,
} from "@/types/tasks";

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/London",
});

export function formatTaskDateTime(value: string | null | undefined): string {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return dateTimeFormatter.format(date);
}

export function getTaskStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    TO_DO: "To do",
    IN_PROGRESS: "In progress",
    BLOCKED: "Blocked",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  return labels[status];
}

export function getTaskPriorityLabel(priority: TaskPriority): string {
  const labels: Record<TaskPriority, string> = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent",
  };

  return labels[priority];
}

export function getAssignmentTypeLabel(type: TaskAssignmentType): string {
  const labels: Record<TaskAssignmentType, string> = {
    PERSONAL: "Personal",
    USERS: "Selected staff",
    DEPARTMENT: "Department",
  };

  return labels[type];
}
