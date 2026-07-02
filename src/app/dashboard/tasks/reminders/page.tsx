import type { Metadata } from "next";

import { Bell } from "lucide-react";

import { ReminderCapabilitiesNotice } from "@/components/tasks/reminders/ReminderCapabilitiesNotice";
import {
  ReminderViewTabs,
  type ReminderView,
} from "@/components/tasks/reminders/ReminderViewTabs";
import { TaskReminderList } from "@/components/tasks/reminders/TaskReminderList";
import { TaskSectionPagination } from "@/components/tasks/TaskSectionPagination";

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

export const metadata: Metadata = {
  title: "Task Reminders",
};

interface TaskRemindersPageProps {
  searchParams: Promise<RawTaskSearchParams>;
}

function parseReminderView(value: string | undefined): ReminderView {
  if (value === "due" || value === "cancelled") {
    return value;
  }

  return "upcoming";
}

export default async function TaskRemindersPage({
  searchParams,
}: TaskRemindersPageProps) {
  const resolvedSearchParams = await searchParams;

  const flatSearchParams = flattenTaskSearchParams(resolvedSearchParams);

  const activeView = parseReminderView(
    getFirstSearchValue(resolvedSearchParams.view),
  );

  const page = parseTaskPage(getFirstSearchValue(resolvedSearchParams.page));

  const reminderQuery =
    activeView === "cancelled"
      ? {
          cancelled: true,
          page,
          ordering: "-updated_at",
        }
      : activeView === "due"
        ? {
            cancelled: false,
            due: true,
            page,
            ordering: "remind_at",
          }
        : {
            cancelled: false,
            due: false,
            page,
            ordering: "remind_at",
          };

  const [capabilitiesResult, remindersResult] = await Promise.allSettled([
    getTaskReminderCapabilities(),
    getTaskReminders(reminderQuery),
  ]);

  if (
    capabilitiesResult.status !== "fulfilled" ||
    remindersResult.status !== "fulfilled"
  ) {
    return (
      <div className="space-y-6 bg-blue-100 p-9 min-h-screen">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Task Reminders</h1>

          <p className="text-sm text-muted-foreground">
            Manage reminders for your personal tasks.
          </p>
        </header>

        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          Task reminders could not be loaded.
        </div>
      </div>
    );
  }

  const capabilities = capabilitiesResult.value;

  const reminders = remindersResult.value;

  const emptyMessages: Record<ReminderView, string> = {
    upcoming: "You have no upcoming task reminders.",
    due: "You have no reminders due at this time.",
    cancelled: "You have no cancelled reminders.",
  };

  return (
    <div className="space-y-6 bg-blue-100 p-9 min-h-screen">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Bell className="size-6 text-muted-foreground" />

          <h1 className="text-2xl font-bold tracking-tight">Task Reminders</h1>
        </div>

        <p className="text-sm text-muted-foreground">
          Manage reminders for your personal tasks.
        </p>
      </header>

      <ReminderCapabilitiesNotice capabilities={capabilities} />

      <ReminderViewTabs activeView={activeView} />

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {reminders.count} {reminders.count === 1 ? "reminder" : "reminders"}
        </p>

        <TaskReminderList
          reminders={reminders.results}
          capabilities={capabilities}
          emptyMessage={emptyMessages[activeView]}
        />

        <TaskSectionPagination
          pathname="/dashboard/tasks/reminders"
          searchParams={flatSearchParams}
          pageParam="page"
          currentPage={page}
          hasPrevious={Boolean(reminders.previous)}
          hasNext={Boolean(reminders.next)}
        />
      </div>
    </div>
  );
}
