import Link from "next/link";
import { serverFetch } from "@/lib/server-fetch";
import type { LedgerKind } from "@/features/party-ledger/types";
import type { BookSearch } from "@/components/cash-book/BookFilters";
export async function StatementHistory({
  kind,
  party,
  search,
}: {
  kind: LedgerKind;
  party: string;
  search: BookSearch;
}) {
  const raw =
    typeof search.statement_page === "string"
      ? Number(search.statement_page)
      : 1;
  const page = Number.isSafeInteger(raw) && raw > 0 ? raw : 1;
  const data = await serverFetch<{
    results: Array<{
      id: string;
      currency: string;
      date_from: string;
      date_to: string;
      created_by_name: string;
      created_at: string;
    }>;
    next: string | null;
    previous: string | null;
  }>(
    `/ledger/party-ledgers/${kind}/parties/${party}/statements/?page=${page}&page_size=10`,
  );
  const href = (n: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(search))
      if (typeof v === "string") q.set(k, v);
    q.set("statement_page", String(n));
    return `/dashboard/ledger/ledgers/${kind}?${q}`;
  };
  return (
    <details className="rounded border p-4">
      <summary className="cursor-pointer font-semibold">
        Saved Reconciliation and Statements
      </summary>
      <ul className="my-3 space-y-2">
        {data.results.map((s) => (
          <li key={s.id}>
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              href={`/statements/ledger/${s.id}`}
            >
              {s.date_from} – {s.date_to} · {s.currency}
            </a>
            <span className="ml-2 text-sm text-muted-foreground">
              {s.created_by_name} · {s.created_at.slice(0, 10)}
            </span>
          </li>
        ))}
      </ul>
      {!data.results.length && <p>No saved statements yet.</p>}
      <div className="flex gap-4">
        {data.previous && (
          <Link className="underline" href={href(page - 1)}>
            Previous statements
          </Link>
        )}
        {data.next && (
          <Link className="underline" href={href(page + 1)}>
            More statements
          </Link>
        )}
      </div>
    </details>
  );
}
