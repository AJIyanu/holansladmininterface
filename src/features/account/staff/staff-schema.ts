import { z } from "zod";

export const employmentTypes = [
  {
    value: "FT",
    label: "Full-Time",
  },
  {
    value: "PT",
    label: "Part-Time",
  },
  {
    value: "CT",
    label: "Contract",
  },
  {
    value: "IN",
    label: "Intern",
  },
] as const;

export const sexOptions = [
  {
    value: "M",
    label: "Male",
  },
  {
    value: "F",
    label: "Female",
  },
] as const;

const optionalDate = z.preprocess((value) => {
  if (value === "" || value === null) {
    return undefined;
  }

  return value;
}, z.string().optional());

export const staffSchema = z
  .object({
    user: z.object({
      username: z
        .string()
        .trim()
        .min(3, "Username must contain at least 3 characters.")
        .max(150, "Username is too long.")
        .regex(
          /^[a-zA-Z0-9._-]+$/,
          "Use only letters, numbers, dots, underscores or hyphens.",
        ),

      email: z
        .string()
        .trim()
        .email("Enter a valid email address.")
        .refine((email) => email.toLowerCase().endsWith("@holansl.com"), {
          message: "Staff email must use the @holansl.com domain.",
        }),

      first_name: z.string().trim().min(2, "First name is required.").max(100),

      last_name: z.string().trim().min(2, "Last name is required.").max(100),
    }),

    middle_name: z.string().trim().max(100).optional(),

    job_title: z.string().trim().min(2, "Job title is required.").max(150),

    employment_type: z.enum(["FT", "PT", "CT", "IN"]),

    start_date: z.string().min(1, "Start date is required."),

    end_date: optionalDate,

    phone_number: z
      .string()
      .trim()
      .min(7, "Enter a valid phone number.")
      .max(30),

    address: z.string().trim().min(5, "Address is required.").max(500),

    sex: z.enum(["M", "F"]),

    date_of_birth: z.string().min(1, "Date of birth is required."),

    nationality: z.string().trim().min(2, "Nationality is required.").max(100),

    department: z.string().min(1, "Select a department."),
  })
  .superRefine((data, context) => {
    if (data.end_date && data.end_date < data.start_date) {
      context.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "End date cannot be earlier than the start date.",
      });
    }

    if (["PT", "CT", "IN"].includes(data.employment_type) && !data.end_date) {
      context.addIssue({
        code: "custom",
        path: ["end_date"],
        message:
          "End date is required for part-time, contract and intern staff.",
      });
    }
  });

export type StaffFormValues = z.infer<typeof staffSchema>;
