import Link from "next/link";
import {
  labels,
  type Summary,
  type Evidence,
} from "@/features/staff-ledger/types";
import { money } from "@/features/cash-book/types";
export function BalanceCards({
  summary,
  currency,
}: {
  summary: Summary;
  currency: string;
}) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Object.entries(summary).map(([key, value]) => (
        <div className="rounded-lg border bg-card p-3" key={key}>
          <dt className="text-sm text-muted-foreground">
            {labels[key] ?? key}
          </dt>
          <dd className="mt-1 break-words text-lg font-semibold">
            {money(value, currency)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
export function EvidenceLinks({
  documents,
  allowed,
}: {
  documents: Evidence[];
  allowed: boolean;
}) {
  if (!documents.length)
    return (
      <p className="text-sm text-muted-foreground">No supporting document.</p>
    );
  return (
    <ul className="space-y-1">
      {documents.map((doc) => (
        <li key={doc.id} className="break-words">
          {allowed ? (
            <a
              className="underline"
              href={`/api/ledger/staff/documents/${doc.id}/download`}
            >
              {doc.filename}
            </a>
          ) : (
            <span>{doc.filename} · Download permission required</span>
          )}
        </li>
      ))}
    </ul>
  );
}
export function Pagination({
  previous,
  next,
  page,
  param,
  query,
}: {
  previous: boolean;
  next: boolean;
  page: number;
  param: string;
  query: Record<string, string>;
}) {
  function href(n: number) {
    return `?${new URLSearchParams({ ...query, [param]: String(n) })}`;
  }
  return (
    <nav
      aria-label={`${param} pagination`}
      className="flex justify-between gap-3 text-sm"
    >
      {previous ? (
        <Link className="underline" href={href(page - 1)}>
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span>Page {page}</span>
      {next ? (
        <Link className="underline" href={href(page + 1)}>
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
