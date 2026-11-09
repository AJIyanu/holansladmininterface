"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { createStaffStatement } from "@/features/staff-ledger/actions";
export function PrintStaffStatement({
  staff,
  dateFrom,
  dateTo,
  currency,
}: {
  staff: string;
  dateFrom: string;
  dateTo: string;
  currency: string;
}) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [created, setCreated] = useState("");
  const [values, setValues] = useState({
    date_from: dateFrom,
    date_to: dateTo,
    currency,
  });
  const key = useRef({ body: "", id: "" });
  async function generate() {
    setBusy(true);
    setError("");
    setCreated("");
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    try {
      const body = JSON.stringify({ staff, ...values });
      if (key.current.body !== body)
        key.current = { body, id: crypto.randomUUID() };
      const result = await createStaffStatement({
        staff,
        ...values,
        request_key: key.current.id,
      });
      if (result.error || !result.id) {
        tab?.close();
        setError(result.error ?? "Unable to create statement.");
        return;
      }
      const url = `/statements/staff/${result.id}`;
      setCreated(url);
      if (tab) tab.location.href = url;
    } catch {
      tab?.close();
      setError("Unable to confirm the result. Retry with the same range.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!busy) {
          setOpen(v);
          if (v) {
            key.current = { body: "", id: "" };
            setCreated("");
          }
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Print Reconciliation and Statement</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reconciliation and Statement</DialogTitle>
          <DialogDescription>
            Generate a complete snapshot for one currency, including prior
            balances. It opens in a new tab for printing.
          </DialogDescription>
        </DialogHeader>
        <label className="space-y-1">
          <span>From</span>
          <LedgerDatePicker
            value={values.date_from}
            disabled={busy}
            onChange={(e) =>
              setValues({ ...values, date_from: e.target.value })
            }
          />
        </label>
        <label className="space-y-1">
          <span>To</span>
          <LedgerDatePicker
            value={values.date_to}
            disabled={busy}
            onChange={(e) => setValues({ ...values, date_to: e.target.value })}
          />
        </label>
        <label className="space-y-1">
          <span>Currency</span>
          <LedgerSelect
            value={values.currency}
            disabled={busy}
            onChange={(e) => setValues({ ...values, currency: e.target.value })}
          >
            {["NGN", "USD", "GBP"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </LedgerSelect>
        </label>
        {error && <p role="alert">{error}</p>}
        {created && (
          <Link
            href={created}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Open printable statement
          </Link>
        )}
        <Button disabled={busy} onClick={generate}>
          {busy ? "Generating…" : "Generate statement"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
export function PrintButton() {
  return (
    <Button className="print:hidden" onClick={() => window.print()}>
      Print
    </Button>
  );
}
