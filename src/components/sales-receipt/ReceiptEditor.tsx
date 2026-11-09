"use client";
import { useSalesTaxRates } from "@/features/tax-ledger/useSalesTaxRates";
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
  invoiceSubtotal,
  discountedLineAmount,
  lineAmount,
  decimal,
} from "@/features/sales-invoice/schema";
import { createReceipt } from "@/features/sales-receipt/actions";
import {
  receiptValuesSchema,
  receiptTotals,
  type ReceiptValues,
} from "@/features/sales-receipt/schema";
import type { ReceiptAccount } from "@/features/sales-receipt/types";
import { ReceiptInvoicePicker } from "./ReceiptInvoicePicker";
import {
  LedgerSelect,
  LedgerDatePicker,
} from "@/components/ledger/FormControls";
import type { InvoiceDefaults } from "@/features/sales-invoice/types";
import { money } from "@/features/cash-book/types";
import { UnitSelect } from "../sales-invoice/UnitSelect";
import { quantityLabel } from "@/features/sales-invoice/units";
const emptyItem = () => ({
  description: "",
  quantity: "1",
  unit: "pcs",
  unit_price: "",
});
export function ReceiptEditor({
  party,
  accounts,
  canViewInvoices,
  defaults,
}: {
  party: string;
  accounts: ReceiptAccount[];
  canViewInvoices: boolean;
  defaults?: InvoiceDefaults;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copying, setCopying] = useState(false);
  const [invoiceLabel, setInvoiceLabel] = useState("");
  const [review, setReview] = useState<ReceiptValues | null>(null);
  const key = useRef({ body: "", id: "" });
  const form = useForm<ReceiptValues>({
    resolver: zodResolver(receiptValuesSchema),
    defaultValues: {
      account_id:
        accounts.find(
          (a) => a.is_active && a.currency === "NGN" && a.kind === "CASH",
        )?.id ?? "",
      payment_method: "CASH",
      bank_name: "",
      payment_reference: "",
      vat_paid: false,
      withholding_applied: false,
      date: new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Lagos",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()),
      currency: "NGN",
      billed_to: defaults?.billed_to ?? "",
      billing_address: defaults?.billing_address ?? "",
      recipient_email: defaults?.recipient_email ?? "",
      notes: "",
      discount_percent: "0",
      items: [emptyItem()],
    },
  });
  const { fields, append, remove, move } = useFieldArray<
    ReceiptValues,
    "items",
    "_key"
  >({ control: form.control, name: "items", keyName: "_key" });
  const items = useWatch({ control: form.control, name: "items" });
  const currency = useWatch({ control: form.control, name: "currency" });
  const discountPercent =
    useWatch({ control: form.control, name: "discount_percent" }) ?? "0";
  const grossSubtotal = invoiceSubtotal(items ?? []);
  const subtotal = invoiceSubtotal(items ?? [], discountPercent);
  const discount = grossSubtotal - subtotal;
  const vatPaid = useWatch({ control: form.control, name: "vat_paid" });
  const withholdingApplied = useWatch({
    control: form.control,
    name: "withholding_applied",
  });
  const method = useWatch({ control: form.control, name: "payment_method" });
  const accountId = useWatch({ control: form.control, name: "account_id" });
  const invoiceId = useWatch({ control: form.control, name: "invoice_id" });
  const rateDate = useWatch({ control: form.control, name: "date" });
  const rates = useSalesTaxRates(open, rateDate, party, invoiceId);
  const { vat, withholding, received } = receiptTotals(
    subtotal,
    vatPaid,
    withholdingApplied,
    rates.vat,
    rates.wht,
  );
  const fmt = (value: bigint) => money(decimal(value), currency);
  async function save() {
    if (!review) return;
    const body = JSON.stringify({ values: review });
    if (key.current.body !== body)
      key.current = { body, id: crypto.randomUUID() };
    setBusy(true);
    try {
      const result = await createReceipt({
        party,
        request_key: key.current.id,
        values: review,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.receipt) {
        toast.success("Payment receipt confirmed.");
        setOpen(false);
        setReview(null);
        form.reset();
        key.current = { body: "", id: "" };
        setInvoiceLabel("");
        router.push(`/dashboard/ledger/sales/receipts/${result.receipt.id}`);
        router.refresh();
      }
    } catch {
      toast.error("Unable to confirm the result. Retry with the same details.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!busy) {
          setOpen(value);
          if (!value) setReview(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <span className="hidden sm:inline">Add Payment Receipt</span>
          <span className="sm:hidden">Add Receipt</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-5xl">
        {!rates.ready && (
          <p role="status">
            {rates.error || "Loading tax rates…"}{" "}
            {rates.error && (
              <Button variant="outline" onClick={rates.retry}>
                Retry rates
              </Button>
            )}
          </p>
        )}
        <DialogHeader>
          <DialogTitle>
            {review ? (
              "Review Payment Receipt"
            ) : (
              <>
                <span className="hidden sm:inline">Add Payment Receipt</span>
                <span className="sm:hidden">Add Receipt</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Confirming acknowledges money received and records it immediately.
          </DialogDescription>
        </DialogHeader>
        {review ? (
          <div className="space-y-4">
            <p>
              {review.billed_to} · {review.date} · {review.currency}
            </p>
            <p>
              Method: {review.payment_method.replaceAll("_", " ")} · Account:{" "}
              {accounts.find((a) => a.id === accountId)?.name}
            </p>
            {review.bank_name && review.payment_method !== "CASH" && (
              <p>Bank: {review.bank_name}</p>
            )}
            {review.payment_reference && (
              <p>Payment reference: {review.payment_reference}</p>
            )}
            <p>
              VAT paid: {review.vat_paid ? "Yes" : "No"} · Withholding:{" "}
              {review.withholding_applied ? "Yes" : "No"}
            </p>
            {review.invoice_id && <p>Invoice reference: {invoiceLabel}</p>}
            <ol className="space-y-2">
              {review.items.map((row, i) => (
                <li key={i} className="rounded border p-3">
                  <p>
                    {i + 1}. {row.description}
                  </p>
                  <p className="text-sm">
                    {quantityLabel(row.quantity, row.unit)} ×{" "}
                    {money(row.unit_price, review.currency)} ={" "}
                    {money(decimal(lineAmount(row)), review.currency)}
                  </p>
                  {Number(review.discount_percent ?? "0") > 0 && (
                    <p className="text-sm">
                      After discount:{" "}
                      {money(
                        decimal(
                          discountedLineAmount(row, review.discount_percent),
                        ),
                        review.currency,
                      )}
                    </p>
                  )}
                </li>
              ))}
            </ol>
            <p className="font-semibold">
              Goods subtotal: {fmt(grossSubtotal)}
            </p>
            {Number(discountPercent) > 0 && (
              <p>
                Discount ({discountPercent}%): −{fmt(discount)}
              </p>
            )}
            <p>Net goods subtotal: {fmt(subtotal)}</p>
            <p>
              VAT paid ({rates.vat}%): {fmt(vat)} · Withholding ({rates.wht}%):
              −{fmt(withholding)} · Amount received: {fmt(received)}
            </p>
            <p className="text-sm text-muted-foreground">
              The goods payment enters the sales ledger immediately. The cash
              book records the amount received, including VAT paid and deducting
              withholding.
            </p>
            <div className="flex gap-3">
              <Button onClick={save} disabled={busy}>
                {busy ? "Saving…" : "Confirm and record receipt"}
              </Button>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => setReview(null)}
              >
                Back to edit
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={form.handleSubmit((values) => {
              if (copying) return;
              if (!rates.ready) {
                toast.error(rates.error || "Wait for tax rates to load.");
                return;
              }
              const account = accounts.find(
                (a) =>
                  a.id === values.account_id &&
                  a.is_active &&
                  a.currency === values.currency,
              );
              if (
                !account ||
                (values.payment_method === "CASH") !== (account.kind === "CASH")
              ) {
                form.setError("account_id", {
                  message:
                    "Choose a matching cash or bank account in this currency.",
                });
                return;
              }
              setReview({
                ...values,
                expected_vat_rate: rates.vat,
                expected_withholding_rate: rates.wht,
              });
            })}
            className="space-y-5"
          >
            {canViewInvoices && (
              <ReceiptInvoicePicker
                party={party}
                selected={invoiceId}
                onCopying={setCopying}
                onSelect={(invoice) => {
                  if (!invoice) {
                    setInvoiceLabel("");
                    form.setValue("invoice_id", undefined);
                    form.setValue("invoice_version", undefined);
                    return;
                  }
                  setReview(null);
                  setInvoiceLabel(
                    invoice.reference ??
                      `Unconfirmed invoice · ${invoice.date}`,
                  );
                  const old = form.getValues();
                  form.reset({
                    ...old,
                    invoice_id: invoice.id,
                    invoice_version: invoice.version,
                    currency: invoice.currency,
                    account_id:
                      accounts.find(
                        (a) =>
                          a.is_active &&
                          a.currency === invoice.currency &&
                          (old.payment_method === "CASH"
                            ? a.kind === "CASH"
                            : a.kind === "BANK"),
                      )?.id ?? "",
                    billed_to: invoice.billed_to,
                    billing_address: invoice.billing_address,
                    recipient_email: invoice.recipient_email,
                    notes: invoice.notes,
                    discount_percent: invoice.pricing?.discount_percent ?? "0",
                    items: invoice.items.map(
                      ({ description, quantity, unit, unit_price }) => ({
                        description,
                        quantity,
                        unit,
                        unit_price,
                      }),
                    ),
                  });
                }}
              />
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                Receipt date
                <Controller
                  control={form.control}
                  name="date"
                  render={({ field }) => <LedgerDatePicker {...field} />}
                />
              </label>
              <label>
                Currency
                <LedgerSelect
                  className="block w-full rounded border bg-background p-2"
                  {...form.register("currency")}
                >
                  {["NGN", "USD", "GBP"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </LedgerSelect>
              </label>
              <label>
                Received from
                <Input maxLength={255} {...form.register("billed_to")} />
              </label>
              <label>
                Client email
                <Input type="email" {...form.register("recipient_email")} />
              </label>
              <label className="sm:col-span-2">
                Billing address
                <textarea
                  rows={2}
                  maxLength={1000}
                  className="block w-full rounded border bg-background p-2"
                  {...form.register("billing_address")}
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                Payment method
                <LedgerSelect
                  value={method}
                  onChange={(event) => {
                    const next = event.target
                      .value as ReceiptValues["payment_method"];
                    form.setValue("payment_method", next);
                    form.setValue(
                      "account_id",
                      accounts.find(
                        (a) =>
                          a.is_active &&
                          a.currency === currency &&
                          (next === "CASH"
                            ? a.kind === "CASH"
                            : a.kind === "BANK"),
                      )?.id ?? "",
                    );
                  }}
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank transfer</option>
                  <option value="CARD">Card</option>
                  <option value="CHEQUE">Cleared cheque</option>
                </LedgerSelect>
              </label>
              <label>
                Receiving account
                <LedgerSelect {...form.register("account_id")}>
                  <option value="">Select account</option>
                  {accounts
                    .filter(
                      (a) =>
                        a.is_active &&
                        a.currency === currency &&
                        (method === "CASH"
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
              {method !== "CASH" && (
                <label>
                  Bank paid into
                  <Input maxLength={255} {...form.register("bank_name")} />
                </label>
              )}
              <label>
                Payment reference (optional)
                <Input
                  maxLength={100}
                  {...form.register("payment_reference")}
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  role="switch"
                  {...form.register("vat_paid")}
                />
                VAT paid ({rates.vat}%)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  role="switch"
                  {...form.register("withholding_applied")}
                />
                Withholding tax ({rates.wht}%)
              </label>
            </div>
            <p className="text-sm text-muted-foreground">
              VAT and withholding are each calculated on the net goods subtotal.
              Only confirm payments already received.
            </p>
            <div className="space-y-3">
              {fields.map((field, i) => (
                <fieldset
                  key={field._key}
                  className="space-y-3 rounded-lg border p-4"
                >
                  <legend className="px-2 font-semibold">Item {i + 1}</legend>
                  <label className="block">
                    Description
                    <textarea
                      rows={2}
                      maxLength={1000}
                      className="block w-full rounded border bg-background p-2"
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
                      <p>Unit</p>
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
                    <div>
                      <p className="text-sm">
                        {Number(discountPercent) > 0
                          ? "Line total after discount"
                          : "Line total"}
                      </p>
                      <p className="break-words py-2 font-semibold tabular-nums">
                        {fmt(
                          discountedLineAmount(
                            items?.[i] ?? emptyItem(),
                            discountPercent,
                          ),
                        )}
                      </p>
                    </div>
                  </div>
                  {form.formState.errors.items?.[i] && (
                    <p role="alert" className="text-sm text-destructive">
                      {Object.values(form.formState.errors.items[i] ?? {})
                        .map((e) =>
                          e && typeof e === "object" && "message" in e
                            ? e.message
                            : undefined,
                        )
                        .filter((v) => typeof v === "string")
                        .join(" ")}
                    </p>
                  )}
                  {
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={i === 0}
                        onClick={() => move(i, i - 1)}
                      >
                        Move up
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={i === fields.length - 1}
                        onClick={() => move(i, i + 1)}
                      >
                        Move down
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={fields.length === 1}
                        onClick={() => remove(i)}
                      >
                        Remove item
                      </Button>
                    </div>
                  }
                </fieldset>
              ))}
            </div>
            {
              <Button
                type="button"
                variant="outline"
                disabled={fields.length >= 100}
                onClick={() => append(emptyItem())}
              >
                Add item
              </Button>
            }
            <label className="block">
              Discount (%)
              <Input
                inputMode="decimal"
                {...form.register("discount_percent")}
              />
            </label>
            <label className="block">
              Notes
              <textarea
                rows={3}
                maxLength={2000}
                className="block w-full rounded border bg-background p-2"
                {...form.register("notes")}
              />
            </label>
            <div className="rounded-lg bg-muted p-4 text-right">
              <p>
                Goods subtotal: <strong>{fmt(grossSubtotal)}</strong>
              </p>
              {Number(discountPercent) > 0 && (
                <p>
                  Discount ({discountPercent}%): −{fmt(discount)}
                </p>
              )}
              <p>Net goods subtotal: {fmt(subtotal)}</p>
              <p>
                VAT paid ({rates.vat}%): {fmt(vat)}
              </p>
              <p>
                Withholding ({rates.wht}%): −{fmt(withholding)}
              </p>
              <p className="text-lg font-semibold">
                Amount received: {fmt(received)}
              </p>
            </div>
            {Object.entries(form.formState.errors).map(([name, error]) =>
              typeof error?.message === "string" ? (
                <p key={name} role="alert" className="text-sm text-destructive">
                  {error.message}
                </p>
              ) : null,
            )}
            <Button type="submit" disabled={copying}>
              Review receipt
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
