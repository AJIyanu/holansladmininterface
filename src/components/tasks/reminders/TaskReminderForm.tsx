"use client";

import { useMemo, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { BellPlus, Loader2 } from "lucide-react";

import { toast } from "sonner";

import { createTaskReminderAction } from "@/app/dashboard/tasks/reminder-actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  resolveReminderPreset,
  TASK_REMINDER_PRESETS,
  validateReminderDate,
  type TaskReminderPreset,
} from "@/lib/tasks/task-reminders";

import { ReminderChannelSelector } from "./ReminderChannelSelector";

import type {
  TaskNotificationChannel,
  TaskReminderCapabilities,
} from "@/types/tasks";

interface TaskReminderFormProps {
  taskId: string;
  batchId: string;
  dueAt: string | null;
  capabilities: TaskReminderCapabilities;
}

export function TaskReminderForm({
  taskId,
  batchId,
  dueAt,
  capabilities,
}: TaskReminderFormProps) {
  const router = useRouter();

  const defaultChannels = useMemo(() => {
    const channels: TaskNotificationChannel[] = [];

    if (capabilities.channels.DASHBOARD?.available) {
      channels.push("DASHBOARD");
    }

    return channels;
  }, [capabilities]);

  const [preset, setPreset] = useState<TaskReminderPreset>("IN_30_MINUTES");

  const [customDateTime, setCustomDateTime] = useState("");

  const [channels, setChannels] =
    useState<TaskNotificationChannel[]>(defaultChannels);

  const [isPending, startTransition] = useTransition();

  function resolveSelectedDate(): Date | null {
    if (preset === "CUSTOM") {
      if (!customDateTime) {
        return null;
      }

      return new Date(customDateTime);
    }

    return resolveReminderPreset(preset, dueAt);
  }

  function submitReminder() {
    const reminderDate = resolveSelectedDate();

    if (!reminderDate) {
      toast.error("Select a valid reminder time.");
      return;
    }

    const dateError = validateReminderDate(reminderDate, dueAt);

    if (dateError) {
      toast.error(dateError);
      return;
    }

    if (channels.length === 0) {
      toast.error("Select at least one reminder channel.");
      return;
    }

    startTransition(async () => {
      const result = await createTaskReminderAction(
        taskId,
        batchId,
        reminderDate.toISOString(),
        channels,
      );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      setPreset("IN_30_MINUTES");
      setCustomDateTime("");

      router.refresh();
    });
  }

  const noAvailableChannels = !Object.values(capabilities.channels).some(
    (channel) => channel.available,
  );

  return (
    <div className="space-y-5 rounded-lg border bg-muted/20 p-4">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Remind me</Label>

          <Select
            value={preset}
            onValueChange={(value) => setPreset(value as TaskReminderPreset)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {TASK_REMINDER_PRESETS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.requiresDueDate && !dueAt}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {preset === "CUSTOM" ? (
          <div className="space-y-2">
            <Label htmlFor="custom-reminder-time">Date and time</Label>

            <Input
              id="custom-reminder-time"
              type="datetime-local"
              value={customDateTime}
              onChange={(event) => setCustomDateTime(event.target.value)}
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Delivery channels</Label>

        <ReminderChannelSelector
          capabilities={capabilities}
          value={channels}
          onChange={setChannels}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={submitReminder}
          disabled={isPending || noAvailableChannels}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <BellPlus className="size-4" />
          )}
          Create reminder
        </Button>
      </div>
    </div>
  );
}
