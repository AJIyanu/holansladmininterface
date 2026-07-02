"use client";

import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import type {
  AuditLogEntry,
  PaginatedResponse,
} from "@/features/account/security/types";
import {
  displayUser,
  formatEventLabel,
  formatSecurityDate,
} from "@/features/account/security/utils";

import { staffActionApi } from "./staff-action-api";
import type { StaffActionContentProps } from "./staff-action-types";

interface StaffRecentActivityActionProps extends StaffActionContentProps {
  kind: "login" | "audit";
}

function ActivityStatus({ status }: { status: AuditLogEntry["status"] }) {
  return (
    <Badge
      variant={status === "SUCCESS" ? "default" : "destructive"}
      className={
        status === "SUCCESS"
          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
          : undefined
      }
    >
      {status === "SUCCESS" ? "Success" : "Failed"}
    </Badge>
  );
}

export default function StaffRecentActivityAction({
  profile,
  kind,
}: StaffRecentActivityActionProps) {
  const [records, setRecords] = useState<AuditLogEntry[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const endpoint =
    kind === "login"
      ? "/api/account/login-activity"
      : "/api/account/audit-logs";

  const viewAllPath =
    kind === "login"
      ? "/dashboard/admin/security/login-activity"
      : "/dashboard/admin/security/audit-logs";

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        user: profile.user.id,
        page: "1",
        page_size: "10",
        ordering: "-created_at",
      });

      const response = await staffActionApi<PaginatedResponse<AuditLogEntry>>(
        `${endpoint}?${query.toString()}`,
      );
      console.log("Fetched records:", response.results);
      setRecords(response.results);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to load recent activity.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, profile.user.id]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const viewAllQuery = new URLSearchParams({
    user: profile.user.id,
    page: "1",
    page_size: "10",
    ordering: "-created_at",
  });

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => void loadRecords()}
          >
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </div>
      ) : (
        <ScrollArea className="max-h-[420px]">
          {records.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No recent{" "}
                {kind === "login" ? "login activity" : "audit history"} found.
              </p>
            </div>
          ) : (
            <div className="divide-y rounded-lg border">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3 p-4 sm:grid-cols-[160px_minmax(0,1fr)_auto]"
                >
                  <div className="min-w-0">
                    <p className="text-xs leading-5 text-muted-foreground">
                      {formatSecurityDate(record.created_at)}
                    </p>
                  </div>

                  <div className="min-w-0">
                    {kind === "login" ? (
                      <>
                        <p className="break-words text-sm font-medium">
                          {formatEventLabel(record.event_type)}
                        </p>

                        <p className="mt-1 break-words text-xs text-muted-foreground">
                          IP: {record.ip_address ?? "Not recorded"}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="break-words text-sm font-medium">
                          {record.action || formatEventLabel(record.event_type)}
                        </p>

                        <p className="mt-1 break-words text-xs text-muted-foreground">
                          {record.resource || "Unknown resource"}
                          {record.target_user
                            ? ` · ${displayUser(record.target_user)}`
                            : ""}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="col-start-2 row-start-1 sm:col-start-3">
                    <ActivityStatus status={record.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      )}

      <div className="flex justify-end border-t pt-4">
        <Button asChild>
          <Link href={`${viewAllPath}?${viewAllQuery.toString()}`}>
            View all {kind === "login" ? "login activity" : "audit history"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
