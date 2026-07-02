import { ClipboardList } from "lucide-react";
import { redirect } from "next/navigation";

import AiInsightPanel from "@/features/account/security/ai-insight-panel";
import SecurityFilters from "@/features/account/security/security-filters";
import SecurityPagination from "@/features/account/security/security-pagination";
import SecuritySummaryPanel from "@/features/account/security/security-summary-panel";
import { AuditLogTable } from "@/features/account/security/security-table";
import type {
  AuditLogEntry,
  AuditLogSearchParams,
  PaginatedResponse,
} from "@/features/account/security/types";
import {
  buildQuery,
  normaliseRange,
  rangeLabels,
} from "@/features/account/security/utils";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch } from "@/lib/server-fetch";

interface AuditLogsPageProps {
  searchParams: Promise<AuditLogSearchParams>;
}

export default async function AuditLogsPage({
  searchParams,
}: AuditLogsPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!hasPermission(currentUser, "accounts.auditlog.view")) {
    redirect("/dashboard/unauthorized");
  }

  const params = await searchParams;

  const range = normaliseRange(params.range);

  const tableQuery = buildQuery(
    {
      range,
      page: params.page,
      page_size: params.page_size,
      search: params.search,
      event_type: params.event_type,
      event_category: params.event_category,
      status: params.status,
      resource: params.resource,
      action: params.action,
      ordering: params.ordering,
      user: params.user,
      target_user: params.target_user,
    },
    {
      page: "1",
      page_size: "20",
      ordering: "-created_at",
    },
  );

  const logs = await serverFetch<PaginatedResponse<AuditLogEntry>>(
    `/account/audit-logs/?${tableQuery}`,
  );

  const page = Number(params.page ?? 1);

  const pageSize = Number(params.page_size ?? 20);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#0B4F8A]">
          <ClipboardList className="size-4" />
          Security
        </div>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Audit logs
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Administrative actions and system events for the{" "}
          {rangeLabels[range].toLowerCase()}.
        </p>
      </header>

      <SecurityFilters
        kind="audit"
        values={{
          ...params,
          range,
        }}
      />

      <SecuritySummaryPanel kind="audit" range={range} />

      <AiInsightPanel
        endpoint="/api/account/audit-logs/ai-insight"
        range={range}
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Audit records</h2>

          <p className="text-sm text-muted-foreground">
            {logs.count} matching records
          </p>
        </div>

        <AuditLogTable entries={logs.results} />

        <SecurityPagination
          count={logs.count}
          page={page}
          pageSize={pageSize}
        />
      </section>
    </div>
  );
}
