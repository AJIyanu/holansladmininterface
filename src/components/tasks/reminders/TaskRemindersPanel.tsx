import { Bell } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ReminderCapabilitiesNotice } from "./ReminderCapabilitiesNotice";
import { TaskReminderForm } from "./TaskReminderForm";
import { TaskReminderList } from "./TaskReminderList";

import type {
  TaskDetail,
  TaskReminder,
  TaskReminderCapabilities,
} from "@/types/tasks";

interface TaskRemindersPanelProps {
  task: TaskDetail;
  reminders: TaskReminder[];
  totalCount: number;
  capabilities: TaskReminderCapabilities;
}

export function TaskRemindersPanel({
  task,
  reminders,
  totalCount,
  capabilities,
}: TaskRemindersPanelProps) {
  const canCreateReminder =
    task.can_set_reminder && !task.is_archived && capabilities.enabled;

  return (
    <Card id="task-reminders" className="bg-white h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="size-5" />
          Reminders
        </CardTitle>

        <CardDescription>
          {totalCount} active {totalCount === 1 ? "reminder" : "reminders"} for
          this task.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <ReminderCapabilitiesNotice capabilities={capabilities} />

        {canCreateReminder ? (
          <TaskReminderForm
            taskId={task.id}
            batchId={task.batch.id}
            dueAt={task.batch.due_at}
            capabilities={capabilities}
          />
        ) : null}

        {!task.can_set_reminder && task.batch.assignment_type !== "PERSONAL" ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Personal reminders are available only for personal tasks.
          </p>
        ) : null}

        <TaskReminderList
          reminders={reminders}
          capabilities={capabilities}
          batchId={task.batch.id}
          emptyMessage="You have no active reminders for this task."
        />
      </CardContent>
    </Card>
  );
}
