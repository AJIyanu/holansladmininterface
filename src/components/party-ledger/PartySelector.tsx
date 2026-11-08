"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LedgerListSkeleton } from "@/components/ledger/LoadingSkeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  searchLedgerParties,
  selectLedgerParty,
} from "@/features/party-ledger/actions";
import type {
  LedgerKind,
  LedgerParty,
  PartyResults,
} from "@/features/party-ledger/types";

export function PartySelector({
  kind,
  selected,
}: {
  kind: LedgerKind;
  selected: LedgerParty | null;
}) {
  const router = useRouter();
  const label = kind === "sales" ? "client" : "supplier";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState({ search: "", page: 1, retry: 0 });
  const [result, setResult] = useState<{ data?: PartyResults; error?: string }>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [saving, startTransition] = useTransition();
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const response = await searchLedgerParties({
          kind,
          search: query.search,
          page: query.page,
        });
        if (!cancelled) {
          setResult(response);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setResult({ error: "Unable to search. Please try again." });
          setLoading(false);
        }
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [open, kind, query]);
  function choose(party: LedgerParty | null) {
    setSaveError("");
    startTransition(async () => {
      try {
        const response = await selectLedgerParty({
          kind,
          party_id: party?.id ?? null,
        });
        if (response.error) {
          setSaveError(response.error);
          return;
        }
        setOpen(false);
        router.replace(`/dashboard/ledger/ledgers/${kind}`);
        router.refresh();
      } catch {
        setSaveError("Unable to save your selection. Please try again.");
      }
    });
  }
  function navigate(page: number) {
    setLoading(true);
    setQuery({ ...query, page });
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!saving) {
          setOpen(value);
          if (value) {
            setLoading(true);
            setSaveError("");
          }
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-auto min-h-11 w-full justify-between gap-3 py-3 text-left sm:max-w-xl"
          aria-label={`Change ${label}: ${selected?.display_name ?? "none selected"}`}
        >
          <span className="min-w-0 whitespace-normal break-words">
            {selected?.display_name ?? `Select ${label}`}
          </span>
          <ChevronsUpDown className="size-4 shrink-0" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Select {label}</DialogTitle>
          <DialogDescription>
            Your last selection is remembered for your account.
          </DialogDescription>
        </DialogHeader>
        <label className="space-y-2">
          <span className="text-sm font-medium">Search {label}s</span>
          <Input
            autoComplete="off"
            maxLength={100}
            placeholder={`Search ${label} name…`}
            value={query.search}
            disabled={saving}
            onChange={(event) => {
              setLoading(true);
              setQuery({ ...query, search: event.target.value, page: 1 });
            }}
          />
        </label>
        <div aria-live="polite" aria-busy={loading}>
          {loading ? (
            <LedgerListSkeleton label={`Searching ${label}s…`} />
          ) : result.error ? (
            <div className="space-y-3 py-3">
              <p role="alert">{result.error}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setLoading(true);
                  setQuery({ ...query, retry: query.retry + 1 });
                }}
              >
                Retry search
              </Button>
            </div>
          ) : (
            <>
              <ul className="space-y-1">
                {result.data?.results.map((party) => (
                  <li key={party.id}>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => choose(party)}
                      className="flex w-full items-center justify-between gap-3 rounded-md border p-3 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                    >
                      <span className="min-w-0">
                        <span className="block break-words font-medium">
                          {party.display_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {party.entity_kind.replaceAll("_", " ").toLowerCase()}{" "}
                          · {party.status.toLowerCase()}
                        </span>
                      </span>
                      {selected?.id === party.id && (
                        <Check
                          aria-label="Selected"
                          className="size-4 shrink-0"
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              {result.data?.count === 0 && (
                <p className="py-6 text-sm text-muted-foreground">
                  No {label}s found. Check the name or the party’s active CRM
                  role.
                </p>
              )}
              {result.data && (
                <div className="mt-3 flex items-center justify-between gap-2 text-sm">
                  <span>
                    {result.data.count} {label}s · Page {query.page}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!result.data.previous || saving}
                      onClick={() => navigate(query.page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!result.data.next || saving}
                      onClick={() => navigate(query.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {saveError && (
          <p role="alert" className="text-sm text-destructive">
            {saveError}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          {selected && (
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => choose(null)}
            >
              Clear selection
            </Button>
          )}
          <Button
            variant="outline"
            disabled={saving}
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </div>
        {saving && (
          <p role="status" className="text-sm text-muted-foreground">
            Saving selection…
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
