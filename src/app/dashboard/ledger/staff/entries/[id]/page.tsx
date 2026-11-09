import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { labels, type StaffEntry } from "@/features/staff-ledger/types";
import { EvidenceLinks } from "@/components/staff-ledger/Records";
import { money } from "@/features/cash-book/types";
export default async function StaffEntryPage({
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
  let entry: StaffEntry;
  try {
    entry = await serverFetch(`/ledger/staff-ledger/entries/${id}/`);
  } catch (e) {
    if (e instanceof ServerFetchError && [403, 404].includes(e.status))
      notFound();
    return (
      <main className="p-6">
        <p role="alert">
          Unable to load this staff transaction. Please refresh.
        </p>
      </main>
    );
  }
  return (
    <main className="space-y-5 p-4 md:p-6">
      <Link className="underline" href="/dashboard/ledger/ledgers/staff">
        Staff Ledger
      </Link>
      <h1 className="text-2xl font-bold">
        {labels[entry.kind]} · {labels[entry.category]}
      </h1>
      <section className="space-y-3 rounded-xl border bg-card p-5">
        <p className="font-semibold">{entry.staff_name}</p>
        <p className="text-xl font-semibold">
          {money(entry.amount, entry.currency)}
        </p>
        <p>
          {entry.date} · {entry.reference || "No reference"}
        </p>
        <p className="whitespace-pre-wrap break-words">{entry.description}</p>
        {entry.account_name && <p>Account: {entry.account_name}</p>}
        <p>
          Change in amount due from staff:{" "}
          {money(entry.receivable_delta, entry.currency)}
        </p>
        <p>
          Change in amount due to staff:{" "}
          {money(entry.payable_delta, entry.currency)}
        </p>
        <p className="text-sm text-muted-foreground">
          Recorded by {entry.actor_name} · {entry.created_at}
        </p>
        <p className="break-all text-xs text-muted-foreground">
          Record {entry.id}
        </p>
        {entry.related_entry && (
          <p>
            <Link
              className="underline"
              href={`/dashboard/ledger/staff/entries/${entry.related_entry}`}
            >
              View linked advance / loan
            </Link>
          </p>
        )}
        {entry.retirement_id && (
          <p>
            <Link
              className="underline"
              href={`/dashboard/ledger/staff/retirements/${entry.retirement_id}`}
            >
              View approved expense breakdown
            </Link>
          </p>
        )}
      </section>
      <section className="space-y-2 rounded-xl border bg-card p-5">
        <h2 className="text-lg font-semibold">Supporting documents</h2>
        <EvidenceLinks
          documents={entry.documents}
          allowed={hasPermission(user, "ledger.staffledger.download")}
        />
      </section>
    </main>
  );
}
