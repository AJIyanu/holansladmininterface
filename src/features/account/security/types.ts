export type SecurityRange = "month" | "quarter" | "year";
export type AuditStatus = "SUCCESS" | "FAILED";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuditUserSummary {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

// export interface AuditLogEntry {
//   id: number;
//   user: AuditUserSummary | null;
//   target_user: AuditUserSummary | null;
//   event_category: "AUTH" | "CRUD" | "SYSTEM" | "SECURITY";
//   event_type:
//     | "LOGIN_SUCCESS"
//     | "LOGIN_FAILED"
//     | "LOGOUT"
//     | "ACCOUNT_CREATED"
//     | "DEFAULT_PASSWORD_LOGIN_BLOCKED"
//     | "PASSWORD_RESET_LINK_SENT"
//     | "PASSWORD_RESET_CODE_VERIFIED"
//     | "PASSWORD_RESET_COMPLETED"
//     | "PASSWORD_RESET_FAILED"
//     | "PASSWORD_RESET_REQUESTED"
//     | "PASSWORD_RESET_EMAIL_FAILED"
//     | "CREATE"
//     | "READ"
//     | "UPDATE"
//     | "DELETE";
//   status: AuditStatus;
//   username_attempted: string;
//   app_label: string;
//   resource: string;
//   action: string;
//   object_id: string;
//   ip_address: string | null;
//   user_agent: string;
//   metadata: unknown;
//   created_at: string;
// }

// export interface RulesInsight {
//   source: "rules" | string;
//   risk_level: RiskLevel;
//   text: string;
// }

export interface LoginActivitySummary {
  range: SecurityRange;
  date_from: string;
  date_to: string;
  successful_logins: number;
  failed_logins: number;
  password_reset_requests: number;
  password_reset_failures: number;
  unique_users: number;
  top_successful_user: {
    user_id: string;
    display_name: string;
    count: number;
  } | null;
  top_failed_account: {
    display_name: string;
    count: number;
  } | null;
  risk_indicators: {
    repeated_failures: boolean;
    multiple_ips_for_account: boolean;
    unusual_time_activity: boolean;
  };
  insight: RulesInsight;
}

export interface AuditLogSummary {
  range: SecurityRange;
  date_from: string;
  date_to: string;
  total_events: number;
  create_count: number;
  update_count: number;
  delete_count: number;
  failed_count: number;
  most_active_actor: {
    user_id: string;
    display_name: string;
    count: number;
  } | null;
  most_affected_resource: {
    resource: string;
    count: number;
  } | null;
  most_affected_target: {
    target_type: string;
    display_name: string;
    count: number;
  } | null;
  activity_by_action: Array<{
    action: string;
    count: number;
  }>;
  insight: RulesInsight;
}

// export interface AiRecommendation {
//   priority: RiskLevel;
//   title: string;
//   recommendation: string;
// }

export interface AiInsightPayload {
  risk_level: RiskLevel;
  summary: string;
  observations?: string[];
  risk_indicators?: string[];
  recommendations?: AiRecommendation[];
  requires_immediate_review?: boolean;
  disclaimer?: string;
}

// export interface AiInsightResponse {
//   range: SecurityRange;
//   input_summary?: Record<string, string | number | boolean | null>;
//   insight: AiInsightPayload;
//   provider?: string;
//   model?: string;
// }

// export interface LoginActivitySearchParams {
//   range?: SecurityRange;
//   page?: string;
//   page_size?: string;
//   search?: string;
//   event_type?: string;
//   status?: AuditStatus;
//   ordering?: string;
// }

// export interface AuditLogSearchParams extends LoginActivitySearchParams {
//   event_category?: string;
//   resource?: string;
//   action?: string;
// }
export interface AuditLogSearchParams {
  range?: string;
  page?: string;
  page_size?: string;
  search?: string;
  event_type?: string;
  event_category?: string;
  status?: string;
  resource?: string;
  action?: string;
  ordering?: string;
  user?: string;
  target_user?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface SecurityUser {
  id: string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface AuditLogEntry {
  id: string;
  event_type: string;
  event_category?: string;
  status: "SUCCESS" | "FAILED";

  user?: SecurityUser | null;
  target_user?: SecurityUser | null;

  username_attempted?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;

  app_label?: string | null;
  resource?: string | null;
  action?: string | null;
  object_id?: string | null;

  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface RulesInsight {
  source: string;
  // risk_level: string;
  risk_level: "low" | "medium" | "high" | "critical";
  text: string;
}

export interface LoginActivitySummary {
  range: SecurityRange;
  date_from: string;
  date_to: string;

  successful_logins: number;
  failed_logins: number;

  password_reset_requests: number;
  password_reset_failures: number;

  unique_users: number;

  top_successful_user: {
    user_id: string;
    display_name: string;
    count: number;
  } | null;

  top_failed_account: {
    display_name: string;
    count: number;
  } | null;

  risk_indicators: {
    repeated_failures: boolean;
    multiple_ips_for_account: boolean;
    unusual_time_activity: boolean;
  };

  insight: RulesInsight;
}

export interface AuditLogSummary {
  range: SecurityRange;
  date_from: string;
  date_to: string;

  total_events: number;
  create_count: number;
  update_count: number;
  delete_count: number;
  failed_count: number;

  most_active_actor: {
    user_id: string;
    display_name: string;
    count: number;
  } | null;

  most_affected_resource: {
    resource: string;
    count: number;
  } | null;

  most_affected_target: {
    target_type: string;
    display_name: string;
    count: number;
  } | null;

  activity_by_action: Array<{
    action: string;
    count: number;
  }>;

  insight: RulesInsight;
}

export interface AiRecommendation {
  priority: string;
  title: string;
  recommendation: string;
}

export interface AiInsightResponse {
  range: SecurityRange;

  input_summary?: Record<string, string | number | boolean | null>;

  insight: {
    risk_level: string;
    summary: string;
    observations?: string[];
    risk_indicators?: string[];
    recommendations?: AiRecommendation[];
    requires_immediate_review?: boolean;
    disclaimer?: string;
  };

  provider?: string;
  model?: string;
}

export interface LoginActivitySearchParams {
  range?: string;
  page?: string;
  page_size?: string;
  search?: string;
  event_type?: string;
  status?: string;
  ordering?: string;
  user?: string;
}
