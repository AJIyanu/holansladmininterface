"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Archive, ArchiveRestore, Ban, Loader2 } from "lucide-react";

import { toast } from "sonner";

import {
  archiveTaskBatchAction,
  cancelTaskBatchAction,
  restoreTaskBatchAction,
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

import { canArchiveBatchState } from "@/lib/tasks/task-lifecycle";

import type { TaskBatchDetail } from "@/types/tasks";

interface TaskBatchActionsProps {
  batch: TaskBatchDetail;
}

export function TaskBatchActions({ batch }: TaskBatchActionsProps) {
  const router = useRouter();

  const [cancelOpen, setCancelOpen] = useState(false);

  const [reason, setReason] = useState("");

  const [isPending, startTransition] = useTransition();

  const canCancel =
    batch.can_manage && !batch.is_cancelled && !batch.is_archived;

  const canArchive = batch.can_manage && canArchiveBatchState(batch);

  const canRestore = batch.can_manage && batch.is_archived;

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
      const result = await cancelTaskBatchAction(batch.id, reason);

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
            Cancel assignment
          </Button>
        ) : null}

        {canArchive ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => runAction(() => archiveTaskBatchAction(batch.id))}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Archive className="size-4" />
            )}
            Archive assignment
          </Button>
        ) : null}

        {canRestore ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => runAction(() => restoreTaskBatchAction(batch.id))}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArchiveRestore className="size-4" />
            )}
            Restore assignment
          </Button>
        ) : null}
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel task assignment</DialogTitle>

            <DialogDescription>
              Every unfinished individual task in this assignment will be
              cancelled. Completed tasks remain completed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="batch-cancel-reason">Cancellation reason</Label>

            <Textarea
              id="batch-cancel-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              placeholder="Explain why the assignment is being cancelled"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={isPending}
            >
              Keep assignment
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
