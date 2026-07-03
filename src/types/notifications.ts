export type NotificationMetadata = Record<string, unknown>;

export interface NotificationActor {
  id?: string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface NotificationInboxApiItem {
  id: string;
  notification_id: string;

  notification_type: string;
  category: string;
  severity: string;

  title: string;
  message: string;

  actor: NotificationActor | null;

  action_url: string;
  action_label: string;

  notification_metadata: NotificationMetadata | null;

  metadata: NotificationMetadata | null;

  is_mandatory: boolean | string | number;
  source: string;

  channels: string | string[] | null;

  is_seen: boolean | string | number;
  is_read: boolean | string | number;
  is_archived: boolean | string | number;

  seen_at: string | null;
  read_at: string | null;
  archived_at: string | null;
  dismissed_at: string | null;

  scheduled_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface DashboardNotification extends Omit<
  NotificationInboxApiItem,
  "is_mandatory" | "is_seen" | "is_read" | "is_archived"
> {
  is_mandatory: boolean;
  is_seen: boolean;
  is_read: boolean;
  is_archived: boolean;
}

export interface PaginatedNotificationResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NotificationInboxApiItem[];
}

export interface DashboardNotificationsResponse {
  count: number;
  unread_count: number;
  next: string | null;
  previous: string | null;
  results: DashboardNotification[];
}

export interface NotificationMutationResponse {
  success: boolean;
  detail?: string;
}
