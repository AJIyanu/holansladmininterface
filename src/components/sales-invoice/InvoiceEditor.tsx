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
  invoiceValuesSchema,
  invoiceSubtotal,
  discountedLineAmount,
  lineAmount,
  decimal,
  vatAmount,
  type InvoiceValues,
} from "@/features/sales-invoice/schema";
import { saveInvoice } from "@/features/sales-invoice/actions";
import type { Invoice, InvoiceDefaults } from "@/features/sales-invoice/types";
import { money } from "@/features/cash-book/types";
import { UnitSelect } from "./UnitSelect";
import {
  quantityLabel,
  quantityNumber,
  shortUnit,
} from "@/features/sales-invoice/units";
const emptyItem = () => ({
  description: "",
  quantity: "1",
  unit: "pcs",
  unit_price: "",
});
export function InvoiceEditor({
  party,
  invoice,
  defaults,
}: {
  party: string;
  invoice?: Invoice;
  defaults?: InvoiceDefaults;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState<InvoiceValues | null>(null);
  const key = useRef({ body: "", id: "" });
  const form = useForm<InvoiceValues>({
    resolver: zodResolver(invoiceValuesSchema),
    defaultValues: invoice
      ? {
          date: invoice.date,
          currency: invoice.currency,
          billed_to: invoice.billed_to,
          billing_address: invoice.billing_address,
          recipient_email: invoice.recipient_email,
          notes: invoice.notes,
          discount_percent: invoice.pricing?.discount_percent ?? "0",
          items: invoice.items.map(
            ({ id, description, quantity, unit, unit_price }) => ({
              id,
              description,
              quantity: quantityNumber(quantity),
              unit: invoice.finance_request ? unit : shortUnit(unit),
              unit_price,
            }),
          ),
        }
      : {
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
    InvoiceValues,
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
  const vat = vatAmount(subtotal);
  const fmt = (value: bigint) => money(decimal(value), currency);
  async function save() {
    if (!review) return;
    const body = JSON.stringify({ values: review, version: invoice?.version });
    if (key.current.body !== body)
      key.current = { body, id: crypto.randomUUID() };
    setBusy(true);
    try {
      const result = await saveInvoice({
        party,
        id: invoice?.id,
        version: invoice?.version,
        request_key: key.current.id,
        values: review,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.invoice) {
        toast.success("Invoice saved.");
        setOpen(false);
        setReview(null);
        router.push(`/dashboard/ledger/sales/invoices/${result.invoice.id}`);
        router.refresh();
      }
    } catch {
      toast.error("Unable to confirm the result. Retry with the same details.");
    } finally {
      setBusy(false);
    }
  }
  if (invoice?.delivered_at) return null;
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
        <Button variant={invoice ? "outline" : "default"}>
          {invoice ? "Edit invoice" : "Add invoice"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {review
              ? "Review invoice"
              : invoice
                ? "Edit invoice"
                : "Add invoice"}
          </DialogTitle>
          <DialogDescription>
            {invoice?.reference ??
              "The invoice reference is assigned on confirmation."}{" "}
            · Not delivered
          </DialogDescription>
        </DialogHeader>
        {review ? (
          <div className="space-y-4">
            <p>
              {review.billed_to} · {review.date} · {review.currency}
            </p>
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
              VAT (7.5%): {fmt(vat)} · Total: {fmt(subtotal + vat)}
            </p>
            <p className="text-sm text-muted-foreground">
              This invoice enters the sales ledger when marked delivered.
            </p>
            <div className="flex gap-3">
              <Button onClick={save} disabled={busy}>
                {busy ? "Saving…" : "Save invoice"}
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
          <form onSubmit={form.handleSubmit(setReview)} className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                Invoice date
                <Input type="date" {...form.register("date")} />
              </label>
              <label>
                Currency
                <select
                  className="block w-full rounded border bg-background p-2"
                  {...form.register("currency")}
                >
                  {["NGN", "USD", "GBP"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Billed to
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
            <div className="space-y-3">
              {fields.map((field, i) => (
                <fieldset
                  key={field._key}
                  className="space-y-3 rounded-lg border p-4"
                  disabled={!!invoice?.finance_request}
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
                  {!invoice?.finance_request && (
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
                  )}
                </fieldset>
              ))}
            </div>
            {!invoice?.finance_request && (
              <Button
                type="button"
                variant="outline"
                disabled={fields.length >= 100}
                onClick={() => append(emptyItem())}
              >
                Add item
              </Button>
            )}
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
              <p>VAT (7.5%): {fmt(vat)}</p>
              <p className="text-lg font-semibold">
                Total: {fmt(subtotal + vat)}
              </p>
            </div>
            {Object.entries(form.formState.errors).map(([name, error]) =>
              typeof error?.message === "string" ? (
                <p key={name} role="alert" className="text-sm text-destructive">
                  {error.message}
                </p>
              ) : null,
            )}
            <Button type="submit">Review invoice</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
