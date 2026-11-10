import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { labels, type StaffStatement } from "@/features/staff-ledger/types";
import { PrintButton } from "@/components/staff-ledger/StatementControls";
import { money } from "@/features/cash-book/types";
import { ReconciliationTemplate } from "@/templates/ReconciliationTemplate";
import type {
  SummaryLine,
  PrintRow,
} from "@/features/reconciliation/presentation";
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
  const summary: SummaryLine[] = [
    {
      label: "Prior balance due from staff",
      amount: s.summary.opening_receivable,
      tone: "prior",
    },
    {
      label: "Prior balance due to staff",
      amount: s.summary.opening_payable,
      tone: "prior",
    },
    { label: "Total paid to staff", amount: s.summary.paid, tone: "invoiced" },
    {
      label: "Total received from staff",
      amount: s.summary.received,
      tone: "received",
    },
    {
      label: "Approved expenses",
      amount: s.summary.approved_expenses,
      tone: "plain",
    },
    {
      label: "Balance due from staff",
      amount: s.summary.closing_receivable,
      tone: "balance",
      emphasis: true,
    },
    {
      label: "Balance due to staff",
      amount: s.summary.closing_payable,
      tone: "balance",
      emphasis: true,
    },
  ];
  const rows: PrintRow[] = s.transactions.map((e) => ({
    id: e.id,
    date: e.date,
    reference: e.reference,
    description: `${labels[e.category] || e.category} — ${e.description}${e.kind === "RETIRE" ? ` (Approved expenses: ${fmt(e.amount)})` : ""}`,
    charged: e.kind === "PAY" ? e.amount : "0.00",
    received: e.kind === "RECEIVE" ? e.amount : "0.00",
    tone:
      e.kind === "PAY"
        ? "invoice"
        : e.kind === "RECEIVE"
          ? "receipt"
          : "neutral",
  }));
  return (
    <main className="min-h-screen bg-muted p-3 md:p-6 print:bg-white print:p-0">
      <div className="mx-auto mb-5 max-w-[900px] print:hidden">
        <PrintButton />
      </div>
      <ReconciliationTemplate
        name={s.staff.name}
        start={s.date_from}
        end={s.date_to}
        currency={s.currency}
        company={s.company}
        summary={summary}
        rows={rows}
        chargedLabel="Paid to staff"
        receivedLabel="Received"
        referenceLabel="Payment / Receipt reference"
      />
    </main>
  );
}
