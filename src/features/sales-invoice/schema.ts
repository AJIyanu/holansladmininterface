import { z } from "zod";
const quantity = z
  .string()
  .regex(
    /^\d{1,8}(\.\d{1,4})?$/,
    "Enter a quantity with up to four decimal places.",
  )
  .refine((v) => /[1-9]/.test(v), "Quantity must be above zero.");
const price = z
  .string()
  .regex(
    /^\d{1,16}(\.\d{1,2})?$/,
    "Enter a unit price with up to two decimal places.",
  );
export const invoiceValuesSchema = z
  .object({
    expected_vat_rate: z
      .string()
      .regex(/^\d{1,2}(\.\d{1,2})?$/)
      .optional(),
    date: z.string().date("Choose a valid date."),
    currency: z.enum(["NGN", "USD", "GBP"]),
    billed_to: z.string().trim().min(1, "Enter the billed-to name.").max(255),
    billing_address: z.string().trim().max(1000),
    recipient_email: z.union([z.literal(""), z.email()]),
    notes: z.string().trim().max(2000),
    discount_percent: z
      .string()
      .regex(
        /^\d{1,3}(\.\d{1,2})?$/,
        "Enter a discount from 0 to 100 with up to two decimal places.",
      )
      .refine((v) => Number(v) <= 100, "Discount cannot exceed 100%.")
      .optional(),
    items: z
      .array(
        z.object({
          id: z.uuid().optional(),
          description: z
            .string()
            .trim()
            .min(1, "Describe each item.")
            .max(1000),
          quantity,
          unit: z
            .string()
            .trim()
            .min(1, "Enter a unit of measurement.")
            .max(40),
          unit_price: price,
        }),
      )
      .min(1, "Add at least one item.")
      .max(100),
  })
  .refine((v) => invoiceSubtotal(v.items, v.discount_percent) > BigInt(0), {
    message: "Goods subtotal after discount must be above zero.",
    path: ["items"],
  })
  .refine(
    (v) =>
      invoiceSubtotal(v.items, v.discount_percent) <=
      BigInt("999999999999999999"),
    {
      message: "Goods subtotal exceeds the supported amount.",
      path: ["items"],
    },
  );
export type InvoiceValues = z.infer<typeof invoiceValuesSchema>;
function scaled(value: string, places: number): bigint {
  if (!/^\d+(\.\d+)?$/.test(value)) return BigInt(0);
  const [whole, fraction = ""] = value.split(".");
  if (fraction.length > places || whole.length > 16) return BigInt(0);
  return (
    BigInt(whole) * BigInt(10) ** BigInt(places) +
    BigInt(fraction.padEnd(places, "0"))
  );
}
export function lineAmount(row: {
  quantity: string;
  unit_price: string;
}): bigint {
  return (
    (scaled(row.quantity, 4) * scaled(row.unit_price, 2) + BigInt(5000)) /
    BigInt(10000)
  );
}
export function invoiceSubtotal(
  rows: Array<{ quantity: string; unit_price: string }>,
  discountPercent = "0",
): bigint {
  return rows.reduce(
    (sum, row) => sum + discountedLineAmount(row, discountPercent),
    BigInt(0),
  );
}
export function discountedLineAmount(
  row: { quantity: string; unit_price: string },
  discountPercent = "0",
): bigint {
  const gross = lineAmount(row);
  const rate = scaled(discountPercent, 2);
  if (rate > BigInt(10000)) return BigInt(0);
  return gross - (gross * rate + BigInt(5000)) / BigInt(10000);
}
export function decimal(value: bigint): string {
  return `${value / BigInt(100)}.${String(value % BigInt(100)).padStart(2, "0")}`;
}
export function vatAmount(subtotal: bigint, rate = "7.5"): bigint {
  return (subtotal * scaled(rate, 2) + BigInt(5000)) / BigInt(10000);
}
