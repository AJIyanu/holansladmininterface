import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import {
  LedgerSelect,
  LedgerDatePicker,
} from "@/components/ledger/FormControls";
import { Button } from "@/components/ui/button";
import { TaxPartyPicker } from "@/components/tax-ledger/PartyPicker";
import { Pagination } from "@/components/staff-ledger/Records";
import { TaxEditor } from "@/components/tax-ledger/Editor";
import {
  actions,
  actionPermission,
  fields,
  type Report,
  type Request,
  type Page,
  type History,
} from "@/features/tax-ledger/types";
import type { Account } from "@/features/staff-ledger/types";
import { money } from "@/features/cash-book/types";
export const metadata = { title: "Tax Ledger | HolanSL" };
export default async function TaxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (
    (!user.is_staff && !user.is_superuser) ||
    !hasPermission(user, "ledger.taxledger.view")
  )
    notFound();
  const can = (p: string) => hasPermission(user, `ledger.taxledger.${p}`),
    cash = hasPermission(user, "ledger.cashbookentry.create");
  const search = await searchParams;
  const query = Object.fromEntries(
    Object.entries(search).filter(([, v]) => typeof v === "string"),
  ) as Record<string, string>;
  const year = new Intl.DateTimeFormat("en", {
    timeZone: "Africa/Lagos",
    year: "numeric",
  }).format(new Date());
  const dateFrom = query.date_from || `${year}-01-01`,
    dateTo = query.date_to || `${year}-12-31`,
    currency = query.currency || "NGN",
    tax = query.tax_type || "ALL";
  const page = Math.max(1, parseInt(query.page) || 1),
    requestPage = Math.max(1, parseInt(query.request_page) || 1);
  const filters = new URLSearchParams({
    date_from: dateFrom,
    date_to: dateTo,
    currency,
    tax_type: tax,
    ...(query.party ? { party: query.party } : {}),
  });
  let report: Report,
    requests: Page<Request>,
    accounts: Account[],
    history: History | undefined;
  try {
    [report, requests, accounts, history] = await Promise.all([
      serverFetch<Report>(`/ledger/tax/?${filters}&page=${page}`),
      serverFetch<Page<Request>>(
        `/ledger/tax/requests/?status=${encodeURIComponent(query.status || "all")}&page=${requestPage}`,
      ),
      serverFetch<Account[]>("/ledger/accounts/"),
      can("adjust") && query.history === "1"
        ? serverFetch<History>("/ledger/tax/history/")
        : Promise.resolve(undefined),
    ]);
  } catch (e) {
    if (e instanceof ServerFetchError && [401, 403].includes(e.status))
      notFound();
    return (
      <main className="space-y-4 p-6">
        <h1 className="text-2xl font-bold">Tax Ledger</h1>
        <p role="alert">
          Unable to load tax records. Check the filters or try again.
        </p>
        <Link className="underline" href="/dashboard/ledger/ledgers/tax">
          Reset filters
        </Link>
      </main>
    );
  }
  const allowed = Object.keys(actions).filter(
    (a) =>
      can(actionPermission[a]) &&
      (a !== "OPENING" || !!history) &&
      (!["REMIT", "VAT_SETTLE", "REVERSE"].includes(a) || cash),
  );
  const fmt = (v: string) => money(v, currency);
  return (
    <main className="space-y-6 p-4 md:p-6">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Accounts</p>
        <h1 className="font-heading text-3xl font-bold">Tax Ledger</h1>
        <p className="text-muted-foreground">
          VAT, withholding tax and company income tax, with separate balances
          and approval records.
        </p>
      </header>
      <div className="flex flex-wrap gap-3">
        <TaxEditor
          allowed={allowed}
          accounts={accounts}
          entries={report.results}
          history={history}
        />
        {can("configure") && (
          <Button asChild variant="outline">
            <Link href="/dashboard/ledger/tax/policies">Tax policies</Link>
          </Button>
        )}
        {can("export") && (
          <Button asChild variant="outline">
            <a href={`/api/ledger/tax/export?${filters}`}>Export CSV</a>
          </Button>
        )}
      </div>
      <form className="grid gap-3 rounded-xl border bg-card p-5 sm:grid-cols-3 lg:grid-cols-6">
        <label>
          From
          <LedgerDatePicker name="date_from" defaultValue={dateFrom} />
        </label>
        <label>
          To
          <LedgerDatePicker name="date_to" defaultValue={dateTo} />
        </label>
        <label>
          Currency
          <LedgerSelect name="currency" defaultValue={currency}>
            {["NGN", "USD", "GBP"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </LedgerSelect>
        </label>
        <label>
          Tax type
          <LedgerSelect name="tax_type" defaultValue={tax}>
            {["ALL", "VAT", "WHT", "CIT"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </LedgerSelect>
        </label>
        <div>
          <p>Party (optional)</p>
          <TaxPartyPicker name="party" defaultValue={query.party || ""} />
        </div>
        <Button className="self-end">Apply filters</Button>
      </form>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          Company balances · {currency} · as at {dateTo}
        </h2>
        <p className="text-sm text-muted-foreground">
          All parties and tax types. A negative net VAT balance is
          carried-forward credit.
        </p>
        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            "vat_due",
            "input_available",
            "input_pending",
            "input_nonrecoverable",
            "wht_asset",
            "wht_available",
            "wht_due",
            "cit_due",
            "vat_remitted",
            "wht_remitted",
            "cit_paid",
            "wht_used",
          ].map((k) => (
            <div key={k} className="rounded-xl border bg-card p-4">
              <dt className="text-sm text-muted-foreground">{fields[k]}</dt>
              <dd className="mt-2 break-words text-xl font-semibold">
                {fmt(report.balances[k])}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="text-xl font-semibold">Filtered tax movements</h2>
        <p>
          {dateFrom} to {dateTo} · {currency} · {tax}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(report.period_totals)
            .filter(
              ([k, v]) =>
                Number(v) !== 0 && !["party_vat", "delivery_vat"].includes(k),
            )
            .map(([k, v]) => (
              <div key={k}>
                <p className="text-sm">{fields[k]}</p>
                <strong>{fmt(v)}</strong>
                <p className="text-xs text-muted-foreground">
                  Opening {fmt(report.opening[k])} · Closing{" "}
                  {fmt(report.closing[k])}
                </p>
              </div>
            ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Tax entries · {report.count}</h2>
        {report.results.map((e) => (
          <article
            key={e.id}
            className="space-y-2 rounded-xl border bg-card p-4"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <strong>{e.reference || e.kind}</strong>
              <span>
                {e.date} · {e.currency}
              </span>
            </div>
            <p>{e.description}</p>
            {e.party_name && <p>{e.party_name}</p>}
            <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.keys(report.period_totals)
                .filter(
                  (k) =>
                    typeof e[k] === "string" &&
                    Number(e[k]) !== 0 &&
                    !["party_vat", "delivery_vat"].includes(k),
                )
                .map((k) => (
                  <div key={k}>
                    <dt className="text-xs text-muted-foreground">
                      {fields[k]}
                    </dt>
                    <dd>{money(String(e[k]), e.currency)}</dd>
                  </div>
                ))}
            </dl>
            <p className="text-xs text-muted-foreground">
              {e.kind} · Period {e.period} · Recorded by {e.actor_name}
            </p>
          </article>
        ))}
        {!report.count && <p>No tax entries in this range.</p>}
        <Pagination
          previous={!!report.previous}
          next={!!report.next}
          page={page}
          param="page"
          query={query}
        />
      </section>
      <section className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="text-xl font-semibold">Requests and approvals</h2>
        <p className="text-sm text-muted-foreground">
          All dates and currencies. Pending or rejected requests do not affect
          balances.
        </p>
        <form className="flex flex-wrap gap-2">
          {Object.entries(query)
            .filter(([k]) => !["status", "request_page"].includes(k))
            .map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
          <LedgerSelect name="status" defaultValue={query.status || "all"}>
            {["all", "pending", "approved", "rejected"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </LedgerSelect>
          <Button variant="outline">Filter requests</Button>
        </form>
        {requests.results.map((r) => (
          <article key={r.id} className="border-b py-3">
            <Link
              className="font-semibold underline"
              href={`/dashboard/ledger/tax/requests/${r.id}`}
            >
              {actions[r.payload.action as keyof typeof actions] ||
                String(r.payload.action)}{" "}
              · {String(r.payload.description)}
            </Link>
            <p>
              {String(r.payload.date)} · {String(r.payload.currency)} ·{" "}
              {r.decision
                ? r.decision.approved
                  ? "Approved"
                  : "Rejected"
                : "Pending approval"}
            </p>
            <p className="text-xs">Prepared by {r.actor_name}</p>
          </article>
        ))}
        {!requests.count && <p>No tax requests.</p>}
        <Pagination
          previous={!!requests.previous}
          next={!!requests.next}
          page={requestPage}
          param="request_page"
          query={query}
        />
      </section>
      {can("adjust") && !history && (
        <Link
          className="inline-block underline"
          href={`?${new URLSearchParams({ ...query, history: "1" })}`}
        >
          Review historical tax links and delivery openings
        </Link>
      )}
      {history && (
        <details className="space-y-3 rounded-xl border bg-card p-5">
          <summary className="cursor-pointer font-semibold">
            Historical tax review · {history.missing_payments.length} payments
            need linking · {history.delivery_review.length} deliveries need
            review
          </summary>
          <p className="mt-3">{history.note}</p>
          {history.discrepancies?.map((d, i) => (
            <p key={i} role="alert">
              {d.reference}: {d.reason}
            </p>
          ))}
          {history.delivery_review.map((d) => (
            <p key={d.document_key}>
              {d.reference} · {d.date} · {d.currency} · Delivery VAT{" "}
              {money(d.expected_vat, d.currency)} · Recognition gap{" "}
              {money(d.recognition_gap, d.currency)}
            </p>
          ))}
        </details>
      )}
    </main>
  );
}
