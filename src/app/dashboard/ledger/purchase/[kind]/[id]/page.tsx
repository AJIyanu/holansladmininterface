import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { money } from "@/features/cash-book/types";
import type { PurchaseRecord } from "@/features/purchases/types";
import { PurchaseEditor } from "@/components/purchases/PurchaseEditor";
import {
  DeliveryControl,
  EvidenceEditor,
} from "@/components/purchases/PurchaseControls";
export default async function Page({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if (!["bills", "payments"].includes(kind) || !z.uuid().safeParse(id).success)
    notFound();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const resource = kind === "bills" ? "purchasebill" : "purchasepayment";
  if (
    !(user.is_staff || user.is_superuser) ||
    !hasPermission(user, "ledger.purchaseledger.view") ||
    !hasPermission(user, `ledger.${resource}.view`)
  )
    notFound();
  let row: PurchaseRecord;
  try {
    row = await serverFetch<PurchaseRecord>(`/ledger/purchase-${kind}/${id}/`);
  } catch (e) {
    if (e instanceof ServerFetchError && [403, 404].includes(e.status))
      notFound();
    throw e;
  }
  const s = row.snapshot;
  const payment = kind === "payments";
  const fmt = (v: string) => money(v, row.currency);
  const canDeliver =
    hasPermission(user, "ledger.purchasebill.deliver") &&
    hasPermission(user, "ledger.purchasetransaction.create");
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <Link className="underline" href="/dashboard/ledger/ledgers/purchase">
        Back to purchase ledger
      </Link>
      <header>
        <h1 className="font-heading text-3xl font-bold">
          {payment ? "Supplier payment" : "Supplier invoice"}
        </h1>
        <p className="break-words">
          {payment
            ? row.evidence?.[0]?.receipt_number ||
              "Supplier receipt number pending"
            : row.reference}{" "}
          · {row.date} · {row.currency}
        </p>
        <p>Recorded by {row.actor_name}</p>
      </header>
      {row.reversed && (
        <p className="rounded border border-destructive p-3 text-destructive">
          This posting has been reversed. Its original record is retained.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {!payment && !row.delivered_at && (
          <>
            {!row.supplier_purchase &&
              hasPermission(user, "ledger.purchasebill.edit") && (
                <PurchaseEditor
                  kind="bills"
                  party={row.party}
                  bill={row}
                  canDeliver={canDeliver}
                />
              )}{" "}
            {canDeliver && <DeliveryControl bill={row} />}
          </>
        )}
        {payment && hasPermission(user, "ledger.purchasepayment.edit") && (
          <EvidenceEditor key={row.evidence?.[0]?.version} payment={row} />
        )}
      </div>
      <section className="space-y-2 rounded border p-4">
        {payment ? (
          <>
            <p>
              Payment method: {s.payment_method.replaceAll("_", " ")} ·{" "}
              {s.account_name}
            </p>
            {s.bank_name && <p>Bank: {s.bank_name}</p>}
            {s.bill_reference && <p>Supplier invoice: {s.bill_reference}</p>}
          </>
        ) : (
          <p>
            {row.delivered_at
              ? `Delivered on ${row.delivered_at}`
              : "Not delivered — outside supplier debt"}
          </p>
        )}
        {s.description && <p>{s.description}</p>}
      </section>
      <ol className="space-y-2">
        {s.items.map((r, i) => (
          <li key={i} className="rounded border p-3">
            <p className="font-semibold">
              {i + 1}. {r.description}
            </p>
            <p>
              {r.quantity} {r.unit} × {fmt(r.unit_price)} ={" "}
              {fmt(r.gross_amount)}
            </p>
            {s.discount_enabled && <p>After discount: {fmt(r.amount)}</p>}
          </li>
        ))}
      </ol>
      <section className="space-y-1 rounded bg-muted p-4">
        <p>Items subtotal: {fmt(s.gross_subtotal)}</p>
        {s.discount_enabled && <p>Discount: −{fmt(s.discount_amount)}</p>}
        <p>Goods value: {fmt(row.subtotal)}</p>
        <p>
          Tax {s.tax_enabled ? `(${s.tax_percent}%)` : "not applied"}:{" "}
          {fmt(s.tax)}
        </p>
        {payment ? (
          <>
            <p>
              Withholding{" "}
              {s.withholding_enabled
                ? `(${s.withholding_percent}%)`
                : "not applied"}
              : −{fmt(s.withholding)}
            </p>
            <p className="font-bold">
              Actual money paid: {fmt(row.paid ?? "0")}
            </p>
          </>
        ) : (
          <p className="font-bold">Supplier invoice total: {fmt(s.total)}</p>
        )}
      </section>
      {payment && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Supplier receipt history</h2>
          {row.evidence?.map((e) => (
            <article key={e.id} className="space-y-1 rounded border p-3">
              <p>
                Revision {e.version} · Receipt number:{" "}
                {e.receipt_number || "Not supplied"}
              </p>
              <p>
                {e.actor_name} · {e.created_at}
              </p>
              {e.filename ? (
                hasPermission(user, "ledger.purchasepayment.download") ? (
                  <a
                    className="break-words underline"
                    href={`/api/ledger/purchase-payments/${row.id}/evidence/${e.id}/download`}
                  >
                    {e.filename}
                  </a>
                ) : (
                  <p>Scan attached; download permission required.</p>
                )
              ) : (
                <p>No scan supplied.</p>
              )}
            </article>
          ))}
        </section>
      )}
      {!payment && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Bill history</h2>
          {row.events?.map((e, i) => (
            <p key={i}>
              {e.action} · {e.actor__username} · {e.created_at}
            </p>
          ))}
        </section>
      )}
    </main>
  );
}
