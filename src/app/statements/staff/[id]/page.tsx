import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { labels, type StaffStatement } from "@/features/staff-ledger/types";
import { PrintButton } from "@/components/staff-ledger/StatementControls";
import { money } from "@/features/cash-book/types";
export const metadata = {
  title: "Staff Reconciliation and Statement | HolanSL",
};
export default async function StaffStatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (
    (!user.is_staff && !user.is_superuser) ||
    !["view", "print"].every((p) =>
      hasPermission(user, `ledger.staffledger.${p}`),
    )
  )
    notFound();
  const { id } = await params;
  let data: StaffStatement;
  try {
    data = await serverFetch(`/ledger/staff-ledger/statements/${id}/`);
  } catch (e) {
    if (e instanceof ServerFetchError && [403, 404].includes(e.status))
      notFound();
    return (
      <main className="p-6">
        <p role="alert">Unable to load the statement. Please refresh.</p>
      </main>
    );
  }
  const s = data.snapshot;
  const fmt = (v: string) => money(v, s.currency);
  return (
    <main className="mx-auto max-w-6xl space-y-5 p-6 print:max-w-none print:p-0">
      <style>{`@page{size:A4 landscape;margin:12mm} @media print{thead{display:table-header-group} tr{break-inside:avoid} body{background:white;color:black}} th,td{overflow-wrap:anywhere}`}</style>
      <header className="space-y-2 border-b pb-4">
        <h1 className="text-2xl font-bold">
          {String(s.company.name || "Holan Integrated Services Limited")}
        </h1>
        {typeof s.company.address === "string" && <p>{s.company.address}</p>}
        <h2 className="text-xl font-semibold">Reconciliation and Statement</h2>
        <p>
          Staff Ledger · {s.staff.name} · {s.currency}
        </p>
        <p>
          {s.date_from} to {s.date_to}
        </p>
        <p className="break-all text-xs">
          Snapshot {data.id} · Created {data.created_at} by {data.actor_name}
        </p>
      </header>
      <PrintButton />
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 print:grid-cols-4">
        {Object.entries(s.summary).map(([k, v]) => (
          <div key={k} className="border p-2">
            <dt className="text-sm">{labels[k]}</dt>
            <dd className="font-semibold">{fmt(v)}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm">
        Amounts due from staff cover recoverable loans, unretired advances and
        change. Amounts due to staff cover approved reimbursements. Ordinary
        salaries and allowances do not create staff debt.
      </p>
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full table-fixed border-collapse text-xs">
          <thead>
            <tr>
              {[
                "Date",
                "Transaction / description",
                "Paid to staff",
                "Received from staff",
                "Approved expenses",
                "Due from staff",
                "Due to staff",
              ].map((h) => (
                <th className="border p-2 text-left" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2" colSpan={5}>
                Prior balances before {s.date_from}
              </td>
              <td className="border p-2">
                {fmt(s.summary.opening_receivable)}
              </td>
              <td className="border p-2">{fmt(s.summary.opening_payable)}</td>
            </tr>
            {s.transactions.map((e) => (
              <tr key={e.id}>
                <td className="border p-2">{e.date}</td>
                <td className="border p-2">
                  {labels[e.category]}
                  <br />
                  {e.description}
                  {e.reference && (
                    <>
                      <br />
                      {e.reference}
                    </>
                  )}
                </td>
                <td className="border p-2">
                  {e.kind === "PAY" ? fmt(e.amount) : "—"}
                </td>
                <td className="border p-2">
                  {e.kind === "RECEIVE" ? fmt(e.amount) : "—"}
                </td>
                <td className="border p-2">
                  {e.kind === "RETIRE" ? fmt(e.amount) : "—"}
                </td>
                <td className="border p-2">{fmt(e.receivable_balance)}</td>
                <td className="border p-2">{fmt(e.payable_balance)}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="border p-2" colSpan={2}>
                Period totals / closing balances
              </td>
              <td className="border p-2">{fmt(s.summary.paid)}</td>
              <td className="border p-2">{fmt(s.summary.received)}</td>
              <td className="border p-2">{fmt(s.summary.approved_expenses)}</td>
              <td className="border p-2">
                {fmt(s.summary.closing_receivable)}
              </td>
              <td className="border p-2">{fmt(s.summary.closing_payable)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 gap-12 pt-12">
        <p className="border-t pt-2">For HolanSL · Signature / date</p>
        <p className="border-t pt-2">Staff member · Signature / date</p>
      </div>
    </main>
  );
}
