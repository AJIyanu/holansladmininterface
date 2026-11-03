import Link from "next/link";
import { requireCashBook } from "@/features/cash-book/access";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import {
  money,
  accountNames,
  type JournalEntry,
  type Page,
} from "@/features/cash-book/types";
import {
  BookFilters,
  BookPagination,
  bookQuery,
  type BookSearch,
} from "@/components/cash-book/BookFilters";

export const metadata = { title: "Cash-book journal | HolanSL" };
export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<BookSearch>;
}) {
  const user = await requireCashBook(true);
  const query = bookQuery(await searchParams);
  const linkedQuery = new URLSearchParams(query);
  linkedQuery.delete("page");
  let data: Page<JournalEntry>;
  try {
    data = await serverFetch<Page<JournalEntry>>(
      `/ledger/cash-book-journal/?${query}`,
    );
  } catch (error) {
    return (
      <main className="space-y-4 p-4 md:p-6">
        <h1 className="font-heading text-3xl font-bold">
          Double-entry journal
        </h1>
        <BookFilters query={query} />
        <p role="alert">
          {error instanceof ServerFetchError && error.status === 400
            ? "Choose a valid financial year and date range."
            : error instanceof ServerFetchError && error.status === 403
              ? "You no longer have permission to view the journal."
              : "The journal could not be loaded. Please try again."}
        </p>
        <Link className="underline" href="/dashboard/ledger/journal">
          Reload journal
        </Link>
      </main>
    );
  }
  return (
    <main className="space-y-6 p-4 md:p-6">
      <header className="space-y-2">
        {hasPermission(user, "ledger.cashbookentry.view") && (
          <Link
            className="text-sm underline"
            href={`/dashboard/ledger?${linkedQuery}`}
          >
            Back to cash book
          </Link>
        )}
        <p className="text-sm text-muted-foreground">Accounts · NGN</p>
        <h1 className="font-heading text-3xl font-bold">
          Double-entry journal
        </h1>
        <p className="text-muted-foreground">
          Each entry has an equal debit and credit. Corrections and deletions
          retain the original entry and add a reversal.
        </p>
      </header>
      <BookFilters query={query} />
      {data.results.length === 0 && (
        <p className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
          No journal entries in this period.
        </p>
      )}
      <div className="space-y-4">
        {data.results.map((entry) => (
          <article
            key={entry.id}
            className="overflow-hidden rounded-xl border bg-card"
          >
            <div className="space-y-2 border-b p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm">{entry.date}</span>
                <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                  {entry.reverses ? "Reversal" : "Entry"}
                </span>
              </div>
              <h2 className="break-words font-semibold">{entry.description}</h2>
              <p className="break-words text-sm text-muted-foreground">
                {entry.reference || "No reference"} · Recorded by{" "}
                {entry.actor_name} ·{" "}
                {new Date(entry.created_at).toLocaleString("en-NG", {
                  timeZone: "Africa/Lagos",
                })}
              </p>
              {entry.reason && (
                <p className="break-words text-sm">Reason: {entry.reason}</p>
              )}
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer">Record identifiers</summary>
                <p className="mt-2 break-all">Journal: {entry.id}</p>
                <p className="break-all">Cash-book entry: {entry.entry}</p>
                {entry.reverses && (
                  <p className="break-all">
                    Reverses journal: {entry.reverses}
                  </p>
                )}
              </details>
            </div>
            <dl className="grid gap-4 p-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">
                  Debit ·{" "}
                  {accountNames[entry.debit_account] ?? entry.debit_account}
                </dt>
                <dd className="mt-1 break-words font-semibold tabular-nums">
                  {money(entry.amount)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  Credit ·{" "}
                  {accountNames[entry.credit_account] ?? entry.credit_account}
                </dt>
                <dd className="mt-1 break-words font-semibold tabular-nums">
                  {money(entry.amount)}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
      <BookPagination
        query={query}
        count={data.count}
        previous={data.previous}
        next={data.next}
        pathname="/dashboard/ledger/journal"
      />
    </main>
  );
}
