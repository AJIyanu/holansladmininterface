import { z } from "zod";
export const requestSchema = z
  .object({
    action: z.enum([
      "REMIT",
      "VAT_SETTLE",
      "CLASSIFY",
      "CIT_ASSESS",
      "CIT_CREDIT",
      "ADJUST",
      "OPENING",
      "REVERSE",
    ]),
    date: z.string().date(),
    period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
    currency: z.enum(["NGN", "USD", "GBP"]),
    tax_type: z.enum(["VAT", "WHT", "CIT"]),
    amount: z
      .string()
      .regex(/^\d{1,16}(\.\d{1,2})?$/)
      .or(z.literal("")),
    authority: z.string().trim().max(255),
    reference: z.string().trim().max(100),
    description: z
      .string()
      .trim()
      .min(1, "Enter a description and reason.")
      .max(1000),
    account_id: z.uuid().or(z.literal("")),
    document_key: z.string().max(100),
    source_entry: z.uuid().or(z.literal("")),
    classification: z.enum(["AVAILABLE", "PENDING", "NONRECOVERABLE"]),
    adjust_field: z.string(),
    decrease: z.boolean(),
  })
  .superRefine((v, c) => {
    const error = (path: string, message: string) =>
      c.addIssue({ code: "custom", path: [path], message });
    if (
      !["CLASSIFY", "OPENING", "REVERSE"].includes(v.action) &&
      (!v.amount || !/[1-9]/.test(v.amount))
    )
      error("amount", "Enter a positive amount.");
    if (["REMIT", "VAT_SETTLE"].includes(v.action) && !v.account_id)
      error("account_id", "Select an account.");
    if (v.action === "REMIT" && (!v.authority || !v.reference))
      error("reference", "Enter the authority and payment reference.");
    if (
      ["CLASSIFY", "VAT_SETTLE", "OPENING"].includes(v.action) &&
      !v.document_key
    )
      error("document_key", "Select a source document.");
    if (v.action === "REVERSE" && !v.source_entry)
      error("source_entry", "Select a posting.");
    if (v.period > v.date.slice(0, 7))
      error("period", "Period cannot follow the accounting date.");
  });
export type Values = z.infer<typeof requestSchema>;
export const policySchema = z.object({
  kind: z.enum(["VAT", "WHT"]),
  party_id: z.uuid().or(z.literal("")),
  rate: z.string().regex(/^\d{1,2}(\.\d{1,2})?$/),
  enabled: z.boolean(),
  effective_date: z.string().date(),
  reason: z.string().trim().min(1).max(1000),
});
