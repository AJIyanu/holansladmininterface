export type Option = { id: string; label: string };

export type ItemImage = {
  id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  position: number;
  caption: string;
  created_at: string;
};

export type ItemActivity = {
  id: string;
  category: "ACTIVITY" | "COMMENT" | "SYSTEM";
  title_code: string;
  title: string;
  description: string;
  occurred_at: string;
  status_result: string;
  created_by_name: string;
  created_at: string;
};

export type RequestedItem = {
  id: string;
  request: string;
  code: string;
  name: string;
  description: string;
  specification: string;
  brand: string;
  quantity: string;
  unit: string;
  urgency: string;
  deadline: string | null;
  status: "OPEN" | "SUSPENDED" | "DELIVERED" | "CLOSED";
  completed_at: string | null;
  client_name: string;
  requester_name: string;
  received_via: string;
  received_via_custom: string;
  received_at: string;
  images: ItemImage[];
  latest_activity: ItemActivity | null;
  activity_count: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
};

export type ItemRequest = {
  id: string;
  client: string;
  client_name: string;
  requester: string | null;
  requester_name: string;
  received_via: string;
  received_via_custom: string;
  notes: string;
  received_at: string;
  created_by_name: string;
  created_at: string;
  items: RequestedItem[];
};

export type Page<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type TrackerDetail = RequestedItem & {
  activities: ItemActivity[];
  suggested_titles: Array<{ value: string; label: string }>;
};
