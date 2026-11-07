import Link from "next/link";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { InvoiceEditor } from "./InvoiceEditor";
import type { InvoicePage } from "@/features/sales-invoice/types";
import type { BookSearch } from "@/components/cash-book/BookFilters";
import { money } from "@/features/cash-book/types";
export async function SalesInvoices({
  party,
  search,
  canCreate,
}: {
  party: string;
  search: BookSearch;
  canCreate: boolean;
}) {
  const value = (key: string, fallback = "") =>
    typeof search[key] === "string" ? (search[key] as string) : fallback;
  const query = new URLSearchParams({
    page: value("invoice_page", "1"),
    search: value("invoice_search"),
    status: value("invoice_status", "all"),
    page_size: "10",
  });
  let data: InvoicePage;
  try {
    data = await serverFetch<InvoicePage>(
      `/ledger/sales-invoices/parties/${party}/?${query}`,
    );
  } catch (error) {
    return (
      <section className="rounded border p-4">
        <h2 className="font-semibold">Invoices</h2>
        <p role="alert">
          {error instanceof ServerFetchError && error.status === 403
            ? "You do not have permission to view invoices."
            : "Unable to load invoices. Refresh and try again."}
        </p>
      </section>
    );
  }
  const href = (page: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(search))
      if (typeof v === "string") q.set(k, v);
    q.set("invoice_page", String(page));
    return `/dashboard/ledger/ledgers/sales?${q}`;
  };
  const page = Number(query.get("page") ?? 1);
  return (
    <section className="space-y-4 rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Invoices</h2>
        {canCreate && <InvoiceEditor party={party} defaults={data.defaults} />}
      </div>
      <form className="flex flex-wrap gap-3">
        <input
          aria-label="Search invoices"
          name="invoice_search"
          placeholder="Search reference or item"
          defaultValue={value("invoice_search")}
          className="rounded border bg-background p-2"
        />
        <select
          aria-label="Delivery status"
          name="invoice_status"
          defaultValue={value("invoice_status", "all")}
          className="rounded border bg-background p-2"
        >
          <option value="all">All invoices</option>
          <option value="not-delivered">Not delivered</option>
          <option value="delivered">Delivered</option>
        </select>
        <button className="rounded border px-4 py-2">Filter invoices</button>
      </form>
      {data.results.length ? (
        <ul className="space-y-3">
          {data.results.map((invoice) => (
            <li
              key={invoice.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded border p-3"
            >
              <div>
                <Link
                  href={`/dashboard/ledger/sales/invoices/${invoice.id}`}
                  className="font-semibold underline"
                >
                  {invoice.reference ?? "Draft invoice"}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {invoice.date} ·{" "}
                  {invoice.delivered_at
                    ? "Delivered"
                    : invoice.confirmed
                      ? "Confirmed · Not delivered"
                      : "Draft · Not delivered"}{" "}
                  · {invoice.items.length} item(s)
                </p>
              </div>
              <p className="tabular-nums">
                {money(invoice.subtotal, invoice.currency)}{" "}
                <span className="text-xs text-muted-foreground">
                  goods subtotal
                </span>
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No invoices match this selection.</p>
      )}
      <div className="flex gap-4 text-sm">
        <span>{data.count} invoice(s)</span>
        {data.previous && (
          <Link className="underline" href={href(page - 1)}>
            Previous
          </Link>
        )}
        {data.next && (
          <Link className="underline" href={href(page + 1)}>
            Next
          </Link>
        )}
      </div>
    </section>
  );
}
