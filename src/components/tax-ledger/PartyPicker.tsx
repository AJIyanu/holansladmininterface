"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LedgerSelect } from "@/components/ledger/FormControls";
import { searchTaxParties } from "@/features/tax-ledger/actions";
export function TaxPartyPicker({
  value,
  onChange,
  name,
  defaultValue = "",
}: {
  value?: string;
  onChange?: (v: string) => void;
  name?: string;
  defaultValue?: string;
}) {
  const [draft, setDraft] = useState(defaultValue),
    [search, setSearch] = useState(""),
    [rows, setRows] = useState<Array<{ id: string; name: string }>>([]),
    [page, setPage] = useState(1),
    [more, setMore] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function find(n = 1) {
    setBusy(true);
    const r = await searchTaxParties(search, n);
    setBusy(false);
    if (r.error) {
      setError(r.error);
      return;
    }
    setError("");
    setRows(r.data?.results ?? []);
    setPage(n);
    setMore(!!r.data?.next);
  }
  return (
    <div className="space-y-2">
      <Input
        aria-label="Find party by name"
        placeholder="Find party by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={() => find()}
      >
        Search parties
      </Button>
      <LedgerSelect
        name={name}
        value={value ?? draft}
        onChange={(e) => {
          setDraft(e.target.value);
          onChange?.(e.target.value);
        }}
      >
        <option value="">All parties / company default</option>
        {(value ?? draft) && !rows.some((r) => r.id === (value ?? draft)) && (
          <option value={value ?? draft}>Selected party</option>
        )}
        {rows.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </LedgerSelect>
      {error && <p role="alert">{error}</p>}
      {(page > 1 || more) && (
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy || page <= 1}
            onClick={() => find(page - 1)}
          >
            Previous
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy || !more}
            onClick={() => find(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
