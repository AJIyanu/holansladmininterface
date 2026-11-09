"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
  LedgerDatePicker,
  LedgerSelect,
} from "@/components/ledger/FormControls";
import {
  editorSchema,
  expenseCategories,
  expenseTotal,
  payCategories,
  receiveCategories,
  retirementBalance,
  todayISO,
  type EditorValues,
} from "@/features/staff-ledger/schema";
import {
  labels,
  type Account,
  type StaffEntry,
} from "@/features/staff-ledger/types";
import { saveStaffRecord } from "@/features/staff-ledger/actions";
import { money } from "@/features/cash-book/types";
import { SourcePicker } from "./Picker";
const accept = "image/png,image/jpeg,image/webp,application/pdf";
export function StaffEditor({
  kind,
  staff,
  accounts,
}: {
  kind: "PAY" | "RECEIVE" | "RETIRE";
  staff: string;
  accounts: Account[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false);
  const [review, setReview] = useState<EditorValues | null>(null);
  const [source, setSource] = useState<StaffEntry | null>(null);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [error, setError] = useState("");
  const submission = useRef({ fingerprint: "", id: "" });
  const initial: EditorValues = {
    kind,
    date: todayISO(),
    currency: "NGN",
    description: "",
    reference: "",
    category: kind === "PAY" ? "SALARY" : "ADVANCE_RETURN",
    amount: "",
    account_id:
      accounts.find((a) => a.is_active && a.currency === "NGN")?.id ?? "",
    related_entry: "",
    items:
      kind === "RETIRE"
        ? [
            {
              date: todayISO(),
              category: "TRANSPORT",
              description: "",
              amount: "",
            },
          ]
        : [],
  };
  const form = useForm<EditorValues>({
    resolver: zodResolver(editorSchema),
    defaultValues: initial,
  });
  const values = useWatch({ control: form.control }) as EditorValues;
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "items",
    keyName: "_key",
  });
  const retire = kind === "RETIRE";
  const linked =
    retire ||
    ["ADVANCE_RETURN", "LOAN_REPAYMENT", "ADVANCE_REIMBURSEMENT"].includes(
      values.category,
    );
  const mode = retire
    ? "retire"
    : values.category === "LOAN_REPAYMENT"
      ? "loan"
      : values.category === "ADVANCE_REIMBURSEMENT"
        ? "reimbursement"
        : "advance";
  const total = retire
    ? expenseTotal(values.items ?? [])
    : values.amount || "0";
  const preview = retirementBalance(source?.remaining ?? "0", total);
  function chooseFile(key: string, file?: File) {
    if (file && file.size > 10 * 1024 * 1024) {
      toast.error("Each supporting document must be 10 MB or smaller.");
      return;
    }
    setFiles((prev) => {
      const next = { ...prev };
      if (file) next[key] = file;
      else delete next[key];
      return next;
    });
  }
  async function confirm() {
    if (!review) return;
    setBusy(true);
    setError("");
    try {
      const ordered: [string, File][] = retire
        ? fields.flatMap((field, index) =>
            files[field._key]
              ? [[`item_${index}`, files[field._key]] as [string, File]]
              : [],
          )
        : files.file
          ? [["file", files.file]]
          : [];
      if (
        ordered.reduce((sum, [, file]) => sum + file.size, 0) >
        20 * 1024 * 1024
      ) {
        setError("Supporting documents must total no more than 20 MB.");
        return;
      }
      const hashes = await Promise.all(
        ordered.map(async ([key, file]) => [
          key,
          file.name,
          file.type,
          file.size,
          Array.from(
            new Uint8Array(
              await crypto.subtle.digest("SHA-256", await file.arrayBuffer()),
            ),
            (b) => b.toString(16).padStart(2, "0"),
          ).join(""),
        ]),
      );
      const fingerprint = JSON.stringify({
        staff,
        values: review,
        files: hashes,
      });
      if (submission.current.fingerprint !== fingerprint)
        submission.current = { fingerprint, id: crypto.randomUUID() };
      const body = new FormData();
      body.set(
        "payload",
        JSON.stringify({
          staff,
          request_key: submission.current.id,
          values: review,
        }),
      );
      for (const [key, file] of ordered) body.set(key, file);
      const result = await saveStaffRecord(body);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success(
        retire
          ? "Expense breakdown submitted for approval."
          : "Staff transaction recorded.",
      );
      setOpen(false);
      setReview(null);
      setFiles({});
      setSource(null);
      form.reset(initial);
      submission.current = { fingerprint: "", id: "" };
      router.push(`/dashboard/ledger/staff/${result.kind}/${result.id}`);
      router.refresh();
    } catch {
      setError("Unable to confirm the result. Retry with the same details.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!busy) setOpen(v);
      }}
    >
      <DialogTrigger asChild>
        <Button variant={retire ? "outline" : "default"}>{labels[kind]}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{labels[kind]}</DialogTitle>
          <DialogDescription>
            {retire
              ? "List how the advance was spent. Submission waits for approval before expenses are recorded."
              : "Record money already paid or received. The staff ledger, cash book and journal update together."}
          </DialogDescription>
        </DialogHeader>
        {review ? (
          <section className="space-y-4">
            <h3 className="font-semibold">Review before confirming</h3>
            <p>
              {review.date} ·{" "}
              {retire ? "Advance expense breakdown" : labels[review.category]} ·{" "}
              {review.currency}
            </p>
            <p className="whitespace-pre-wrap break-words">
              {review.description}
            </p>
            {source && (
              <p>
                Linked: {source.date} · {source.description}
              </p>
            )}
            {!retire && (
              <p>
                Account:{" "}
                {accounts.find((a) => a.id === review.account_id)?.name} ·
                Reference: {review.reference || "—"}
              </p>
            )}
            {retire && (
              <ol className="list-inside list-decimal space-y-2">
                {review.items.map((item, i) => (
                  <li key={fields[i]._key} className="rounded border p-3">
                    {item.date} · {labels[item.category]} · {item.description} ·{" "}
                    {money(item.amount, review.currency)}
                    {files[fields[i]._key] && (
                      <p className="text-sm text-muted-foreground">
                        Supporting document: {files[fields[i]._key].name}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
            {!retire && files.file && (
              <p>Supporting document: {files.file.name}</p>
            )}
            <p className="text-xl font-semibold">
              Total:{" "}
              {money(
                retire ? expenseTotal(review.items) : review.amount,
                review.currency,
              )}
            </p>
            {retire ? (
              <p>
                On approval: change due {money(preview.change, review.currency)}
                ; reimbursement due{" "}
                {money(preview.reimbursement, review.currency)}. No additional
                cash movement.
              </p>
            ) : (
              <p>
                {["ADVANCE", "LOAN"].includes(review.category)
                  ? "This creates an amount recoverable from the staff member."
                  : linked
                    ? "This settles the linked advance or loan."
                    : "This is an ordinary expense or income; it does not create staff debt."}
              </p>
            )}
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setReview(null);
                  setError("");
                }}
              >
                Back to form
              </Button>
              <Button disabled={busy} onClick={confirm}>
                {busy
                  ? "Saving…"
                  : retire
                    ? "Submit expense breakdown"
                    : "Confirm transaction"}
              </Button>
            </div>
          </section>
        ) : (
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(
              (v) => {
                if (
                  !retire &&
                  !accounts.some(
                    (a) =>
                      a.id === v.account_id &&
                      a.currency === v.currency &&
                      a.is_active,
                  )
                ) {
                  setError(
                    "Choose an active account in the selected currency.",
                  );
                  return;
                }
                setError("");
                setReview(v);
              },
              () =>
                setError(
                  "Check the dates, required descriptions, selected account or advance, and positive amounts for each item.",
                ),
            )}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1">
                <span>Date</span>
                <Controller
                  name="date"
                  control={form.control}
                  render={({ field }) => (
                    <LedgerDatePicker {...field} required />
                  )}
                />
              </label>
              <label className="space-y-1">
                <span>Currency</span>
                <Controller
                  name="currency"
                  control={form.control}
                  render={({ field }) => (
                    <LedgerSelect
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        form.setValue("related_entry", "");
                        form.setValue("account_id", "");
                        setSource(null);
                      }}
                    >
                      {["NGN", "USD", "GBP"].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </LedgerSelect>
                  )}
                />
              </label>
              {!retire && (
                <>
                  <label className="space-y-1">
                    <span>Category</span>
                    <Controller
                      name="category"
                      control={form.control}
                      render={({ field }) => (
                        <LedgerSelect
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            form.setValue("related_entry", "");
                            setSource(null);
                          }}
                        >
                          {(kind === "PAY"
                            ? payCategories
                            : receiveCategories
                          ).map((c) => (
                            <option key={c} value={c}>
                              {labels[c]}
                            </option>
                          ))}
                        </LedgerSelect>
                      )}
                    />
                  </label>
                  <label className="space-y-1">
                    <span>Cash / bank account</span>
                    <Controller
                      name="account_id"
                      control={form.control}
                      render={({ field }) => (
                        <LedgerSelect {...field} required>
                          <option value="">Select account</option>
                          {accounts
                            .filter(
                              (a) =>
                                a.is_active && a.currency === values.currency,
                            )
                            .map((a) => (
                              <option value={a.id} key={a.id}>
                                {a.name} · {a.kind === "CASH" ? "Cash" : "Bank"}
                              </option>
                            ))}
                        </LedgerSelect>
                      )}
                    />
                  </label>
                  <label className="space-y-1">
                    <span>Amount</span>
                    <Input
                      inputMode="decimal"
                      {...form.register("amount")}
                      required
                    />
                  </label>
                  <label className="space-y-1">
                    <span>Reference (optional)</span>
                    <Input maxLength={100} {...form.register("reference")} />
                  </label>
                </>
              )}
            </div>
            {linked && (
              <div className="space-y-2">
                <span className="text-sm font-medium">
                  Related {mode === "loan" ? "loan" : "advance"}
                </span>
                <SourcePicker
                  key={`${values.currency}-${mode}`}
                  staff={staff}
                  currency={values.currency}
                  mode={mode}
                  label={source ? `${source.date} · ${source.description}` : ""}
                  onSelect={(entry) => {
                    setSource(entry);
                    form.setValue("related_entry", entry.id, {
                      shouldValidate: true,
                    });
                  }}
                />
                {source && (
                  <p className="text-sm text-muted-foreground">
                    Remaining: {money(source.remaining ?? "0", values.currency)}{" "}
                    · Reimbursement due:{" "}
                    {money(source.reimbursement_due ?? "0", values.currency)}
                  </p>
                )}
              </div>
            )}
            <label className="block space-y-1">
              <span>Description</span>
              <Input
                {...form.register("description")}
                maxLength={1000}
                required
              />
            </label>
            {retire ? (
              <section className="space-y-3">
                <h3 className="font-semibold">Expense breakdown</h3>
                {fields.map((field, index) => (
                  <fieldset
                    key={field._key}
                    className="space-y-3 rounded-lg border p-3"
                  >
                    <legend className="px-1 font-medium">
                      Expense {index + 1}
                    </legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1">
                        <span>Expense date</span>
                        <Controller
                          name={`items.${index}.date`}
                          control={form.control}
                          render={({ field: f }) => (
                            <LedgerDatePicker {...f} required />
                          )}
                        />
                      </label>
                      <label className="space-y-1">
                        <span>Category</span>
                        <Controller
                          name={`items.${index}.category`}
                          control={form.control}
                          render={({ field: f }) => (
                            <LedgerSelect {...f}>
                              {expenseCategories.map((c) => (
                                <option key={c} value={c}>
                                  {labels[c]}
                                </option>
                              ))}
                            </LedgerSelect>
                          )}
                        />
                      </label>
                      <label className="space-y-1 sm:col-span-2">
                        <span>How the money was spent</span>
                        <Input
                          {...form.register(`items.${index}.description`)}
                          maxLength={1000}
                          required
                        />
                      </label>
                      <label className="space-y-1">
                        <span>Amount</span>
                        <Input
                          {...form.register(`items.${index}.amount`)}
                          inputMode="decimal"
                          required
                        />
                      </label>
                      <label className="space-y-1">
                        <span>Receipt (optional)</span>
                        <Input
                          type="file"
                          accept={accept}
                          onChange={(e) =>
                            chooseFile(field._key, e.target.files?.[0])
                          }
                        />
                        {files[field._key] && (
                          <span className="break-all text-xs">
                            {files[field._key].name}
                          </span>
                        )}
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={index === 0}
                        onClick={() => move(index, index - 1)}
                        aria-label={`Move expense ${index + 1} up`}
                      >
                        Move up
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={index === fields.length - 1}
                        onClick={() => move(index, index + 1)}
                        aria-label={`Move expense ${index + 1} down`}
                      >
                        Move down
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={fields.length === 1}
                        onClick={() => {
                          chooseFile(field._key);
                          remove(index);
                        }}
                      >
                        Remove item
                      </Button>
                    </div>
                  </fieldset>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  disabled={fields.length >= 100}
                  onClick={() =>
                    append({
                      date: values.date,
                      category: "OTHER",
                      description: "",
                      amount: "",
                    })
                  }
                >
                  Add expense item
                </Button>
                <p className="text-lg font-semibold" aria-live="polite">
                  Total expenses: {money(total, values.currency)}
                </p>
                {source && (
                  <p>
                    Estimated change: {money(preview.change, values.currency)} ·
                    Estimated reimbursement:{" "}
                    {money(preview.reimbursement, values.currency)}
                  </p>
                )}
              </section>
            ) : (
              <label className="block space-y-1">
                <span>Supporting document (optional)</span>
                <Input
                  type="file"
                  accept={accept}
                  onChange={(e) => chooseFile("file", e.target.files?.[0])}
                />
                {files.file && (
                  <span className="text-xs">{files.file.name}</span>
                )}
              </label>
            )}
            <p className="text-xs text-muted-foreground">
              PDF, PNG, JPEG or WebP. Maximum 10 MB each, 20 MB combined.
            </p>
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            <Button type="submit">
              Review {retire ? "expense breakdown" : "transaction"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
