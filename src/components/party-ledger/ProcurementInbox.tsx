"use client";

import {
  LedgerSelect,
  LedgerDatePicker,
} from "@/components/ledger/FormControls";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { procurementAction } from "@/features/party-ledger/workspace-actions";
export interface InboxItem {
  id: string;
  kind: string;
  label: string;
  currency?: string;
  request_id: string;
}
export function ProcurementInbox({
  rows,
  canSales,
  canPurchase,
}: {
  rows: InboxItem[];
  canSales: boolean;
  canPurchase: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const keys = useRef<Record<string, string>>({});
  return (
    <div className="space-y-4">
      {!rows.length && <p>No pending documents in your procurement scope.</p>}
      {rows.map((r) => (
        <form
          key={r.id}
          className="space-y-3 rounded border p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const payload = {
              source_id: r.id,
              action: f.get("action"),
              date: f.get("date"),
              reason: f.get("reason"),
            };
            if (!window.confirm(`${payload.action}: ${r.label}?`)) return;
            const body = JSON.stringify(payload);
            keys.current[body] ??= crypto.randomUUID();
            setBusy(true);
            try {
              const result = await procurementAction({
                ...payload,
                request_key: keys.current[body],
              });
              if (result.error) toast.error(result.error);
              else {
                toast.success(result.data?.message ?? "Saved.");
                router.refresh();
              }
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2 className="font-semibold">
            {r.kind} · {r.label}
          </h2>
          <a
            className="block underline"
            target="_blank"
            rel="noopener noreferrer"
            href={`/dashboard/procurement/${r.kind === "QUOTATION" ? "quotation-revisions" : ["INVOICE", "REQUEST"].includes(r.kind) ? "finance-requests" : "supplier-purchases"}/${r.id}`}
          >
            Review source document and line items
          </a>
          <p className="break-all text-sm">
            Request {r.request_id} {r.currency && `· ${r.currency}`}
          </p>
          <div className="flex flex-wrap gap-3">
            <label>
              Action
              <LedgerSelect name="action" className="w-full min-w-48">
                {r.kind === "QUOTATION" ? (
                  <>
                    <option value="APPROVE">Approve quotation</option>
                    <option value="REJECT">Reject quotation</option>
                  </>
                ) : r.kind === "REQUEST" ? (
                  <>
                    <option value="APPROVE_REQUEST">
                      Approve request (no payment)
                    </option>
                    <option value="REJECT_REQUEST">Reject request</option>
                  </>
                ) : (
                  <option
                    value={
                      r.kind === "INVOICE" ? "IMPORT_INVOICE" : "IMPORT_BILL"
                    }
                  >
                    {r.kind === "INVOICE" ? "Create invoice" : "Create bill"}
                  </option>
                )}
              </LedgerSelect>
            </label>
            <label>
              Accounting date
              <LedgerDatePicker name="date" required />
            </label>
          </div>
          <Input
            name="reason"
            aria-label="Approval or posting reason"
            placeholder="Reason / posting description"
            required
            maxLength={500}
          />
          <Button
            disabled={
              busy ||
              (r.kind === "INVOICE" && !canSales) ||
              (r.kind === "BILL" && !canPurchase)
            }
          >
            Review and confirm
          </Button>
        </form>
      ))}
    </div>
  );
}
