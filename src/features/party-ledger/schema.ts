import { z } from "zod";

export const ledgerAmount = z
  .string()
  .regex(
    /^\d{1,16}(\.\d{1,2})?$/,
    "Enter an amount with up to two decimal places.",
  )
  .refine((value) => /[1-9]/.test(value), "Enter an amount above zero.");
export const entryValuesSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
  amount: ledgerAmount,
  description: z.string().trim().min(1, "Enter a description.").max(500),
  reference: z.string().trim().max(100),
});
export type EntryValues = z.infer<typeof entryValuesSchema>;
export const postingSchema = entryValuesSchema
  .extend({
    kind: z.enum(["sales", "purchase"]),
    party_id: z.uuid(),
    request_key: z.uuid(),
    transaction_type: z.enum(["INVOICE", "BILL", "PAYMENT"]),
    currency: z.enum(["NGN", "USD", "GBP"]),
    account_id: z.uuid().optional(),
    allocations: z
      .array(z.object({ document_id: z.uuid(), amount: ledgerAmount }))
      .max(100),
  })
  .refine(
    (value) =>
      value.transaction_type === "PAYMENT" || value.reference.length > 0,
    { message: "Enter the invoice or bill reference.", path: ["reference"] },
  );

export function cents(value: string): bigint {
  if (!/^\d+(\.\d{0,2})?$/.test(value)) return BigInt(0);
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));
}
export function decimal(value: bigint): string {
  const sign = value < BigInt(0) ? "-" : "";
  const absolute = value < BigInt(0) ? -value : value;
  return `${sign}${absolute / BigInt(100)}.${String(absolute % BigInt(100)).padStart(2, "0")}`;
}
