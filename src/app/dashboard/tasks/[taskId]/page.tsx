import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { TaskLifecycleActions } from "@/components/tasks/task-detail/TaskLifecycleActions";
import { TaskStatusControl } from "@/components/tasks/task-detail/TaskStatusControl";
import { TaskSummary } from "@/components/tasks/task-detail/TaskSummary";

import { getTask, TaskApiError } from "@/lib/api/tasks";
import { TaskActivityTimeline } from "@/components/tasks/activity/TaskActivityTimeline";
import { TaskCommentsSection } from "@/components/tasks/comments/TaskCommentsSection";
import { TaskSectionPagination } from "@/components/tasks/TaskSectionPagination";

import { getTaskActivity, getTaskComments } from "@/lib/api/task-comments";

import { TaskRemindersPanel } from "@/components/tasks/reminders/TaskRemindersPanel";

import {
  getTaskReminderCapabilities,
  getTaskReminders,
} from "@/lib/api/task-reminders";

import {
  flattenTaskSearchParams,
  getFirstSearchValue,
  parseTaskPage,
  type RawTaskSearchParams,
} from "@/lib/tasks/task-query";

interface TaskDetailPageProps {
  params: Promise<{
    taskId: string;
  }>;

  searchParams: Promise<RawTaskSearchParams>;
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

export default async function TaskDetailPage({
  params,
  searchParams,
}: TaskDetailPageProps) {
  const { taskId } = await params;
  const resolvedSearchParams = await searchParams;

  const flatSearchParams = flattenTaskSearchParams(resolvedSearchParams);

  const commentsPage = parseTaskPage(
    getFirstSearchValue(resolvedSearchParams.comments_page),
  );

  const activityPage = parseTaskPage(
    getFirstSearchValue(resolvedSearchParams.activity_page),
  );

  const remindersPage = parseTaskPage(
    getFirstSearchValue(resolvedSearchParams.reminders_page),
  );

  try {
    const task = await getTask(taskId);

    const [
      commentsResult,
      activityResult,
      remindersResult,
      capabilitiesResult,
    ] = await Promise.allSettled([
      getTaskComments(task.id, {
        page: commentsPage,
        archived: task.is_archived,
      }),

      getTaskActivity(task.id, {
        page: activityPage,
        archived: task.is_archived,
      }),

      getTaskReminders({
        task: task.id,
        cancelled: false,
        page: remindersPage,
        ordering: "remind_at",
      }),

      getTaskReminderCapabilities(),
    ]);
    console.log(`Reminder Respone: ${JSON.stringify(remindersResult)}`);

    const commentsResponse =
      commentsResult.status === "fulfilled" ? commentsResult.value : null;

    const activityResponse =
      activityResult.status === "fulfilled" ? activityResult.value : null;

    const remindersResponse =
      remindersResult.status === "fulfilled" ? remindersResult.value : null;

    const reminderCapabilities =
      capabilitiesResult.status === "fulfilled"
        ? capabilitiesResult.value
        : null;

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

        <div className="grid gap-6 xl:grid-cols-2">
          {remindersResponse && reminderCapabilities ? (
            <div className="space-y-4">
              <TaskRemindersPanel
                task={task}
                reminders={remindersResponse.results}
                totalCount={remindersResponse.count}
                capabilities={reminderCapabilities}
              />

              <TaskSectionPagination
                pathname={`/dashboard/tasks/${task.id}`}
                searchParams={flatSearchParams}
                pageParam="reminders_page"
                currentPage={remindersPage}
                hasPrevious={Boolean(remindersResponse.previous)}
                hasNext={Boolean(remindersResponse.next)}
                anchor="task-reminders"
              />
            </div>
          ) : (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
            >
              Task reminders could not be loaded.
            </div>
          )}

          <div className="space-y-4">
            {commentsResponse ? (
              <>
                <TaskCommentsSection
                  taskId={task.id}
                  batchId={task.batch.id}
                  comments={commentsResponse.results}
                  totalCount={commentsResponse.count}
                  canComment={task.permissions.can_comment}
                  disabled={task.is_archived}
                />

                <TaskSectionPagination
                  pathname={`/dashboard/tasks/${task.id}`}
                  searchParams={flatSearchParams}
                  pageParam="comments_page"
                  currentPage={commentsPage}
                  hasPrevious={Boolean(commentsResponse.previous)}
                  hasNext={Boolean(commentsResponse.next)}
                  anchor="task-comments"
                />
              </>
            ) : (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
              >
                Comments could not be loaded.
              </div>
            )}
          </div>

          <div className="space-y-4">
            {activityResponse ? (
              <>
                <TaskActivityTimeline
                  activities={activityResponse.results}
                  totalCount={activityResponse.count}
                />

                <TaskSectionPagination
                  pathname={`/dashboard/tasks/${task.id}`}
                  searchParams={flatSearchParams}
                  pageParam="activity_page"
                  currentPage={activityPage}
                  hasPrevious={Boolean(activityResponse.previous)}
                  hasNext={Boolean(activityResponse.next)}
                  anchor="task-activity"
                />
              </>
            ) : (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
              >
                Task activity could not be loaded.
              </div>
            )}
          </div>
        </div>
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
