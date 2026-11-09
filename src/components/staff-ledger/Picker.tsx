"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  searchStaff,
  selectStaff,
  sourceChoices,
} from "@/features/staff-ledger/actions";
import type { Staff, StaffEntry } from "@/features/staff-ledger/types";
import { money } from "@/features/cash-book/types";
type Choice = { id: string; label: string; entry?: StaffEntry };
export function StaffPicker({ selected }: { selected: Staff | null }) {
  return (
    <Picker title="Select staff" label={selected?.name ?? "Select staff"} />
  );
}
export function SourcePicker({
  staff,
  currency,
  mode,
  label,
  onSelect,
}: {
  staff: string;
  currency: "NGN" | "USD" | "GBP";
  mode: "advance" | "loan" | "reimbursement" | "retire";
  label: string;
  onSelect: (entry: StaffEntry) => void;
}) {
  return (
    <Picker
      title={mode === "loan" ? "Select loan" : "Select advance"}
      label={label || "Select linked advance or loan"}
      source={{ staff, currency, mode }}
      onSelect={onSelect}
    />
  );
}
function Picker({
  title,
  label,
  source,
  onSelect,
}: {
  title: string;
  label: string;
  source?: {
    staff: string;
    currency: "NGN" | "USD" | "GBP";
    mode: "advance" | "loan" | "reimbursement" | "retire";
  };
  onSelect?: (entry: StaffEntry) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState({ search: "", page: 1, retry: 0 });
  const [result, setResult] = useState<{
    rows: Choice[];
    next: boolean;
    previous: boolean;
    error?: string;
  }>({ rows: [], next: false, previous: false });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const staff = source?.staff,
    currency = source?.currency,
    mode = source?.mode;
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        let rows: Choice[] = [],
          next = false,
          previous = false,
          error: string | undefined;
        if (staff && currency && mode) {
          const response = await sourceChoices({
            staff,
            currency,
            mode,
            ...query,
          });
          error = response.error;
          next = !!response.data?.next;
          previous = !!response.data?.previous;
          rows =
            response.data?.results.map((e) => ({
              id: e.id,
              label: `${e.date} · ${e.description} · ${money(e.amount, e.currency)} · remaining ${money(e.remaining ?? "0", e.currency)} · reimbursement ${money(e.reimbursement_due ?? "0", e.currency)}`,
              entry: e,
            })) ?? [];
        } else {
          const response = await searchStaff(query);
          error = response.error;
          next = !!response.data?.next;
          previous = !!response.data?.previous;
          rows =
            response.data?.results.map((s) => ({
              id: s.id,
              label: `${s.name} (@${s.username})${s.is_active ? "" : " · inactive"}`,
            })) ?? [];
        }
        if (!cancelled) {
          setResult({ rows, next, previous, error });
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setResult({
            rows: [],
            next: false,
            previous: false,
            error: "Unable to search. Try again.",
          });
          setLoading(false);
        }
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, staff, currency, mode, query]);
  async function choose(row: Choice) {
    if (row.entry && onSelect) {
      onSelect(row.entry);
      setOpen(false);
      return;
    }
    setSaving(true);
    try {
      const response = await selectStaff(row.id);
      if (response.error) {
        setResult({ ...result, error: response.error });
        return;
      }
      setOpen(false);
      router.replace("/dashboard/ledger/ledgers/staff");
      router.refresh();
    } catch {
      setResult({ ...result, error: "Unable to save selection." });
    } finally {
      setSaving(false);
    }
  }
  const content = (
    <div className="space-y-3">
      <label className="space-y-2">
        <span>Search</span>
        <Input
          value={query.search}
          maxLength={100}
          disabled={saving}
          onChange={(e) => {
            setLoading(true);
            setQuery({ ...query, search: e.target.value, page: 1 });
          }}
        />
      </label>
      <div className="space-y-2" aria-live="polite" aria-busy={loading}>
        {loading ? (
          <p>Searching…</p>
        ) : result.error ? (
          <>
            <p role="alert">{result.error}</p>
            <Button
              type="button"
              onClick={() => {
                setLoading(true);
                setQuery({ ...query, retry: query.retry + 1 });
              }}
            >
              Retry
            </Button>
          </>
        ) : result.rows.length ? (
          result.rows.map((row) => (
            <Button
              type="button"
              key={row.id}
              variant="outline"
              disabled={saving}
              className="h-auto w-full justify-start whitespace-normal py-3 text-left"
              onClick={() => choose(row)}
            >
              {row.label}
            </Button>
          ))
        ) : (
          <p>No matching records.</p>
        )}
      </div>
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={loading || saving || !result.previous}
          onClick={() => {
            setLoading(true);
            setQuery({ ...query, page: query.page - 1 });
          }}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={loading || saving || !result.next}
          onClick={() => {
            setLoading(true);
            setQuery({ ...query, page: query.page + 1 });
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
  if (source)
    return (
      <section className="space-y-3 rounded-lg border p-3">
        <Button
          type="button"
          variant="outline"
          className="h-auto min-h-11 w-full whitespace-normal text-left"
          aria-expanded={open}
          onClick={() => {
            setOpen(!open);
            if (!open) setLoading(true);
          }}
        >
          {label}
        </Button>
        {open && (
          <>
            <h3 className="font-medium">{title}</h3>
            {content}
          </>
        )}
      </section>
    );
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!saving) {
          setOpen(v);
          if (v) setLoading(true);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-auto min-h-11 w-full whitespace-normal text-left"
        >
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Your last selected staff member is remembered.
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
