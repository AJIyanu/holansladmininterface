import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { AuditLogSummary, LoginActivitySummary } from "./types";
import { formatPeriod, percentage, riskBadgeClass } from "./utils";

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-background/70 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

function ProgressRow({ label, value, total }: { label: string; value: number; total: number }) {
  const width = percentage(value, total);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-foreground/70" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function LoginSummaryCards({ summary }: { summary: LoginActivitySummary }) {
  const totalAttempts = summary.successful_logins + summary.failed_logins;
  const failureRate = percentage(summary.failed_logins, totalAttempts);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="size-5 text-[#0B4F8A]" />
            Authentication outcomes
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {formatPeriod(summary.date_from, summary.date_to)}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Successful" value={summary.successful_logins} />
            <Metric label="Failed" value={summary.failed_logins} />
            <Metric label="Reset requests" value={summary.password_reset_requests} />
            <Metric label="Failure rate" value={`${failureRate}%`} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ProgressRow label="Successful logins" value={summary.successful_logins} total={totalAttempts} />
            <ProgressRow label="Failed logins" value={summary.failed_logins} total={totalAttempts} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="size-5 text-[#0B4F8A]" />
            Security signals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <CheckCircle2 className="size-4" /> Most successful user
              </p>
              <p className="mt-2 font-semibold">
                {summary.top_successful_user?.display_name ?? "No activity"}
              </p>
              <p className="text-sm text-muted-foreground">
                {summary.top_successful_user?.count ?? 0} successful logins
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <AlertTriangle className="size-4" /> Most failed account
              </p>
              <p className="mt-2 font-semibold">
                {summary.top_failed_account?.display_name ?? "No failed account"}
              </p>
              <p className="text-sm text-muted-foreground">
                {summary.top_failed_account?.count ?? 0} failed attempts
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={summary.risk_indicators.repeated_failures ? riskBadgeClass("high") : riskBadgeClass("low")}>
              Repeated failures: {summary.risk_indicators.repeated_failures ? "Detected" : "None"}
            </Badge>
            <Badge variant="outline" className={summary.risk_indicators.multiple_ips_for_account ? riskBadgeClass("medium") : riskBadgeClass("low")}>
              Multiple IPs: {summary.risk_indicators.multiple_ips_for_account ? "Detected" : "None"}
            </Badge>
            <Badge variant="outline" className={summary.risk_indicators.unusual_time_activity ? riskBadgeClass("medium") : riskBadgeClass("low")}>
              Unusual time: {summary.risk_indicators.unusual_time_activity ? "Detected" : "None"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AuditSummaryCards({ summary }: { summary: AuditLogSummary }) {
  const failureRate = percentage(summary.failed_count, summary.total_events);
  const actionTotal = Math.max(
    1,
    summary.activity_by_action.reduce((total, item) => total + item.count, 0),
  );

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="size-5 text-[#0B4F8A]" />
            Activity overview
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {formatPeriod(summary.date_from, summary.date_to)}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Total events" value={summary.total_events} />
            <Metric label="Created" value={summary.create_count} />
            <Metric label="Updated" value={summary.update_count} />
            <Metric label="Deleted" value={summary.delete_count} />
          </div>
          <div className="space-y-3">
            {summary.activity_by_action.map((item) => (
              <ProgressRow key={item.action} label={item.action} value={item.count} total={actionTotal} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="size-5 text-[#0B4F8A]" />
            Risk and responsibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <UserRound className="size-4" /> Most active actor
              </p>
              <p className="mt-2 font-semibold">
                {summary.most_active_actor?.display_name ?? "No actor"}
              </p>
              <p className="text-sm text-muted-foreground">
                {summary.most_active_actor?.count ?? 0} events
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <KeyRound className="size-4" /> Most affected target
              </p>
              <p className="mt-2 font-semibold">
                {summary.most_affected_target?.display_name ?? summary.most_affected_resource?.resource ?? "No target"}
              </p>
              <p className="text-sm text-muted-foreground">
                {summary.most_affected_target?.count ?? summary.most_affected_resource?.count ?? 0} events
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Failed actions" value={summary.failed_count} />
            <Metric label="Failure rate" value={`${failureRate}%`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
