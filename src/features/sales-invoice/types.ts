export interface InvoiceItem {
  id?: string;
  position?: number;
  description: string;
  quantity: string;
  unit: string;
  unit_price: string;
  amount?: string;
}
export interface Invoice {
  pricing?: {
    discount_percent: string;
    gross_subtotal: string;
    discount_amount: string;
    vat: string;
    total: string;
  };
  company?: {
    address?: string;
    website?: string;
    email?: string;
    phone?: string;
  };
  id: string;
  party: string;
  date: string;
  currency: "NGN" | "USD" | "GBP";
  reference: string | null;
  billed_to: string;
  billing_address: string;
  recipient_email: string;
  notes: string;
  subtotal: string;
  version: number;
  confirmed: boolean;
  delivered_at: string | null;
  posted_transaction: string | null;
  finance_request: string | null;
  items: InvoiceItem[];
  created_by_name: string;
  updated_by_name: string;
  created_at: string;
  updated_at: string;
  revisions?: Array<{
    id: string;
    version: number;
    created_at: string;
    actor__username: string;
  }>;
  emails?: Array<{
    id: string;
    destination: string;
    subject: string;
    message: string;
    status: string;
    actor_name: string;
    invoice_version: number;
    created_at: string;
  }>;
}
export interface InvoiceDefaults {
  billed_to: string;
  billing_address: string;
  recipient_email: string;
}
export interface InvoicePage {
  count: number;
  next: string | null;
  previous: string | null;
  results: Invoice[];
  defaults: InvoiceDefaults;
}
export interface InvoicePermissions {
  edit: boolean;
  confirm: boolean;
  deliver: boolean;
  print: boolean;
  email: boolean;
}
