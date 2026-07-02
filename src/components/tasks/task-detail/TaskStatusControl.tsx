"use client";

import {
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import {
  Loader2,
  RefreshCw,
} from "lucide-react";

import { toast } from "sonner";

import { updateTaskStatusAction } from "@/app/dashboard/tasks/actions";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getAvailableTaskStatuses,
} from "@/lib/tasks/task-lifecycle";
import {
  getTaskStatusLabel,
} from "@/lib/tasks/format-task";

import type {
  TaskDetail,
  TaskStatus,
} from "@/types/tasks";

interface TaskStatusControlProps {
  task: TaskDetail;
}

export function TaskStatusControl({
  task,
}: TaskStatusControlProps) {
  const router = useRouter();

  const availableStatuses =
    getAvailableTaskStatuses(task.status);

  const [selectedStatus, setSelectedStatus] =
    useState<string>(
      availableStatuses[0] ?? "",
    );

  const [isPending, startTransition] =
    useTransition();

  const disabled =
    !task.permissions.can_update_status ||
    task.is_archived ||
    availableStatuses.length === 0;

  function submitStatus() {
    if (!selectedStatus) {
      return;
    }

    startTransition(async () => {
      const result =
        await updateTaskStatusAction(
          task.id,
          selectedStatus as Exclude<
            TaskStatus,
            "CANCELLED"
          >,
        );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Update status
        </CardTitle>

        <CardDescription>
          Cancellation is handled separately and
          requires a reason.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {availableStatuses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This task has reached a final status.
          </p>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              disabled={disabled || isPending}
            >
              <SelectTrigger className="sm:max-w-xs">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>

              <SelectContent>
                {availableStatuses.map(
                  (status) => (
                    <SelectItem
                      key={status}
                      value={status}
                    >
                      {getTaskStatusLabel(status)}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            <Button
              type="button"
              onClick={submitStatus}
              disabled={
                disabled ||
                isPending ||
                !selectedStatus
              }
              className="w-full sm:w-auto"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}

              Update status
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}