import Link from "next/link";
import { serverFetch } from "@/lib/server-fetch";
import type { ReceiptPage } from "@/features/sales-receipt/types";
import type { BookSearch } from "@/components/cash-book/BookFilters";
import { money } from "@/features/cash-book/types";
export async function SalesReceipts({
  party,
  search,
}: {
  party: string;
  search: BookSearch;
}) {
  const page =
    typeof search.receipt_page === "string" ? search.receipt_page : "1";
  const query =
    typeof search.receipt_search === "string" ? search.receipt_search : "";
  let data: ReceiptPage;
  try {
    data = await serverFetch<ReceiptPage>(
      `/ledger/sales-receipts/parties/${party}/?${new URLSearchParams({ page, search: query })}`,
    );
  } catch {
    return (
      <section className="rounded border p-4">
        <h2 className="font-semibold">Payment receipts</h2>
        <p role="alert">Unable to load receipts. Refresh the page to retry.</p>
      </section>
    );
  }
  const href = (value: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(search))
      if (typeof v === "string") params.set(k, v);
    params.set("receipt_page", String(value));
    return `/dashboard/ledger/ledgers/sales?${params}`;
  };
  return (
    <section className="space-y-4 rounded-xl border p-4">
      <h2 className="text-xl font-semibold">Payment receipts</h2>
      <form className="flex flex-wrap gap-2">
        {Object.entries(search)
          .filter(
            ([k, v]) =>
              !["receipt_page", "receipt_search"].includes(k) &&
              typeof v === "string",
          )
          .map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={String(v)} />
          ))}
        <input
          name="receipt_search"
          aria-label="Search receipt reference"
          defaultValue={query}
          maxLength={100}
          className="rounded border bg-background p-2"
          placeholder="Search receipt reference"
        />
        <button className="rounded border px-4 py-2">Search</button>
      </form>
      {data.results.length ? (
        <ul className="space-y-2">
          {data.results.map((receipt) => (
            <li
              key={receipt.id}
              className="flex flex-wrap justify-between gap-2 rounded border p-3"
            >
              <Link
                className="font-semibold underline"
                href={`/dashboard/ledger/sales/receipts/${receipt.id}`}
              >
                {receipt.reference}
              </Link>
              <span>
                {receipt.date} · Received{" "}
                {money(receipt.received, receipt.currency)}
                {receipt.reversed ? " · Reversed" : ""}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No payment receipts found.</p>
      )}
      <nav aria-label="Receipt pages" className="flex gap-4">
        {data.previous && (
          <Link className="underline" href={href(Number(page) - 1)}>
            Previous
          </Link>
        )}
        {data.next && (
          <Link className="underline" href={href(Number(page) + 1)}>
            Next
          </Link>
        )}
      </nav>
    </section>
  );
}
