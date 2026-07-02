import {
  Building2,
  CalendarClock,
  CircleAlert,
  UserRound,
  ArrowUpRight,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  formatTaskDateTime,
  getAssignmentTypeLabel,
} from "@/lib/tasks/format-task";
import Link from "next/link";

import { TaskPriorityBadge } from "../TaskPriorityBadge";
import { TaskStatusBadge } from "../TaskStatusBadge";

import type { TaskListItem } from "@/types/tasks";

interface TaskCardProps {
  task: TaskListItem;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Link
              href={`/dashboard/tasks/${task.id}`}
              className="group flex min-w-0 flex-1 items-start gap-1 font-semibold text-foreground hover:text-primary"
            >
              <span className="break-words">{task.batch.title}</span>

              <ArrowUpRight className="mt-0.5 size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>

            <TaskPriorityBadge priority={task.batch.priority} />
          </div>

          <div className="flex flex-wrap gap-2">
            <TaskStatusBadge status={task.status} />

            {task.is_overdue ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                <CircleAlert className="size-3.5" />
                Overdue
              </span>
            ) : null}
          </div>
        </div>

        {task.batch.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {task.batch.description}
          </p>
        ) : null}

        <dl className="grid gap-3 text-sm">
          <div className="flex items-start gap-2">
            <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

            <div>
              <dt className="text-xs text-muted-foreground">Due</dt>

              <dd className="font-medium">
                {formatTaskDateTime(task.batch.due_at)}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

            <div>
              <dt className="text-xs text-muted-foreground">Assignment</dt>

              <dd className="font-medium">
                {getAssignmentTypeLabel(task.batch.assignment_type)}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

            <div>
              <dt className="text-xs text-muted-foreground">Department</dt>

              <dd className="font-medium">
                {task.assigned_department_name || "Not assigned"}
              </dd>
            </div>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
