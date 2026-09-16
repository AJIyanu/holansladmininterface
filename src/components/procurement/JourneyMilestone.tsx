"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Package,
  FileText,
  Truck,
  Inbox,
  RotateCcw,
  CreditCard,
} from "lucide-react";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatHumanValue,
  type Entity,
  type Page,
  type Tracker,
  text,
} from "@/features/procurement/types";

const readable = (value: string) => value.toLowerCase().replaceAll("_", " ");
const date = (value: unknown) => formatHumanValue(value);
const references: Record<string, string> = {
  attempt: "attempts",
  supplier_offer: "supplier-quotations",
  quote_revision: "quotation-revisions",
  outcome_line: "outcome-lines",
  rejection_action: "rejection-actions",
  related_item: "items",
};

export function JourneyMilestone({
  milestone,
  item,
  index,
}: {
  milestone: Tracker["milestones"][number];
  item: string;
  index: number;
}) {
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<Entity[] | null>(null);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keepOpen = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 250);
  };
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetch(
      `/api/procurement/events/?item=${item}&milestone=${milestone.code}&page=${page}&page_size=20`,
      { signal: controller.signal, cache: "no-store" },
    )
      .then(async (response) => {
        if (!response.ok)
          throw new Error(
            response.status === 403
              ? "You do not have permission to view the full event history."
              : "Could not load milestone details. Close and reopen to retry.",
          );
        return response.json() as Promise<Page<Entity>>;
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setEvents(data.results);
          setMore(Boolean(data.next));
          setLoading(false);
          setError("");
        }
      })
      .catch((failure) => {
        if (!controller.signal.aborted) {
          setError(failure.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [open, item, milestone.code, page]);
  const occurred = ["RECORDED", "COMPLETED", "PARTIAL", "EXCEPTION"].includes(
    milestone.state,
  );
  const Icon =
    milestone.code === "REQUEST_RECEIVED"
      ? Inbox
      : milestone.code.includes("QUOTATION") ||
          milestone.code.includes("INVOICE")
        ? FileText
        : milestone.code.includes("WAYBILLED")
          ? Truck
          : milestone.code.includes("PAYMENT")
            ? CreditCard
            : milestone.code.includes("REORDER")
              ? RotateCcw
              : Package;
  const Status =
    milestone.state === "EXCEPTION"
      ? AlertTriangle
      : occurred
        ? CheckCircle2
        : Circle;
  const latest = milestone.latest_event;
  const rows = events?.length
    ? events
    : milestone.code === "REQUEST_RECEIVED" && latest
      ? [latest]
      : [];
  return (
    <li className="relative grid min-h-44 items-center py-5 pl-8 md:grid-cols-[1fr_5rem_1fr] md:pl-0">
      <svg
        aria-hidden="true"
        className="absolute inset-y-0 left-0 h-full w-6 text-border md:left-1/2 md:w-20 md:-translate-x-1/2"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d={
            index % 2
              ? "M50 0 C100 25 100 25 50 50 C0 75 0 75 50 100"
              : "M50 0 C0 25 0 25 50 50 C100 75 100 75 50 100"
          }
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="1 7"
          strokeLinecap="round"
        />
      </svg>
      <span
        aria-hidden="true"
        className={`absolute left-1.5 z-10 size-3 rounded-full border-2 border-background ring-2 md:left-1/2 md:-translate-x-1/2 ${occurred ? "bg-primary ring-primary" : "bg-muted-foreground ring-muted-foreground"}`}
      />
      <div className={index % 2 ? "md:col-start-3" : "md:col-start-1"}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor asChild>
            <button
              type="button"
              onMouseEnter={keepOpen}
              onMouseLeave={closeSoon}
              onFocus={keepOpen}
              onClick={keepOpen}
              onKeyDown={(event) => {
                if (["Enter", " ", "ArrowDown"].includes(event.key)) {
                  event.preventDefault();
                  keepOpen();
                  requestAnimationFrame(() => panelRef.current?.focus());
                }
              }}
              aria-controls={open ? panelId : undefined}
              aria-expanded={open}
              aria-haspopup="dialog"
              className={`relative flex w-full items-center gap-4 rounded-[2.5rem] border p-5 text-left shadow-md transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${index % 2 ? "md:flex-row-reverse" : ""} ${milestone.state === "EXCEPTION" ? "border-destructive/30 bg-destructive/10" : occurred ? "border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5" : "border-border bg-gradient-to-br from-muted to-card"}`}
            >
              <div className="min-w-0 flex-1 space-y-2">
                <p className="font-semibold">{milestone.label}</p>
                <p className="flex items-center gap-1.5 text-xs capitalize text-muted-foreground">
                  <Status className="size-3.5 shrink-0" />
                  {readable(milestone.state)}
                </p>
                {latest ? (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {text(latest.created_by_name)}
                    <br />
                    {date(latest.occurred_at)}
                    {latest.quantity != null && (
                      <>
                        <br />
                        Quantity: {text(latest.quantity)}
                      </>
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {milestone.state === "INTEGRATION_UNAVAILABLE"
                      ? "Awaiting ledger integration"
                      : "No activity recorded yet"}
                  </p>
                )}
                <p className="text-xs font-medium text-primary">
                  {milestone.event_count || 0} recorded activities · View
                  details
                </p>
              </div>
              <span className="flex size-16 shrink-0 items-center justify-center rounded-full border bg-background shadow-lg lg:size-20">
                <Icon
                  className={`size-7 ${occurred ? "text-primary" : "text-muted-foreground"}`}
                />
              </span>
            </button>
          </PopoverAnchor>
          <PopoverContent
            id={panelId}
            ref={panelRef}
            tabIndex={-1}
            onMouseEnter={keepOpen}
            onMouseLeave={closeSoon}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            side={index % 2 ? "left" : "right"}
            sideOffset={12}
            className="max-h-[70vh] w-[min(30rem,calc(100vw-2rem))] overflow-y-auto p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="font-semibold">{milestone.label}</h3>
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : loading || events === null ? (
              <div role="status" aria-label="Loading milestone history">
                <Skeleton className="h-28 w-full" />
              </div>
            ) : rows.length ? (
              <div className="space-y-4">
                {rows.map((event) => (
                  <article
                    key={event.id}
                    className="space-y-2 rounded-xl border p-4 text-sm"
                  >
                    <p className="font-semibold capitalize">
                      {readable(text(event.kind))}
                    </p>
                    <p>
                      {text(event.created_by_name)} · {date(event.occurred_at)}
                    </p>
                    {event.quantity != null && (
                      <p>Quantity: {text(event.quantity)}</p>
                    )}
                    {Boolean(event.reason) && (
                      <p className="whitespace-pre-wrap">
                        {text(event.reason)}
                      </p>
                    )}
                    {Boolean(event.created_at) && (
                      <p className="text-xs text-muted-foreground">
                        Recorded: {date(event.created_at)}
                      </p>
                    )}
                    {Boolean(event.details) &&
                      typeof event.details === "object" && (
                        <dl className="space-y-2">
                          {Object.entries(
                            event.details as Record<string, unknown>,
                          )
                            .filter(
                              ([, value]) => value !== null && value !== "",
                            )
                            .map(([key, value]) => (
                              <div key={key}>
                                <dt className="text-xs capitalize text-muted-foreground">
                                  {readable(key)}
                                </dt>
                                <dd className="break-words whitespace-pre-wrap">
                                  {text(value)}
                                </dd>
                              </div>
                            ))}
                        </dl>
                      )}
                    {Object.entries(references)
                      .filter(([key]) => event[key] && key !== "supplier_offer")
                      .map(([key, route]) => (
                        <Link
                          key={key}
                          className="block text-primary underline"
                          href={`/dashboard/procurement/${route}/${event[key]}`}
                        >
                          Open {readable(key)}
                        </Link>
                      ))}
                    <Link
                      className="block text-primary underline"
                      href={`/dashboard/procurement/events?item=${item}&milestone=${milestone.code}`}
                    >
                      All milestone records and references
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No activity recorded for this milestone.
              </p>
            )}
            <div className="mt-4 flex gap-2">
              {page > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => {
                    setLoading(true);
                    setPage(page - 1);
                  }}
                >
                  Previous
                </Button>
              )}
              {more && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => {
                    setLoading(true);
                    setPage(page + 1);
                  }}
                >
                  More activity
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </li>
  );
}
