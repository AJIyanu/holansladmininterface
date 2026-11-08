import { z } from "zod";
import {
  invoiceValuesSchema,
  invoiceSubtotal,
  vatAmount,
} from "../sales-invoice/schema";
export const receiptValuesSchema = invoiceValuesSchema
  .safeExtend({
    account_id: z.uuid("Select a receiving account."),
    payment_method: z.enum(["CASH", "BANK_TRANSFER", "CARD", "CHEQUE"]),
    bank_name: z.string().trim().max(255),
    payment_reference: z.string().trim().max(100),
    vat_paid: z.boolean(),
    withholding_applied: z.boolean(),
    invoice_id: z.uuid().optional(),
    invoice_version: z.number().int().positive().optional(),
  })
  .refine((v) => v.payment_method === "CASH" || !!v.bank_name, {
    message: "Enter the name of the bank paid into.",
    path: ["bank_name"],
  })
  .refine(
    (v) =>
      receiptTotals(
        invoiceSubtotal(v.items, v.discount_percent),
        v.vat_paid,
        v.withholding_applied,
      ).received <= BigInt("999999999999999999"),
    {
      message: "Amount received exceeds the supported amount.",
      path: ["items"],
    },
  );
export type ReceiptValues = z.infer<typeof receiptValuesSchema>;
export function receiptTotals(
  subtotal: bigint,
  vatPaid: boolean,
  withholdingApplied: boolean,
) {
  const vat = vatPaid ? vatAmount(subtotal) : BigInt(0);
  const withholding = withholdingApplied
    ? (subtotal * BigInt(2) + BigInt(50)) / BigInt(100)
    : BigInt(0);
  return { subtotal, vat, withholding, received: subtotal + vat - withholding };
}
