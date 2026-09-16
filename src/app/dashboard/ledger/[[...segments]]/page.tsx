import Link from "next/link";
import { notFound } from "next/navigation";
import { requireLedger, ledgerGet } from "@/features/ledger/api";
import {
  resources,
  settings,
  financial,
  actionForm,
  statementForm,
} from "@/features/ledger/config";
import {
  can,
  text,
  type Entity,
  type Page,
} from "@/features/procurement/types";
import { LedgerForm } from "@/components/ledger/LedgerForm";
import { RecordView } from "@/components/ledger/RecordView";
import { FilterChoice } from "@/components/ledger/FilterChoice";
import { ReviewDecision } from "@/components/ledger/ReviewDecision";
const link =
  "inline-flex min-h-10 items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted";
const full = (user: { is_superuser: boolean; permissions: string[] }) =>
  can(user, "ledger.financialrecord.viewall");
const object = (x: unknown): Entity =>
  x && typeof x === "object" && !Array.isArray(x) ? (x as Entity) : { id: "" };
const list = (x: unknown): Entity[] =>
  Array.isArray(x) ? (x as Entity[]) : [];
export default async function LedgerPage({
  params,
  searchParams,
}: {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireLedger();
  const access = {
    is_superuser: user.is_superuser,
    permissions: user.permissions,
  };
  const { segments = [] } = await params;
  const [key = "overview", id, operation] = segments;
  if (segments.length > 3) notFound();
  const search = await searchParams;
  const q = (name: string, fallback = "") =>
    typeof search[name] === "string" ? (search[name] as string) : fallback;
  const capabilities = await ledgerGet<{ currencies: string[] }>(
    "capabilities/",
  );
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const currency = q("currency", "NGN"),
    from = q("date_from", today.slice(0, 7) + "-01"),
    to = q("date_to", today);
  const page = Math.max(1, Number.parseInt(q("page", "1"), 10) || 1);
  const query = new URLSearchParams({
    currency,
    date_from: from,
    date_to: to,
    page: String(page),
  });
  for (const k of [
    "client",
    "status",
    "search",
    "account",
    "kind",
    "cash_account",
  ])
    if (q(k)) query.set(k, q(k));
  const top = [
    ...[
      ["overview", "Overview", "journalentry"],
      ["approval-requests", "Approvals", "approvalrequest"],
      ["finance-submissions", "Procurement submissions", "financesubmission"],
      ["invoices", "Invoices", "invoice"],
      ["receipts", "Receipts", "receipt"],
      ["payments", "Payments", "payment"],
      ["expenses", "Expenses", "expense"],
      ["supplier-bills", "Supplier bills", "supplierbill"],
      ["advances", "Advances", "advance"],
      ["advance-clearances", "Clearances", "advanceclearance"],
      ["credit-notes", "Credit notes", "creditnote"],
      ["withholdings", "Withholding", "withholdingrecord"],
      ["documents", "Documents", "ledgerdocument"],
      ["journals", "Account book", "journalentry"],
      ["client-statements", "Reconciliation and Statement", "clientstatement"],
      ["analytics", "Analytics", "journalentry"],
      ["tax-reports", "Tax", "taxreport"],
    ].filter(([, , model]) => can(user, `ledger.${model}.view`)),
    ["settings", "Settings", "financialrecord"],
  ];
  const title =
    resources[key]?.title ||
    (
      {
        overview: "Accounts overview",
        settings: "Accounts settings",
        analytics: "Financial analytics",
        "tax-reports": "Tax records",
        "client-statements": "Reconciliation and Statement",
      } as Record<string, string>
    )[key];
  if (!title) notFound();
  const shell = (children: React.ReactNode) => (
    <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <header className="space-y-3">
        <p className="text-sm font-medium text-primary">Accounts department</p>
        <h1 className="font-heading text-3xl font-bold">{title}</h1>
        <nav aria-label="Accounts navigation" className="flex flex-wrap gap-2">
          {top.map(([path, label]) => (
            <Link
              key={path}
              className={`${link} ${key === path ? "bg-primary text-primary-foreground" : ""}`}
              href={`/dashboard/ledger/${path}?currency=${currency}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </main>
  );
  const filters = (accounts: Entity[] = []) => (
    <form className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
      <label className="space-y-1 text-sm">
        Currency
        <select
          name="currency"
          defaultValue={currency}
          className="block min-h-10 rounded-md border bg-background p-2"
        >
          {capabilities.currencies.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-sm">
        From
        <input
          className="block min-h-10 rounded-md border bg-background p-2"
          type="date"
          name="date_from"
          defaultValue={from}
        />
      </label>
      <label className="space-y-1 text-sm">
        Through
        <input
          className="block min-h-10 rounded-md border bg-background p-2"
          type="date"
          name="date_to"
          defaultValue={to}
        />
      </label>
      {key === "journals" && (
        <>
          <label className="space-y-1 text-sm">
            Account
            <select
              name="account"
              defaultValue={q("account")}
              className="block min-h-10 rounded-md border bg-background p-2"
            >
              <option value="">All accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {text(a.label)}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            Reference
            <input
              className="block min-h-10 rounded-md border bg-background p-2"
              name="search"
              defaultValue={q("search")}
            />
          </label>
        </>
      )}
      {financial.includes(key) && (
        <label className="space-y-1 text-sm">
          Status
          <select
            name="status"
            defaultValue={q("status")}
            className="block min-h-10 rounded-md border bg-background p-2"
          >
            <option value="">All statuses</option>
            {[
              "DRAFT",
              "SUBMITTED",
              "APPROVED",
              "REJECTED",
              "POSTED",
              "REVERSED",
              "CANCELLED",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      )}
      {financial.includes(key) && can(user, "crm.party.view") && (
        <FilterChoice
          name="client"
          label="Client / payee"
          resource="parties"
          initial={q("client")}
        />
      )}
      {["receipts", "payments"].includes(key) &&
        can(user, "ledger.cashaccount.view") && (
          <FilterChoice
            name="cash_account"
            label="Bank / cash account"
            resource="cash-accounts"
            initial={q("cash_account")}
          />
        )}
      <button className={link}>Apply filters</button>
    </form>
  );
  const pages = (data: { previous: unknown; next: unknown }) => (
    <nav aria-label="Pagination" className="flex items-center justify-between">
      <span>Page {page}</span>
      <div className="flex gap-2">
        {Boolean(data.previous) && (
          <Link
            className={link}
            href={`?${new URLSearchParams({ ...Object.fromEntries(query), page: String(page - 1) })}`}
          >
            Previous
          </Link>
        )}
        {Boolean(data.next) && (
          <Link
            className={link}
            href={`?${new URLSearchParams({ ...Object.fromEntries(query), page: String(page + 1) })}`}
          >
            Next
          </Link>
        )}
      </div>
    </nav>
  );
  if (key === "settings")
    return shell(
      <>
        <p>
          Configure the accounts and currencies used by your department.
          Changing the selected currency changes the view; it does not convert
          money or transfer funds.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {settings
            .filter((k) => can(user, `ledger.${resources[k].model}.view`))
            .map((k) => (
              <Link
                className="rounded-xl border bg-card p-5 hover:bg-muted"
                key={k}
                href={`/dashboard/ledger/${k}`}
              >
                <h2 className="font-heading text-lg font-semibold">
                  {resources[k].title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  View and manage {resources[k].title.toLowerCase()}
                </p>
              </Link>
            ))}
        </div>
        <Link className={link} href="/dashboard/admin/staff">
          Staff and permission assignments
        </Link>
      </>,
    );
  if (key === "client-statements") {
    await requireLedger("ledger.clientstatement.view");
    if (!full(user))
      return shell(
        <p>
          Full financial scope is required to view complete client statements.
        </p>,
      );
    if (!id)
      return shell(
        <LedgerForm
          definition={statementForm}
          user={access}
          initial={{ currency, date_from: from, date_to: to }}
        />,
      );
    if (operation === "export" && can(user, "ledger.clientstatement.export"))
      return shell(
        <LedgerForm
          definition={{
            title: "Export Reconciliation and Statement",
            permission: "ledger.clientstatement.export",
            endpoint: `client-statements/${id}/export`,
            destination: `client-statements/${id}`,
            fields: [
              {
                name: "format",
                label: "Format",
                type: "select",
                options: ["PDF", "JPG"],
                required: true,
              },
            ],
          }}
          user={access}
        />,
      );
    const data = await ledgerGet<Page<Entity> & { summary: Entity }>(
      `client-statements/${id}/?page=${page}`,
    );
    return shell(
      <>
        {can(user, "ledger.clientstatement.export") && (
          <Link
            className={link}
            href={`/dashboard/ledger/client-statements/${id}/export`}
          >
            Print / export
          </Link>
        )}
        <section className="rounded-xl border bg-card p-5">
          <RecordView value={data.summary} />
        </section>
        <RecordView value={data.results} />
        {pages(data)}
      </>,
    );
  }
  if (["overview", "analytics", "tax-reports"].includes(key)) {
    const permission =
      key === "tax-reports"
        ? "ledger.taxreport.view"
        : "ledger.journalentry.view";
    if (!can(user, permission) || !full(user))
      return shell(
        <p>
          Your permissions do not include complete financial reports. Use the
          transaction screens available above.
        </p>,
      );
    const data = await ledgerGet<Entity>(
      `${key === "tax-reports" ? "tax-reports" : "analytics"}/?${new URLSearchParams({ currency, date_from: from, date_to: to })}`,
    );
    if (key === "tax-reports")
      return shell(
        <>
          {filters()}
          {can(user, "ledger.taxremittance.view") && (
            <Link className={link} href="/dashboard/ledger/tax-remittances">
              Remittance records and payments
            </Link>
          )}
          <p>
            VAT collections, client-remitted VAT and income WHT credits remain
            separate. Remittance records require supporting evidence.
          </p>
          <RecordView value={data} />
        </>,
      );
    const balances = list(data.balances),
      months = list(data.monthly).filter((x) =>
        ["INCOME", "EXPENSE"].includes(
          text(x.account__account__classification),
        ),
      );
    const largest = Math.max(
      1,
      ...months.map((x) => Math.abs(Number(x.credit) - Number(x.debit))),
    );
    return shell(
      <>
        {filters()}
        <p className="text-sm text-muted-foreground">
          Balances through {to}. Revenue below is recognised on client
          acceptance. All amounts are in {currency}.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {balances.map((b, i) => (
            <article key={i} className="rounded-xl border bg-card p-5">
              <h2 className="font-medium">{text(b.account__account__name)}</h2>
              <p className="mt-2 text-2xl font-semibold tabular-nums">
                {text(b.balance)} {currency}
              </p>
              <p className="text-sm text-muted-foreground">
                {text(b.account__account__classification)}
              </p>
            </article>
          ))}
        </div>
        <section className="space-y-4 rounded-xl border bg-card p-5">
          <h2 className="font-heading text-xl font-semibold">
            Monthly revenue and expenses
          </h2>
          {!months.length && (
            <p>No posted income or expenses in this period.</p>
          )}
          {months.map((m, i) => {
            const income = m.account__account__classification === "INCOME";
            const value = income
              ? Number(m.credit) - Number(m.debit)
              : Number(m.debit) - Number(m.credit);
            return (
              <div key={i} className="space-y-1">
                <p className="flex justify-between gap-4 text-sm">
                  <span>
                    {text(m.month).slice(0, 7)} ·{" "}
                    {income ? "Revenue" : "Expenses"}
                  </span>
                  <span>
                    {value.toLocaleString()} {currency}
                  </span>
                </p>
                <div className="h-4 rounded bg-muted">
                  <div
                    className={`h-4 rounded ${income ? "bg-primary" : "bg-chart-2"}`}
                    style={{ width: `${(Math.abs(value) / largest) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </section>
        {!balances.length && <p>No posted balances for this currency.</p>}
      </>,
    );
  }
  if (["client-codes", "approval-routing"].includes(key)) {
    const definition = resources[key].form!;
    await requireLedger(definition.permission);
    return shell(<LedgerForm definition={definition} user={access} />);
  }
  const resource = resources[key];
  if (!resource) notFound();
  await requireLedger(`ledger.${resource.model}.view`);
  if (id === "new" || operation) {
    const definition =
      id === "new" ? resource.form : actionForm(key, id!, operation!);
    if (!definition) notFound();
    if (!can(user, definition.permission))
      return shell(<p>You do not have permission to perform this action.</p>);
    const initial: Record<string, unknown> = { currency, date: today };
    for (const field of definition.fields)
      if (q(field.name) && field.name !== "expected_version")
        initial[field.name] = q(field.name);
    if (operation && id) {
      const record = await ledgerGet<Entity>(`${key}/${id}/`);
      Object.assign(initial, record, { expected_version: record.version });
      for (const field of definition.fields)
        if (record[`${field.name}_id`])
          initial[field.name] = record[`${field.name}_id`];
    }
    return shell(
      <LedgerForm definition={definition} user={access} initial={initial} />,
    );
  }
  if (id) {
    const record = await ledgerGet<Entity>(`${key}/${id}/`);
    if (key === "finance-submissions") {
      const source = object(record.source);
      const route = (
        {
          INVOICE: "invoices",
          EXPENSE: "expenses",
          ADVANCE: "advances",
          ADVANCE_BREAKDOWN: "advance-clearances",
          SUPPLIER_REFUND: "receipts",
        } as Record<string, string>
      )[text(source.kind)];
      return shell(
        <section className="space-y-4 rounded-xl border bg-card p-5">
          <RecordView value={record} />
          {route && !record.record_id && (
            <div className="flex gap-2">
              <Link
                className={link}
                href={`/dashboard/ledger/${route}/new?${new URLSearchParams({ request: text(source.request_id), currency: text(source.currency) })}`}
              >
                Prepare {resources[route].title.toLowerCase()}
              </Link>
              {can(user, "ledger.financesubmission.edit") && (
                <Link
                  className={link}
                  href={`/dashboard/ledger/finance-submissions/${id}/prepare`}
                >
                  Link prepared draft
                </Link>
              )}
            </div>
          )}
        </section>,
      );
    }
    const status = text(record.status);
    const actions = financial.includes(key)
      ? [
          ...(status === "DRAFT" ? ["edit", "submit"] : []),
          ...(status === "SUBMITTED" ? ["approve", "reject"] : []),
          ...(status === "APPROVED" ? ["post"] : []),
          ...(status === "POSTED"
            ? [
                "generate",
                ...(key === "invoices" ? ["recognize", "cancel"] : []),
              ]
            : []),
        ]
      : ["currencies", "accounts", "cash-accounts", "tax-types"].includes(key)
        ? ["edit"]
        : key === "periods"
          ? [record.closed ? "reopen" : "close"]
          : key === "withholding-authorizations" && !record.revoked_from
            ? ["revoke"]
            : [];
    return shell(
      <>
        <div className="flex flex-wrap gap-2">
          <Link className={link} href={`/dashboard/ledger/${key}`}>
            Back to list
          </Link>
          {actions
            .filter((a) => {
              const def = actionForm(key, id, a);
              return def && can(user, def.permission);
            })
            .map((a) => (
              <Link
                className={link}
                key={a}
                href={`/dashboard/ledger/${key}/${id}/${a}`}
              >
                {a.replaceAll("-", " ")}
              </Link>
            ))}
        </div>
        {key === "receipts" &&
          status === "POSTED" &&
          can(user, "ledger.receipt.allocate") && (
            <Link
              className={link}
              href={`/dashboard/ledger/allocations/new?source=${record.settlement_source}&date=${today}`}
            >
              Allocate receipt to invoice
            </Link>
          )}
        {["expenses", "supplier-bills", "advances", "tax-remittances"].includes(
          key,
        ) &&
          status === "POSTED" &&
          can(user, "ledger.payment.create") && (
            <Link
              className={link}
              href={`/dashboard/ledger/payments/new?${new URLSearchParams({ target: id, party: text(record.party_id) === "—" ? "" : text(record.party_id), currency: text(record.currency), policy: text(record.policy_id), purpose: ({ expenses: "EXPENSE", "supplier-bills": "BILL", advances: "ADVANCE", "tax-remittances": "TAX_REMITTANCE" } as Record<string, string>)[key] })}`}
            >
              Record payment for this item
            </Link>
          )}
        {key === "documents" && can(user, "ledger.ledgerdocument.download") && (
          <Link className={link} href={`/api/ledger/documents/${id}/download/`}>
            Download supporting document
          </Link>
        )}
        {key === "invoices" &&
          status === "POSTED" &&
          Boolean(record.request_id) &&
          can(user, "procurement.clientpurchaseorder.create") && (
            <Link
              className={link}
              href={`/dashboard/procurement/purchase-orders/new?request=${record.request_id}`}
            >
              Record client purchase approval
            </Link>
          )}
        <section className="rounded-xl border bg-card p-5">
          <RecordView value={record} />
        </section>
      </>,
    );
  }
  let endpoint = `${key}/?${query}`;
  if (key === "approval-requests")
    endpoint = `approval-requests/?page=${page}&status=${q("status", "PENDING")}`;
  if (key === "journals" && q("account")) endpoint = `account-book/?${query}`;
  const data = await ledgerGet<Page<Entity> & { summary?: Entity }>(endpoint);
  let accounts: Entity[] = [];
  if (key === "journals" && can(user, "ledger.accountcurrency.view")) {
    let n = 1;
    let more = true;
    while (more && n <= 100) {
      const choices = await ledgerGet<Page<Entity>>(
        `lookups/?kind=account-currencies&page=${n++}`,
      );
      accounts = accounts.concat(choices.results);
      more = Boolean(choices.next);
    }
  }
  return shell(
    <>
      {resource.form && can(user, resource.form.permission) && (
        <Link
          className={link}
          href={`/dashboard/ledger/${key}/new?currency=${currency}`}
        >
          {resource.form.title}
        </Link>
      )}
      {financial.includes(key) || key === "journals" ? filters(accounts) : null}
      {key === "approval-requests" && (
        <div className="flex gap-2">
          {["PENDING", "APPROVED", "REJECTED"].map((s) => (
            <Link className={link} key={s} href={`?status=${s}`}>
              {s}
            </Link>
          ))}
        </div>
      )}
      {data.summary && (
        <section className="rounded-xl border bg-card p-5">
          <RecordView value={data.summary} />
        </section>
      )}
      <p className="text-sm text-muted-foreground">{data.count} records</p>
      <div className="space-y-4">
        {data.results.map((row) => {
          if (key === "approval-requests") {
            const record = object(row.record);
            const quotation = Boolean(row.quotation_revision);
            const model = financial.find(
              (k) =>
                resources[k].model ===
                text(record.kind).toLowerCase().replaceAll("_", ""),
            );
            const permission = quotation
              ? "ledger.quotation.approve"
              : `ledger.${model ? resources[model].model : text(record.kind).toLowerCase()}.approve`;
            return (
              <article
                className="space-y-4 rounded-xl border bg-card p-5"
                key={row.id}
              >
                <h2 className="font-heading text-xl font-semibold">
                  {quotation
                    ? "Procurement quotation"
                    : text(record.reference) || text(record.kind)}
                </h2>
                {quotation && (
                  <Link
                    className={link}
                    href={`/dashboard/procurement/quotation-revisions/${row.quotation_revision}`}
                  >
                    Open procurement document
                  </Link>
                )}
                <RecordView value={quotation ? row.snapshot : record} />
                {row.status === "PENDING" && can(user, permission) && (
                  <ReviewDecision
                    id={row.id}
                    quotation={quotation}
                    version={Number(record.version)}
                  />
                )}
              </article>
            );
          }
          if (key === "journals" && q("account"))
            return (
              <article className="rounded-xl border bg-card p-5" key={row.id}>
                <RecordView value={row} />
              </article>
            );
          if (key === "journals")
            return (
              <article
                className="space-y-3 rounded-xl border bg-card p-5"
                key={row.id}
              >
                <h2 className="font-semibold">
                  {text(row.reference)} · {text(row.date)}
                </h2>
                <p>
                  {text(row.description)} · {text(row.currency)}
                </p>
                <div className="overflow-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr>
                        <th>Account</th>
                        <th className="text-right">Debit</th>
                        <th className="text-right">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list(row.lines).map((line) => (
                        <tr className="border-t" key={line.id}>
                          <td className="py-3">
                            {text(line.account_code)} —{" "}
                            {text(line.account_name)}
                          </td>
                          <td className="text-right tabular-nums">
                            {text(line.debit)}
                          </td>
                          <td className="text-right tabular-nums">
                            {text(line.credit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            );
          if (key === "finance-submissions")
            return (
              <article className="rounded-xl border bg-card p-5" key={row.id}>
                <RecordView value={row} />
                <Link
                  className={link}
                  href={`/dashboard/ledger/finance-submissions/${row.id}`}
                >
                  Review procurement submission
                </Link>
              </article>
            );
          return (
            <Link
              className="block rounded-xl border bg-card p-5 hover:bg-muted"
              key={row.id}
              href={`/dashboard/ledger/${key}/${row.id}`}
            >
              <dl className="grid gap-3 sm:grid-cols-3">
                {resource.columns.map((c) => (
                  <div key={c}>
                    <dt className="text-xs capitalize text-muted-foreground">
                      {c.replaceAll("_", " ")}
                    </dt>
                    <dd className="break-words font-medium">{text(row[c])}</dd>
                  </div>
                ))}
              </dl>
            </Link>
          );
        })}
      </div>
      {!data.count && (
        <p className="rounded-xl border border-dashed p-8 text-center">
          No records match this view.
        </p>
      )}
      {pages(data)}
    </>,
  );
}
