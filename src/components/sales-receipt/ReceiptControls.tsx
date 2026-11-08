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
import { emailReceipt } from "@/features/sales-receipt/actions";
import type { Receipt } from "@/features/sales-receipt/types";
export function ReceiptControls({
  receipt,
  canPrint,
  canEmail,
}: {
  receipt: Receipt;
  canPrint: boolean;
  canEmail: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({
    destination: receipt.snapshot.recipient_email,
    subject: `Receipt ${receipt.reference} — HolanSL`,
    message: `Dear ${receipt.snapshot.billed_to},\n\nPlease find attached your payment receipt for the items detailed in the document. We acknowledge receipt of your payment with thanks.\n\nPlease contact us if you require any clarification.\n\nThank you for choosing HolanSL.\n\nKind regards,\nAccounts Department\nHolanSL`,
  });
  const [review, setReview] = useState(false);
  const key = useRef({ body: "", id: "" });
  async function send() {
    const body = JSON.stringify(draft);
    if (key.current.body !== body)
      key.current = { body, id: crypto.randomUUID() };
    setBusy(true);
    try {
      const result = await emailReceipt({
        id: receipt.id,
        ...draft,
        request_key: key.current.id,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast[result.status === "SENT" ? "success" : "warning"](
        result.status === "SENT"
          ? "Email accepted by the delivery provider."
          : "Email outcome is not confirmed. Check the send history before starting another attempt.",
      );
      setOpen(false);
      setReview(false);
      router.refresh();
    } catch {
      toast.error(
        "Unable to confirm the email result. Retry with the same details.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex flex-wrap gap-3">
      {canPrint && (
        <Button variant="outline" asChild>
          <a
            href={`/api/ledger/receipts/${receipt.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Print / Download PDF
          </a>
        </Button>
      )}
      {canEmail && !receipt.reversed && (
        <Dialog
          open={open}
          onOpenChange={(v) => {
            if (!busy) {
              setOpen(v);
              if (v) {
                key.current = { body: "", id: "" };
                setReview(false);
              }
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>Email receipt</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {review ? "Review receipt email" : "Email payment receipt"}
              </DialogTitle>
              <DialogDescription>
                Attach {receipt.reference}.pdf
              </DialogDescription>
            </DialogHeader>
            {review ? (
              <div className="space-y-4">
                <p>To: {draft.destination}</p>
                <p>Subject: {draft.subject}</p>
                <p className="whitespace-pre-wrap break-words">
                  {draft.message}
                </p>
                <div className="flex gap-2">
                  <Button disabled={busy} onClick={send}>
                    {busy ? "Sending…" : "Send email"}
                  </Button>
                  <Button
                    disabled={busy}
                    variant="outline"
                    onClick={() => setReview(false)}
                  >
                    Back to edit
                  </Button>
                </div>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setReview(true);
                }}
              >
                <label className="block">
                  To
                  <Input
                    required
                    type="email"
                    value={draft.destination}
                    onChange={(e) =>
                      setDraft({ ...draft, destination: e.target.value })
                    }
                  />
                </label>
                <label className="block">
                  Subject
                  <Input
                    required
                    maxLength={250}
                    value={draft.subject}
                    onChange={(e) =>
                      setDraft({ ...draft, subject: e.target.value })
                    }
                  />
                </label>
                <label className="block">
                  Message
                  <textarea
                    required
                    maxLength={10000}
                    rows={9}
                    className="block w-full rounded border bg-background p-2"
                    value={draft.message}
                    onChange={(e) =>
                      setDraft({ ...draft, message: e.target.value })
                    }
                  />
                </label>
                <Button type="submit">Review email</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
