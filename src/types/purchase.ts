export interface Tracker {
  id: string;
  status: string;
  description: string;
  updated_at: string;
}

export type POStatus =
  | "pending"
  | "ordered"
  | "ready"
  | "canceled"
  | "delivered"
  | "accepted"
  | "rejected"
  | string;

export interface PurchaseOrder {
  id: string;
  client_name: string;
  supplier_name: string;
  item_name: string;
  item_brand: string;
  po_number: string;
  status: POStatus;
  created_at: string;
  trackers: Tracker[];
  supplier_quote: string | null;
  quantity?: number;
  uom?: string;
  price?: string;
  expiry_date?: string | null;
}

export interface SupplierQuote {
  id: string;
  supplier_name: string;
  currency: string;
  quoted_price: string;
  lead_time_days?: number;
  import_type?: string;
  client_request_details?: {
    specification?: string;
    item_name?: string;
  };
}

export interface Party {
  id: string;
  name: string;
  party_type: string;
}

export interface PurchaseOrderDefaultData {
  id: string;
  po_number: string;
  client: string;
  supplier_quote: string;
  quantity: number;
  uom: string;
  price: string;
  expiry_date?: string | null;
  status: POStatus;
}
