import Link from "next/link";
import { cn } from "@/lib/utils";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { money } from "@/features/cash-book/types";
import type { LedgerKind } from "@/features/party-ledger/types";
import {
  BookFilters,
  BookPagination,
  bookQuery,
  type BookSearch,
} from "@/components/cash-book/BookFilters";

interface TransactionPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    id: string;
    date: string;
    transaction_type: string;
    amount: string;
    description: string;
    reference: string;
    running_balance: string;
    created_by_name: string;
    remaining_amount: string;
  }>;
  summary: {
    opening_balance: string;
    charges: string;
    payments: string;
    credits: string;
    invoices: string;
    refunds: string;
    closing_balance: string;
  };
}
export async function PartyTransactions({
  kind,
  partyId,
  search,
}: {
  kind: LedgerKind;
  partyId: string;
  search: BookSearch;
}) {
  const query = bookQuery(search);
  const currency = query.get("currency") ?? "NGN";
  const formatMoney = (v: string) => money(v, currency);
  let data: TransactionPage;
  try {
    data = await serverFetch<TransactionPage>(
      `/ledger/party-ledgers/${kind}/parties/${partyId}/transactions/?${query}`,
    );
  } catch (error) {
    return (
      <div className="space-y-3">
        <BookFilters query={query} />
        <p role="alert">
          {error instanceof ServerFetchError && error.status === 400
            ? "Choose a valid financial year and date range."
            : "Unable to load transactions. Please try again."}
        </p>
        <Link className="underline" href={`/dashboard/ledger/ledgers/${kind}`}>
          Reload ledger
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <BookFilters query={query} />
      <p className="text-sm text-muted-foreground">
        Currency: {currency} ·{" "}
        {kind === "sales"
          ? "Client balance due"
          : "Balance payable to supplier"}
        . A negative balance represents an advance or credit.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Opening balance", data.summary.opening_balance],
          ["Closing balance", data.summary.closing_balance],
          [
            kind === "sales" ? "Amount invoiced" : "Supplier bills",
            data.summary.invoices,
            "border-warning-border bg-warning-subtle text-warning-content",
          ],
          [
            kind === "sales" ? "Payments received" : "Payments made",
            data.summary.payments,
            kind === "sales"
              ? "border-success-border bg-success-subtle text-success-content"
              : "border-destructive-border bg-destructive-subtle text-destructive-content",
          ],
          [
            "Refunds",
            data.summary.refunds,
            kind === "sales"
              ? "border-destructive-border bg-destructive-subtle text-destructive-content"
              : "border-success-border bg-success-subtle text-success-content",
          ],
        ].map(([label, amount, color]) => (
          <div
            key={label}
            className={cn("min-w-0 rounded-lg border p-3", color)}
          >
            <p className={cn("text-sm", !color && "text-muted-foreground")}>
              {label}
            </p>
            <p className="mt-1 break-words text-lg font-semibold tabular-nums">
              {formatMoney(amount)}
            </p>
          </div>
        ))}
      </div>
      {data.results.length === 0 ? (
        <p className="rounded-md bg-muted p-5 text-center">
          No transactions in this period.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.results.map((row) => (
            <li key={row.id} className="space-y-2 rounded-lg border p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-sm">
                  {row.date} · {row.transaction_type.toLowerCase()}
                </span>
                <span className="font-semibold tabular-nums">
                  {formatMoney(row.amount)}
                </span>
              </div>
              <p className="break-words">{row.description}</p>
              <p className="break-words text-sm text-muted-foreground">
                {row.reference || "No reference"} · Recorded by{" "}
                {row.created_by_name}
              </p>
              <p className="text-sm">
                Balance: {formatMoney(row.running_balance)}
              </p>
              <p className="text-sm text-muted-foreground">
                {row.transaction_type === "PAYMENT"
                  ? "Currently unallocated"
                  : "Currently outstanding"}
                : {formatMoney(row.remaining_amount)}
              </p>
            </li>
          ))}
        </ul>
      )}
      <BookPagination
        query={query}
        count={data.count}
        previous={data.previous}
        next={data.next}
        pathname={`/dashboard/ledger/ledgers/${kind}`}
      />
    </div>
  );
}
