"use client";

import { startTransition, useState } from "react";

import { useRouter } from "next/navigation";

import { CalendarClock, Loader2, Save } from "lucide-react";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createTaskAction } from "@/app/dashboard/tasks/new/actions";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

import { taskFormSchema, type TaskFormValues } from "@/lib/validation/task";

import { AssignmentTypeSelector } from "./AssignmentTypeSelector";
import { NotificationChannelSelector } from "./NotificationChannelSelector";
import { StaffMultiSelect } from "./StaffMultiSelect";

import type {
  TaskCreateCapabilities,
  TaskDepartmentOption,
  TaskStaffOption,
} from "@/types/tasks";

interface CreateTaskFormProps {
  capabilities: TaskCreateCapabilities;
  staff: TaskStaffOption[];
  departments: TaskDepartmentOption[];
  staffLoadError?: string;
  departmentLoadError?: string;
}

export function CreateTaskForm({
  capabilities,
  staff,
  departments,
  staffLoadError,
  departmentLoadError,
}: CreateTaskFormProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      startAt: "",
      dueAt: "",
      assignmentType: "PERSONAL",
      userIds: [],
      departmentId: "",
      includeAssigner: false,
      notificationChannels: ["DASHBOARD", "EMAIL"],
    },
  });

  const assignmentType = watch("assignmentType");

  function applyServerErrors(
    fieldErrors: Record<string, string[]> | undefined,
  ) {
    if (!fieldErrors) {
      return;
    }

    Object.entries(fieldErrors).forEach(([field, messages]) => {
      const message = messages[0];

      if (!message) {
        return;
      }

      if (field in taskFormSchema.shape) {
        setError(field as keyof TaskFormValues, {
          type: "server",
          message,
        });
      }
    });
  }

  const submitTask = handleSubmit(async (values) => {
    setIsSubmitting(true);

    startTransition(async () => {
      const result = await createTaskAction(values);

      if (!result.success) {
        applyServerErrors(result.fieldErrors);

        toast.error(result.message);
        setIsSubmitting(false);
        return;
      }

      toast.success(result.message);

      router.push(result.redirectTo ?? "/dashboard/tasks");

      router.refresh();
    });
  });

  return (
    <form onSubmit={submitTask} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task information</CardTitle>

          <CardDescription>
            Enter the task instruction and expected timeline.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="task-title">Task title</Label>

            <Input
              id="task-title"
              {...register("title")}
              placeholder="Enter a clear task title"
              className="placeholder:text-muted-foreground/70"
            />

            {errors.title ? (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>

            <Textarea
              id="task-description"
              {...register("description")}
              rows={5}
              placeholder="Describe what needs to be completed"
              className="resize-y placeholder:text-muted-foreground/70"
            />

            {errors.description ? (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Priority</Label>

              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-start-at">Start date and time</Label>

              <div className="relative">
                <CalendarClock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="task-start-at"
                  type="datetime-local"
                  {...register("startAt")}
                  className="pl-9"
                />
              </div>

              {errors.startAt ? (
                <p className="text-sm text-destructive">
                  {errors.startAt.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-due-at">Due date and time</Label>

              <div className="relative">
                <CalendarClock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="task-due-at"
                  type="datetime-local"
                  {...register("dueAt")}
                  className="pl-9"
                />
              </div>

              {errors.dueAt ? (
                <p className="text-sm text-destructive">
                  {errors.dueAt.message}
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assignment</CardTitle>

          <CardDescription>
            Choose who should receive the task. All options remain available
            responsively on supported devices and screen sizes.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Controller
            control={control}
            name="assignmentType"
            render={({ field }) => (
              <AssignmentTypeSelector
                value={field.value}
                onChange={field.onChange}
                capabilities={capabilities}
              />
            )}
          />

          {assignmentType === "USERS" ? (
            <div className="space-y-3">
              {staffLoadError ? (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                >
                  {staffLoadError}
                </div>
              ) : null}

              <Controller
                control={control}
                name="userIds"
                render={({ field }) => (
                  <StaffMultiSelect
                    staff={staff}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.userIds?.message}
                  />
                )}
              />
            </div>
          ) : null}

          {assignmentType === "DEPARTMENT" ? (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Department</Label>

                {departmentLoadError ? (
                  <div
                    role="alert"
                    className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                  >
                    {departmentLoadError}
                  </div>
                ) : null}

                <Controller
                  control={control}
                  name="departmentId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>

                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name} ({department.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                {errors.departmentId ? (
                  <p className="text-sm text-destructive">
                    {errors.departmentId.message}
                  </p>
                ) : null}
              </div>

              <Controller
                control={control}
                name="includeAssigner"
                render={({ field }) => (
                  <Label
                    htmlFor="include-assigner"
                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 md:self-end"
                  >
                    <Checkbox
                      id="include-assigner"
                      checked={field.value}
                      onCheckedChange={(value) =>
                        field.onChange(value === true)
                      }
                      className="mt-1"
                    />

                    <span>
                      <span className="block font-medium">Include me</span>

                      <span className="block text-sm font-normal text-muted-foreground">
                        Also create an individual task copy for your account.
                      </span>
                    </span>
                  </Label>
                )}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {assignmentType !== "PERSONAL" ? (
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>

            <CardDescription>
              Select how assignees should be notified.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Controller
              control={control}
              name="notificationChannels"
              render={({ field }) => (
                <NotificationChannelSelector
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.notificationChannels?.message}
                />
              )}
            />
          </CardContent>
        </Card>
      ) : null}

      <div className="sticky bottom-0 z-10 -mx-4 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:mx-0 sm:flex sm:justify-end sm:border-0 sm:bg-transparent sm:p-0">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}

          {isSubmitting ? "Creating task..." : "Create task"}
        </Button>
      </div>
    </form>
  );
}
