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
  LedgerSelect,
  LedgerDatePicker,
} from "@/components/ledger/FormControls";
import { UnitSelect } from "@/components/sales-invoice/UnitSelect";
import {
  purchaseValuesSchema,
  purchaseTotals,
  defaults,
  type PurchaseValues,
} from "@/features/purchases/schema";
import { savePurchase } from "@/features/purchases/actions";
import type { PurchaseRecord } from "@/features/purchases/types";
import type { ReceiptAccount } from "@/features/sales-receipt/types";
import { decimal, lineAmount } from "@/features/sales-invoice/schema";
import { money } from "@/features/cash-book/types";
import { BillPicker } from "./BillPicker";
export function PurchaseEditor({
  kind,
  party,
  accounts = [],
  bill,
  canCopy = false,
  canDeliver = false,
}: {
  kind: "bills" | "payments";
  party: string;
  accounts?: ReceiptAccount[];
  bill?: PurchaseRecord;
  canCopy?: boolean;
  canDeliver?: boolean;
}) {
  const payment = kind === "payments";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState<PurchaseValues | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [billLabel, setBillLabel] = useState("");
  const key = useRef({ body: "", id: "" });
  const fileInput = useRef<HTMLInputElement>(null);
  const initial = {
    ...defaults(),
    ...(bill?.snapshot ?? {}),
    account_id:
      accounts.find(
        (a) => a.currency === "NGN" && a.kind === "CASH" && a.is_active,
      )?.id ?? "",
  };
  const form = useForm<PurchaseValues>({
    resolver: zodResolver(purchaseValuesSchema),
    defaultValues: initial,
  });
  const values = useWatch({ control: form.control }) as PurchaseValues;
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "items",
    keyName: "_key",
  });
  const totals = purchaseTotals(values);
  const fmt = (v: bigint) =>
    money(v < BigInt(0) ? "-" + decimal(-v) : decimal(v), values.currency);
  const title = payment
    ? "Add payment"
    : bill
      ? "Edit supplier bill"
      : "Add bill";
  function prepare(v: PurchaseValues) {
    if (!payment && !v.reference) {
      form.setError("reference", {
        message: "Enter the supplier invoice reference.",
      });
      return;
    }
    if (payment) {
      const account = accounts.find(
        (a) =>
          a.id === v.account_id && a.currency === v.currency && a.is_active,
      );
      if (
        !account ||
        (v.payment_method === "CASH") !== (account.kind === "CASH")
      ) {
        form.setError("account_id", {
          message: "Select a matching active paying account.",
        });
        return;
      }
      if (v.payment_method !== "CASH" && !v.bank_name) {
        form.setError("bank_name", { message: "Enter the paying bank name." });
        return;
      }
    }
    setReview(v);
  }
  async function save() {
    if (!review) return;
    setBusy(true);
    try {
      let checksum = "";
      if (file)
        checksum = Array.from(
          new Uint8Array(
            await crypto.subtle.digest("SHA-256", await file.arrayBuffer()),
          ),
        )
          .map((n) => n.toString(16).padStart(2, "0"))
          .join("");
      const body = JSON.stringify({
        values: review,
        checksum,
        filename: file?.name,
      });
      if (key.current.body !== body)
        key.current = { body, id: crypto.randomUUID() };
      const data = new FormData();
      data.set(
        "payload",
        JSON.stringify({
          kind,
          party,
          id: bill?.id,
          version: bill?.version,
          request_key: key.current.id,
          values: review,
        }),
      );
      if (file) data.set("file", file);
      const result = await savePurchase(data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.record) {
        toast.success(
          payment ? "Supplier payment recorded." : "Supplier bill saved.",
        );
        setOpen(false);
        setReview(null);
        form.reset();
        setFile(null);
        key.current = { body: "", id: "" };
        router.push(`/dashboard/ledger/purchase/${kind}/${result.record.id}`);
        router.refresh();
      }
    } catch {
      toast.error("Unable to confirm the result. Retry with the same details.");
    } finally {
      setBusy(false);
    }
  }
  const summary = (
    <div className="space-y-1 rounded bg-muted p-4">
      <p>Items subtotal: {fmt(totals.gross)}</p>
      {values.discount_enabled && <p>Discount: −{fmt(totals.discount)}</p>}
      <p>Goods value: {fmt(totals.subtotal)}</p>
      <p>
        Tax {values.tax_enabled ? `(${values.tax_percent}%)` : "not applied"}:{" "}
        {fmt(totals.tax)}
      </p>
      {payment ? (
        <>
          <p>
            Withholding{" "}
            {values.withholding_enabled
              ? `(${values.withholding_percent}%)`
              : "not applied"}
            : −{fmt(totals.withholding)}
          </p>
          <p className="font-bold">Actual money paid: {fmt(totals.paid)}</p>
        </>
      ) : (
        <p className="font-bold">Supplier invoice total: {fmt(totals.total)}</p>
      )}
    </div>
  );
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!busy) {
          setOpen(v);
          if (!v) setReview(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant={payment || bill ? "outline" : "default"}>
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{review ? "Review supplier record" : title}</DialogTitle>
          <DialogDescription>
            {payment
              ? "Record money already paid to the supplier. Attach their receipt now or later."
              : "Record the supplier's invoice. It becomes supplier debt only when marked delivered."}
          </DialogDescription>
        </DialogHeader>
        {review ? (
          <div className="space-y-4">
            <p>
              {review.date} · {review.currency}
            </p>
            {payment ? (
              <>
                <p>
                  {review.payment_method.replaceAll("_", " ")} ·{" "}
                  {accounts.find((a) => a.id === review.account_id)?.name}
                </p>
                {review.payment_method !== "CASH" && review.bank_name && (
                  <p>Bank: {review.bank_name}</p>
                )}
                <p>
                  Supplier receipt number:{" "}
                  {review.receipt_number || "Not yet supplied"}
                </p>
                <p>Receipt scan: {file?.name ?? "Not yet supplied"}</p>
                {review.bill_id && <p>Supplier invoice: {billLabel}</p>}
              </>
            ) : (
              <>
                <p>Invoice: {review.reference}</p>
                <p>
                  {review.delivered
                    ? `Delivered on ${review.delivery_date}`
                    : "Not delivered — no debt posted"}
                </p>
              </>
            )}
            <ol className="space-y-2">
              {review.items.map((r, i) => (
                <li key={i} className="rounded border p-2">
                  {i + 1}. {r.description} · {r.quantity} {r.unit} ×{" "}
                  {money(r.unit_price, review.currency)} ={" "}
                  {money(decimal(lineAmount(r)), review.currency)}
                </li>
              ))}
            </ol>
            {summary}
            <p className="text-sm text-muted-foreground">
              {payment
                ? "Confirmation posts the goods payment and exact cash outflow immediately. Payments before delivery remain supplier advances."
                : review.delivered
                  ? "Confirmation records the goods value as supplier debt without moving cash."
                  : "This bill remains outside the purchase ledger until delivery is confirmed."}
            </p>
            <div className="flex gap-2">
              <Button disabled={busy} onClick={save}>
                {busy ? "Saving…" : "Confirm and save"}
              </Button>
              <Button
                disabled={busy}
                variant="outline"
                onClick={() => setReview(null)}
              >
                Back to edit
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(prepare)} className="space-y-4">
            {payment && canCopy && (
              <BillPicker
                party={party}
                selected={values.bill_id}
                onSelect={(row) => {
                  if (!row) {
                    form.setValue("bill_id", undefined);
                    form.setValue("bill_version", undefined);
                    setBillLabel("");
                    return;
                  }
                  const old = form.getValues();
                  setBillLabel(row.reference ?? "");
                  form.reset({
                    ...old,
                    items: row.snapshot.items.map(
                      ({ description, quantity, unit, unit_price }) => ({
                        description,
                        quantity,
                        unit,
                        unit_price,
                      }),
                    ),
                    currency: row.currency as PurchaseValues["currency"],
                    bill_id: row.id,
                    bill_version: row.version,
                    tax_enabled: row.snapshot.tax_enabled,
                    tax_percent: row.snapshot.tax_percent,
                    discount_enabled: row.snapshot.discount_enabled,
                    discount_type: row.snapshot.discount_type,
                    discount_value: row.snapshot.discount_value,
                    account_id:
                      accounts.find(
                        (a) =>
                          a.is_active &&
                          a.currency === row.currency &&
                          (old.payment_method === "CASH"
                            ? a.kind === "CASH"
                            : a.kind === "BANK"),
                      )?.id ?? "",
                  });
                }}
              />
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                Date
                <Controller
                  control={form.control}
                  name="date"
                  render={({ field }) => <LedgerDatePicker {...field} />}
                />
              </label>
              <label>
                Currency
                <LedgerSelect {...form.register("currency")}>
                  {["NGN", "USD", "GBP"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </LedgerSelect>
              </label>
              {!payment && (
                <label>
                  Supplier invoice reference
                  <Input maxLength={100} {...form.register("reference")} />
                </label>
              )}
              <label>
                Description / notes
                <Input maxLength={500} {...form.register("description")} />
              </label>
            </div>
            <div className="space-y-3">
              {fields.map((f, i) => (
                <fieldset key={f._key} className="space-y-3 rounded border p-3">
                  <legend>Item {i + 1}</legend>
                  <label className="block">
                    Description
                    <textarea
                      className="block w-full rounded border bg-background p-2"
                      maxLength={1000}
                      {...form.register(`items.${i}.description`)}
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <label>
                      Quantity
                      <Input
                        inputMode="decimal"
                        {...form.register(`items.${i}.quantity`)}
                      />
                    </label>
                    <div>
                      Unit
                      <Controller
                        control={form.control}
                        name={`items.${i}.unit`}
                        render={({ field }) => (
                          <UnitSelect
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                          />
                        )}
                      />
                    </div>
                    <label>
                      Unit price
                      <Input
                        inputMode="decimal"
                        {...form.register(`items.${i}.unit_price`)}
                      />
                    </label>
                    <p>
                      Line total
                      <br />
                      {fmt(
                        lineAmount(
                          values.items[i] ?? { quantity: "0", unit_price: "0" },
                        ),
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!i}
                      onClick={() => move(i, i - 1)}
                    >
                      Move up
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={i === fields.length - 1}
                      onClick={() => move(i, i + 1)}
                    >
                      Move down
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={fields.length === 1}
                      onClick={() => remove(i)}
                    >
                      Remove
                    </Button>
                  </div>
                  {form.formState.errors.items?.[i] && (
                    <p role="alert" className="text-destructive">
                      Check this item’s description, positive quantity, unit and
                      unit price.
                    </p>
                  )}
                </fieldset>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={fields.length >= 100}
              onClick={() =>
                append({
                  description: "",
                  quantity: "1",
                  unit: "pcs",
                  unit_price: "",
                })
              }
            >
              Add item
            </Button>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  role="switch"
                  {...form.register("tax_enabled")}
                />
                Add tax
              </label>
              {values.tax_enabled && (
                <label>
                  Tax (%)
                  <Input
                    inputMode="decimal"
                    {...form.register("tax_percent")}
                  />
                </label>
              )}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  role="switch"
                  {...form.register("discount_enabled")}
                />
                Add discount
              </label>
              {values.discount_enabled && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <label>
                    Discount type
                    <LedgerSelect {...form.register("discount_type")}>
                      <option value="PERCENT">Percentage</option>
                      <option value="AMOUNT">Fixed amount</option>
                    </LedgerSelect>
                  </label>
                  <label>
                    Discount value
                    <Input
                      inputMode="decimal"
                      {...form.register("discount_value")}
                    />
                  </label>
                </div>
              )}
            </div>
            {payment ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label>
                    Payment method
                    <LedgerSelect {...form.register("payment_method")}>
                      <option value="CASH">Cash</option>
                      <option value="BANK_TRANSFER">Bank transfer</option>
                      <option value="CARD">Card</option>
                      <option value="CHEQUE">Cleared cheque</option>
                    </LedgerSelect>
                  </label>
                  <label>
                    Paying account
                    <LedgerSelect {...form.register("account_id")}>
                      <option value="">Select account</option>
                      {accounts
                        .filter(
                          (a) =>
                            a.is_active &&
                            a.currency === values.currency &&
                            (values.payment_method === "CASH"
                              ? a.kind === "CASH"
                              : a.kind === "BANK"),
                        )
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                    </LedgerSelect>
                  </label>
                  {values.payment_method !== "CASH" && (
                    <label>
                      Paying bank name
                      <Input maxLength={255} {...form.register("bank_name")} />
                    </label>
                  )}
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      role="switch"
                      {...form.register("withholding_enabled")}
                    />
                    Withholding tax
                  </label>
                  {values.withholding_enabled && (
                    <label>
                      Withholding (%)
                      <Input
                        inputMode="decimal"
                        {...form.register("withholding_percent")}
                      />
                    </label>
                  )}
                  <label>
                    Supplier receipt number
                    <Input
                      maxLength={100}
                      {...form.register("receipt_number")}
                    />
                  </label>
                  <label>
                    Supplier receipt scan (optional)
                    <Input
                      ref={fileInput}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      onChange={(e) => {
                        const value = e.target.files?.[0] ?? null;
                        if (value && value.size > 10 * 1024 * 1024) {
                          toast.error(
                            "Receipt scans must be 10 MB or smaller.",
                          );
                          e.target.value = "";
                          setFile(null);
                        } else setFile(value);
                      }}
                    />
                    <span className="text-sm text-muted-foreground">
                      PDF, JPEG, PNG or WebP; up to 10 MB.
                    </span>
                  </label>
                  {file && (
                    <div className="break-words">
                      Selected scan: {file.name}{" "}
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setFile(null);
                          if (fileInput.current) fileInput.current.value = "";
                        }}
                      >
                        Remove scan
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Tax and withholding are both calculated on goods after
                  discount, before tax is added.
                </p>
              </>
            ) : (
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    role="switch"
                    disabled={!canDeliver}
                    {...form.register("delivered")}
                  />
                  Items delivered
                </label>
                {values.delivered && (
                  <label>
                    Delivery date
                    <Controller
                      control={form.control}
                      name="delivery_date"
                      render={({ field }) => <LedgerDatePicker {...field} />}
                    />
                  </label>
                )}
              </div>
            )}
            {summary}
            {Object.entries(form.formState.errors).map(([k, e]) =>
              typeof e?.message === "string" ? (
                <p key={k} role="alert" className="text-destructive">
                  {e.message}
                </p>
              ) : null,
            )}
            <Button type="submit">Review {payment ? "payment" : "bill"}</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
