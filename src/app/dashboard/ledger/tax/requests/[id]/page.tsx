import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { TaxDecision } from "@/components/tax-ledger/Decision";
import {
  actions,
  actionPermission,
  type Request,
} from "@/features/tax-ledger/types";
export default async function TaxRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const u = await getCurrentUser();
  if (!u) redirect("/login");
  if (
    (!u.is_staff && !u.is_superuser) ||
    !hasPermission(u, "ledger.taxledger.view")
  )
    notFound();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  let r: Request;
  try {
    r = await serverFetch(`/ledger/tax/requests/${id}/`);
  } catch (e) {
    if (e instanceof ServerFetchError && [403, 404].includes(e.status))
      notFound();
    return (
      <main className="p-6">
        <p role="alert">Unable to load this tax request. Refresh to retry.</p>
      </main>
    );
  }
  const action = String(r.payload.action);
  return (
    <main className="space-y-5 p-6">
      <Link className="underline" href="/dashboard/ledger/ledgers/tax">
        Tax Ledger
      </Link>
      <h1 className="text-2xl font-bold">
        {actions[action as keyof typeof actions]}
      </h1>
      <p>
        {r.decision
          ? r.decision.approved
            ? "Approved and posted"
            : "Rejected"
          : "Pending approval"}
      </p>
      <dl className="grid gap-3 rounded-xl border bg-card p-5 sm:grid-cols-2">
        {Object.entries(r.payload)
          .filter(
            ([k, v]) =>
              !["file", "request_key"].includes(k) &&
              typeof v !== "object" &&
              v !== "",
          )
          .map(([k, v]) => (
            <div key={k} className="min-w-0 break-words">
              <dt className="text-sm text-muted-foreground">
                {k.replaceAll("_", " ")}
              </dt>
              <dd>{String(v)}</dd>
            </div>
          ))}
      </dl>
      <p>
        Prepared by {r.actor_name} · {r.created_at}
      </p>
      {r.document && (
        <a
          className="underline"
          href={`/api/ledger/tax/documents/${r.document.id}/download`}
        >
          Download {r.document.filename}
        </a>
      )}
      {r.decision ? (
        <p>
          {r.decision.approved ? "Approved" : "Rejected"} by{" "}
          {r.decision.actor_name}: {r.decision.reason}
        </p>
      ) : (
        hasPermission(u, "ledger.taxledger.approve") &&
        hasPermission(u, `ledger.taxledger.${actionPermission[action]}`) &&
        (!["REMIT", "VAT_SETTLE", "REVERSE"].includes(action) ||
          hasPermission(u, "ledger.cashbookentry.create")) && (
          <TaxDecision id={id} />
        )
      )}
    </main>
  );
}
