"use client";

import { useEffect, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Loader2, Pencil, Trash2, UserRound } from "lucide-react";

import { toast } from "sonner";

import {
  removeTaskCommentAction,
  updateTaskCommentAction,
} from "@/app/dashboard/tasks/comment-actions";

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

import { formatTaskDateTime } from "@/lib/tasks/format-task";

import type { TaskComment } from "@/types/tasks";

interface TaskCommentItemProps {
  taskId: string;
  batchId: string;
  comment: TaskComment;
}

function getUserName(comment: TaskComment): string {
  if (!comment.author) {
    return "Former staff member";
  }

  const fullName = [comment.author.first_name, comment.author.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || comment.author.username || comment.author.email;
}

export function TaskCommentItem({
  taskId,
  batchId,
  comment,
}: TaskCommentItemProps) {
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);

  const [removeOpen, setRemoveOpen] = useState(false);

  const [body, setBody] = useState(comment.body);

  const [reason, setReason] = useState("");

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setBody(comment.body);
  }, [comment.body]);

  const authorName = getUserName(comment);

  function submitEdit() {
    startTransition(async () => {
      const result = await updateTaskCommentAction(
        taskId,
        batchId,
        comment.id,
        body,
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

  function submitRemoval() {
    startTransition(async () => {
      const result = await removeTaskCommentAction(
        taskId,
        batchId,
        comment.id,
        reason,
      );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setRemoveOpen(false);
      setReason("");
      router.refresh();
    });
  }

  return (
    <>
      <article className="flex gap-3 rounded-lg shadow-md bg-orange-100 border border-orange-300 py-4 mb-1">
        <div className="mt-0.5 shrink-0 rounded-full bg-muted p-2">
          <UserRound className="size-4 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-medium">{authorName}</p>

              <p className="text-xs text-muted-foreground">
                {formatTaskDateTime(comment.created_at)}

                {comment.edited_at ? " · Edited" : ""}
              </p>
            </div>

            {!comment.is_removed &&
            (comment.permissions.can_edit || comment.permissions.can_remove) ? (
              <div className="flex gap-1">
                {comment.permissions.can_edit ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditOpen(true)}
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                ) : null}

                {comment.permissions.can_remove ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRemoveOpen(true)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                ) : null}
              </div>
            ) : null}
          </header>

          {comment.is_removed ? (
            <div className="rounded-md border border-dashed bg-muted/30 p-3">
              <p className="text-sm italic text-muted-foreground">
                [Comment removed]
              </p>

              {comment.removal_reason ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Reason: {comment.removal_reason}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words text-sm leading-6">
              {comment.body}
            </p>
          )}
        </div>
      </article>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit comment</DialogTitle>

            <DialogDescription>
              Update your comment without creating a new entry.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor={`edit-${comment.id}`}>Comment</Label>

            <Textarea
              id={`edit-${comment.id}`}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={6}
              maxLength={10_000}
            />

            <p className="text-right text-xs text-muted-foreground">
              {body.length}/10,000
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={submitEdit}
              disabled={
                isPending || !body.trim() || body.trim() === comment.body.trim()
              }
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Pencil className="size-4" />
              )}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove comment</DialogTitle>

            <DialogDescription>
              The comment will remain in the audit record but its original text
              will no longer appear in the regular interface.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor={`remove-${comment.id}`}>Removal reason</Label>

            <Textarea
              id={`remove-${comment.id}`}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              maxLength={2_000}
              placeholder="Explain why this comment is being removed"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRemoveOpen(false)}
              disabled={isPending}
            >
              Keep comment
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={submitRemoval}
              disabled={isPending || !reason.trim()}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Remove comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
