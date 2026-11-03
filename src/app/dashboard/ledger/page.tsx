import Link from "next/link";
import { requireCashBook } from "@/features/cash-book/access";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { money, type CashPage } from "@/features/cash-book/types";
import { EntryForm, VoidEntry } from "@/components/cash-book/EntryForm";
import {
  BookFilters,
  BookPagination,
  bookQuery,
  type BookSearch,
} from "@/components/cash-book/BookFilters";

export const metadata = { title: "Cash book | HolanSL" };

export default async function CashBookPage({
  searchParams,
}: {
  searchParams: Promise<BookSearch>;
}) {
  const user = await requireCashBook();
  const query = bookQuery(await searchParams);
  const linkedQuery = new URLSearchParams(query);
  linkedQuery.delete("page");
  let data: CashPage;
  try {
    data = await serverFetch<CashPage>(`/ledger/cash-book/?${query}`);
  } catch (error) {
    return (
      <main className="space-y-4 p-4 md:p-6">
        <h1 className="font-heading text-3xl font-bold">Cash book</h1>
        <BookFilters query={query} />
        <p role="alert">
          {error instanceof ServerFetchError && error.status === 400
            ? "Choose a valid financial year and date range."
            : error instanceof ServerFetchError && error.status === 403
              ? "You no longer have permission to view the cash book."
              : "The cash book could not be loaded. Please try again."}
        </p>
        <Link className="underline" href="/dashboard/ledger">
          Reload cash book
        </Link>
      </main>
    );
  }
  const canEdit = hasPermission(user, "ledger.cashbookentry.edit");
  const canDelete = hasPermission(user, "ledger.cashbookentry.delete");
  return (
    <main className="space-y-6 p-4 md:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Accounts · NGN</p>
          <h1 className="font-heading text-3xl font-bold">Cash book</h1>
          <p className="mt-2 text-muted-foreground">
            Record money in and expenses. Every entry balances in the journal.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {hasPermission(user, "ledger.cashbookjournal.view") && (
            <Link
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              href={`/dashboard/ledger/journal?${linkedQuery}`}
            >
              Double-entry journal
            </Link>
          )}
          {hasPermission(user, "ledger.cashbookentry.create") && <EntryForm />}
        </div>
      </header>
      <BookFilters query={query} />
      <section
        aria-label="Cash summary"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          ["Opening balance", data.summary.opening_balance],
          ["Money in · Debit", data.summary.debit],
          ["Money out · Credit", data.summary.credit],
          ["Closing balance", data.summary.closing_balance],
        ].map(([label, amount]) => (
          <div key={label} className="min-w-0 rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 break-words text-xl font-semibold tabular-nums">
              {money(amount)}
            </p>
          </div>
        ))}
      </section>
      <p className="text-sm text-muted-foreground">
        {data.summary.date_from} to {data.summary.date_to}. Initial opening
        balance is ₦0.00; previous entries carry forward.
      </p>
      {data.summary.closing_balance.startsWith("-") && (
        <p
          role="status"
          className="rounded-md border border-warning bg-warning-subtle p-3 text-warning-content"
        >
          The recorded cash balance is negative. Review missing receipts or
          incorrect expenses.
        </p>
      )}
      {data.results.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <h2 className="font-heading text-xl font-semibold">
            No entries in this period
          </h2>
          <p className="mt-2 text-muted-foreground">
            Receipts and expenses will appear here when recorded.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {data.results.map((entry) => (
              <article
                key={entry.id}
                className="space-y-3 rounded-xl border bg-card p-4"
              >
                <div className="flex justify-between gap-3">
                  <span>{entry.date}</span>
                  <span className="font-semibold">
                    {entry.kind === "EXPENSE" ? "Credit" : "Debit"}{" "}
                    {money(entry.amount)}
                  </span>
                </div>
                <p className="break-words">{entry.description}</p>
                <p className="break-words text-sm text-muted-foreground">
                  {entry.reference || "No reference"} · Recorded by{" "}
                  {entry.created_by_name}
                </p>
                <p className="text-sm">
                  Balance: {money(entry.running_balance ?? "0.00")}
                </p>
                <div className="flex gap-2">
                  {canEdit && (
                    <EntryForm
                      key={`${entry.id}-${entry.version}`}
                      entry={entry}
                    />
                  )}
                  {canDelete && <VoidEntry entry={entry} />}
                </div>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-xl border md:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                NGN cash-book transactions with running balance
              </caption>
              <thead className="bg-muted">
                <tr>
                  {[
                    "Date",
                    "Description / reference",
                    "Debit (in)",
                    "Credit (out)",
                    "Balance",
                    "Recorded by",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-4 py-3 font-medium"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.results.map((entry) => (
                  <tr key={entry.id} className="border-t align-top">
                    <td className="whitespace-nowrap px-4 py-3">
                      {entry.date}
                    </td>
                    <td className="max-w-xs break-words px-4 py-3">
                      <p>{entry.description}</p>
                      <p className="mt-1 text-muted-foreground">
                        {entry.reference || "—"}
                        {entry.kind === "CAPITAL"
                          ? " · Capital introduced"
                          : ""}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                      {entry.kind !== "EXPENSE" ? money(entry.amount) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                      {entry.kind === "EXPENSE" ? money(entry.amount) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                      {money(entry.running_balance ?? "0.00")}
                    </td>
                    <td className="px-4 py-3">
                      <p>{entry.created_by_name}</p>
                      {entry.version > 1 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Edited by {entry.updated_by_name}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {canEdit && (
                          <EntryForm
                            key={`${entry.id}-${entry.version}`}
                            entry={entry}
                          />
                        )}
                        {canDelete && <VoidEntry entry={entry} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <BookPagination
        query={query}
        count={data.count}
        previous={data.previous}
        next={data.next}
        pathname="/dashboard/ledger"
      />
    </main>
  );
}
