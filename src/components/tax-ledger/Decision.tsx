"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { decideTax } from "@/features/tax-ledger/actions";
export function TaxDecision({ id }: { id: string }) {
  const router = useRouter();
  const [reason, setReason] = useState(""),
    [choice, setChoice] = useState<boolean | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const attempt = useRef<{ body: string; key: string } | null>(null);
  async function submit() {
    if (choice === null || busy) return;
    const body = JSON.stringify({ reason, choice });
    if (attempt.current?.body !== body)
      attempt.current = { body, key: crypto.randomUUID() };
    setBusy(true);
    const r = await decideTax({
      id,
      reason,
      approved: choice,
      request_key: attempt.current.key,
    });
    setBusy(false);
    if (r.error) {
      setError(r.error);
      return;
    }
    toast.success(
      choice ? "Tax activity approved and posted." : "Request rejected.",
    );
    router.refresh();
  }
  return (
    <section className="space-y-3 rounded-xl border p-5">
      <h2 className="font-semibold">Approval decision</h2>
      <label>
        Review notes
        <Textarea
          value={reason}
          maxLength={1000}
          disabled={busy}
          onChange={(e) => {
            setReason(e.target.value);
            setChoice(null);
          }}
        />
      </label>
      {error && <p role="alert">{error}</p>}
      {choice === null ? (
        <div className="flex gap-2">
          <Button disabled={!reason.trim()} onClick={() => setChoice(true)}>
            Approve
          </Button>
          <Button
            variant="outline"
            disabled={!reason.trim()}
            onClick={() => setChoice(false)}
          >
            Reject
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <p>
            {choice
              ? "Confirm approval and post the financial entries?"
              : "Confirm rejection without posting?"}
          </p>
          <Button disabled={busy} onClick={submit}>
            {busy ? "Saving…" : "Confirm decision"}
          </Button>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => setChoice(null)}
          >
            Back
          </Button>
        </div>
      )}
    </section>
  );
}
