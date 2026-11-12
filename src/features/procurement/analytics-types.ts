export type AnalyticsRange = "week" | "month" | "quarter" | "year";

export type AnalyticsResponse = {
  range: AnalyticsRange;
  date_from: string;
  date_to: string;
  cards: {
    received: number;
    active: number;
    suspended: number;
    closed: number;
    delivered: number;
    not_delivered: number;
  };
  open_comparison: {
    current_week: number;
    previous_week: number;
    difference: number;
    percent_change: number;
  };
  delivered_by_month: Array<{ month: string; count: number }>;
  received_by_client: Array<{
    client_id: string;
    client_name: string;
    count: number;
  }>;
  client_monthly_ratios: Array<{
    client_id: string;
    client_name: string;
    months: Array<{
      month: string;
      received: number;
      delivered: number;
      ratio_percent: number;
    }>;
  }>;
  cache: {
    hit: boolean;
    cached_at: string;
    new_records_threshold: number;
  };
};

export type ProcurementAiResponse = {
  range: AnalyticsRange;
  provider?: string;
  model?: string;
  insight: {
    summary: string;
    observations: string[];
    delivery_concerns: string[];
    demand_patterns: string[];
    recommendations: string[];
    disclaimer: string;
  };
  cache: AnalyticsResponse["cache"];
};
