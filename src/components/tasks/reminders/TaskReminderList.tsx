import { BellOff } from "lucide-react";

import { TaskReminderItem } from "./TaskReminderItem";

import type { TaskReminder, TaskReminderCapabilities } from "@/types/tasks";

interface TaskReminderListProps {
  reminders: TaskReminder[];
  capabilities: TaskReminderCapabilities;
  batchId?: string;
  emptyMessage?: string;
}

export function TaskReminderList({
  reminders,
  capabilities,
  batchId,
  emptyMessage = "No reminders were found.",
}: TaskReminderListProps) {
  if (reminders.length === 0) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
        <BellOff className="mb-3 size-7 text-muted-foreground" />

        <p className="font-medium">No reminders</p>

        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {reminders.map((reminder) => (
        <TaskReminderItem
          key={reminder.id}
          reminder={reminder}
          capabilities={capabilities}
          batchId={batchId}
        />
      ))}
    </div>
  );
}
