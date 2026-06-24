import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().trim().min(2, "Department name is required.").max(150),
  code: z
    .string()
    .trim()
    .min(2, "Department code is required.")
    .max(5, "Department code cannot exceed 5 characters.")
    .transform((value) => value.toUpperCase()),
  description: z.string().trim().max(1000).optional(),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;
