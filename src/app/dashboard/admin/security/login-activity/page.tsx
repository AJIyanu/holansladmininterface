import { LogIn } from "lucide-react";
import { redirect } from "next/navigation";

import AiInsightPanel from "@/features/account/security/ai-insight-panel";
import SecurityFilters from "@/features/account/security/security-filters";
import SecurityPagination from "@/features/account/security/security-pagination";
import SecuritySummaryPanel from "@/features/account/security/security-summary-panel";
import { LoginActivityTable } from "@/features/account/security/security-table";
import type {
  AuditLogEntry,
  LoginActivitySearchParams,
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

interface LoginActivityPageProps {
  searchParams: Promise<LoginActivitySearchParams>;
}

export default async function LoginActivityPage({
  searchParams,
}: LoginActivityPageProps) {
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
      status: params.status,
      ordering: params.ordering,
      user: params.user,
    },
    {
      page: "1",
      page_size: "20",
      ordering: "-created_at",
    },
  );

  /*
   * Only the table depends on all search/filter
   * parameters.
   *
   * Summary and AI components fetch separately and
   * cache results using only the selected range.
   */
  const activity = await serverFetch<PaginatedResponse<AuditLogEntry>>(
    `/account/login-activity/?${tableQuery}`,
  );

  const page = Number(params.page ?? 1);

  const pageSize = Number(params.page_size ?? 20);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#0B4F8A]">
          <LogIn className="size-4" />
          Security
        </div>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Login activity
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Authentication activity and security signals for the{" "}
          {rangeLabels[range].toLowerCase()}.
        </p>
      </header>

      <SecurityFilters
        kind="login"
        values={{
          ...params,
          range,
        }}
      />

      <SecuritySummaryPanel kind="login" range={range} />

      <AiInsightPanel
        endpoint="/api/account/login-activity/ai-insight"
        range={range}
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Activity records</h2>

          <p className="text-sm text-muted-foreground">
            {activity.count} matching records
          </p>
        </div>

        <LoginActivityTable entries={activity.results} />

        <SecurityPagination
          count={activity.count}
          page={page}
          pageSize={pageSize}
        />
      </section>
    </div>
  );
}
