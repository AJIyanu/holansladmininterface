"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { billChoices } from "@/features/purchases/actions";
import type { PurchaseRecord, PurchasePage } from "@/features/purchases/types";
export function BillPicker({
  party,
  selected,
  onSelect,
}: {
  party: string;
  selected?: string;
  onSelect: (bill: PurchaseRecord | null) => void;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PurchasePage>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      void billChoices({ party, search, page })
        .then((r) => {
          if (!cancelled) {
            setData(r.data);
            setError(r.error ?? "");
          }
        })
        .catch(() => {
          if (!cancelled) setError("Unable to load supplier invoices.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [party, search, page, retry]);
  return (
    <section className="space-y-3 rounded border p-4">
      <h3 className="font-semibold">Copy supplier invoice (optional)</h3>
      <p className="text-sm text-muted-foreground">
        Copy replaces the current item draft. You can edit it before confirming.
        A payment settles a delivered bill up to its outstanding goods value;
        otherwise it remains an advance.
      </p>
      <Input
        aria-label="Search supplier invoice reference"
        maxLength={100}
        value={search}
        placeholder="Search supplier invoice reference"
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
      {loading && <p role="status">Loading…</p>}
      {error && (
        <p role="alert">
          {error}{" "}
          <Button
            type="button"
            variant="outline"
            onClick={() => setRetry((v) => v + 1)}
          >
            Retry
          </Button>
        </p>
      )}
      {data?.results.map((r) => (
        <div
          key={r.id}
          className="flex flex-wrap justify-between gap-2 rounded border p-2"
        >
          <span>
            {r.reference} · {r.date} · {r.currency} {r.subtotal}
            {selected === r.id ? " · Selected" : ""}
          </span>
          <Button
            disabled={r.reversed || loading}
            type="button"
            variant="outline"
            onClick={() => onSelect(r)}
          >
            Copy items
          </Button>
        </div>
      ))}
      {data?.count === 0 && <p>No matching supplier invoices.</p>}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!data?.previous || loading}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!data?.next || loading}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
        {selected && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onSelect(null)}
          >
            Remove invoice link
          </Button>
        )}
      </div>
    </section>
  );
}
