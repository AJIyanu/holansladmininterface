import { z } from "zod";

export const cashFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
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
