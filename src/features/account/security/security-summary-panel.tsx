"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Skeleton } from "@/components/ui/skeleton";

import RulesInsightCard from "./rules-insight-card";
import {
  fetchSessionCached,
  removeSecurityCache,
} from "./security-session-cache";
import SummaryUnavailable from "./summary-unavailable";
import {
  AuditSummaryCards,
  LoginSummaryCards,
} from "./summary-cards";
import type {
  AuditLogSummary,
  LoginActivitySummary,
  SecurityRange,
} from "./types";

interface SecuritySummaryPanelProps {
  kind: "login" | "audit";
  range: SecurityRange;
}

function SummaryLoading() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-60 rounded-xl" />
        <Skeleton className="h-60 rounded-xl" />
      </div>

      <Skeleton className="h-32 rounded-xl" />
    </div>
  );
}

export default function SecuritySummaryPanel({
  kind,
  range,
}: SecuritySummaryPanelProps) {
  const [summary, setSummary] = useState<
    LoginActivitySummary | AuditLogSummary | null
  >(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  const [requestVersion, setRequestVersion] =
    useState(0);

  const endpoint =
    kind === "login"
      ? "/api/account/login-activity/summary"
      : "/api/account/audit-logs/summary";

  const cacheKey = useMemo(
    () =>
      `holansl-security:${kind}:summary:${range}`,
    [kind, range],
  );

  const requestUrl = useMemo(
    () =>
      `${endpoint}?range=${encodeURIComponent(
        range,
      )}`,
    [endpoint, range],
  );

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);
    setSummary(null);

    async function loadSummary() {
      try {
        const response =
          await fetchSessionCached<
            LoginActivitySummary | AuditLogSummary
          >({
            cacheKey,
            url: requestUrl,
            timeoutMs: 30_000,
          });

        if (!response?.insight?.text) {
          removeSecurityCache(cacheKey);

          throw new Error(
            "The summary response was incomplete.",
          );
        }

        if (active) {
          setSummary(response);
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          setError(
            "The summary request took too long to respond.",
          );
        } else {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "The summary is temporarily unavailable.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      /*
       * Do not cancel the shared request.
       *
       * Pagination and filter changes may briefly
       * unmount this component. The next instance
       * will reuse the same in-flight request.
       */
      active = false;
    };
  }, [
    cacheKey,
    requestUrl,
    requestVersion,
  ]);

  function retry() {
    removeSecurityCache(cacheKey);
    setRequestVersion(
      (current) => current + 1,
    );
  }

  if (loading) {
    return <SummaryLoading />;
  }

  if (!summary || error) {
    return (
      <SummaryUnavailable
        message={
          error ??
          "Activity records are still available below."
        }
        onRetry={retry}
      />
    );
  }

  if (kind === "login") {
    const loginSummary =
      summary as LoginActivitySummary;

    return (
      <div className="space-y-4">
        <LoginSummaryCards
          summary={loginSummary}
        />

        <RulesInsightCard
          insight={loginSummary.insight}
        />
      </div>
    );
  }

  const auditSummary =
    summary as AuditLogSummary;

  return (
    <div className="space-y-4">
      <AuditSummaryCards
        summary={auditSummary}
      />

      <RulesInsightCard
        insight={auditSummary.insight}
      />
    </div>
  );
}