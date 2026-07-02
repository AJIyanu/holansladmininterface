import { z } from "zod";

export const taskFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Task title is required.")
      .max(255, "Task title cannot exceed 255 characters."),

    description: z.string().trim().max(10_000, "Description is too long."),

    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),

    startAt: z.string(),

    dueAt: z.string(),

    assignmentType: z.enum(["PERSONAL", "USERS", "DEPARTMENT"]),

    userIds: z.array(z.string()),

    departmentId: z.string(),

    includeAssigner: z.boolean(),

    notificationChannels: z.array(z.enum(["DASHBOARD", "EMAIL", "WHATSAPP"])),
  })
  .superRefine((values, context) => {
    if (values.startAt && Number.isNaN(new Date(values.startAt).getTime())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startAt"],
        message: "Enter a valid start date and time.",
      });
    }

    if (values.dueAt && Number.isNaN(new Date(values.dueAt).getTime())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dueAt"],
        message: "Enter a valid due date and time.",
      });
    }

    if (
      values.startAt &&
      values.dueAt &&
      new Date(values.dueAt).getTime() < new Date(values.startAt).getTime()
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dueAt"],
        message: "The due date cannot be before the start date.",
      });
    }

    if (values.assignmentType === "USERS" && values.userIds.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["userIds"],
        message: "Select at least one staff member.",
      });
    }

    if (values.assignmentType === "DEPARTMENT" && !values.departmentId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["departmentId"],
        message: "Select a department.",
      });
    }

    if (
      values.assignmentType !== "PERSONAL" &&
      values.notificationChannels.length === 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["notificationChannels"],
        message: "Select at least one notification channel.",
      });
    }
  });

export type TaskFormValues = z.infer<typeof taskFormSchema>;
