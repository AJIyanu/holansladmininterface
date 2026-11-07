import { z } from "zod";

export function cashBookToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export const cashFormSchema = z.object({
  account: z.uuid().optional(),
  currency: z.enum(["NGN", "USD", "GBP"]).optional(),
  date: z
    .string()
    .date("Choose a valid date.")
    .refine(
      (value) => value <= cashBookToday(),
      "Future income and expenses cannot be recorded. Choose today or a past date.",
    ),
  kind: z.enum(["RECEIPT", "EXPENSE", "CAPITAL"]),
  amount: z
    .string()
    .regex(
      /^\d{1,16}(\.\d{1,2})?$/,
      "Enter an amount with up to two decimal places.",
    )
    .refine((value) => /[1-9]/.test(value), "Enter an amount above zero."),
  description: z.string().trim().min(1, "Enter a description.").max(500),
  reference: z.string().trim().max(100),
  reason: z.string().trim().max(500),
});
export type CashFormValues = z.infer<typeof cashFormSchema>;
