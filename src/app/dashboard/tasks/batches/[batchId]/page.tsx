import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  Building2,
  CalendarClock,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { TaskBatchActions } from "@/components/tasks/batches/TaskBatchActions";
import { TaskBatchAssignees } from "@/components/tasks/batches/TaskBatchAssignees";
import { TaskBatchProgress } from "@/components/tasks/batches/TaskBatchProgress";
import { EditTaskBatchDialog } from "@/components/tasks/batches/EditTaskBatchDialog";
import { TaskPriorityBadge } from "@/components/tasks/TaskPriorityBadge";

import {
  getTaskBatch,
  getTasks,
  TaskApiError,
} from "@/lib/api/tasks";

import {
  formatTaskDateTime,
  getAssignmentTypeLabel,
} from "@/lib/tasks/format-task";

interface TaskBatchPageProps {
  params: Promise<{
    batchId: string;
  }>;
}

export async function generateMetadata({
  params,
}: TaskBatchPageProps): Promise<Metadata> {
  const { batchId } = await params;

  try {
    const batch = await getTaskBatch(batchId);

    return {
      title: batch.title,
    };
  } catch {
    return {
      title: "Task Assignment",
    };
  }
}

export default async function TaskBatchPage({
  params,
}: TaskBatchPageProps) {
  const { batchId } = await params;

  try {
    const batch = await getTaskBatch(batchId);

    const taskResponse = await getTasks({
      batch: batch.id,
      archived: batch.is_archived,
      ordering: "assignee",
    });

    return (
      <div className="space-y-6 bg-blue-100 p-9 min-h-screen">
        <header className="space-y-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-3 w-fit"
          >
            <Link href="/dashboard/tasks/created">
              <ArrowLeft className="size-4" />
              Back to assignments
            </Link>
          </Button>

          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="break-words text-2xl font-bold tracking-tight">
                  {batch.title}
                </h1>

                <TaskPriorityBadge
                  priority={batch.priority}
                />
              </div>

              <p className="text-sm text-muted-foreground">
                {getAssignmentTypeLabel(
                  batch.assignment_type,
                )}{" "}
                assignment
              </p>
            </div>

            {batch.can_manage ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {!batch.is_cancelled &&
                !batch.is_archived ? (
                  <EditTaskBatchDialog
                    batch={batch}
                  />
                ) : null}

                <TaskBatchActions batch={batch} />
              </div>
            ) : null}
          </div>
        </header>

        {batch.is_cancelled ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="font-semibold text-destructive">
              Assignment cancelled
            </p>

            <p className="mt-1 text-sm text-destructive">
              {batch.cancellation_reason ||
                "No cancellation reason was provided."}
            </p>
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Instructions
              </CardTitle>
            </CardHeader>

            <CardContent>
              {batch.description ? (
                <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {batch.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No description was provided.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Assignment information
              </CardTitle>
            </CardHeader>

            <CardContent>
              <dl className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <UserRound className="mt-0.5 size-4 text-muted-foreground" />

                  <div>
                    <dt className="text-muted-foreground">
                      Created by
                    </dt>
                    <dd className="font-medium">
                      {batch.created_by_name ||
                        "Unknown"}
                    </dd>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Building2 className="mt-0.5 size-4 text-muted-foreground" />

                  <div>
                    <dt className="text-muted-foreground">
                      Source department
                    </dt>
                    <dd className="font-medium">
                      {batch.source_department_name ||
                        "Not applicable"}
                    </dd>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CalendarClock className="mt-0.5 size-4 text-muted-foreground" />

                  <div className="space-y-2">
                    <div>
                      <dt className="text-muted-foreground">
                        Starts
                      </dt>
                      <dd className="font-medium">
                        {formatTaskDateTime(
                          batch.start_at,
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-muted-foreground">
                        Due
                      </dt>
                      <dd className="font-medium">
                        {formatTaskDateTime(
                          batch.due_at,
                        )}
                      </dd>
                    </div>
                  </div>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {batch.progress ? (
          <TaskBatchProgress
            progress={batch.progress}
          />
        ) : null}

        <TaskBatchAssignees
          tasks={taskResponse.results}
        />

        {/* Batch activity is added in Stage 5. */}
      </div>
    );
  } catch (error) {
    if (
      error instanceof TaskApiError &&
      error.status === 404
    ) {
      notFound();
    }

    const message =
      error instanceof TaskApiError
        ? error.message
        : "The task assignment could not be loaded.";

    return (
      <div
        role="alert"
        className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
      >
        {message}
      </div>
    );
  }
}