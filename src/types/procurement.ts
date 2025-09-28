// Base types from Django models
export interface Party {
  id: string;
  name: string;
  party_type: "client" | "supplier" | "logistics";
  is_organization: boolean;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactPerson {
  id: string;
  party: string;
  first_name: string;
  last_name?: string;
  position?: string;
  email?: string;
  phone?: string;
  link?: string;
}

export interface ClientRequest {
  id: string;
  client: string;
  client_name: string;
  contact_person?: string;
  contact_person_name?: string;
  item_name: string;
  specification?: string;
  model?: string;
  brand?: string;
  uom: string;
  quantity: number;
  status: "pending" | "processing" | "discarded" | "completed";
  comments?: string;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Form data types
export interface ClientRequestFormData {
  client: string;
  contact_person?: string;
  item_name: string;
  specification?: string;
  model?: string;
  brand?: string;
  uom: string;
  quantity: number;
  status: "pending" | "processing" | "discarded" | "completed";
  comments?: string;
}

// Table filter types
export interface RequestFilters {
  search?: string;
  status?: string;
  client?: string;
  page?: number;
}
