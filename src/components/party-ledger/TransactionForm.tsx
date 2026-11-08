"use client";

import {
  LedgerSelect,
  LedgerDatePicker,
} from "@/components/ledger/FormControls";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LedgerListSkeleton } from "@/components/ledger/LoadingSkeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  entryValuesSchema,
  ledgerAmount,
  cents,
  decimal,
  type EntryValues,
} from "@/features/party-ledger/schema";
import {
  getOutstandingDocuments,
  postLedgerEntry,
} from "@/features/party-ledger/actions";
import { money } from "@/features/cash-book/types";
import type {
  LedgerKind,
  LedgerParty,
  OutstandingPage,
} from "@/features/party-ledger/types";

type Allocation = { document_id: string; amount: string; reference: string };
export function TransactionForm({
  kind,
  party,
  payment = false,
  accounts = [],
}: {
  kind: LedgerKind;
  party: LedgerParty;
  payment?: boolean;
  accounts?: Array<{
    id: string;
    name: string;
    kind: string;
    currency: string;
    is_active: boolean;
  }>;
}) {
  const title = payment
    ? "Add payment"
    : kind === "sales"
      ? "Add invoice"
      : "Add bill";
  const type = payment ? "PAYMENT" : kind === "sales" ? "INVOICE" : "BILL";
  const [currency, setCurrency] = useState("NGN");
  const [account, setAccount] = useState(
    "00000000-0000-4000-8000-000000000001",
  );
  const formatMoney = (value: string) => money(value, currency);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [review, setReview] = useState<EntryValues | null>(null);
  const [allocations, setAllocations] = useState<Record<string, Allocation>>(
    {},
  );
  const [query, setQuery] = useState({ search: "", page: 1, retry: 0 });
  const [documents, setDocuments] = useState<{
    data?: OutstandingPage;
    error?: string;
  }>({});
  const [loading, setLoading] = useState(true);
  const submission = useRef<{ payload: string; key: string } | null>(null);
  const form = useForm<EntryValues>({
    resolver: zodResolver(entryValuesSchema),
    defaultValues: {
      date: new Date().toLocaleDateString("en-CA", {
        timeZone: "Africa/Lagos",
      }),
      amount: "",
      description: "",
      reference: "",
    },
  });
  useEffect(() => {
    if (!open || !payment) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const result = await getOutstandingDocuments({
          currency,
          kind,
          party_id: party.id,
          search: query.search,
          page: query.page,
        });
        if (!cancelled) {
          setDocuments(result);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setDocuments({ error: "Unable to load outstanding documents." });
          setLoading(false);
        }
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, payment, party.id, kind, query, currency]);
  const allocationRows = Object.values(allocations).filter(
    (item) => item.amount.trim() !== "",
  );
  const allocated = allocationRows.reduce(
    (total, row) => total + cents(row.amount),
    BigInt(0),
  );
  function prepare(values: EntryValues) {
    setError("");
    if (!payment && !values.reference) {
      form.setError("reference", { message: "Enter the document reference." });
      return;
    }
    if (
      allocationRows.some((row) => !ledgerAmount.safeParse(row.amount).success)
    ) {
      setError(
        "Each allocation must be a positive amount with up to two decimal places.",
      );
      return;
    }
    if (allocationRows.length > 100) {
      setError("Allocate to at most 100 documents per payment.");
      return;
    }
    if (allocated > cents(values.amount)) {
      setError("Allocations exceed the payment amount.");
      return;
    }
    setReview(values);
  }
  function save() {
    if (!review) return;
    const values = {
      ...review,
      kind,
      party_id: party.id,
      transaction_type: type,
      currency,
      ...(payment ? { account_id: account } : {}),
      allocations: allocationRows.map(({ document_id, amount }) => ({
        document_id,
        amount,
      })),
    };
    const fingerprint = JSON.stringify(values);
    if (submission.current?.payload !== fingerprint)
      submission.current = { payload: fingerprint, key: crypto.randomUUID() };
    const key = submission.current.key;
    setError("");
    startTransition(async () => {
      try {
        const result = await postLedgerEntry({ ...values, request_key: key });
        if (!result.success) {
          setError(result.message);
          return;
        }
        toast.success(result.message);
        submission.current = null;
        setOpen(false);
        setReview(null);
        setAllocations({});
        form.reset();
        router.refresh();
      } catch {
        setError(
          "Unable to confirm the result. Retry with the same details to avoid duplicate posting.",
        );
      }
    });
  }
  function changePage(page: number) {
    setLoading(true);
    setQuery({ ...query, page });
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!pending) {
          setOpen(value);
          if (value) {
            setLoading(true);
            setError("");
          }
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant={payment ? "outline" : "default"}>{title}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{review ? "Review transaction" : title}</DialogTitle>
          <DialogDescription>
            {party.display_name} · {currency} ·{" "}
            {payment
              ? kind === "sales"
                ? "Money received into the cash book."
                : "Money paid from the cash book."
              : "Record the amount due shown on the document."}
          </DialogDescription>
        </DialogHeader>
        {!review && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              Currency
              <LedgerSelect
                className="w-full min-w-48"
                value={currency}
                onChange={(e) => {
                  const value = e.target.value;
                  setCurrency(value);
                  setAllocations({});
                  setAccount(
                    accounts.find((a) => a.currency === value && a.is_active)
                      ?.id ?? "",
                  );
                  setQuery({ search: "", page: 1, retry: 0 });
                }}
              >
                {["NGN", "USD", "GBP"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </LedgerSelect>
            </label>
            {payment && (
              <label>
                Cash / bank account
                <LedgerSelect
                  className="w-full min-w-48"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                >
                  <option value="">Select account</option>
                  {accounts
                    .filter((a) => a.currency === currency && a.is_active)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} · {a.kind}
                      </option>
                    ))}
                </LedgerSelect>
              </label>
            )}
          </div>
        )}
        {review ? (
          <div className="space-y-4">
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ["Date", review.date],
                ["Amount", formatMoney(review.amount)],
                ["Reference", review.reference || "None"],
                ["Description", review.description],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="break-words font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            {payment && (
              <div className="space-y-2 rounded-lg border p-4">
                <h3 className="font-semibold">Payment allocation</h3>
                {allocationRows.map((row) => (
                  <p
                    key={row.document_id}
                    className="flex flex-wrap justify-between gap-2"
                  >
                    <span className="break-words">{row.reference}</span>
                    <span>{formatMoney(row.amount)}</span>
                  </p>
                ))}
                <p>
                  Unallocated advance:{" "}
                  {formatMoney(decimal(cents(review.amount) - allocated))}
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Confirming posts this transaction immediately to the ledger and
              journal{payment ? ", including its cash movement" : ""}.
            </p>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={pending}
                onClick={() => {
                  setReview(null);
                  setError("");
                }}
              >
                Edit details
              </Button>
              <Button disabled={pending} onClick={save}>
                {pending ? "Posting…" : "Confirm and post"}
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              void form.handleSubmit(prepare)(event);
            }}
          >
            <fieldset disabled={pending} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1">
                  <span>Date</span>
                  <Controller
                    control={form.control}
                    name="date"
                    render={({ field }) => <LedgerDatePicker {...field} />}
                  />
                  <span className="text-sm text-destructive">
                    {form.formState.errors.date?.message}
                  </span>
                </label>
                <label className="space-y-1">
                  <span>
                    {payment
                      ? `Payment amount (${currency})`
                      : `Total amount due (${currency})`}
                  </span>
                  <Input
                    inputMode="decimal"
                    {...form.register("amount")}
                    placeholder="0.00"
                  />
                  <span className="text-sm text-destructive">
                    {form.formState.errors.amount?.message}
                  </span>
                </label>
              </div>
              <label className="block space-y-1">
                <span>
                  {payment
                    ? "Payment reference (optional)"
                    : kind === "sales"
                      ? "Invoice reference"
                      : "Supplier bill reference"}
                </span>
                <Input maxLength={100} {...form.register("reference")} />
                <span className="text-sm text-destructive">
                  {form.formState.errors.reference?.message}
                </span>
              </label>
              <label className="block space-y-1">
                <span>Description</span>
                <Input maxLength={500} {...form.register("description")} />
                <span className="text-sm text-destructive">
                  {form.formState.errors.description?.message}
                </span>
              </label>
              {payment && (
                <section className="space-y-3 rounded-lg border p-4">
                  <h3 className="font-semibold">Allocate payment (optional)</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter amounts against outstanding documents, or leave blank
                    to record an advance.
                  </p>
                  <label className="block space-y-1">
                    <span className="text-sm">
                      Search document reference or description
                    </span>
                    <Input
                      value={query.search}
                      maxLength={100}
                      onChange={(event) => {
                        setLoading(true);
                        setQuery({
                          ...query,
                          search: event.target.value,
                          page: 1,
                        });
                      }}
                    />
                  </label>
                  {loading ? (
                    <LedgerListSkeleton label="Loading outstanding documents…" />
                  ) : documents.error ? (
                    <div className="space-y-2">
                      <p role="alert">{documents.error}</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setLoading(true);
                          setQuery({ ...query, retry: query.retry + 1 });
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <>
                      {documents.data?.results.map((doc) => (
                        <label
                          key={doc.id}
                          className="block space-y-2 rounded-md border p-3"
                        >
                          <span className="block break-words text-sm font-medium">
                            {doc.reference || doc.description} · {doc.date}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            Outstanding: {formatMoney(doc.outstanding)}
                          </span>
                          <Input
                            aria-label={`Allocate to ${doc.reference || doc.description}`}
                            inputMode="decimal"
                            placeholder="0.00"
                            value={allocations[doc.id]?.amount ?? ""}
                            onChange={(event) =>
                              setAllocations({
                                ...allocations,
                                [doc.id]: {
                                  document_id: doc.id,
                                  amount: event.target.value,
                                  reference: doc.reference || doc.description,
                                },
                              })
                            }
                          />
                        </label>
                      ))}
                      {documents.data?.count === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No outstanding documents found.
                        </p>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!documents.data?.previous}
                          onClick={() => changePage(query.page - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!documents.data?.next}
                          onClick={() => changePage(query.page + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </>
                  )}
                  <p className="text-sm">
                    Allocated across all selected documents:{" "}
                    {formatMoney(decimal(allocated))}
                  </p>
                  {allocationRows.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Selections are retained when changing search or page.
                      </p>
                      {allocationRows.map((row) => (
                        <div
                          key={row.document_id}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
                          <span className="break-words">
                            {row.reference}: {row.amount}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setAllocations((current) => {
                                const next = { ...current };
                                delete next[row.document_id];
                                return next;
                              })
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </fieldset>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Review transaction</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
