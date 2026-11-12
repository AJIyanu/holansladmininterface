"use client";

import {
  AlertCircle,
  Bot,
  Minus,
  RefreshCw,
  Sparkles,
  Triangle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAnalyticsCached, removeAnalyticsCache } from "./analytics-cache";
import type {
  AnalyticsRange,
  AnalyticsResponse,
  ProcurementAiResponse,
} from "./analytics-types";

const ranges: Array<{ value: AnalyticsRange; label: string }> = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
  { value: "year", label: "Year" },
];
const deliveredConfig = {
  count: { label: "Delivered items", color: "var(--chart-1)" },
} satisfies ChartConfig;
const clientConfig = {
  count: { label: "Items received", color: "var(--chart-2)" },
} satisfies ChartConfig;
const ratioConfig = {
  ratio_percent: { label: "Delivery ratio", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function AnalyticsDashboard() {
  const [range, setRange] = useState<AnalyticsRange>("year");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const cacheKey = `holansl-procurement:analytics:${range}`;

  useEffect(() => {
    let active = true;
    void fetchAnalyticsCached<AnalyticsResponse>(
      cacheKey,
      `/api/procurement/analytics/summary?range=${range}`,
      30_000,
    )
      .then((response) => {
        if (!response?.cards)
          throw new Error("The analytics response was incomplete.");
        if (active) setData(response);
      })
      .catch((requestError) => {
        if (active)
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Procurement analytics are unavailable.",
          );
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [cacheKey, range, version]);

  function retry() {
    removeAnalyticsCache(cacheKey);
    setLoading(true);
    setError(null);
    setData(null);
    setVersion((current) => current + 1);
  }

  function changeRange(next: AnalyticsRange) {
    setLoading(true);
    setError(null);
    setData(null);
    setRange(next);
  }

  return (
    <main className="space-y-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Procurement</p>
          <h1 className="font-heading text-3xl font-bold">Analytics</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Item demand, delivery movement and operational performance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Analytics period">
          {ranges.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={range === option.value ? "default" : "outline"}
              onClick={() => changeRange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </header>
      {loading ? (
        <AnalyticsSkeleton />
      ) : error || !data ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-3">
              <AlertCircle className="size-5 text-destructive" />
              <div>
                <p className="font-medium">Analytics unavailable</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
            <Button variant="outline" onClick={retry}>
              <RefreshCw className="size-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <AnalyticsContent data={data} range={range} />
      )}
      <ProcurementAiPanel key={range} range={range} />
    </main>
  );
}

function AnalyticsContent({
  data,
  range,
}: {
  data: AnalyticsResponse;
  range: AnalyticsRange;
}) {
  const [clientId, setClientId] = useState(
    data.client_monthly_ratios[0]?.client_id || "",
  );
  const effectiveClientId = data.client_monthly_ratios.some(
    (client) => client.client_id === clientId,
  )
    ? clientId
    : data.client_monthly_ratios[0]?.client_id || "";
  const selected = data.client_monthly_ratios.find(
    (client) => client.client_id === effectiveClientId,
  );
  const metrics = [
    ["Items received", data.cards.received],
    ["Active · Open", data.cards.active],
    ["Suspended", data.cards.suspended],
    ["Closed", data.cards.closed],
    ["Delivered", data.cards.delivered],
    ["Not delivered", data.cards.not_delivered],
  ] as const;
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm text-muted-foreground">
          {data.date_from} to {data.date_to} · {range}
        </p>
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {metrics.map(([label, value]) => (
            <Card key={label} className="gap-2 p-4 sm:p-5">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="font-heading text-3xl font-bold tabular-nums">
                {value.toLocaleString("en-NG")}
              </p>
            </Card>
          ))}
        </section>
      </div>
      <OpenComparison comparison={data.open_comparison} />
      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Items delivered by month"
          description="January to December of the current year"
        >
          <ChartContainer config={deliveredConfig}>
            <BarChart data={data.delivered_by_month} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                name="Delivered"
                fill="var(--color-count)"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </ChartCard>
        <ChartCard
          title="Items received per client"
          description={`Clients with requests in the selected ${range}`}
        >
          <div className="max-h-96 overflow-y-auto">
            <div
              style={{
                height: Math.max(288, data.received_by_client.length * 42),
              }}
            >
              <ChartContainer config={clientConfig} className="h-full">
                <BarChart
                  data={data.received_by_client}
                  layout="vertical"
                  accessibilityLayer
                  margin={{ left: 16 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" allowDecimals={false} hide />
                  <YAxis
                    type="category"
                    dataKey="client_name"
                    width={120}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    name="Received"
                    fill="var(--color-count)"
                    radius={[0, 5, 5, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </ChartCard>
      </section>
      <ChartCard
        title="Monthly received-to-delivered ratio"
        description="Delivery percentage for the selected client in the current year"
        action={
          data.client_monthly_ratios.length ? (
            <Select value={effectiveClientId} onValueChange={setClientId}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Choose client" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-md">
                {data.client_monthly_ratios.map((client) => (
                  <SelectItem key={client.client_id} value={client.client_id}>
                    {client.client_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null
        }
      >
        {selected ? (
          <ChartContainer config={ratioConfig}>
            <LineChart data={selected.months} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis
                domain={[0, "auto"]}
                tickFormatter={(value) => `${value}%`}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    valueFormatter={(value) => `${value}%`}
                  />
                }
              />
              <ChartLegend />
              <Line
                type="monotone"
                dataKey="ratio_percent"
                name="Delivery ratio"
                stroke="var(--color-ratio_percent)"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <EmptyChart />
        )}
      </ChartCard>
    </div>
  );
}

function OpenComparison({
  comparison,
}: {
  comparison: AnalyticsResponse["open_comparison"];
}) {
  const up = comparison.difference > 0;
  const down = comparison.difference < 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Items still open</CardTitle>
        <CardDescription>
          Current open items compared with the open-item snapshot seven days ago
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-heading text-4xl font-bold">
            {comparison.current_week.toLocaleString("en-NG")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Previous week: {comparison.previous_week.toLocaleString("en-NG")}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 font-semibold ${up ? "text-destructive" : down ? "text-success" : "text-muted-foreground"}`}
        >
          {up || down ? (
            <Triangle
              className={`size-5 fill-current ${down ? "rotate-180" : ""}`}
            />
          ) : (
            <Minus className="size-5" />
          )}
          {Math.abs(comparison.percent_change).toLocaleString("en-NG")}%{" "}
          {up ? "increase" : down ? "decrease" : "unchanged"}
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
function EmptyChart() {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
      No data is available for this period.
    </div>
  );
}
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6" role="status">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-xl" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}

function ProcurementAiPanel({ range }: { range: AnalyticsRange }) {
  const [data, setData] = useState<ProcurementAiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const key = useMemo(() => `holansl-procurement:ai:${range}`, [range]);
  useEffect(() => {
    let active = true;
    void fetchAnalyticsCached<ProcurementAiResponse>(
      key,
      `/api/procurement/analytics/ai-insight?range=${range}`,
      90_000,
    )
      .then((response) => {
        if (!response?.insight?.summary)
          throw new Error("The AI analysis response was incomplete.");
        if (active) setData(response);
      })
      .catch((requestError) => {
        if (active)
          setError(
            requestError instanceof Error
              ? requestError.message
              : "AI analysis is unavailable.",
          );
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [key, range, version]);
  if (loading)
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="size-5 text-primary" /> AI Procurement analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-10/12" />
          <Skeleton className="h-4 w-8/12" />
        </CardContent>
      </Card>
    );
  if (error || !data)
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-medium">AI analysis unavailable</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              removeAnalyticsCache(key);
              setLoading(true);
              setError(null);
              setData(null);
              setVersion((current) => current + 1);
            }}
          >
            <RefreshCw className="size-4" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  const insight = data.insight;
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-primary/5 via-background to-info-subtle">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" /> AI Procurement analysis
        </CardTitle>
        <CardDescription>
          {[data.provider, data.model].filter(Boolean).join(" · ")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="leading-7">{insight.summary}</p>
        <InsightList title="Observations" values={insight.observations} />
        <InsightList
          title="Delivery concerns"
          values={insight.delivery_concerns}
        />
        <InsightList title="Demand patterns" values={insight.demand_patterns} />
        <InsightList title="Recommendations" values={insight.recommendations} />
        {insight.disclaimer && (
          <p className="border-t pt-4 text-xs text-muted-foreground">
            {insight.disclaimer}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function InsightList({ title, values }: { title: string; values: string[] }) {
  if (!values?.length) return null;
  return (
    <section>
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
        {values.map((value) => (
          <li key={value} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
