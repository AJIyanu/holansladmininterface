"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Archive, ArchiveRestore, Ban, Loader2 } from "lucide-react";

import { toast } from "sonner";

import {
  archiveTaskAction,
  cancelTaskAction,
  restoreTaskAction,
} from "@/app/dashboard/tasks/actions";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { isFinalTaskStatus } from "@/lib/tasks/task-lifecycle";

import type { TaskDetail } from "@/types/tasks";

interface TaskLifecycleActionsProps {
  task: TaskDetail;
}

export function TaskLifecycleActions({ task }: TaskLifecycleActionsProps) {
  const router = useRouter();

  const [cancelOpen, setCancelOpen] = useState(false);

  const [reason, setReason] = useState("");

  const [isPending, startTransition] = useTransition();

  const canCancel =
    task.permissions.can_cancel &&
    !task.is_archived &&
    !isFinalTaskStatus(task.status);

  const canArchive =
    task.permissions.can_archive &&
    !task.is_archived &&
    isFinalTaskStatus(task.status);

  const canRestore = task.permissions.can_restore && task.is_archived;

  function runAction(
    action: () => Promise<{
      success: boolean;
      message: string;
    }>,
  ) {
    startTransition(async () => {
      const result = await action();

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  function submitCancellation() {
    runAction(async () => {
      const result = await cancelTaskAction(task.id, reason);

      if (result.success) {
        setCancelOpen(false);
        setReason("");
      }

      return result;
    });
  }

  if (!canCancel && !canArchive && !canRestore) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {canCancel ? (
          <Button
            type="button"
            variant="destructive"
            onClick={() => setCancelOpen(true)}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            <Ban className="size-4" />
            Cancel task
          </Button>
        ) : null}

        {canArchive ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => runAction(() => archiveTaskAction(task.id))}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Archive className="size-4" />
            )}
            Archive
          </Button>
        ) : null}

        {canRestore ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => runAction(() => restoreTaskAction(task.id))}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArchiveRestore className="size-4" />
            )}
            Restore
          </Button>
        ) : null}
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel task</DialogTitle>

            <DialogDescription>
              This action is final. The task cannot be reopened after
              cancellation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="task-cancel-reason">Cancellation reason</Label>

            <Textarea
              id="task-cancel-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              placeholder="Explain why the task is being cancelled"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={isPending}
            >
              Keep task
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={submitCancellation}
              disabled={isPending || !reason.trim()}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Ban className="size-4" />
              )}
              Confirm cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
