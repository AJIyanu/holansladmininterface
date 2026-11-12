import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, titleCase } from "./format";
import type { RequestedItem } from "./types";

export function TrackerCards({ items }: { items: RequestedItem[] }) {
  if (!items.length)
    return (
      <div className="rounded-2xl border bg-card p-10 text-center">
        <h2 className="font-heading text-xl font-semibold">
          No trackers found
        </h2>
        <p className="mt-2 text-muted-foreground">
          Every newly registered item will appear here automatically.
        </p>
      </div>
    );
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/dashboard/procurement/requesttracks/items/${item.id}`}
          className="group rounded-2xl border bg-card p-5 shadow-sm transition hover:border-primary/40"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">
                {item.client_name}
              </p>
              <h2 className="mt-1 font-heading text-xl font-semibold">
                {item.name}
              </h2>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {item.code}
              </p>
            </div>
            <Badge className={statusClass(item.status)}>
              {titleCase(item.status)}
            </Badge>
          </div>
          <div className="mt-6">
            <div className="flex items-center">
              <Milestone active label="Received" /> <Line active />
              <Milestone active={item.activity_count > 1} label="Active" />{" "}
              <Line
                active={item.status === "DELIVERED" || item.status === "CLOSED"}
              />
              <Milestone
                active={item.status === "DELIVERED" || item.status === "CLOSED"}
                label={item.status === "CLOSED" ? "Closed" : "Delivered"}
              />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4 text-sm">
            <span className="text-muted-foreground">
              Latest: {item.latest_activity?.title || "Request received"} ·{" "}
              {formatDate(
                item.latest_activity?.occurred_at || item.received_at,
                true,
              )}
            </span>
            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </div>
        </Link>
      ))}
    </div>
  );
}

function statusClass(status: RequestedItem["status"]) {
  return {
    OPEN: "border-info-border bg-info-subtle text-info-content",
    CLOSED:
      "border-destructive-border bg-destructive-subtle text-destructive-content",
    DELIVERED: "border-success-border bg-success-subtle text-success-content",
    SUSPENDED: "border-warning-border bg-warning-subtle text-warning-content",
  }[status];
}

function Milestone({ active, label }: { active: boolean; label: string }) {
  const Icon = active ? CheckCircle2 : Circle;
  return (
    <span className="flex shrink-0 flex-col items-center gap-1 text-xs">
      <Icon
        className={`size-5 ${active ? "text-success" : "text-muted-foreground"}`}
      />
      <span>{label}</span>
    </span>
  );
}
function Line({ active }: { active: boolean }) {
  return (
    <span
      className={`mx-2 mb-5 h-0.5 min-w-4 flex-1 ${active ? "bg-success" : "bg-border"}`}
    />
  );
}
