"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Loader2, MessageSquare, Send } from "lucide-react";

import { toast } from "sonner";

import { createTaskCommentAction } from "@/app/dashboard/tasks/comment-actions";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { TaskCommentItem } from "./TaskCommentItem";

import type { TaskComment } from "@/types/tasks";

interface TaskCommentsSectionProps {
  taskId: string;
  batchId: string;
  comments: TaskComment[];
  totalCount: number;
  canComment: boolean;
  disabled?: boolean;
}

export function TaskCommentsSection({
  taskId,
  batchId,
  comments,
  totalCount,
  canComment,
  disabled = false,
}: TaskCommentsSectionProps) {
  const router = useRouter();

  const [body, setBody] = useState("");

  const [isPending, startTransition] = useTransition();

  function submitComment() {
    startTransition(async () => {
      const result = await createTaskCommentAction(taskId, batchId, body);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setBody("");
      router.refresh();
    });
  }

  return (
    <Card id="task-comments">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="size-5" />
          Comments
        </CardTitle>

        <CardDescription>
          {totalCount} {totalCount === 1 ? "comment" : "comments"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {canComment && !disabled ? (
          <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
            <div className="space-y-2">
              <Label htmlFor="new-task-comment">Add comment</Label>

              <Textarea
                id="new-task-comment"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={4}
                maxLength={10_000}
                placeholder="Add an update or question about this task"
                className="resize-y placeholder:text-muted-foreground/70"
              />

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  {body.length}/10,000
                </p>

                <Button
                  type="button"
                  onClick={submitComment}
                  disabled={isPending || !body.trim()}
                  className="w-full sm:w-auto"
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  Add comment
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {disabled ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Archived tasks cannot receive new comments.
          </p>
        ) : null}

        {comments.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center text-center">
            <MessageSquare className="mb-3 size-7 text-muted-foreground" />

            <p className="font-medium">No comments yet</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Updates and questions about this task will appear here.
            </p>
          </div>
        ) : (
          <div>
            {comments.map((comment) => (
              <TaskCommentItem
                key={comment.id}
                taskId={taskId}
                batchId={batchId}
                comment={comment}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
