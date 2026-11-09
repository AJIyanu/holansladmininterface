import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { StatementReview } from "@/components/party-ledger/StatementReview";
import { money } from "@/features/cash-book/types";
interface Statement {
  id: string;
  ledger_kind: string;
  created_at: string;
  created_by_name: string;
  snapshot: {
    party: { name: string };
    company: Record<string, unknown>;
    currency: string;
    date_from: string;
    date_to: string;
    tax?: Record<string, string>;
    opening_balance: string;
    closing_balance: string;
    charges: string;
    credits: string;
    payments: string;
    invoices: string;
    refunds: string;
    transactions: Array<{
      id: string;
      date: string;
      type: string;
      reference: string;
      description: string;
      debit: string;
      credit: string;
      balance: string;
      vat_recognised?: string;
      vat_cash?: string;
      wht?: string;
      actual_cash?: string;
      combined_balance?: string;
    }>;
    outstanding: Array<{
      id: string;
      date: string;
      reference: string;
      amount: string;
    }>;
    advances: Array<{
      id: string;
      date: string;
      reference: string;
      amount: string;
    }>;
  };
  reviews: Array<{
    id: string;
    status: string;
    notes: string;
    actor_name: string;
    created_at: string;
  }>;
}
export default async function StatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (
    (!user.is_staff && !user.is_superuser) ||
    !hasPermission(user, "ledger.reconciliation.view")
  )
    notFound();
  const { id } = await params;
  let data: Statement;
  try {
    data = await serverFetch<Statement>(`/ledger/statements/${id}/`);
  } catch (error) {
    if (error instanceof ServerFetchError && [403, 404].includes(error.status))
      notFound();
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Reconciliation and Statement</h1>
        <p role="alert">
          Unable to load this statement. Please refresh and try again.
        </p>
      </main>
    );
  }
  if (!hasPermission(user, `ledger.${data.ledger_kind}ledger.view`)) notFound();
  const s = data.snapshot;
  const fmt = (v: string) => money(v, s.currency);
  return (
    <main className="mx-auto max-w-6xl p-6 text-foreground print:max-w-none print:p-0">
      <style>{`@page {size:A4 landscape;margin:12mm} th,td {overflow-wrap:anywhere} @media print {thead{display:table-header-group} tr{break-inside:avoid} body{background:white;color:black} a{text-decoration:none}}`}</style>
      <header className="space-y-2 border-b pb-4">
        <h1 className="text-2xl font-bold">
          {String(s.company.name || "HolanSL")}
        </h1>
        {typeof s.company.address === "string" && <p>{s.company.address}</p>}
        <h2 className="text-xl font-semibold">Reconciliation and Statement</h2>
        <p>
          {s.party.name} ·{" "}
          {data.ledger_kind === "sales" ? "Sales Ledger" : "Purchase Ledger"} ·{" "}
          {s.currency}
        </p>
        <p>
          {s.date_from} to {s.date_to}
        </p>
        <p className="text-xs">
          Snapshot {data.id} · Created {data.created_at} by{" "}
          {data.created_by_name}
        </p>
      </header>
      <StatementReview
        id={id}
        canReview={hasPermission(user, "ledger.reconciliation.confirm")}
      />
      <dl className="my-4 grid grid-cols-3 gap-3 text-sm">
        {[
          ["Prior balance (goods)", s.opening_balance],
          ["Charges / increases", s.charges],
          ["Credits / reductions", s.credits],
          [
            data.ledger_kind === "sales"
              ? "Payments received"
              : "Payments made",
            s.payments,
          ],
          [
            data.ledger_kind === "sales" ? "Amount invoiced" : "Supplier bills",
            s.invoices,
          ],
          ["Refunds", s.refunds],
          ["Closing balance (goods)", s.closing_balance],
        ].map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd className="font-semibold">{fmt(v)}</dd>
          </div>
        ))}
      </dl>
      {s.tax && (
        <dl className="my-4 grid grid-cols-3 gap-3 text-sm">
          {Object.entries({
            opening_total: "Prior balance including VAT",
            closing_total: "Closing balance including VAT",
            opening_vat: "Prior VAT balance",
            closing_vat: "Outstanding VAT",
            vat_recognised: "VAT recognised",
            vat_cash:
              data.ledger_kind === "sales"
                ? "VAT received (Output VAT)"
                : "VAT paid (Input VAT)",
            wht:
              data.ledger_kind === "sales"
                ? "WHT held by client"
                : "WHT withheld from supplier",
            actual_cash:
              data.ledger_kind === "sales"
                ? "Actual cash received (net)"
                : "Actual cash paid (net)",
          }).map(([k, label]) => (
            <div key={k}>
              <dt>{label}</dt>
              <dd className="font-semibold">{fmt(s.tax![k])}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mb-3 text-sm">
        Positive balance:{" "}
        {data.ledger_kind === "sales"
          ? "due from client"
          : "payable to supplier"}
        . Negative balance: advance or credit.
      </p>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {[
              "Date",
              "Type / reference",
              "Description",
              "Goods increase",
              "Goods reduction",
              ...(s.tax
                ? [
                    "VAT recognised",
                    "VAT cash",
                    "WHT",
                    "Actual cash",
                    "Balance incl. VAT",
                  ]
                : ["Balance"]),
            ].map((h) => (
              <th key={h} className="border p-2 text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {s.transactions.map((r) => (
            <tr key={r.id}>
              <td className="border p-2">{r.date}</td>
              <td className="border p-2">
                {r.type}
                <br />
                {r.reference}
              </td>
              <td className="border p-2">{r.description}</td>
              <td className="border p-2">{fmt(r.debit)}</td>
              <td className="border p-2">{fmt(r.credit)}</td>
              {s.tax &&
                [r.vat_recognised, r.vat_cash, r.wht, r.actual_cash].map(
                  (v, i) => (
                    <td key={i} className="border p-2">
                      {fmt(v || "0.00")}
                    </td>
                  ),
                )}
              <td className="border p-2">
                {fmt(r.combined_balance ?? r.balance)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!s.transactions.length && (
        <p className="py-4">No transactions in the selected period.</p>
      )}
      {(
        [
          ["Outstanding documents", s.outstanding],
          ["Unallocated advances", s.advances],
        ] as const
      ).map(([title, rows]) => (
        <section key={title} className="mt-6">
          <h3 className="font-semibold">
            {title} as at {s.date_to}
          </h3>
          {rows.length ? (
            rows.map((r) => (
              <p key={r.id} className="text-sm">
                {r.date} · {r.reference || r.id} · {fmt(r.amount)}
              </p>
            ))
          ) : (
            <p>None</p>
          )}
        </section>
      ))}
      <section className="mt-6">
        <h3 className="font-semibold">Review history</h3>
        {data.reviews.length ? (
          data.reviews.map((r) => (
            <p key={r.id}>
              {r.status} · {r.actor_name} · {r.created_at}: {r.notes}
            </p>
          ))
        ) : (
          <p>Not yet reviewed.</p>
        )}
      </section>
    </main>
  );
}
