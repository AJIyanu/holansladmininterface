import type { Page } from "@/features/cash-book/types";
export type { Page };
export const actions = {
  REMIT: "Remit tax",
  VAT_SETTLE: "Settle document VAT",
  CLASSIFY: "Classify input VAT",
  CIT_ASSESS: "Record CIT assessment",
  CIT_CREDIT: "Apply WHT to CIT",
  ADJUST: "Adjust tax balance",
  OPENING: "Record historical delivery VAT",
  REVERSE: "Reverse tax posting",
} as const;
export const actionPermission: Record<string, string> = {
  REMIT: "remit",
  VAT_SETTLE: "remit",
  CLASSIFY: "configure",
  CIT_ASSESS: "adjust",
  CIT_CREDIT: "apply",
  ADJUST: "adjust",
  OPENING: "adjust",
  REVERSE: "adjust",
};
export const fields: Record<string, string> = {
  output_vat: "VAT on sales (Output VAT)",
  input_vat: "Eligible purchase VAT (Input VAT)",
  input_pending: "Input VAT pending review",
  input_nonrecoverable: "Non-recoverable input VAT",
  sales_vat_cash: "VAT received from clients",
  purchase_vat_cash: "VAT paid to suppliers",
  wht_asset: "WHT held by clients",
  wht_liability: "WHT withheld from suppliers",
  input_used: "Input VAT offset used",
  vat_remitted: "VAT remitted",
  wht_remitted: "WHT remitted",
  cit_assessed: "CIT assessed",
  cit_paid: "CIT remitted",
  wht_used: "WHT credit applied to CIT",
  party_vat: "Change in party VAT balance",
  delivery_vat: "VAT on delivered goods",
  vat_due: "Net VAT due / (credit)",
  input_available: "Unused input VAT credit",
  wht_available: "Available client WHT credit",
  wht_due: "Supplier WHT due",
  cit_due: "CIT balance due",
};
export interface Entry {
  id: string;
  date: string;
  period: string;
  currency: string;
  kind: string;
  reference: string;
  description: string;
  party_name: string;
  actor_name: string;
  document_key: string;
  [key: string]: unknown;
}
export interface Request {
  id: string;
  actor_name: string;
  created_at: string;
  payload: Record<string, string | boolean>;
  document: { id: string; filename: string } | null;
  decision: {
    approved: boolean;
    reason: string;
    actor_name: string;
    entry: string | null;
  } | null;
}
export interface Source {
  document_key: string;
  reference: string;
  party_name: string;
  outstanding_vat: string;
  input_vat: string;
  currency: string;
}
export interface Policy {
  id: string;
  party_name: string;
  kind: string;
  rate: string;
  enabled: boolean;
  effective_date: string;
  reason: string;
  actor_name: string;
}
export interface Report extends Page<Entry> {
  opening: Record<string, string>;
  closing: Record<string, string>;
  period_totals: Record<string, string>;
  balances: Record<string, string>;
}
export interface History {
  missing_payments: Array<{
    id: string;
    side: string;
    reference: string;
    vat: string;
    wht: string;
  }>;
  delivery_review: Array<{
    document_key: string;
    reference: string;
    currency: string;
    date: string;
    expected_vat: string;
    recorded_vat: string;
    recognition_gap: string;
  }>;
  discrepancies?: Array<{ reference: string; reason: string }>;
  note: string;
}
