"use client";

import { useMemo, useState, useTransition } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Bell, CalendarClock, Loader2, Pencil, Trash2 } from "lucide-react";

import { toast } from "sonner";

import {
  cancelTaskReminderAction,
  updateTaskReminderAction,
} from "@/app/dashboard/tasks/reminder-actions";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { formatTaskDateTime } from "@/lib/tasks/format-task";

import { toDateTimeLocalValue } from "@/lib/tasks/task-lifecycle";

import { validateReminderDate } from "@/lib/tasks/task-reminders";

import { ReminderChannelSelector } from "./ReminderChannelSelector";

import type {
  TaskNotificationChannel,
  TaskReminder,
  TaskReminderCapabilities,
} from "@/types/tasks";

interface TaskReminderItemProps {
  reminder: TaskReminder;
  capabilities: TaskReminderCapabilities;
  batchId?: string;
}

const stateLabels = {
  SCHEDULED: "Upcoming",
  DUE: "Due",
  CANCELLED: "Cancelled",
} as const;

export function TaskReminderItem({
  reminder,
  capabilities,
  batchId,
}: TaskReminderItemProps) {
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);

  const [cancelOpen, setCancelOpen] = useState(false);

  const [remindAt, setRemindAt] = useState(
    toDateTimeLocalValue(reminder.remind_at),
  );

  const availableInitialChannels = useMemo(() => {
    const supported = reminder.channels.filter(
      (channel) => capabilities.channels[channel]?.available,
    );

    if (supported.length > 0) {
      return supported;
    }

    if (capabilities.channels.DASHBOARD?.available) {
      return ["DASHBOARD"] as TaskNotificationChannel[];
    }

    return [];
  }, [reminder.channels, capabilities]);

  const [channels, setChannels] = useState<TaskNotificationChannel[]>(
    availableInitialChannels,
  );

  const [reason, setReason] = useState("");

  const [isPending, startTransition] = useTransition();

  function submitEdit() {
    if (!remindAt) {
      toast.error("Select a reminder date and time.");
      return;
    }

    const reminderDate = new Date(remindAt);

    const dateError = validateReminderDate(reminderDate, reminder.task.due_at);

    if (dateError) {
      toast.error(dateError);
      return;
    }

    startTransition(async () => {
      const result = await updateTaskReminderAction(
        reminder.id,
        reminder.task.id,
        reminderDate.toISOString(),
        channels,
        batchId,
      );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setEditOpen(false);
      router.refresh();
    });
  }

  function submitCancellation() {
    startTransition(async () => {
      const result = await cancelTaskReminderAction(
        reminder.id,
        reminder.task.id,
        reason,
        batchId,
      );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setCancelOpen(false);
      setReason("");
      router.refresh();
    });
  }

  return (
    <>
      <article className="rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <div className="shrink-0 rounded-full bg-muted p-2">
              <Bell className="size-4 text-muted-foreground" />
            </div>

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/dashboard/tasks/${reminder.task.id}`}
                  className="break-words font-semibold hover:text-primary hover:underline"
                >
                  {reminder.task.title}
                </Link>

                <Badge
                  variant={
                    reminder.state === "CANCELLED"
                      ? "secondary"
                      : reminder.state === "DUE"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {stateLabels[reminder.state]}
                </Badge>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                <div>
                  <p className="font-medium">
                    {formatTaskDateTime(reminder.remind_at)}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Task deadline: {formatTaskDateTime(reminder.task.due_at)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {reminder.channels.map((channel) => (
                  <Badge key={channel} variant="secondary">
                    {channel}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {reminder.permissions.can_edit || reminder.permissions.can_cancel ? (
            <div className="flex gap-2 sm:shrink-0">
              {reminder.permissions.can_edit ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
              ) : null}

              {reminder.permissions.can_cancel ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelOpen(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Cancel
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </article>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit reminder</DialogTitle>

            <DialogDescription>
              Change the reminder time or delivery channels.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor={`reminder-${reminder.id}`}>Date and time</Label>

              <Input
                id={`reminder-${reminder.id}`}
                type="datetime-local"
                value={remindAt}
                onChange={(event) => setRemindAt(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Delivery channels</Label>

              <ReminderChannelSelector
                capabilities={capabilities}
                value={channels}
                onChange={setChannels}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={isPending}
            >
              Close
            </Button>

            <Button
              type="button"
              onClick={submitEdit}
              disabled={isPending || !remindAt || channels.length === 0}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Pencil className="size-4" />
              )}
              Save reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel reminder</DialogTitle>

            <DialogDescription>
              The scheduled notification will no longer appear or be delivered.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor={`cancel-reminder-${reminder.id}`}>Reason</Label>

            <Textarea
              id={`cancel-reminder-${reminder.id}`}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Optional reason"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={isPending}
            >
              Keep reminder
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={submitCancellation}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Cancel reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
