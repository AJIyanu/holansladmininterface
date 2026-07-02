import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getTaskPriorityLabel } from "@/lib/tasks/format-task";

import type { TaskPriority } from "@/types/tasks";

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

const priorityClasses: Record<TaskPriority, string> = {
  LOW: "border-slate-300 bg-white text-slate-600",
  MEDIUM: "border-blue-300 bg-blue-50 text-blue-700",
  HIGH: "border-orange-300 bg-orange-50 text-orange-700",
  URGENT: "border-red-300 bg-red-50 text-red-700",
};

export function TaskPriorityBadge({
  priority,
  className,
}: TaskPriorityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "whitespace-nowrap font-medium",
        priorityClasses[priority],
        className,
      )}
    >
      {getTaskPriorityLabel(priority)}
    </Badge>
  );
}
