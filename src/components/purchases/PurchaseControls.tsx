"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import { LedgerDatePicker } from "@/components/ledger/FormControls";
import {
  deliverBill,
  updateSupplierEvidence,
} from "@/features/purchases/actions";
import { defaults } from "@/features/purchases/schema";
import type { PurchaseRecord } from "@/features/purchases/types";
export function DeliveryControl({ bill }: { bill: PurchaseRecord }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(defaults().date);
  const [busy, setBusy] = useState(false);
  const key = useRef({ body: "", id: "" });
  async function save() {
    const body = JSON.stringify({ date, version: bill.version });
    if (key.current.body !== body)
      key.current = { body, id: crypto.randomUUID() };
    setBusy(true);
    try {
      const r = await deliverBill({
        id: bill.id,
        version: bill.version,
        delivery_date: date,
        request_key: key.current.id,
      });
      if (r.error) toast.error(r.error);
      else {
        toast.success("Delivery confirmed; supplier debt recorded.");
        setOpen(false);
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
      onOpenChange={(v) => {
        if (!busy) setOpen(v);
      }}
    >
      <DialogTrigger asChild>
        <Button>Mark delivered</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm supplier delivery</DialogTitle>
          <DialogDescription>
            Confirm all items on {bill.reference} have been delivered. This
            records the goods value as supplier debt; no money moves.
          </DialogDescription>
        </DialogHeader>
        <label>
          Delivery date
          <LedgerDatePicker
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <Button disabled={busy} onClick={save}>
          {busy ? "Posting…" : "Confirm delivery"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
export function EvidenceEditor({ payment }: { payment: PurchaseRecord }) {
  const router = useRouter();
  const current = payment.evidence?.[0];
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState(current?.receipt_number ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const key = useRef({ body: "", id: "" });
  async function save() {
    setBusy(true);
    try {
      let checksum = "";
      if (file)
        checksum = Array.from(
          new Uint8Array(
            await crypto.subtle.digest("SHA-256", await file.arrayBuffer()),
          ),
        )
          .map((v) => v.toString(16).padStart(2, "0"))
          .join("");
      const body = JSON.stringify({
        number,
        checksum,
        filename: file?.name,
        version: current?.version,
      });
      if (key.current.body !== body)
        key.current = { body, id: crypto.randomUUID() };
      const data = new FormData();
      data.set("id", payment.id);
      data.set("request_key", key.current.id);
      data.set("version", String(current?.version ?? 1));
      data.set("receipt_number", number);
      if (file) data.set("file", file);
      const r = await updateSupplierEvidence(data);
      if (r.error) toast.error(r.error);
      else {
        toast.success("Supplier receipt evidence updated.");
        setOpen(false);
        setReview(false);
        setFile(null);
        router.refresh();
      }
    } catch {
      toast.error("Unable to confirm the update. Retry with the same details.");
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
            setNumber(current?.receipt_number ?? "");
            setReview(false);
            setFile(null);
          }
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Update supplier receipt</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {review ? "Review receipt update" : "Update supplier receipt"}
          </DialogTitle>
          <DialogDescription>
            Only the supplier receipt number and scan can change. Previous
            evidence remains in the history.
          </DialogDescription>
        </DialogHeader>
        {review ? (
          <div className="space-y-3">
            <p>Receipt number: {number || "Not supplied"}</p>
            <p>
              {file
                ? `New scan: ${file.name}`
                : `Keep scan: ${current?.filename || "None"}`}
            </p>
            <Button disabled={busy} onClick={save}>
              {busy ? "Saving…" : "Confirm update"}
            </Button>
            <Button
              disabled={busy}
              variant="outline"
              onClick={() => setReview(false)}
            >
              Back to edit
            </Button>
          </div>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              setReview(true);
            }}
          >
            <label className="block">
              Supplier receipt number
              <Input
                maxLength={100}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </label>
            <label className="block">
              Receipt scan
              <Input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  if (f && f.size > 10 * 1024 * 1024) {
                    toast.error("Scans must be 10 MB or smaller.");
                    e.target.value = "";
                    setFile(null);
                  } else setFile(f);
                }}
              />
            </label>
            <p className="text-sm text-muted-foreground">
              PDF, JPEG, PNG or WebP; up to 10 MB. Leave empty to keep the
              current scan.
            </p>
            <Button
              type="submit"
              disabled={number === (current?.receipt_number ?? "") && !file}
            >
              Review update
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
