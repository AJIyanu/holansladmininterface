import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { StatementReview } from "@/components/party-ledger/StatementReview";
import { ReconciliationTemplate } from "@/templates/ReconciliationTemplate";
import {
  partyPresentation,
  statementDate,
  type PartySnapshot,
} from "@/features/reconciliation/presentation";
interface Statement {
  id: string;
  ledger_kind: string;
  created_at: string;
  created_by_name: string;
  snapshot: PartySnapshot;
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
  const presentation = partyPresentation(s, data.ledger_kind);
  return (
    <main className="min-h-screen bg-muted p-3 md:p-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-[900px] print:hidden">
        <StatementReview
          id={id}
          canReview={hasPermission(user, "ledger.reconciliation.confirm")}
        />
        {!s.print_version && (
          <p className="mb-3 text-sm text-muted-foreground">
            This saved statement uses its original recorded figures. Generate a
            new statement for the latest tax detail and document references.
          </p>
        )}
      </div>
      <ReconciliationTemplate
        name={s.party.name}
        start={s.date_from}
        end={s.date_to}
        currency={s.currency}
        company={s.company}
        {...presentation}
        receivedLabel={data.ledger_kind === "sales" ? "Received" : "Paid"}
        note="A negative balance represents an advance or credit."
      />
      <details className="mx-auto mt-6 max-w-[900px] print:hidden">
        <summary className="cursor-pointer">Internal review history</summary>
        <p className="my-2 text-sm">
          Created {statementDate(data.created_at.slice(0, 10))} by{" "}
          {data.created_by_name}
        </p>
        {data.reviews.map((r) => (
          <p key={r.id} className="text-sm">
            {r.status} · {r.actor_name} ·{" "}
            {statementDate(r.created_at.slice(0, 10))}: {r.notes}
          </p>
        ))}
        {!data.reviews.length && <p>No reviews recorded.</p>}
      </details>
    </main>
  );
}
