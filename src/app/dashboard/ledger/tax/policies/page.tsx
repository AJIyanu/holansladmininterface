import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { PolicyEditor } from "@/components/tax-ledger/PolicyEditor";
import { Pagination } from "@/components/staff-ledger/Records";
import type { Page, Policy } from "@/features/tax-ledger/types";
export default async function PolicyPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const u = await getCurrentUser();
  if (!u) redirect("/login");
  if (
    (!u.is_staff && !u.is_superuser) ||
    !hasPermission(u, "ledger.taxledger.view") ||
    !hasPermission(u, "ledger.taxledger.configure")
  )
    notFound();
  const query = await searchParams,
    page = Math.max(1, parseInt(query.page || "1") || 1);
  let data: Page<Policy>;
  try {
    data = await serverFetch(`/ledger/tax/policies/?page=${page}`);
  } catch (e) {
    if (e instanceof ServerFetchError && [401, 403].includes(e.status))
      notFound();
    return (
      <main className="p-6">
        <p role="alert">Unable to load tax policies. Refresh to retry.</p>
      </main>
    );
  }
  return (
    <main className="space-y-5 p-6">
      <Link className="underline" href="/dashboard/ledger/ledgers/tax">
        Tax Ledger
      </Link>
      <h1 className="text-2xl font-bold">Tax policies</h1>
      <PolicyEditor />
      <h2 className="text-xl font-semibold">Version history</h2>
      {data.results.map((p) => (
        <article key={p.id} className="space-y-1 rounded-xl border bg-card p-4">
          <strong>
            {p.kind} · {p.rate}% · {p.enabled ? "Enabled" : "Disabled"}
          </strong>
          <p>
            {p.party_name} · Effective {p.effective_date}
          </p>
          <p>{p.reason}</p>
          <p className="text-sm">Configured by {p.actor_name}</p>
        </article>
      ))}
      {!data.count && (
        <p>
          No policy overrides. VAT defaults to 7.5% and WHT to 2% when selected.
        </p>
      )}
      <Pagination
        previous={!!data.previous}
        next={!!data.next}
        page={page}
        param="page"
        query={{}}
      />
    </main>
  );
}
