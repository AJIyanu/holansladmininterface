import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { TaskLifecycleActions } from "@/components/tasks/task-detail/TaskLifecycleActions";
import { TaskStatusControl } from "@/components/tasks/task-detail/TaskStatusControl";
import { TaskSummary } from "@/components/tasks/task-detail/TaskSummary";

import { getTask, TaskApiError } from "@/lib/api/tasks";

interface TaskDetailPageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export async function generateMetadata({
  params,
}: TaskDetailPageProps): Promise<Metadata> {
  const { taskId } = await params;

  try {
    const task = await getTask(taskId);

    return {
      title: task.batch.title,
    };
  } catch {
    return {
      title: "Task Details",
    };
  }
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { taskId } = await params;

  try {
    const task = await getTask(taskId);

    return (
      <div className="space-y-6 bg-blue-100 p-9 min-h-screenq">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Button asChild variant="ghost" size="sm" className="-ml-3 w-fit">
              <Link href="/dashboard/tasks">
                <ArrowLeft className="size-4" />
                Back to tasks
              </Link>
            </Button>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Task Details
              </h1>

              <p className="text-sm text-muted-foreground">
                View and manage this individual task.
              </p>
            </div>
          </div>

          <TaskLifecycleActions task={task} />
        </header>

        <TaskSummary task={task} />

        <TaskStatusControl task={task} />

        {/* Comments, activity and reminders
            are added in the remaining stages. */}
      </div>
    );
  } catch (error) {
    if (error instanceof TaskApiError && error.status === 404) {
      notFound();
    }

    const message =
      error instanceof TaskApiError
        ? error.message
        : "The task could not be loaded.";

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
