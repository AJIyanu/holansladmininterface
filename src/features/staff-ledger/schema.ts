import { z } from "zod";
export const payCategories = [
  "SALARY",
  "ALLOWANCE",
  "TRANSPORT",
  "EXPENSE",
  "LOAN",
  "ADVANCE",
  "ADVANCE_REIMBURSEMENT",
  "OTHER_PAYMENT",
];
export const receiveCategories = [
  "ADVANCE_RETURN",
  "LOAN_REPAYMENT",
  "LEVY",
  "CONTRIBUTION",
  "OTHER_RECEIPT",
];
export const expenseCategories = [
  "TRANSPORT",
  "ACCOMMODATION",
  "MEALS",
  "PURCHASES",
  "COMMUNICATION",
  "OTHER",
];
export function cents(value: string): bigint {
  if (!/^\d{1,16}(\.\d{1,2})?$/.test(value ?? "")) return BigInt(0);
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));
}
export function amountString(value: bigint): string {
  return `${value / BigInt(100)}.${String(value % BigInt(100)).padStart(2, "0")}`;
}
export function expenseTotal(items: { amount: string }[]): string {
  return amountString(
    items.reduce((sum, item) => sum + cents(item.amount), BigInt(0)),
  );
}
export function retirementBalance(remaining: string, total: string) {
  const rest = cents(remaining) - cents(total);
  return {
    change: amountString(rest > BigInt(0) ? rest : BigInt(0)),
    reimbursement: amountString(rest < BigInt(0) ? -rest : BigInt(0)),
  };
}
const amount = z
  .string()
  .regex(
    /^\d{1,16}(\.\d{1,2})?$/,
    "Enter an amount with up to two decimal places.",
  )
  .refine((v) => cents(v) > BigInt(0), "Amount must be above zero.");
export const editorSchema = z
  .object({
    kind: z.enum(["PAY", "RECEIVE", "RETIRE"]),
    date: z.string().date(),
    currency: z.enum(["NGN", "USD", "GBP"]),
    description: z.string().trim().min(1, "Enter a description.").max(1000),
    reference: z.string().trim().max(100),
    category: z.string(),
    amount: z.string(),
    account_id: z.string(),
    related_entry: z.string(),
    items: z
      .array(
        z.object({
          date: z.string().date(),
          category: z.enum(expenseCategories),
          description: z
            .string()
            .trim()
            .min(1, "Describe each expense.")
            .max(1000),
          amount,
        }),
      )
      .max(100),
  })
  .superRefine((v, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });
    if (v.kind === "RETIRE") {
      if (!z.uuid().safeParse(v.related_entry).success)
        issue("related_entry", "Select the advance to retire.");
      if (!v.items.length) issue("items", "Add at least one expense.");
      if (
        cents(expenseTotal(v.items)) === BigInt(0) ||
        v.items.reduce((s, i) => s + cents(i.amount), BigInt(0)) >
          BigInt("999999999999999999")
      )
        issue("items", "Expense total is outside the supported range.");
      if (v.items.some((i) => i.date > v.date))
        issue("items", "Expense dates must not follow the submission date.");
    } else {
      if (!amount.safeParse(v.amount).success)
        issue(
          "amount",
          "Enter a positive amount with up to two decimal places.",
        );
      if (!z.uuid().safeParse(v.account_id).success)
        issue("account_id", "Select the cash or bank account.");
      if (
        !(v.kind === "PAY" ? payCategories : receiveCategories).includes(
          v.category,
        )
      )
        issue("category", "Select a valid category.");
      const linked = [
        "ADVANCE_RETURN",
        "LOAN_REPAYMENT",
        "ADVANCE_REIMBURSEMENT",
      ].includes(v.category);
      if (linked && !z.uuid().safeParse(v.related_entry).success)
        issue("related_entry", "Select the related advance or loan.");
      if (!linked && v.related_entry)
        issue(
          "related_entry",
          "This category cannot be linked to an advance or loan.",
        );
    }
  });
export type EditorValues = z.infer<typeof editorSchema>;
export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
