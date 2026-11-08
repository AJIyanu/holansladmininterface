"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LedgerListSkeleton } from "@/components/ledger/LoadingSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  receiptInvoiceChoices,
  receiptInvoiceDraft,
} from "@/features/sales-receipt/actions";
import type { Invoice, InvoicePage } from "@/features/sales-invoice/types";
export function ReceiptInvoicePicker({
  party,
  selected,
  onSelect,
  onCopying,
}: {
  party: string;
  selected?: string;
  onCopying: (value: boolean) => void;
  onSelect: (invoice: Invoice | null) => void;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<InvoicePage>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      void receiptInvoiceChoices({ party, search, page })
        .then((result) => {
          if (!cancelled) {
            setData(result.data);
            setError(result.error ?? "");
          }
        })
        .catch(() => {
          if (!cancelled) setError("Unable to load invoices.");
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
  async function copy(id: string) {
    setCopying(true);
    onCopying(true);
    try {
      const result = await receiptInvoiceDraft({ party, id });
      if (result.invoice) {
        onSelect(result.invoice);
        toast.success(
          "Invoice copied. You can edit the receipt items before confirming.",
        );
      } else toast.error(result.error);
    } catch {
      toast.error("Unable to copy invoice.");
    } finally {
      setCopying(false);
      onCopying(false);
    }
  }
  return (
    <section className="space-y-3 rounded-lg border p-4">
      <h3 className="font-semibold">Copy from an invoice (optional)</h3>
      <p className="text-sm text-muted-foreground">
        Choosing an invoice replaces the current item draft. Payments for
        undelivered invoices remain client advances; delivered invoices are
        settled up to their outstanding goods value.
      </p>
      <Input
        aria-label="Search invoices to copy"
        value={search}
        maxLength={100}
        onChange={(e) => {
          setLoading(true);
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder="Search reference or item"
      />
      {loading && <LedgerListSkeleton label="Loading invoices…" />}
      {!loading && error && (
        <p role="alert">
          {error}{" "}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setLoading(true);
              setRetry((n) => n + 1);
            }}
          >
            Retry
          </Button>
        </p>
      )}
      {!loading && data?.results.length === 0 && <p>No matching invoices.</p>}
      <div className="space-y-2">
        {!loading &&
          data?.results.map((invoice) => (
            <div
              key={invoice.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border p-2"
            >
              <span className="break-words">
                {invoice.reference ?? "Unconfirmed invoice"} · {invoice.date} ·{" "}
                {invoice.currency} {invoice.subtotal}
                {selected === invoice.id ? " · Selected" : ""}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={copying}
                onClick={() => copy(invoice.id)}
              >
                Copy items
              </Button>
            </div>
          ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!data?.previous || loading || copying}
          onClick={() => {
            setLoading(true);
            setPage((n) => n - 1);
          }}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!data?.next || loading || copying}
          onClick={() => {
            setLoading(true);
            setPage((n) => n + 1);
          }}
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
