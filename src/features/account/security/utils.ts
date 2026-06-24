import type { AuditLogEntry, RiskLevel, SecurityRange } from "./types";

export const rangeLabels: Record<SecurityRange, string> = {
  month: "Recent month",
  quarter: "Recent quarter",
  year: "Recent year",
};

export function normaliseRange(value?: string): SecurityRange {
  return value === "quarter" || value === "year" ? value : "month";
}

export function formatSecurityDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(new Date(value));
}

export function formatPeriod(from: string, to: string): string {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "Europe/London",
  });

  return `${formatter.format(new Date(from))} – ${formatter.format(new Date(to))}`;
}

export function formatEventLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function displayUser(
  user: AuditLogEntry["user"] | AuditLogEntry["target_user"],
  fallback = "System",
): string {
  if (!user) {
    return fallback;
  }

  const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  return fullName || user.username || user.email;
}

export function percentage(part: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

export function riskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case "critical":
      return "border-red-300 bg-red-100 text-red-800";
    case "high":
      return "border-orange-300 bg-orange-100 text-orange-800";
    case "medium":
      return "border-amber-300 bg-amber-100 text-amber-800";
    default:
      return "border-emerald-300 bg-emerald-100 text-emerald-800";
  }
}

export function buildQuery(
  params: Record<string, string | undefined>,
  defaults: Record<string, string>,
): string {
  const query = new URLSearchParams(defaults);

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  return query.toString();
}
