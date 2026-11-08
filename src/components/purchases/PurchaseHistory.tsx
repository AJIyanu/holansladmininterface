import Link from "next/link";
import { serverFetch } from "@/lib/server-fetch";
import type { PurchasePage } from "@/features/purchases/types";
import type { BookSearch } from "@/components/cash-book/BookFilters";
import { PurchaseRecordCard } from "./PurchaseRecordCard";
export async function PurchaseHistory({
  kind,
  party,
  search,
}: {
  kind: "bills" | "payments";
  party: string;
  search: BookSearch;
}) {
  const field = `supplier_${kind}`;
  const page =
    typeof search[field + "_page"] === "string"
      ? String(search[field + "_page"])
      : "1";
  const query =
    typeof search[field + "_search"] === "string"
      ? String(search[field + "_search"])
      : "";
  let data: PurchasePage;
  try {
    data = await serverFetch<PurchasePage>(
      `/ledger/purchase-${kind}/parties/${party}/?${new URLSearchParams({ page, search: query })}`,
    );
  } catch {
    return (
      <section className="rounded border p-4">
        <h2 className="font-semibold">Supplier {kind}</h2>
        <p role="alert">Unable to load supplier {kind}. Refresh to retry.</p>
      </section>
    );
  }
  const href = (n: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(search))
      if (typeof v === "string") q.set(k, v);
    q.set(field + "_page", String(n));
    return `/dashboard/ledger/ledgers/purchase?${q}`;
  };
  return (
    <section className="space-y-3 rounded-xl border p-4">
      <h2 className="text-xl font-semibold">Supplier {kind}</h2>
      <form className="flex flex-wrap gap-2">
        {Object.entries(search)
          .filter(
            ([k, v]) =>
              ![field + "_page", field + "_search"].includes(k) &&
              typeof v === "string",
          )
          .map(([k, v]) => (
            <input type="hidden" key={k} name={k} value={String(v)} />
          ))}
        <input
          className="rounded border bg-background p-2"
          name={field + "_search"}
          aria-label={`Search supplier ${kind}`}
          defaultValue={query}
          maxLength={100}
          placeholder={
            kind === "bills"
              ? "Supplier invoice reference"
              : "Supplier receipt number"
          }
        />
        <button className="rounded border px-3 py-2">Search</button>
      </form>
      {data.results.length ? (
        <ul className="space-y-2">
          {data.results.map((row) => (
            <li key={row.id}>
              <PurchaseRecordCard row={row} kind={kind} />
            </li>
          ))}
        </ul>
      ) : (
        <p>No supplier {kind} found.</p>
      )}
      <nav aria-label={`Supplier ${kind} pages`} className="flex gap-3">
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
