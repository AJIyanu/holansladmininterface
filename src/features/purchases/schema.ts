import { z } from "zod";
import { invoiceValuesSchema, lineAmount } from "../sales-invoice/schema";
const percent = z
  .string()
  .regex(
    /^\d{1,3}(\.\d{1,2})?$/,
    "Enter a percentage with up to two decimal places.",
  )
  .refine((v) => Number(v) <= 100, "Percentage cannot exceed 100%.");
const amount = z
  .string()
  .regex(
    /^\d{1,16}(\.\d{1,2})?$/,
    "Enter an amount with up to two decimal places.",
  );
export const purchaseValuesSchema = z
  .object({
    date: z.string().date(),
    currency: z.enum(["NGN", "USD", "GBP"]),
    description: z.string().trim().max(500),
    items: invoiceValuesSchema.shape.items,
    reference: z.string().trim().max(100),
    delivered: z.boolean(),
    delivery_date: z.string().date(),
    tax_enabled: z.boolean(),
    tax_percent: percent,
    discount_enabled: z.boolean(),
    discount_type: z.enum(["AMOUNT", "PERCENT"]),
    discount_value: amount,
    account_id: z.string(),
    payment_method: z.enum(["CASH", "BANK_TRANSFER", "CARD", "CHEQUE"]),
    bank_name: z.string().trim().max(255),
    receipt_number: z.string().trim().max(100),
    withholding_enabled: z.boolean(),
    withholding_percent: percent.refine(
      (v) => Number(v) < 100,
      "Withholding must be less than 100%.",
    ),
    bill_id: z.uuid().optional(),
    bill_version: z.number().int().positive().optional(),
  })
  .superRefine((v, ctx) => {
    const t = purchaseTotals(v);
    if (
      v.discount_enabled &&
      v.discount_type === "PERCENT" &&
      Number(v.discount_value) > 100
    )
      ctx.addIssue({
        code: "custom",
        path: ["discount_value"],
        message: "Discount cannot exceed 100%.",
      });
    if (
      t.subtotal <= BigInt(0) ||
      t.gross > BigInt("999999999999999999") ||
      t.paid > BigInt("999999999999999999") ||
      t.withholding >= t.subtotal
    )
      ctx.addIssue({
        code: "custom",
        path: ["items"],
        message:
          "Check quantities, prices and deductions: totals must remain positive and within the supported amount limit.",
      });
  });
export type PurchaseValues = z.infer<typeof purchaseValuesSchema>;
function scaled(v: string) {
  if (!/^\d{1,16}(\.\d{1,2})?$/.test(v)) return BigInt(0);
  const [w, f = ""] = v.split(".");
  return BigInt(w) * BigInt(100) + BigInt(f.padEnd(2, "0"));
}
export function purchaseTotals(
  v: Pick<
    PurchaseValues,
    | "items"
    | "tax_enabled"
    | "tax_percent"
    | "discount_enabled"
    | "discount_type"
    | "discount_value"
    | "withholding_enabled"
    | "withholding_percent"
  >,
) {
  const gross = v.items.reduce((s, r) => s + lineAmount(r), BigInt(0));
  const percent = (total: bigint, rate: string) =>
    (total * scaled(rate) + BigInt(5000)) / BigInt(10000);
  const discount = v.discount_enabled
    ? v.discount_type === "AMOUNT"
      ? scaled(v.discount_value)
      : percent(gross, v.discount_value)
    : BigInt(0);
  const subtotal = gross - discount;
  const tax = v.tax_enabled ? percent(subtotal, v.tax_percent) : BigInt(0);
  const withholding = v.withholding_enabled
    ? percent(subtotal, v.withholding_percent)
    : BigInt(0);
  return {
    gross,
    discount,
    subtotal,
    tax,
    withholding,
    total: subtotal + tax,
    paid: subtotal + tax - withholding,
  };
}
export function defaults(): PurchaseValues {
  const date = new Date().toLocaleDateString("en-CA", {
    timeZone: "Africa/Lagos",
  });
  return {
    date,
    currency: "NGN",
    description: "",
    items: [{ description: "", quantity: "1", unit: "pcs", unit_price: "" }],
    reference: "",
    delivered: false,
    delivery_date: date,
    tax_enabled: false,
    tax_percent: "7.5",
    discount_enabled: false,
    discount_type: "PERCENT",
    discount_value: "0",
    account_id: "",
    payment_method: "CASH",
    bank_name: "",
    receipt_number: "",
    withholding_enabled: false,
    withholding_percent: "2",
  };
}
