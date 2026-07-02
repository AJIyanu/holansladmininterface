import Link from "next/link";

import {
  ExternalLink,
  UserRound,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { formatTaskDateTime } from "@/lib/tasks/format-task";

import { TaskStatusBadge } from "../TaskStatusBadge";

import type { TaskListItem } from "@/types/tasks";

interface TaskBatchAssigneesProps {
  tasks: TaskListItem[];
}

export function TaskBatchAssignees({
  tasks,
}: TaskBatchAssigneesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Individual tasks
        </CardTitle>
      </CardHeader>

      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No visible individual tasks were found.
          </p>
        ) : (
          <div className="divide-y rounded-lg border">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 gap-3">
                  <div className="rounded-full bg-muted p-2">
                    <UserRound className="size-4 text-muted-foreground" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {task.assignee_name ||
                        "Unassigned staff"}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {[
                        task.assigned_department_name,
                        task.assignee_employee_id,
                      ]
                        .filter(Boolean)
                        .join(" · ") ||
                        task.assignee_email}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Updated{" "}
                      {formatTaskDateTime(
                        task.updated_at,
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <TaskStatusBadge
                    status={task.status}
                  />

                  <Link
                    href={`/dashboard/tasks/${task.id}`}
                    aria-label={`View task for ${task.assignee_name}`}
                    className="rounded-md border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <ExternalLink className="size-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}