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
import { invoiceAction, emailInvoice } from "@/features/sales-invoice/actions";
import type {
  Invoice,
  InvoicePermissions,
} from "@/features/sales-invoice/types";
import { InvoiceEditor } from "./InvoiceEditor";
export function InvoiceControls({
  invoice,
  permissions,
}: {
  invoice: Invoice;
  permissions: InvoicePermissions;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<"confirm" | "deliver" | null>(null);
  const [deliveryDate, setDeliveryDate] = useState(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Lagos",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date()),
  );
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailReview, setEmailReview] = useState<{
    destination: string;
    subject: string;
    message: string;
  } | null>(null);
  const [emailDraft, setEmailDraft] = useState<{
    destination: string;
    subject: string;
    message: string;
  } | null>(null);
  const key = useRef({ body: "", id: "" });
  const emailKey = useRef({ body: "", id: "" });
  async function perform() {
    if (!confirm) return;
    const payload = {
      id: invoice.id,
      version: invoice.version,
      action: confirm,
      ...(confirm === "deliver" ? { delivery_date: deliveryDate } : {}),
    };
    const body = JSON.stringify(payload);
    if (key.current.body !== body)
      key.current = { body, id: crypto.randomUUID() };
    setBusy(true);
    try {
      const result = await invoiceAction({
        ...payload,
        request_key: key.current.id,
      });
      if (result.error) toast.error(result.error);
      else {
        toast.success(
          confirm === "deliver"
            ? "Invoice marked delivered and posted to the sales ledger."
            : "Invoice confirmed.",
        );
        setConfirm(null);
        router.refresh();
      }
    } catch {
      toast.error("Unable to confirm the result. Retry with the same details.");
    } finally {
      setBusy(false);
    }
  }
  async function send() {
    if (!emailReview) return;
    const payload = {
      ...emailReview,
      id: invoice.id,
      version: invoice.version,
    };
    const body = JSON.stringify(payload);
    if (emailKey.current.body !== body)
      emailKey.current = { body, id: crypto.randomUUID() };
    setBusy(true);
    try {
      const result = await emailInvoice({
        ...payload,
        request_key: emailKey.current.id,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.status === "SENT")
        toast.success("Invoice accepted by the email provider.");
      else if (result.status === "SENDING")
        toast.info(
          "This email attempt is already being processed. Check its history.",
        );
      else
        toast.error(
          "Email delivery was not confirmed. Check the sending history before starting another attempt.",
        );
      setEmailOpen(false);
      setEmailReview(null);
      router.refresh();
    } catch {
      toast.error("Unable to confirm the result. Retry this same attempt.");
    } finally {
      setBusy(false);
    }
  }
  const message = `Dear ${invoice.billed_to},\n\nPlease find attached our invoice for the items detailed in the document.\n\nKindly review the invoice and contact us if you require any clarification.\n\nThank you for choosing HolanSL.\n\nKind regards,\nAccounts Department\nHolanSL`;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {!invoice.delivered_at && permissions.edit && (
          <InvoiceEditor
            key={invoice.version}
            party={invoice.party}
            invoice={invoice}
          />
        )}{" "}
        {!invoice.delivered_at && !invoice.confirmed && permissions.confirm && (
          <Button disabled={busy} onClick={() => setConfirm("confirm")}>
            Confirm invoice
          </Button>
        )}{" "}
        {!invoice.delivered_at && invoice.confirmed && permissions.deliver && (
          <Button disabled={busy} onClick={() => setConfirm("deliver")}>
            Mark delivered
          </Button>
        )}
        {invoice.confirmed && permissions.print && (
          <Button asChild variant="outline">
            <a
              href={`/api/ledger/invoices/${invoice.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Print / Download PDF
            </a>
          </Button>
        )}
        {invoice.confirmed && permissions.email && (
          <Dialog
            open={emailOpen}
            onOpenChange={(v) => {
              if (!busy) {
                setEmailOpen(v);
                if (v) {
                  emailKey.current = { body: "", id: "" };
                  setEmailReview(null);
                }
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline">Send email</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Email invoice</DialogTitle>
                <DialogDescription>
                  {invoice.reference} · Invoice PDF attached
                </DialogDescription>
              </DialogHeader>
              {emailReview ? (
                <div className="space-y-3">
                  <p>
                    <strong>To:</strong> {emailReview.destination}
                  </p>
                  <p>
                    <strong>Subject:</strong> {emailReview.subject}
                  </p>
                  <p className="whitespace-pre-wrap break-words rounded border p-3">
                    {emailReview.message}
                  </p>
                  <p className="text-sm">Attachment: {invoice.reference}.pdf</p>
                  <div className="flex gap-3">
                    <Button disabled={busy} onClick={send}>
                      {busy ? "Sending…" : "Send invoice"}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() => setEmailReview(null)}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              ) : (
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    const draft = {
                      destination: String(f.get("destination")),
                      subject: String(f.get("subject")),
                      message: String(f.get("message")),
                    };
                    setEmailDraft(draft);
                    setEmailReview(draft);
                  }}
                >
                  <label className="block">
                    To
                    <Input
                      name="destination"
                      type="email"
                      required
                      defaultValue={
                        emailDraft?.destination ?? invoice.recipient_email
                      }
                    />
                  </label>
                  <label className="block">
                    Subject
                    <Input
                      name="subject"
                      required
                      maxLength={250}
                      defaultValue={
                        emailDraft?.subject ??
                        `Invoice ${invoice.reference} — HolanSL`
                      }
                    />
                  </label>
                  <label className="block">
                    Message
                    <textarea
                      name="message"
                      required
                      maxLength={10000}
                      rows={10}
                      className="block w-full rounded border bg-background p-2"
                      defaultValue={emailDraft?.message ?? message}
                    />
                  </label>
                  <Button type="submit">Review email</Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
      {confirm && (
        <div className="space-y-3 rounded-lg border bg-muted p-4">
          <h2 className="font-semibold">
            {confirm === "confirm"
              ? "Confirm these invoice details?"
              : "Confirm all listed goods have been delivered"}
          </h2>
          {confirm === "deliver" ? (
            <>
              <label>
                Delivery date
                <Input
                  type="date"
                  min={invoice.date}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </label>
              <p>
                The goods subtotal will be posted once to this client’s sales
                ledger.
              </p>
            </>
          ) : (
            <p>The confirmed version will be available to print and email.</p>
          )}
          <div className="flex gap-3">
            <Button disabled={busy} onClick={perform}>
              {busy ? "Saving…" : "Confirm"}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setConfirm(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
