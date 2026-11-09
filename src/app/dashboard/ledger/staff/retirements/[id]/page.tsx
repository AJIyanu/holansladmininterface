import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { labels, type Retirement } from "@/features/staff-ledger/types";
import { EvidenceLinks } from "@/components/staff-ledger/Records";
import { RetirementApproval } from "@/components/staff-ledger/Approval";
import { money } from "@/features/cash-book/types";
export default async function RetirementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (
    (!user.is_staff && !user.is_superuser) ||
    !hasPermission(user, "ledger.staffledger.view")
  )
    notFound();
  const { id } = await params;
  let r: Retirement;
  try {
    r = await serverFetch(`/ledger/staff-ledger/retirements/${id}/`);
  } catch (e) {
    if (e instanceof ServerFetchError && [403, 404].includes(e.status))
      notFound();
    return (
      <main className="p-6">
        <p role="alert">
          Unable to load this expense breakdown. Please refresh.
        </p>
      </main>
    );
  }
  return (
    <main className="space-y-5 p-4 md:p-6">
      <Link className="underline" href="/dashboard/ledger/ledgers/staff">
        Staff Ledger
      </Link>
      <h1 className="text-2xl font-bold">Advance expense breakdown</h1>
      <section className="space-y-2 rounded-xl border bg-card p-5">
        <p className="font-semibold">{r.staff_name}</p>
        <p>
          {r.date} ·{" "}
          {r.decision
            ? r.decision.approved
              ? "Approved"
              : "Rejected"
            : "Pending approval"}
        </p>
        <p className="whitespace-pre-wrap break-words">{r.description}</p>
        <p>
          <Link
            className="underline"
            href={`/dashboard/ledger/staff/entries/${r.advance}`}
          >
            Advance: {r.advance_description}
          </Link>
        </p>
        <p className="text-sm text-muted-foreground">
          Prepared by {r.actor_name} · {r.created_at}
        </p>
        <p className="text-xl font-semibold">
          Total expenses: {money(r.total, r.currency)}
        </p>
      </section>
      <ol className="space-y-3">
        {r.items.map((item, i) => (
          <li
            key={item.position ?? i}
            className="space-y-2 rounded-xl border bg-card p-4"
          >
            <h2 className="font-semibold">
              {i + 1}. {labels[item.category]} ·{" "}
              {money(item.amount, r.currency)}
            </h2>
            <p>{item.date}</p>
            <p className="break-words">{item.description}</p>
            <EvidenceLinks
              documents={r.documents.filter(
                (d) => d.item_position === item.position,
              )}
              allowed={hasPermission(user, "ledger.staffledger.download")}
            />
          </li>
        ))}
      </ol>
      {r.decision ? (
        <section className="space-y-2 rounded-xl border bg-card p-5">
          <h2 className="text-lg font-semibold">
            {r.decision.approved ? "Approval" : "Rejection"} record
          </h2>
          <p>
            {r.decision.date} · {r.decision.actor_name}
          </p>
          <p className="break-words">{r.decision.reason}</p>
          {r.decision.entry && (
            <Link
              className="underline"
              href={`/dashboard/ledger/staff/entries/${r.decision.entry}`}
            >
              View financial posting
            </Link>
          )}
        </section>
      ) : (
        hasPermission(user, "ledger.staffledger.approve") && (
          <RetirementApproval
            key={`${r.id}-${r.remaining_advance}`}
            record={r}
          />
        )
      )}
    </main>
  );
}
