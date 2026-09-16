"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
export function ReviewDecision({
  id,
  version,
  quotation,
}: {
  id: string;
  version?: number;
  quotation: boolean;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [review, setReview] = useState<"approve" | "reject" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const attempt = useRef({ fingerprint: "", key: "" });
  async function send() {
    if (!review) return;
    setBusy(true);
    setError("");
    const body = JSON.stringify({
      reason,
      ...(!quotation ? { expected_version: version } : {}),
    });
    const fp = review + body;
    if (attempt.current.fingerprint !== fp)
      attempt.current = { fingerprint: fp, key: crypto.randomUUID() };
    try {
      const response = await fetch(
        `/api/ledger/approval-requests/${id}/${review}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": attempt.current.key,
          },
          body,
        },
      );
      if (!response.ok)
        throw Error(
          response.status === 409
            ? "This record changed. Refresh before deciding."
            : "Decision could not be saved. Check permissions, reason and record status.",
        );
      router.refresh();
      setReview(null);
      setReason("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save decision.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-3 border-t pt-4">
      <label htmlFor={`reason-${id}`} className="font-medium">
        Decision reason
      </label>
      <Textarea
        id={`reason-${id}`}
        value={reason}
        disabled={busy}
        onChange={(e) => {
          setReason(e.target.value);
          setReview(null);
        }}
      />
      {review ? (
        <div className="space-y-2">
          <p>
            Confirm that you want to {review} this exact document with the
            reason above.
          </p>
          <Button disabled={busy} onClick={send}>
            Confirm {review}
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
        <div className="flex gap-2">
          <Button
            disabled={!reason.trim() || busy}
            onClick={() => setReview("approve")}
          >
            Approve
          </Button>
          <Button
            variant="outline"
            disabled={!reason.trim() || busy}
            onClick={() => setReview("reject")}
          >
            Reject
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
