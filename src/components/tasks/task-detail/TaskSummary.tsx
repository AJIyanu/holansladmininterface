import Link from "next/link";

import {
  Building2,
  Bell,
  CalendarClock,
  Layers3,
  UserRound,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  formatTaskDateTime,
  getAssignmentTypeLabel,
} from "@/lib/tasks/format-task";

import { TaskPriorityBadge } from "../TaskPriorityBadge";
import { TaskStatusBadge } from "../TaskStatusBadge";

import type { TaskDetail } from "@/types/tasks";

interface TaskSummaryProps {
  task: TaskDetail;
}

export function TaskSummary({ task }: TaskSummaryProps) {
  const creatorName =
    task.batch.created_by_name || task.batch.created_by?.username || "Unknown";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <Card className="bg-orange-50">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardTitle className="break-words text-xl">
              {task.batch.title}
            </CardTitle>

            <div className="flex flex-wrap gap-2">
              <TaskPriorityBadge priority={task.batch.priority} />

              <TaskStatusBadge status={task.status} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {task.batch.description ? (
            <div>
              <h2 className="mb-2 text-sm font-semibold">Description</h2>

              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {task.batch.description}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No description was provided.
            </p>
          )}

          {task.cancellation_reason ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm font-semibold text-destructive">
                Cancellation reason
              </p>

              <p className="mt-1 text-sm text-destructive">
                {task.cancellation_reason}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="bg-green-100">
        <CardHeader>
          <CardTitle className="text-base">Assignment details</CardTitle>
        </CardHeader>

        <CardContent>
          <dl className="space-y-4 text-sm">
            {task.reminders ? (
              <div className="flex gap-3">
                <Bell className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                <div>
                  <dt className="text-muted-foreground">Active reminders</dt>

                  <dd className="font-medium">{task.reminders.active_count}</dd>

                  {task.reminders.next_reminder_at ? (
                    <p className="text-xs text-muted-foreground">
                      Next:{" "}
                      {formatTaskDateTime(task.reminders.next_reminder_at)}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
            <div className="flex gap-3">
              <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

              <div>
                <dt className="text-muted-foreground">Assigned to</dt>
                <dd className="font-medium">
                  {task.assignee_name || "Unassigned"}
                </dd>
              </div>
            </div>

            <div className="flex gap-3">
              <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

              <div>
                <dt className="text-muted-foreground">Department</dt>
                <dd className="font-medium">
                  {task.assigned_department_name || "Not assigned"}
                </dd>
              </div>
            </div>

            <div className="flex gap-3">
              <Layers3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

              <div>
                <dt className="text-muted-foreground">Assignment type</dt>
                <dd className="font-medium">
                  {getAssignmentTypeLabel(task.batch.assignment_type)}
                </dd>
              </div>
            </div>

            <div className="flex gap-3">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

              <div className="space-y-2">
                <div>
                  <dt className="text-muted-foreground">Starts</dt>
                  <dd className="font-medium">
                    {formatTaskDateTime(task.batch.start_at)}
                  </dd>
                </div>

                <div>
                  <dt className="text-muted-foreground">Due</dt>
                  <dd className="font-medium">
                    {formatTaskDateTime(task.batch.due_at)}
                  </dd>
                </div>
              </div>
            </div>

            <div>
              <dt className="text-muted-foreground">Created by</dt>
              <dd className="font-medium">{creatorName}</dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Assignment group</dt>
              <dd>
                <Link
                  href={`/dashboard/tasks/batches/${task.batch.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  View batch details
                </Link>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
