"use client";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LedgerSelect,
  LedgerDatePicker,
} from "@/components/ledger/FormControls";
import { requestSchema, type Values } from "@/features/tax-ledger/schema";
import {
  actions,
  fields,
  type Entry,
  type Source,
  type History,
} from "@/features/tax-ledger/types";
import { submitTax, searchTaxSources } from "@/features/tax-ledger/actions";
import type { Account } from "@/features/staff-ledger/types";
import { money } from "@/features/cash-book/types";
export function TaxEditor({
  allowed,
  accounts,
  entries,
  history,
}: {
  allowed: string[];
  accounts: Account[];
  entries: Entry[];
  history?: History;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [review, setReview] = useState<Values | null>(null),
    [file, setFile] = useState<File | null>(null),
    [error, setError] = useState(""),
    [search, setSearch] = useState(""),
    [sources, setSources] = useState<Source[]>([]),
    [sourcePage, setSourcePage] = useState(1),
    [more, setMore] = useState(false),
    [searching, setSearching] = useState(false);
  const attempt = useRef<{ body: string; key: string } | null>(null);
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const form = useForm<Values>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      action: (allowed[0] || "REMIT") as Values["action"],
      date: today,
      period: today.slice(0, 7),
      currency: "NGN",
      tax_type: "VAT",
      amount: "",
      authority: "",
      reference: "",
      description: "",
      account_id: "",
      document_key: "",
      source_entry: "",
      classification: "AVAILABLE",
      adjust_field: "output_vat",
      decrease: false,
    },
  });
  const watched = useWatch({ control: form.control }) as Values;
  const action = watched.action,
    currency = watched.currency;
  const cash = ["REMIT", "VAT_SETTLE"].includes(action),
    source = ["CLASSIFY", "VAT_SETTLE"].includes(action);
  async function find(page = 1) {
    setSearching(true);
    const r = await searchTaxSources({ search, page, currency });
    setSearching(false);
    if (r.error) {
      setError(r.error);
      return;
    }
    setSources(r.data?.results ?? []);
    setMore(!!r.data?.next);
    setSourcePage(page);
  }
  async function submit() {
    if (!review || busy) return;
    const signature = JSON.stringify({
      review,
      file: file
        ? { name: file.name, size: file.size, lastModified: file.lastModified }
        : null,
    });
    if (attempt.current?.body !== signature)
      attempt.current = { body: signature, key: crypto.randomUUID() };
    setBusy(true);
    setError("");
    const body = new FormData();
    body.set("payload", JSON.stringify(review));
    body.set("request_key", attempt.current.key);
    if (file) body.set("file", file);
    const r = await submitTax(body);
    setBusy(false);
    if (r.error) {
      setError(r.error);
      return;
    }
    toast.success("Tax request submitted for approval.");
    setOpen(false);
    setReview(null);
    setFile(null);
    form.reset();
    attempt.current = null;
    router.push(`/dashboard/ledger/tax/requests/${r.id}`);
    router.refresh();
  }
  const select = (
    name:
      | "action"
      | "currency"
      | "tax_type"
      | "account_id"
      | "document_key"
      | "source_entry"
      | "classification"
      | "adjust_field",
    options: Array<[string, string]>,
  ) => (
    <LedgerSelect
      value={String(watched[name])}
      onChange={(e) => {
        form.setValue(name, e.target.value as never, { shouldValidate: true });
        if (name === "action") {
          form.setValue(
            "tax_type",
            e.target.value.startsWith("CIT_") ? "CIT" : "VAT",
          );
          form.setValue("document_key", "");
          form.setValue("source_entry", "");
        }
        if (name === "currency") {
          form.setValue("account_id", "");
          form.setValue("source_entry", "");
          form.setValue("document_key", "");
          setSources([]);
        }
      }}
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </LedgerSelect>
  );
  if (!allowed.length) return null;
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!busy) {
          setOpen(v);
          setReview(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>Record tax activity</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {review ? "Review tax request" : "Record tax activity"}
          </DialogTitle>
          <DialogDescription>
            Records post after approval. Your name and the approver’s name are
            retained.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        {review ? (
          <div className="space-y-4">
            <dl className="grid gap-2 sm:grid-cols-2">
              {Object.entries(review)
                .filter(
                  ([k, v]) =>
                    v !== "" &&
                    v !== false &&
                    (![
                      "classification",
                      "adjust_field",
                      "decrease",
                      "tax_type",
                      "account_id",
                      "source_entry",
                      "document_key",
                    ].includes(k) ||
                      (k === "classification" &&
                        review.action === "CLASSIFY") ||
                      (["adjust_field", "decrease"].includes(k) &&
                        review.action === "ADJUST") ||
                      (k === "tax_type" && review.action === "REMIT") ||
                      (k === "account_id" &&
                        ["REMIT", "VAT_SETTLE"].includes(review.action)) ||
                      (k === "source_entry" && review.action === "REVERSE") ||
                      (k === "document_key" &&
                        ["OPENING", "CLASSIFY", "VAT_SETTLE"].includes(
                          review.action,
                        ))),
                )
                .map(([k, v]) => (
                  <div key={k} className="min-w-0 break-words">
                    <dt className="text-sm text-muted-foreground">
                      {k.replaceAll("_", " ")}
                    </dt>
                    <dd>
                      {k === "action"
                        ? actions[review.action]
                        : k === "account_id"
                          ? accounts.find((a) => a.id === v)?.name
                          : k === "adjust_field"
                            ? fields[String(v)]
                            : k === "document_key"
                              ? sources.find((s) => s.document_key === v)
                                  ?.reference ||
                                history?.delivery_review.find(
                                  (d) => d.document_key === v,
                                )?.reference ||
                                "Selected document"
                              : k === "source_entry"
                                ? entries.find((e) => e.id === v)?.reference ||
                                  "Selected posting"
                                : String(v)}
                    </dd>
                  </div>
                ))}
            </dl>
            {file && <p>Evidence: {file.name}</p>}
            <p>
              No money is transferred by this form. It records completed
              activity.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => setReview(null)}
              >
                Back
              </Button>
              <Button disabled={busy} onClick={submit}>
                {busy ? "Submitting…" : "Submit for approval"}
              </Button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={form.handleSubmit(setReview)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1">
                Activity
                {select(
                  "action",
                  allowed.map((a) => [a, actions[a as keyof typeof actions]]),
                )}
              </label>
              <label className="space-y-1">
                Currency
                {select(
                  "currency",
                  ["NGN", "USD", "GBP"].map((v) => [v, v]),
                )}
              </label>
              <label>
                Date
                <LedgerDatePicker
                  value={watched.date}
                  onChange={(e) => form.setValue("date", e.target.value)}
                  required
                />
              </label>
              <label>
                Tax period (YYYY-MM)
                <Input {...form.register("period")} placeholder="2026-11" />
              </label>
              {action === "REMIT" && (
                <>
                  <label>
                    Tax type
                    {select(
                      "tax_type",
                      ["VAT", "WHT", "CIT"].map((v) => [v, v]),
                    )}
                  </label>
                  <label>
                    Authority
                    <Input {...form.register("authority")} />
                  </label>
                </>
              )}
              {!["CLASSIFY", "OPENING", "REVERSE"].includes(action) && (
                <label>
                  Amount
                  <Input inputMode="decimal" {...form.register("amount")} />
                </label>
              )}
              {cash && (
                <label>
                  Cash / bank account
                  {select("account_id", [
                    ["", "Select account"],
                    ...accounts
                      .filter((a) => a.currency === currency && a.is_active)
                      .map((a) => [a.id, a.name] as [string, string]),
                  ])}
                </label>
              )}
              <label>
                Reference
                <Input {...form.register("reference")} />
              </label>
            </div>
            {source && (
              <section className="space-y-2 rounded-lg border p-3">
                <label>
                  Find invoice, bill or tax source
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Reference or party name"
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  disabled={searching}
                  onClick={() => find()}
                >
                  Search sources
                </Button>
                <label className="block">
                  Source document
                  {select("document_key", [
                    ["", "Select source"],
                    ...sources
                      .filter(
                        (s) =>
                          action !== "VAT_SETTLE" ||
                          s.document_key.split(":").length === 2,
                      )
                      .filter(
                        (s) =>
                          action !== "CLASSIFY" ||
                          s.document_key.startsWith("purchase:"),
                      )
                      .map(
                        (s) =>
                          [
                            s.document_key,
                            `${s.reference || s.document_key} · ${s.party_name} · VAT due ${money(s.outstanding_vat, currency)}`,
                          ] as [string, string],
                      ),
                  ])}
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={searching || sourcePage <= 1}
                    onClick={() => find(sourcePage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={searching || !more}
                    onClick={() => find(sourcePage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </section>
            )}
            {action === "OPENING" && (
              <label>
                Historical delivery
                {select("document_key", [
                  ["", "Select reviewed delivery"],
                  ...(history?.delivery_review ?? [])
                    .filter((d) => d.currency === currency)
                    .map(
                      (d) =>
                        [
                          d.document_key,
                          `${d.reference} · VAT gap ${money(d.recognition_gap, currency)}`,
                        ] as [string, string],
                    ),
                ])}
              </label>
            )}
            {action === "REVERSE" && (
              <label>
                Posting to reverse (current ledger page)
                {select("source_entry", [
                  ["", "Select posting"],
                  ...entries
                    .filter(
                      (e) =>
                        e.currency === currency &&
                        [
                          "REMIT",
                          "CIT_ASSESS",
                          "CIT_CREDIT",
                          "ADJUST",
                        ].includes(e.kind),
                    )
                    .map(
                      (e) =>
                        [
                          e.id,
                          `${e.date} · ${e.kind} · ${e.reference} · ${e.description}`,
                        ] as [string, string],
                    ),
                ])}
              </label>
            )}
            {action === "CLASSIFY" && (
              <label>
                Input VAT treatment
                {select("classification", [
                  ["AVAILABLE", "Eligible input credit"],
                  ["PENDING", "Pending review"],
                  ["NONRECOVERABLE", "Non-recoverable expense"],
                ])}
              </label>
            )}
            {action === "ADJUST" && (
              <>
                <label>
                  Balance
                  {select(
                    "adjust_field",
                    [
                      "output_vat",
                      "input_vat",
                      "input_pending",
                      "input_nonrecoverable",
                      "wht_asset",
                      "wht_liability",
                      "cit_assessed",
                      "wht_used",
                      "input_used",
                    ].map((v) => [v, fields[v]]),
                  )}
                </label>
                <label className="flex gap-2">
                  <input type="checkbox" {...form.register("decrease")} />
                  Decrease this balance
                </label>
              </>
            )}
            <label className="block space-y-1">
              Description / reason
              <Textarea {...form.register("description")} />
            </label>
            <label className="block space-y-1">
              Supporting document (optional, image or PDF, up to 10 MB)
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {Object.entries(form.formState.errors).map(([k, e]) => (
              <p key={k} role="alert" className="text-sm text-destructive">
                {e.message}
              </p>
            ))}
            <Button type="submit">Review request</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
