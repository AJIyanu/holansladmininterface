"use client";

import {
  LedgerSelect,
  LedgerDatePicker,
} from "@/components/ledger/FormControls";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  workspaceAction,
  operationChoices,
} from "@/features/party-ledger/workspace-actions";
import type { LedgerKind } from "@/features/party-ledger/types";

export interface Choice {
  id: string;
  date: string;
  transaction_type: string;
  reference: string;
  amount: string;
  currency: string;
}
export function WorkspaceTools({
  kind,
  party,
  canCorrect,
  canRecognize,
  canPrint,
  canCash,
}: {
  kind: LedgerKind;
  party: string;
  canCorrect: boolean;
  canRecognize: boolean;
  canPrint: boolean;
  canCash: boolean;
}) {
  const router = useRouter();
  const [choices, setChoices] = useState<Choice[]>([]);
  const [query, setQuery] = useState({ search: "", page: 1 });
  const [more, setMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [mode, setMode] = useState<"operations" | "statements">(
    canPrint ? "statements" : "operations",
  );
  const [action, setAction] = useState(canCorrect ? "ALLOCATE" : "ACCEPTED");
  const [currency, setCurrency] = useState("NGN");
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState<Record<string, unknown> | null>(null);
  const [link, setLink] = useState("");
  const key = useRef({ body: "", key: "" });
  useEffect(() => {
    if (mode !== "operations") return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const result = await operationChoices({
        kind,
        party,
        currency,
        ...query,
      });
      if (cancelled) return;
      if (result.error) {
        setLoadError(result.error);
        return;
      }
      setLoadError("");
      if (result.data) {
        setChoices((previous) =>
          Array.from(
            new Map(
              [...previous, ...result.data.results].map((row) => [row.id, row]),
            ).values(),
          ),
        );
        setMore(!!result.data.next);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [kind, party, currency, mode, query]);
  if (!canCorrect && !canRecognize && !canPrint) return null;
  const rows = choices.filter((c) => c.currency === currency);
  async function commit() {
    if (!review) return;
    const body = JSON.stringify({ mode, ...review });
    if (key.current.body !== body)
      key.current = { body, key: crypto.randomUUID() };
    const tab =
      mode === "statements" ? window.open("about:blank", "_blank") : null;
    if (tab) tab.opener = null;
    setBusy(true);
    try {
      const result = await workspaceAction({
        kind,
        party,
        mode,
        payload: { ...review, request_key: key.current.key },
      });
      if (result.error) {
        tab?.close();
        toast.error(result.error);
        return;
      }
      if (result.data && mode === "statements") {
        const url = `/statements/ledger/${result.data.id}`;
        setLink(url);
        if (tab) tab.location.href = url;
      }
      toast.success(result.data?.message ?? "Reconciliation saved.");
      setReview(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="rounded-lg border p-4">
      <summary className="cursor-pointer font-semibold">
        Reconciliation and ledger actions
      </summary>
      <form
        onChange={() => setReview(null)}
        className="mt-4 grid gap-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const payload: Record<string, unknown> = { currency };
          if (mode === "statements") {
            payload.date_from = f.get("date_from");
            payload.date_to = f.get("date_to");
          } else {
            payload.action = action;
            payload.date = f.get("date");
            payload.reason = f.get("reason");
            if (f.get("transaction_id"))
              payload.transaction_id = f.get("transaction_id");
            if (f.get("amount")) payload.amount = f.get("amount");
            if (action === "ALLOCATE")
              payload.allocations = rows
                .filter((c) => ["INVOICE", "BILL"].includes(c.transaction_type))
                .flatMap((c) =>
                  f.get(c.id)
                    ? [{ document_id: c.id, amount: f.get(c.id) }]
                    : [],
                );
          }
          setReview(payload);
        }}
      >
        <label>
          Task
          <LedgerSelect
            className="w-full min-w-48"
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as typeof mode);
              setReview(null);
            }}
          >
            {canPrint && (
              <option value="statements">
                Print Reconciliation and Statement
              </option>
            )}
            {(canCorrect || canRecognize) && (
              <option value="operations">Record an operation</option>
            )}
          </LedgerSelect>
        </label>
        <label>
          Currency
          <LedgerSelect
            className="w-full min-w-48"
            value={currency}
            onChange={(e) => {
              setCurrency(e.target.value);
              setQuery({ search: "", page: 1 });
              setReview(null);
            }}
          >
            {["NGN", "USD", "GBP"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </LedgerSelect>
        </label>
        {mode === "statements" ? (
          <>
            <label>
              From
              <LedgerDatePicker name="date_from" required />
            </label>
            <label>
              To
              <LedgerDatePicker name="date_to" required />
            </label>
          </>
        ) : (
          <>
            <div className="space-y-2 md:col-span-2">
              <label>
                Find an existing transaction
                <Input
                  placeholder="Search reference or description"
                  value={query.search}
                  onChange={(e) =>
                    setQuery({ search: e.target.value, page: 1 })
                  }
                />
              </label>
              {loadError && <p role="alert">{loadError}</p>}
              {more && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}
                >
                  Load more matching transactions
                </Button>
              )}
              <p className="text-sm text-muted-foreground">
                Search adds matching records to the selections below.
              </p>
            </div>
            <label>
              Operation
              <LedgerSelect
                className="w-full min-w-48"
                value={action}
                onChange={(e) => {
                  setAction(e.target.value);
                  setReview(null);
                }}
              >
                {(canCorrect
                  ? [
                      "ALLOCATE",
                      "CREDIT",
                      "ADJUST_UP",
                      "ADJUST_DOWN",
                      ...(canCash ? ["REFUND", "REVERSE"] : []),
                    ]
                  : []
                )
                  .concat(
                    canRecognize ? ["DISPATCHED", "REJECTED", "ACCEPTED"] : [],
                  )
                  .map((a) => (
                    <option key={a} value={a}>
                      {
                        (
                          {
                            ALLOCATE: "Allocate or reallocate payment",
                            CREDIT: "Credit note",
                            REFUND: "Refund",
                            REVERSE: "Reverse / cancel",
                            ADJUST_UP: "Increase balance",
                            ADJUST_DOWN: "Reduce balance",
                            DISPATCHED: "Goods dispatched",
                            REJECTED: "Goods rejected",
                            ACCEPTED: "Goods accepted",
                          } as Record<string, string>
                        )[a]
                      }
                    </option>
                  ))}
              </LedgerSelect>
            </label>
            <label>
              Effective date
              <LedgerDatePicker name="date" required />
            </label>
            {!["ADJUST_UP", "ADJUST_DOWN"].includes(action) && (
              <label className="md:col-span-2">
                Original transaction
                <LedgerSelect
                  name="transaction_id"
                  required
                  className="w-full min-w-48"
                >
                  <option value="">Choose transaction</option>
                  {rows.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.date} · {c.transaction_type} ·{" "}
                      {c.reference || c.id.slice(0, 8)} · {c.amount}
                    </option>
                  ))}
                </LedgerSelect>
              </label>
            )}
            {!["ALLOCATE", "REVERSE"].includes(action) && (
              <label>
                Amount
                <Input
                  name="amount"
                  inputMode="decimal"
                  required
                  pattern="[0-9]+(\.[0-9]{1,2})?"
                />
              </label>
            )}
            <label className="md:col-span-2">
              Reason / supporting evidence
              <Input name="reason" maxLength={500} required />
            </label>
            {action === "ALLOCATE" && (
              <fieldset className="space-y-2 md:col-span-2">
                <legend>Replace the payment’s allocations</legend>
                <p className="text-sm text-muted-foreground">
                  Enter all allocations to retain. Blank amounts release
                  existing allocations. Total must fit the available payment.
                </p>
                {rows
                  .filter((c) =>
                    ["INVOICE", "BILL"].includes(c.transaction_type),
                  )
                  .map((c) => (
                    <label key={c.id} className="flex items-center gap-3">
                      {c.reference || c.id.slice(0, 8)} · {c.date}
                      <Input
                        name={c.id}
                        aria-label={`Allocation to ${c.reference}`}
                        placeholder="0.00"
                        inputMode="decimal"
                        pattern="[0-9]+(\.[0-9]{1,2})?"
                      />
                    </label>
                  ))}
              </fieldset>
            )}
          </>
        )}
        <Button type="submit" disabled={busy}>
          Review details
        </Button>
      </form>
      {review && (
        <div className="mt-4 space-y-3 rounded border bg-muted p-4">
          <p className="font-medium">Confirm these details</p>
          <dl className="text-sm">
            {Object.entries(review)
              .filter(([k]) => k !== "allocations")
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="inline font-medium">
                    {k.replaceAll("_", " ")}:{" "}
                  </dt>
                  <dd className="inline break-all">{String(v)}</dd>
                </div>
              ))}
          </dl>
          {Array.isArray(review.allocations) && (
            <p>
              {review.allocations.length} allocation(s). Existing allocations
              will be replaced.
            </p>
          )}
          <Button disabled={busy} onClick={commit}>
            {busy ? "Saving…" : "Confirm and save"}
          </Button>
          <Button
            variant="outline"
            className="ml-2"
            onClick={() => setReview(null)}
            disabled={busy}
          >
            Back
          </Button>
        </div>
      )}
      {link && (
        <a
          className="mt-3 block underline"
          target="_blank"
          rel="noopener noreferrer"
          href={link}
        >
          Open printable Reconciliation and Statement
        </a>
      )}
    </details>
  );
}
