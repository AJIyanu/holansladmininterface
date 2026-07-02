"use client";

import {
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import {
  Loader2,
  Pencil,
} from "lucide-react";

import { toast } from "sonner";

import { updateTaskBatchAction } from "@/app/dashboard/tasks/actions";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  localDateTimeToIso,
  toDateTimeLocalValue,
} from "@/lib/tasks/task-lifecycle";

import type {
  TaskBatchDetail,
  TaskPriority,
} from "@/types/tasks";

interface EditTaskBatchDialogProps {
  batch: TaskBatchDetail;
}

export function EditTaskBatchDialog({
  batch,
}: EditTaskBatchDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(
    batch.title,
  );
  const [description, setDescription] =
    useState(batch.description);

  const [priority, setPriority] =
    useState<TaskPriority>(batch.priority);

  const [startAt, setStartAt] = useState(
    toDateTimeLocalValue(batch.start_at),
  );

  const [dueAt, setDueAt] = useState(
    toDateTimeLocalValue(batch.due_at),
  );

  const [isPending, startTransition] =
    useTransition();

  function submit() {
    if (!title.trim()) {
      toast.error("Task title is required.");
      return;
    }

    if (
      startAt &&
      dueAt &&
      new Date(dueAt).getTime() <
        new Date(startAt).getTime()
    ) {
      toast.error(
        "The due date cannot be before the start date.",
      );
      return;
    }

    startTransition(async () => {
      const result =
        await updateTaskBatchAction(
          batch.id,
          {
            title,
            description,
            priority,
            start_at:
              localDateTimeToIso(startAt),
            due_at: localDateTimeToIso(dueAt),
          },
        );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto"
      >
        <Pencil className="size-4" />
        Edit details
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit task assignment
            </DialogTitle>

            <DialogDescription>
              Changes apply to every individual
              task in this assignment.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="batch-title">
                Title
              </Label>

              <Input
                id="batch-title"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch-description">
                Description
              </Label>

              <Textarea
                id="batch-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>

              <Select
                value={priority}
                onValueChange={(value) =>
                  setPriority(
                    value as TaskPriority,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="LOW">
                    Low
                  </SelectItem>
                  <SelectItem value="MEDIUM">
                    Medium
                  </SelectItem>
                  <SelectItem value="HIGH">
                    High
                  </SelectItem>
                  <SelectItem value="URGENT">
                    Urgent
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="batch-start">
                  Start
                </Label>

                <Input
                  id="batch-start"
                  type="datetime-local"
                  value={startAt}
                  onChange={(event) =>
                    setStartAt(
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch-due">
                  Due
                </Label>

                <Input
                  id="batch-due"
                  type="datetime-local"
                  value={dueAt}
                  onChange={(event) =>
                    setDueAt(
                      event.target.value,
                    )
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={submit}
              disabled={isPending}
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
    </>
  );
}