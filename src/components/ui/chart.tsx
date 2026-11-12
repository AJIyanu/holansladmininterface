"use client";

import * as React from "react";
import {
  Legend,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
} from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  { label: React.ReactNode; color: string }
>;

export function ChartContainer({
  config,
  className,
  children,
}: {
  config: ChartConfig;
  className?: string;
  children: React.ReactElement;
}) {
  const style = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [
      `--color-${key}`,
      value.color,
    ]),
  ) as React.CSSProperties;
  return (
    <div
      data-slot="chart"
      className={cn("h-72 w-full text-xs", className)}
      style={style}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export const ChartTooltip = Tooltip;
export const ChartLegend = Legend;

export function ChartTooltipContent({
  active,
  payload,
  label,
  valueFormatter,
}: Partial<TooltipContentProps<number, string>> & {
  valueFormatter?: (value: number) => React.ReactNode;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-36 rounded-lg border bg-popover p-3 text-popover-foreground shadow-md">
      {label ? <p className="mb-2 font-medium">{String(label)}</p> : null}
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div
            key={`${entry.dataKey?.toString()}-${index}`}
            className="flex items-center justify-between gap-4"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="size-2.5 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-mono font-medium tabular-nums">
              {valueFormatter
                ? valueFormatter(Number(entry.value ?? 0))
                : Number(entry.value ?? 0).toLocaleString("en-NG")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
