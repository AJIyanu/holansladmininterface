"use client";

import { LedgerSelect } from "@/components/ledger/FormControls";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reviewStatement } from "@/features/party-ledger/workspace-actions";
export function StatementReview({
  id,
  canReview,
}: {
  id: string;
  canReview: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const key = useRef({ body: "", id: "" });
  return (
    <div className="my-5 space-y-3 print:hidden">
      <Button onClick={() => window.print()}>Print / Save as PDF</Button>
      {canReview && (
        <form
          className="flex flex-wrap gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const payload = { status: f.get("status"), notes: f.get("notes") };
            if (
              !window.confirm(
                `Record this reconciliation as ${payload.status}?`,
              )
            )
              return;
            const body = JSON.stringify(payload);
            if (key.current.body !== body)
              key.current = { body, id: crypto.randomUUID() };
            setBusy(true);
            try {
              const result = await reviewStatement(id, {
                ...payload,
                request_key: key.current.id,
              });
              if (result.error) toast.error(result.error);
              else {
                toast.success("Review recorded.");
                router.refresh();
              }
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Status
            <LedgerSelect name="status" className="w-full min-w-48">
              <option>AGREED</option>
              <option>DISPUTED</option>
            </LedgerSelect>
          </label>
          <Input
            name="notes"
            required
            maxLength={1000}
            placeholder="Review notes / evidence of agreement"
            aria-label="Review notes"
          />
          <Button disabled={busy}>Record review</Button>
        </form>
      )}
    </div>
  );
}
