"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LedgerDatePicker } from "@/components/ledger/FormControls";
import { decideRetirement } from "@/features/staff-ledger/actions";
import { retirementBalance, todayISO } from "@/features/staff-ledger/schema";
import type { Retirement } from "@/features/staff-ledger/types";
import { money } from "@/features/cash-book/types";
export function RetirementApproval({ record: r }: { record: Retirement }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [date, setDate] = useState(todayISO()),
    [reason, setReason] = useState("");
  const [review, setReview] = useState<boolean | null>(null);
  const key = useRef({ body: "", id: "" });
  const preview = retirementBalance(r.remaining_advance, r.total);
  async function confirm() {
    if (review === null) return;
    setBusy(true);
    setError("");
    const payload = {
      approved: review,
      date,
      reason,
      expected_remaining: r.remaining_advance,
    };
    const body = JSON.stringify(payload);
    if (key.current.body !== body)
      key.current = { body, id: crypto.randomUUID() };
    try {
      const result = await decideRetirement({
        id: r.id,
        request_key: key.current.id,
        ...payload,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setReview(null);
      router.refresh();
    } catch {
      setError("Unable to confirm the result. Retry with the same details.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-3 rounded-xl border bg-card p-5">
      <h2 className="text-lg font-semibold">Review expense breakdown</h2>
      <p>
        Advance remaining: {money(r.remaining_advance, r.currency)} · Expenses:{" "}
        {money(r.total, r.currency)}
      </p>
      <p>
        After approval: change due {money(preview.change, r.currency)};
        reimbursement due {money(preview.reimbursement, r.currency)}. Approval
        does not move cash.
      </p>
      {review === null ? (
        <>
          <label className="block space-y-1">
            <span>Decision date</span>
            <LedgerDatePicker
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="block space-y-1">
            <span>Reason / review notes</span>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={1000}
              required
            />
          </label>
          <div className="flex gap-2">
            <Button
              disabled={!reason.trim() || !date}
              onClick={() => setReview(true)}
            >
              Review approval
            </Button>
            <Button
              variant="outline"
              disabled={!reason.trim() || !date}
              onClick={() => setReview(false)}
            >
              Review rejection
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="font-semibold">
            Confirm {review ? "approval" : "rejection"} dated {date}?
          </p>
          <p>{reason}</p>
          <p className="text-sm text-muted-foreground">
            Your identity and this decision will be recorded.
          </p>
          <div className="flex gap-2">
            <Button disabled={busy} onClick={confirm}>
              {busy ? "Saving…" : "Confirm decision"}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setReview(null)}
            >
              Back
            </Button>
          </div>
        </>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
