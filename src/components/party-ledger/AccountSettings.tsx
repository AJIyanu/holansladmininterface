"use client";

import { LedgerSelect } from "@/components/ledger/FormControls";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveLedgerAccount } from "@/features/party-ledger/workspace-actions";
export interface Account {
  id: string;
  name: string;
  kind: string;
  currency: string;
  is_active: boolean;
}
export function AccountSettings({
  accounts,
  canCreate,
  canEdit,
}: {
  accounts: Account[];
  canCreate: boolean;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  async function save(payload: unknown, edit = false) {
    setBusy(true);
    try {
      const result = await saveLedgerAccount(payload, edit);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Account saved.");
        router.refresh();
        if (!edit) form.current?.reset();
      }
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <p>
        NGN is the primary currency. USD and GBP accounts hold their own
        balances. Accounts start at zero; record an authorized opening entry
        when needed. Financial year: January–December.
      </p>
      <ul className="space-y-2">
        {accounts.map((a) => (
          <li
            key={a.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded border p-3"
          >
            <span>
              {a.name} · {a.kind} · {a.currency} ·{" "}
              {a.is_active ? "Active" : "Inactive"}
            </span>
            {canEdit && (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const name = String(
                    new FormData(e.currentTarget).get("name") ?? "",
                  ).trim();
                  if (
                    name !== a.name &&
                    window.confirm(`Rename ${a.name} to ${name}?`)
                  )
                    void save({ id: a.id, name }, true);
                }}
              >
                <Input
                  name="name"
                  aria-label={`Rename ${a.name} ${a.currency} ${a.kind}`}
                  defaultValue={a.name}
                  required
                  maxLength={100}
                />
                <Button disabled={busy} variant="outline">
                  Rename
                </Button>
              </form>
            )}
            {canEdit && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => {
                  if (
                    window.confirm(
                      `${a.is_active ? "Deactivate" : "Activate"} ${a.name} (${a.currency} ${a.kind})?`,
                    )
                  )
                    void save({ id: a.id, is_active: !a.is_active }, true);
                }}
              >
                {a.is_active ? "Deactivate" : "Activate"}
              </Button>
            )}
          </li>
        ))}
      </ul>
      {canCreate && (
        <form
          ref={form}
          className="grid gap-3 rounded border p-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.currentTarget));
            if (
              window.confirm(
                `Create ${data.name} (${data.currency} ${data.kind}) with zero opening balance?`,
              )
            )
              void save(data);
          }}
        >
          <label>
            Account name
            <Input name="name" required maxLength={100} />
          </label>
          <label>
            Type
            <LedgerSelect name="kind" className="w-full min-w-48">
              <option value="CASH">Cash holder</option>
              <option value="BANK">Bank account</option>
            </LedgerSelect>
          </label>
          <label>
            Currency
            <LedgerSelect name="currency" className="w-full min-w-48">
              {["NGN", "USD", "GBP"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </LedgerSelect>
          </label>
          <Button disabled={busy}>Add account</Button>
        </form>
      )}
    </div>
  );
}
