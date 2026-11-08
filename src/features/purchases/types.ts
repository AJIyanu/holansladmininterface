import type { PurchaseValues } from "./schema";
export interface Evidence {
  id: string;
  version: number;
  receipt_number: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  actor_name: string;
  created_at: string;
}
export interface PurchaseRecord {
  id: string;
  party: string;
  date: string;
  currency: string;
  reference?: string;
  subtotal: string;
  version?: number;
  delivered_at?: string | null;
  transaction: string | null;
  supplier_purchase?: string | null;
  paid?: string;
  vat?: string;
  withholding?: string;
  actor_name: string;
  reversed: boolean;
  bill?: string | null;
  snapshot: Omit<PurchaseValues, "items"> & {
    gross_subtotal: string;
    discount_amount: string;
    subtotal: string;
    tax: string;
    withholding: string;
    total: string;
    paid: string;
    account_name?: string;
    bill_reference?: string;
    items: Array<
      PurchaseValues["items"][number] & { gross_amount: string; amount: string }
    >;
  };
  evidence?: Evidence[];
  events?: Array<{
    action: string;
    actor__username: string;
    created_at: string;
  }>;
}
export interface PurchasePage {
  results: PurchaseRecord[];
  count: number;
  next: string | null;
  previous: string | null;
}
