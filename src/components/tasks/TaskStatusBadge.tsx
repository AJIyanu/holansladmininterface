import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getTaskStatusLabel } from "@/lib/tasks/format-task";

import type { TaskStatus } from "@/types/tasks";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const statusClasses: Record<TaskStatus, string> = {
  TO_DO: "border-slate-300 bg-slate-100 text-slate-700",
  IN_PROGRESS: "border-blue-300 bg-blue-100 text-blue-700",
  BLOCKED: "border-amber-300 bg-amber-100 text-amber-800",
  COMPLETED: "border-emerald-300 bg-emerald-100 text-emerald-700",
  CANCELLED: "border-red-300 bg-red-100 text-red-700",
};

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "whitespace-nowrap font-medium",
        statusClasses[status],
        className,
      )}
    >
      {getTaskStatusLabel(status)}
    </Badge>
  );
}
