"use client";
import { useState } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { JourneyMilestone } from "./JourneyMilestone";
import { Button } from "@/components/ui/button";
import type { Tracker } from "@/features/procurement/types";
import { text } from "@/features/procurement/types";
const readable = (value: string) => value.toLowerCase().replaceAll("_", " ");
export function ItemTracker({ tracker }: { tracker: Tracker }) {
  const [mode, setMode] = useState<"milestones" | "history">("milestones");
  return (
    <section className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Ordered", tracker.ordered_quantity],
          ["Accepted", tracker.accepted_quantity],
          ["Closed rejected", tracker.closed_rejected_quantity],
          ["Remaining", tracker.remaining_quantity],
        ].map(([name, value]) => (
          <div key={name} className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">{name}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-semibold">Item journey</h2>
        <div className="flex gap-2">
          <Button
            variant={mode === "milestones" ? "default" : "outline"}
            aria-pressed={mode === "milestones"}
            onClick={() => setMode("milestones")}
          >
            Milestones
          </Button>
          <Button
            variant={mode === "history" ? "default" : "outline"}
            aria-pressed={mode === "history"}
            onClick={() => setMode("history")}
          >
            History
          </Button>
        </div>
      </div>
      {mode === "milestones" ? (
        <ol className="relative mx-auto w-full max-w-5xl rounded-2xl border bg-card p-4 md:p-8">
          {tracker.milestones.map((milestone, index) => (
            <JourneyMilestone
              key={milestone.code}
              milestone={milestone}
              item={tracker.item}
              index={index}
            />
          ))}
        </ol>
      ) : (
        <div className="space-y-3">
          {tracker.events.length === 0 ? (
            <p>No events recorded.</p>
          ) : (
            tracker.events.map((event) => (
              <details key={event.id} className="rounded-xl border bg-card p-4">
                <summary className="cursor-pointer font-medium">
                  {readable(text(event.kind))}
                  <span className="ml-3 text-sm font-normal text-muted-foreground">
                    {text(event.created_by_name)} ·{" "}
                    {new Date(text(event.occurred_at)).toLocaleString()}
                  </span>
                </summary>
                <div className="mt-3 space-y-2 text-sm">
                  <p>Quantity: {text(event.quantity)}</p>
                  {!!event.reason && (
                    <p className="whitespace-pre-wrap">{text(event.reason)}</p>
                  )}
                  {!!event.document && (
                    <Link
                      className="text-primary underline"
                      href={`/api/procurement/documents/${event.document}/download/`}
                    >
                      Download supporting document
                    </Link>
                  )}
                </div>
              </details>
            ))
          )}
          <Link
            className="inline-block text-primary underline"
            href={`/dashboard/procurement/events?item=${tracker.item}`}
          >
            View all {tracker.event_count} events
          </Link>
        </div>
      )}
      <section className="space-y-3">
        <h3 className="font-heading text-lg font-semibold">
          Fulfilment attempts
        </h3>
        {tracker.attempts.length === 0 ? (
          <p className="text-muted-foreground">
            Attempts start when a client purchase order is recorded.
          </p>
        ) : (
          tracker.attempts.map((attempt, index) => (
            <div key={attempt.id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap gap-2">
                <RotateCcw className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">
                  Attempt {index + 1} · {readable(attempt.strategy)}
                </h4>
                <span className="text-sm text-muted-foreground">
                  {readable(attempt.status)}
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {Object.entries(attempt.quantities).map(([name, quantity]) => (
                  <div key={name}>
                    <dt className="text-sm capitalize text-muted-foreground">
                      {readable(name)}
                    </dt>
                    <dd className="font-medium tabular-nums">{quantity}</dd>
                  </div>
                ))}
              </dl>
              <Link
                className="mt-3 inline-block text-sm text-primary underline"
                href={`/dashboard/procurement/attempts/${attempt.id}`}
              >
                Open attempt
              </Link>
            </div>
          ))
        )}
      </section>
      <div className="rounded-xl border bg-muted p-4">
        <p className="font-medium">Financial milestones</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {tracker.finance.reason}
        </p>
      </div>
      {(tracker.previous_item || tracker.reorders.length > 0) && (
        <div className="space-y-2 rounded-xl border p-4">
          <h3 className="font-semibold">Related client orders</h3>
          {tracker.previous_item && (
            <Link
              className="block text-primary underline"
              href={`/dashboard/procurement/items/${tracker.previous_item}`}
            >
              Previous client order
            </Link>
          )}
          {tracker.reorders.map((id, index) => (
            <Link
              key={id}
              className="block text-primary underline"
              href={`/dashboard/procurement/items/${id}`}
            >
              Client reorder {index + 1}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
