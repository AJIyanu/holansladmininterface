"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { money } from "@/features/cash-book/types";
import type { PurchaseRecord } from "@/features/purchases/types";

export function PurchaseRecordCard({
  row,
  kind,
}: {
  row: PurchaseRecord;
  kind: "bills" | "payments";
}) {
  const payment = kind === "payments";
  const title = payment
    ? row.evidence?.[0]?.receipt_number || "Payment — receipt number pending"
    : row.reference || "Supplier invoice";
  const format = (amount: string) => money(amount, row.currency);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex w-full flex-wrap justify-between gap-2 rounded border bg-card p-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`View ${payment ? "supplier payment" : "supplier invoice"}: ${title}`}
        >
          <span className="min-w-0 break-words font-semibold">{title}</span>
          <span className="flex flex-wrap gap-x-2 text-sm">
            <span>{row.date}</span>
            <span>{format(payment ? (row.paid ?? "0") : row.subtotal)}</span>
            <span>
              {row.reversed
                ? "Reversed"
                : payment
                  ? "Paid"
                  : row.delivered_at
                    ? "Delivered"
                    : "Not delivered"}
            </span>
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="break-words">{title}</DialogTitle>
          <DialogDescription>
            {payment ? "Supplier payment" : "Supplier invoice"} · {row.date} ·{" "}
            {row.currency}
          </DialogDescription>
        </DialogHeader>
        {row.reversed && (
          <p className="rounded border border-destructive p-3 text-destructive">
            This posting has been reversed. Its original record is retained.
          </p>
        )}
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">
              {payment ? "Amount paid" : "Invoice value"}
            </dt>
            <dd className="font-semibold tabular-nums">
              {format(payment ? (row.paid ?? "0") : row.snapshot.total)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Recorded by</dt>
            <dd className="break-words">{row.actor_name || "Not available"}</dd>
          </div>
          {!payment && (
            <div>
              <dt className="text-sm text-muted-foreground">Delivery status</dt>
              <dd>
                {row.delivered_at
                  ? `Delivered on ${row.delivered_at}`
                  : "Not delivered — outside supplier debt"}
              </dd>
            </div>
          )}
          {payment && row.evidence?.[0]?.receipt_number && (
            <div>
              <dt className="text-sm text-muted-foreground">Receipt number</dt>
              <dd className="break-words">{row.evidence[0].receipt_number}</dd>
            </div>
          )}
          {row.snapshot.description && (
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">Description</dt>
              <dd className="break-words">{row.snapshot.description}</dd>
            </div>
          )}
        </dl>
        <div className="flex flex-wrap justify-end gap-3">
          <Link
            className="rounded-md border px-4 py-2 text-sm underline"
            href={`/dashboard/ledger/purchase/${kind}/${row.id}`}
          >
            Open full details
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
