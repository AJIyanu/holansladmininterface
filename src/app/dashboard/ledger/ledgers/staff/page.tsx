import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";
import { StaffPicker } from "@/components/staff-ledger/Picker";
import { StaffEditor } from "@/components/staff-ledger/StaffEditor";
import { BalanceCards, Pagination } from "@/components/staff-ledger/Records";
import { PrintStaffStatement } from "@/components/staff-ledger/StatementControls";
import {
  LedgerDatePicker,
  LedgerSelect,
} from "@/components/ledger/FormControls";
import { Button } from "@/components/ui/button";
import {
  labels,
  type Staff,
  type StaffEntry,
  type Summary,
  type Retirement,
  type StatementRow,
  type Page,
  type Account,
} from "@/features/staff-ledger/types";
import { money } from "@/features/cash-book/types";
export const metadata = { title: "Staff Ledger | HolanSL" };
export default async function StaffLedgerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (
    (!user.is_staff && !user.is_superuser) ||
    !hasPermission(user, "ledger.staffledger.view")
  )
    notFound();
  const can = (p: string) => hasPermission(user, `ledger.staffledger.${p}`);
  const search = await searchParams;
  const val = (k: string, fallback: string) =>
    typeof search[k] === "string" ? (search[k] as string) : fallback;
  const year = new Intl.DateTimeFormat("en", {
    timeZone: "Africa/Lagos",
    year: "numeric",
  }).format(new Date());
  const dateFrom = val("date_from", `${year}-01-01`),
    dateTo = val("date_to", `${year}-12-31`),
    currency = val("currency", "NGN");
  const page = (key: string) => Math.max(1, parseInt(val(key, "1"), 10) || 1);
  const query = Object.fromEntries(
    Object.entries(search).flatMap(([k, v]) =>
      typeof v === "string" ? [[k, v]] : [],
    ),
  );
  let state: { selected_staff: Staff | null },
    accounts: Account[] = [],
    entries: (Page<StaffEntry> & { summary: Summary }) | undefined,
    retirements: Page<Retirement> | undefined,
    statements: Page<StatementRow> | undefined;
  try {
    state = await serverFetch("/ledger/staff-ledger/");
    if (state.selected_staff) {
      const base = `/ledger/staff-ledger/staff/${state.selected_staff.id}`;
      [accounts, entries, retirements, statements] = await Promise.all([
        serverFetch<Account[]>("/ledger/accounts/"),
        serverFetch<Page<StaffEntry> & { summary: Summary }>(
          `${base}/entries/?${new URLSearchParams({ date_from: dateFrom, date_to: dateTo, currency, page: String(page("page")) })}`,
        ),
        serverFetch<Page<Retirement>>(
          `${base}/retirements/?page=${page("retirement_page")}`,
        ),
        can("print")
          ? serverFetch<Page<StatementRow>>(
              `${base}/statements/?page=${page("statement_page")}`,
            )
          : Promise.resolve(undefined),
      ]);
    }
  } catch (e) {
    if (e instanceof ServerFetchError && [401, 403].includes(e.status))
      notFound();
    return (
      <main className="space-y-4 p-6">
        <h1 className="text-2xl font-bold">Staff Ledger</h1>
        <p role="alert">
          Unable to load staff records. Check your date range or try again.
        </p>
        <Link className="underline" href="/dashboard/ledger/ledgers/staff">
          Reset filters and retry
        </Link>
      </main>
    );
  }
  const staff = state.selected_staff;
  return (
    <main className="space-y-6 p-4 md:p-6">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Accounts</p>
        <h1 className="font-heading text-3xl font-bold">Staff Ledger</h1>
        <p className="text-muted-foreground">
          Staff payments, money returned, loans and advance expenses.
        </p>
      </header>
      <section className="space-y-2 rounded-xl border bg-card p-5">
        <h2 className="text-lg font-semibold">Staff member</h2>
        <StaffPicker selected={staff} />
      </section>
      {staff && entries && retirements ? (
        <>
          <section className="space-y-4 rounded-xl border bg-card p-5">
            <h2 className="text-xl font-semibold">
              {staff.name}
              {!staff.is_active && " · inactive account"}
            </h2>
            <div className="flex flex-wrap gap-3">
              {can("pay") &&
                hasPermission(user, "ledger.cashbookentry.create") && (
                  <StaffEditor
                    key={`${staff.id}-pay`}
                    kind="PAY"
                    staff={staff.id}
                    accounts={accounts}
                  />
                )}
              {can("receive") &&
                hasPermission(user, "ledger.cashbookentry.create") && (
                  <StaffEditor
                    key={`${staff.id}-receive`}
                    kind="RECEIVE"
                    staff={staff.id}
                    accounts={accounts}
                  />
                )}
              {can("retire") && (
                <StaffEditor
                  key={`${staff.id}-retire`}
                  kind="RETIRE"
                  staff={staff.id}
                  accounts={accounts}
                />
              )}
              {can("print") && (
                <PrintStaffStatement
                  key={`${staff.id}-${dateFrom}-${dateTo}-${currency}`}
                  staff={staff.id}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  currency={currency}
                />
              )}
            </div>
            <form className="grid items-end gap-3 sm:grid-cols-4">
              <label className="space-y-1">
                <span>From</span>
                <LedgerDatePicker name="date_from" defaultValue={dateFrom} />
              </label>
              <label className="space-y-1">
                <span>To</span>
                <LedgerDatePicker name="date_to" defaultValue={dateTo} />
              </label>
              <label className="space-y-1">
                <span>Currency</span>
                <LedgerSelect name="currency" defaultValue={currency}>
                  {["NGN", "USD", "GBP"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </LedgerSelect>
              </label>
              <Button type="submit">Apply filters</Button>
            </form>
            <p className="text-xs text-muted-foreground">
              Financial year: January–December. Balances start at zero until
              transactions are recorded. Currencies are kept separate.
            </p>
          </section>
          <BalanceCards summary={entries.summary} currency={currency} />
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">
              Transactions · {entries.count}
            </h2>
            {entries.results.length ? (
              entries.results.map((e) => (
                <article
                  key={e.id}
                  className="space-y-2 rounded-xl border bg-card p-4"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <Link
                      className="font-semibold underline"
                      href={`/dashboard/ledger/staff/entries/${e.id}`}
                    >
                      {labels[e.kind]} · {labels[e.category]}
                    </Link>
                    <strong>{money(e.amount, e.currency)}</strong>
                  </div>
                  <p className="break-words">{e.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {e.date} · {e.reference || "No reference"} · Recorded by{" "}
                    {e.actor_name}
                  </p>
                </article>
              ))
            ) : (
              <p>No transactions in this date range and currency.</p>
            )}
            <Pagination
              previous={!!entries.previous}
              next={!!entries.next}
              page={page("page")}
              param="page"
              query={query}
            />
          </section>
          <section className="space-y-3 rounded-xl border bg-card p-5">
            <h2 className="text-xl font-semibold">
              Advance expense submissions
            </h2>
            <p className="text-sm text-muted-foreground">
              All dates and currencies. Pending and rejected submissions have no
              financial posting.
            </p>
            {retirements.results.map((r) => (
              <article key={r.id} className="space-y-1 border-b py-3">
                <Link
                  className="font-medium underline"
                  href={`/dashboard/ledger/staff/retirements/${r.id}`}
                >
                  {r.description}
                </Link>
                <p>
                  {r.date} · {money(r.total, r.currency)} ·{" "}
                  {r.decision
                    ? r.decision.approved
                      ? "Approved"
                      : "Rejected"
                    : "Pending approval"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Prepared by {r.actor_name}
                </p>
              </article>
            ))}
            {!retirements.count && <p>No expense breakdowns submitted.</p>}
            <Pagination
              previous={!!retirements.previous}
              next={!!retirements.next}
              page={page("retirement_page")}
              param="retirement_page"
              query={query}
            />
          </section>
          {statements && (
            <section className="space-y-3 rounded-xl border bg-card p-5">
              <h2 className="text-xl font-semibold">
                Saved Reconciliation and Statements
              </h2>
              {statements.results.map((s) => (
                <p key={s.id}>
                  <Link
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`/statements/staff/${s.id}`}
                  >
                    {s.date_from}–{s.date_to} · {s.currency}
                  </Link>
                  <span className="ml-2 text-xs text-muted-foreground">
                    Created {s.created_at}
                  </span>
                </p>
              ))}
              {!statements.count && <p>No statements generated.</p>}
              <Pagination
                previous={!!statements.previous}
                next={!!statements.next}
                page={page("statement_page")}
                param="statement_page"
                query={query}
              />
            </section>
          )}
        </>
      ) : (
        <p className="rounded-xl border bg-card p-6">
          Select a staff member to open their ledger.
        </p>
      )}
    </main>
  );
}
