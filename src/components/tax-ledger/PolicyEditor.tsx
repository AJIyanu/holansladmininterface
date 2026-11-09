"use client";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  LedgerDatePicker,
  LedgerSelect,
} from "@/components/ledger/FormControls";
import { policySchema } from "@/features/tax-ledger/schema";
import { saveTaxPolicy } from "@/features/tax-ledger/actions";
import { TaxPartyPicker } from "./PartyPicker";
type Values = z.infer<typeof policySchema>;
export function PolicyEditor() {
  const router = useRouter();
  const [review, setReview] = useState<Values | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const attempt = useRef<{ body: string; key: string } | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      kind: "VAT",
      party_id: "",
      rate: "7.5",
      enabled: true,
      effective_date: new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Lagos",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()),
      reason: "",
    },
  });
  const watched = useWatch({ control: form.control }) as Values;
  async function save() {
    if (!review || busy) return;
    const body = JSON.stringify(review);
    if (attempt.current?.body !== body)
      attempt.current = { body, key: crypto.randomUUID() };
    setBusy(true);
    const r = await saveTaxPolicy({
      ...review,
      request_key: attempt.current.key,
    });
    setBusy(false);
    if (r.error) {
      setError(r.error);
      return;
    }
    setReview(null);
    attempt.current = null;
    toast.success("Tax policy version saved.");
    router.refresh();
  }
  return (
    <section className="space-y-3 rounded-xl border bg-card p-5">
      <h2 className="text-xl font-semibold">New policy version</h2>
      <p>
        Effective rates apply to new transactions. Existing documents retain
        their recorded rates.
      </p>
      {error && <p role="alert">{error}</p>}
      {review ? (
        <div className="space-y-3">
          <p>
            {review.kind}: {review.rate}% ·{" "}
            {review.enabled ? "Enabled" : "Disabled"} · from{" "}
            {review.effective_date} ·{" "}
            {review.party_id ? "Selected client" : "Company default"}
          </p>
          <p>{review.reason}</p>
          <Button disabled={busy} onClick={save}>
            Confirm policy
          </Button>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => setReview(null)}
          >
            Back
          </Button>
        </div>
      ) : (
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={form.handleSubmit(setReview)}
        >
          <label>
            Tax type
            <LedgerSelect
              value={watched.kind}
              onChange={(e) => {
                form.setValue("kind", e.target.value as "VAT" | "WHT");
                form.setValue("party_id", "");
                form.setValue("rate", e.target.value === "VAT" ? "7.5" : "2");
              }}
            >
              <option>VAT</option>
              <option>WHT</option>
            </LedgerSelect>
          </label>
          <label>
            Percentage
            <Input inputMode="decimal" {...form.register("rate")} />
          </label>
          <label>
            Effective from
            <LedgerDatePicker
              value={watched.effective_date}
              onChange={(e) => form.setValue("effective_date", e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...form.register("enabled")} />
            Enabled
          </label>
          {watched.kind === "WHT" && (
            <div className="sm:col-span-2">
              <p>Client-specific authority / rate (optional)</p>
              <TaxPartyPicker
                value={watched.party_id}
                onChange={(v) => form.setValue("party_id", v)}
              />
            </div>
          )}
          <label className="sm:col-span-2">
            Reason
            <Textarea {...form.register("reason")} />
          </label>
          {Object.entries(form.formState.errors).map(([k, e]) => (
            <p key={k} role="alert">
              {e.message}
            </p>
          ))}
          <Button type="submit">Review policy</Button>
        </form>
      )}
    </section>
  );
}
