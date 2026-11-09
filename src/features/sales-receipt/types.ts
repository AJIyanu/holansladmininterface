import type { InvoiceItem } from "../sales-invoice/types";
export interface ReceiptAccount {
  id: string;
  name: string;
  kind: string;
  currency: string;
  is_active: boolean;
}
export interface Receipt {
  id: string;
  party: string;
  invoice: string | null;
  transaction: string;
  reference: string;
  date: string;
  currency: string;
  subtotal: string;
  vat: string;
  withholding: string;
  received: string;
  actor_name: string;
  created_at: string;
  reversed: boolean;
  snapshot: {
    vat_rate?: string;
    withholding_rate?: string;
    company: {
      address?: string;
      website?: string;
      email?: string;
      phone?: string;
    };
    billed_to: string;
    billing_address: string;
    recipient_email: string;
    notes: string;
    items: Array<InvoiceItem & { reference: string; gross_amount: string }>;
    payment_method: string;
    bank_name: string;
    account_name: string;
    payment_reference: string;
    invoice_reference: string;
    amount_in_words: string;
    discount_percent: string;
    discount_amount: string;
    gross_subtotal: string;
    vat_paid: boolean;
    withholding_applied: boolean;
  };
  emails?: Array<{
    id: string;
    destination: string;
    subject: string;
    message: string;
    status: string;
    actor_name: string;
    created_at: string;
  }>;
}
export interface ReceiptPage {
  results: Receipt[];
  count: number;
  next: string | null;
  previous: string | null;
}
