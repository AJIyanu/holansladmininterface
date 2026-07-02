"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SummaryUnavailableProps {
  message?: string;
  onRetry?: () => void;
}

export default function SummaryUnavailable({
  message = "Activity records are still available below.",
  onRetry,
}: SummaryUnavailableProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-dashed bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />

        <div className="min-w-0">
          <p className="font-medium">Summary temporarily unavailable</p>

          <p className="mt-1 break-words text-sm text-muted-foreground">
            {message}
          </p>
        </div>
      </div>

      {onRetry && (
        <Button type="button" variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      )}
    </div>
  );
}
