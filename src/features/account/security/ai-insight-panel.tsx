"use client";

import { AlertCircle, Bot, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  fetchSessionCached,
  removeSecurityCache,
} from "./security-session-cache";
import type { AiInsightResponse, RiskLevel, SecurityRange } from "./types";
import { riskBadgeClass } from "./utils";

interface AiInsightPanelProps {
  endpoint: string;
  range: SecurityRange;
}

const AI_REQUEST_TIMEOUT_MS = 90_000;

function TypewriterText({ text }: { text: string }) {
  const [visibleLength, setVisibleLength] = useState(0);

  useEffect(() => {
    setVisibleLength(0);

    const step = Math.max(1, Math.ceil(text.length / 120));

    const interval = window.setInterval(() => {
      setVisibleLength((current) => {
        const next = Math.min(text.length, current + step);

        if (next >= text.length) {
          window.clearInterval(interval);
        }

        return next;
      });
    }, 16);

    return () => {
      window.clearInterval(interval);
    };
  }, [text]);

  return <>{text.slice(0, visibleLength)}</>;
}

export default function AiInsightPanel({
  endpoint,
  range,
}: AiInsightPanelProps) {
  const [data, setData] = useState<AiInsightResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [requestVersion, setRequestVersion] = useState(0);

  const cacheKey = useMemo(
    () => `holansl-security:ai:${endpoint}:${range}`,
    [endpoint, range],
  );

  const requestUrl = useMemo(
    () => `${endpoint}?range=${encodeURIComponent(range)}`,
    [endpoint, range],
  );

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);
    setData(null);

    async function loadInsight() {
      try {
        const response = await fetchSessionCached<AiInsightResponse>({
          cacheKey,
          url: requestUrl,
          timeoutMs: AI_REQUEST_TIMEOUT_MS,
        });

        if (!response?.insight?.summary) {
          removeSecurityCache(cacheKey);

          throw new Error("The AI insight response was incomplete.");
        }

        if (active) {
          setData(response);
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
            "AI analysis took too long to respond. The normal system insight remains available.",
          );
        } else {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "AI insight is temporarily unavailable.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadInsight();

    return () => {
      /*
       * Do not cancel the shared request when the
       * user changes pagination, ordering or filters.
       */
      active = false;
    };
  }, [cacheKey, requestUrl, requestVersion]);

  function retry() {
    removeSecurityCache(cacheKey);

    setRequestVersion((current) => current + 1);
  }

  if (loading) {
    return (
      <Card className="border-violet-200 bg-violet-50/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Loader2 className="size-5 animate-spin text-violet-700" />
            AI security analysis
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />

          <p className="text-xs text-muted-foreground">
            AI analysis is being prepared separately. The activity table and
            normal system insight are already available.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-dashed border-violet-300 bg-violet-50/30">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-violet-700" />

            <div className="min-w-0">
              <p className="font-medium">AI analysis unavailable</p>

              <p className="mt-1 break-words text-sm text-muted-foreground">
                {error}
              </p>
            </div>
          </div>

          <Button type="button" variant="outline" onClick={retry}>
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { insight } = data;

  return (
    <Card className="overflow-hidden border-violet-200 bg-gradient-to-br from-violet-50 via-background to-blue-50">
      <CardHeader className="border-b border-violet-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="size-5 shrink-0 text-violet-700" />
              AI security analysis
            </CardTitle>

            {(data.provider || data.model) && (
              <p className="mt-1 break-words text-xs text-muted-foreground">
                {[data.provider, data.model].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={riskBadgeClass(insight.risk_level as RiskLevel)}
            >
              {insight.risk_level.toUpperCase()} RISK
            </Badge>

            {insight.requires_immediate_review && (
              <Badge variant="destructive">Immediate review</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-4 sm:p-5">
        <section className="animate-in fade-in slide-in-from-bottom-1 duration-500">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-violet-700" />
            Overview
          </h3>

          <p className="min-h-12 break-words text-sm leading-6 text-foreground/85">
            <TypewriterText text={insight.summary} />
          </p>
        </section>

        {insight.observations?.length ? (
          <section>
            <h3 className="mb-2 text-sm font-semibold">Observations</h3>

            <ul className="space-y-2 text-sm text-foreground/80">
              {insight.observations.map((observation) => (
                <li key={observation} className="flex min-w-0 gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-violet-600" />

                  <span className="min-w-0 break-words">{observation}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {insight.risk_indicators?.length ? (
          <section>
            <h3 className="mb-2 text-sm font-semibold">Risk indicators</h3>

            <div className="flex flex-wrap gap-2">
              {insight.risk_indicators.map((indicator) => (
                <Badge
                  key={indicator}
                  variant="outline"
                  className="max-w-full whitespace-normal border-violet-200 bg-white/60 text-left"
                >
                  {indicator}
                </Badge>
              ))}
            </div>
          </section>
        ) : null}

        {insight.recommendations?.length ? (
          <section>
            <h3 className="mb-3 text-sm font-semibold">Recommendations</h3>

            <div className="grid gap-3 lg:grid-cols-2">
              {insight.recommendations.map((recommendation) => (
                <div
                  key={`${recommendation.priority}-${recommendation.title}`}
                  className="min-w-0 rounded-lg border border-violet-100 bg-white/60 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="break-words font-medium">
                      {recommendation.title}
                    </p>

                    <Badge
                      variant="outline"
                      className={riskBadgeClass(
                        recommendation.priority as RiskLevel,
                      )}
                    >
                      {recommendation.priority}
                    </Badge>
                  </div>

                  <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">
                    {recommendation.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {insight.disclaimer && (
          <p className="break-words border-t pt-4 text-xs leading-5 text-muted-foreground">
            {insight.disclaimer}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
