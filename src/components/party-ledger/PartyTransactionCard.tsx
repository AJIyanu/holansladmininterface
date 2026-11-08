"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { money } from "@/features/cash-book/types";
import type { LedgerKind } from "@/features/party-ledger/types";

interface Transaction {
  id: string;
  date: string;
  transaction_type: string;
  amount: string;
  description: string;
  reference: string;
  running_balance: string;
  created_by_name: string;
  remaining_amount: string;
}

export function PartyTransactionCard({
  row,
  kind,
  currency,
}: {
  row: Transaction;
  kind: LedgerKind;
  currency: string;
}) {
  const amountLabel =
    row.transaction_type === "PAYMENT"
      ? kind === "sales"
        ? "Payment received"
        : "Payment made"
      : "Transaction amount";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="w-full space-y-2 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`View ${row.transaction_type.toLowerCase()} transaction dated ${row.date}`}
        >
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm">
              {row.date} · {row.transaction_type.toLowerCase()}
            </span>
            <span className="font-semibold tabular-nums">
              {money(row.amount, currency)}
            </span>
          </span>
          <span className="block break-words">{row.description}</span>
          <span className="block break-words text-sm text-muted-foreground">
            {row.reference || "No reference"} · Recorded by{" "}
            {row.created_by_name}
          </span>
          <span className="block text-sm">
            Balance: {money(row.running_balance, currency)}
          </span>
          <span className="block text-sm text-muted-foreground">
            {row.transaction_type === "PAYMENT"
              ? "Currently unallocated"
              : "Currently outstanding"}
            : {money(row.remaining_amount, currency)}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="break-words">
            {row.description || "Ledger transaction"}
          </DialogTitle>
          <DialogDescription className="break-words">
            {row.date} · {row.transaction_type.toLowerCase()} ·{" "}
            {row.reference || "No reference"}
          </DialogDescription>
        </DialogHeader>
        <dl className="grid min-w-0 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">{amountLabel}</dt>
            <dd className="break-words font-semibold tabular-nums">
              {money(row.amount, currency)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Running balance</dt>
            <dd className="break-words font-semibold tabular-nums">
              {money(row.running_balance, currency)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">
              {row.transaction_type === "PAYMENT"
                ? "Unallocated amount"
                : "Outstanding amount"}
            </dt>
            <dd className="break-words font-semibold tabular-nums">
              {money(row.remaining_amount, currency)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Recorded by</dt>
            <dd>{row.created_by_name || "Not available"}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Ledger</dt>
            <dd>{kind === "sales" ? "Sales ledger" : "Purchase ledger"}</dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  );
}
