import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Plus, FolderOpen } from "lucide-react";
import { requireProcurement, procurementGet } from "@/features/procurement/api";
import {
  resources,
  actionForm,
  actionNames,
} from "@/features/procurement/config";
import {
  can,
  canWrite,
  text,
  label,
  entities,
  fieldDisplay,
  type Entity,
  type Page,
  type Tracker,
} from "@/features/procurement/types";
import { ProcurementForm } from "@/components/procurement/ProcurementForm";
import { SubmitRequestButton } from "@/components/procurement/RequestActions";
import { ItemTracker } from "@/components/procurement/ItemTracker";
import {
  RecordDetails,
  NestedRecords,
} from "@/components/procurement/RecordDetails";
import { ServerFetchError } from "@/lib/server-fetch";
export const metadata = { title: "Procurement | HolanSL" };
const button =
  "inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90";
const outline =
  "inline-flex items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted";
type Props = {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export default async function ProcurementPage({ params, searchParams }: Props) {
  const { segments = [] } = await params;
  const search = await searchParams;
  const [resource, id, operation] = segments;
  if (segments.length > 3) notFound();
  const user = await requireProcurement();
  if (!resource)
    return (
      <main className="space-y-6 p-4 md:p-6">
        <header>
          <p className="text-sm text-muted-foreground">Staff operations</p>
          <h1 className="font-heading text-3xl font-bold">Procurement</h1>
          <p className="mt-2 text-muted-foreground">
            From a client request to delivery, with every item and replacement
            attempt recorded.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(resources)
            .filter(
              ([key, item]) =>
                ![
                  "events",
                  "attempts",
                  "delivery-outcomes",
                  "quotation-revisions",
                  "document-versions",
                  "rejection-actions",
                  "task-links",
                ].includes(key) && can(user, `procurement.${item.model}.view`),
            )
            .map(([key, item]) => (
              <Link
                key={key}
                href={`/dashboard/procurement/${key}`}
                className="flex items-center gap-4 rounded-xl border bg-card p-5 hover:border-primary"
              >
                <FolderOpen className="h-6 w-6 text-primary" />
                <span className="flex-1 font-semibold">{item.title}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
        </div>
      </main>
    );
  const config = resources[resource];
  if (!config) notFound();
  await requireProcurement(`procurement.${config.model}.view`);
  const requestId =
    typeof search.request === "string" ? search.request : undefined;
  const heading = (title: string) => (
    <header className="space-y-2">
      <Link
        href="/dashboard/procurement"
        className="text-sm text-primary hover:underline"
      >
        Procurement
      </Link>
      <h1 className="font-heading text-2xl font-bold md:text-3xl">{title}</h1>
    </header>
  );
  if (id === "new" || operation) {
    const definition =
      id === "new" ? config.form : actionForm(resource, id!, operation!);
    if (!definition) notFound();
    if (!canWrite(user, definition.permission))
      return (
        <main className="space-y-4 p-6">
          {heading(definition.title)}
          <p>You do not have permission to perform this action.</p>
        </main>
      );
    const initial: Record<string, unknown> =
      operation === "generate" ? { draft: true, format: "PDF" } : {};
    for (const field of definition.fields) {
      const val = search[field.name];
      if (
        typeof val === "string" &&
        field.type !== "file" &&
        field.type !== "boolean"
      )
        initial[field.name] = val;
    }
    if (operation && id) {
      try {
        const source = await procurementGet<Entity>(`${resource}/${id}/`);
        if (operation === "revise") {
          const version =
            resource === "quotations" ? entities(source.revisions)[0] : source;
          if (version) {
            for (const field of definition.fields)
              if (
                field.name !== "document" &&
                field.name !== "reason" &&
                field.type !== "datetime" &&
                version[field.name] !== undefined
              )
                initial[field.name] =
                  field.type === "date" && version[field.name]
                    ? text(version[field.name]).slice(0, 10)
                    : version[field.name];
            initial.request = source.request;
            if (definition.lines)
              initial[definition.lines.name] = entities(version.lines);
          }
        }
      } catch (error) {
        if (error instanceof ServerFetchError && error.status === 404)
          notFound();
        throw error;
      }
    }
    return (
      <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
        {heading(definition.title)}
        <ProcurementForm
          definition={definition}
          requestId={requestId}
          user={{
            is_superuser: user.is_superuser,
            permissions: user.permissions,
          }}
          initial={initial}
        />
      </main>
    );
  }
  if (id) {
    let record: Entity;
    try {
      record = await procurementGet<Entity>(`${resource}/${id}/`);
    } catch (error) {
      if (error instanceof ServerFetchError && error.status === 404) notFound();
      throw error;
    }
    const rootRequest =
      typeof record.request === "string" ? record.request : requestId;
    const context = rootRequest ? `?request=${rootRequest}` : "";
    const tracker =
      resource === "items"
        ? await procurementGet<Tracker>(`items/${id}/tracker/`)
        : null;
    return (
      <main className="space-y-6 p-4 md:p-6">
        {heading(`${config.title} · ${label(record)}`)}
        {resource === "requests" &&
          !record.submitted_at &&
          canWrite(user, "procurement.procurementrequest.edit") && (
            <SubmitRequestButton
              key={`${record.id}-${record.version}`}
              request={record}
            />
          )}
        <div className="flex flex-wrap gap-2 rounded-xl border bg-card p-4">
          <Link className={outline} href={`/dashboard/procurement/${resource}`}>
            Back to {config.title.toLowerCase()}
          </Link>
          {(actionNames[resource] || []).map((action) => {
            const definition = actionForm(resource, id, action);
            if (!definition || !canWrite(user, definition.permission))
              return null;
            if (action === "submit") return null;
            if (action === "dispatch" && record.dispatched_at) return null;
            return (
              <Link
                className={outline}
                key={action}
                href={`/dashboard/procurement/${resource}/${id}/${action}${context}`}
              >
                {definition.title}
              </Link>
            );
          })}
          {resource === "requests" && (
            <section className="mt-2 w-full space-y-3 border-t pt-4">
              <h2 className="text-sm font-semibold">Related records</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  "supplier-quotations",
                  "quotations",
                  "purchase-orders",
                  "deliveries",
                  "documents",
                  "finance-requests",
                ].map(
                  (key) =>
                    resources[key].form &&
                    canWrite(user, resources[key].form!.permission) && (
                      <Link
                        className={outline}
                        key={key}
                        href={`/dashboard/procurement/${key}/new?request=${id}`}
                      >
                        Add {resources[key].title.toLowerCase()}
                      </Link>
                    ),
                )}
              </div>
            </section>
          )}
          {resource === "documents" &&
            can(user, "procurement.procurementdocument.download") && (
              <Link
                className={button}
                href={`/api/procurement/documents/${id}/download/`}
              >
                Download file
              </Link>
            )}
          {(resource === "quotation-revisions" || resource === "deliveries") &&
            canWrite(user, "procurement.documentversion.create") && (
              <Link
                className={outline}
                href={`/dashboard/procurement/document-versions/new?${new URLSearchParams({ ...(rootRequest ? { request: rootRequest } : {}), kind: resource === "deliveries" ? "WB" : "QT", [resource === "deliveries" ? "delivery" : "quotation_revision"]: id })}`}
              >
                Prepare{" "}
                {resource === "deliveries" ? "waybill" : "quotation document"}
              </Link>
            )}
        </div>
        <RecordDetails record={record} />
        {resource === "requests" && !record.client_code && (
          <p className="rounded-lg border bg-muted p-4">
            Assign a client document code before preparing numbered documents.
          </p>
        )}
        {tracker && <ItemTracker tracker={tracker} />}
        {resource === "document-versions" && (
          <section className="space-y-3 rounded-xl border bg-card p-5">
            <h2 className="font-heading text-xl font-semibold">
              Document preview
            </h2>
            <p className="text-muted-foreground">
              Generate a draft to preview the sample-based layout. The office
              address comes from company configuration. Saved files retain the
              address used when they were generated.
            </p>
            {can(user, "procurement.procurementdocument.view") &&
              can(user, "procurement.procurementdocument.download") &&
              entities(record.assets).map((asset) => (
                <div key={asset.id} className="space-y-2">
                  <p className="text-sm font-medium">{text(asset.filename)}</p>
                  <iframe
                    title={text(asset.filename)}
                    src={`/api/procurement/documents/${asset.document}/download/?preview=true`}
                    className="h-[70vh] w-full rounded-lg border bg-white"
                  />
                  <a
                    className="text-primary underline"
                    href={`/api/procurement/documents/${asset.document}/download/`}
                  >
                    Download {text(asset.format)}
                  </a>
                </div>
              ))}
            {record.kind !== "WB" && (
              <p className="text-sm text-muted-foreground">
                Official quotations and invoices require ledger approval.
                Receipts are issued only by ledger.
              </p>
            )}
          </section>
        )}
        {resource === "finance-requests" && (
          <p className="rounded-lg border bg-muted p-4">
            This is a finance request draft. Ledger approval, disbursement and
            posting are not available yet.
          </p>
        )}
        <NestedRecords
          record={record}
          resource={resource}
          canEditItems={canWrite(user, "procurement.requestitem.edit")}
        />
        {resource === "requests" && (
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-semibold">
              Related records
            </h2>
            <div className="flex flex-wrap gap-3">
              {[
                "supplier-quotations",
                "quotations",
                "purchase-orders",
                "supplier-purchases",
                "deliveries",
                "documents",
                "document-register",
                "finance-requests",
              ]
                .filter((key) =>
                  can(user, `procurement.${resources[key].model}.view`),
                )
                .map((key) => (
                  <Link
                    key={key}
                    className={outline}
                    href={`/dashboard/procurement/${key}?request=${id}`}
                  >
                    {resources[key].title}
                  </Link>
                ))}
            </div>
          </section>
        )}
      </main>
    );
  }
  const query = new URLSearchParams(config.filters);
  for (const key of [
    "page",
    "search",
    "request",
    "client",
    "owner",
    "item",
    "kind",
    "milestone",
  ]) {
    if (typeof search[key] === "string") query.set(key, search[key] as string);
  }
  query.set("page_size", "20");
  const data = await procurementGet<Page<Entity>>(`${resource}/?${query}`);
  const page = Math.max(1, Number(query.get("page") || 1) || 1);
  const pageLink = (n: number) => {
    const next = new URLSearchParams(query);
    next.set("page", String(n));
    return `/dashboard/procurement/${resource}?${next}`;
  };
  return (
    <main className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {heading(config.title)}
        {config.form && canWrite(user, config.form.permission) && (
          <Link
            className={button}
            href={`/dashboard/procurement/${resource}/new${requestId ? `?request=${requestId}` : ""}`}
          >
            <Plus className="h-4 w-4" />
            {config.form.title}
          </Link>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {data.count} record{data.count === 1 ? "" : "s"}
          {requestId ? " for this request" : ""}
        </p>
        {["requests", "items"].includes(resource) && (
          <form className="flex gap-2">
            <label className="sr-only" htmlFor="procurement-search">
              Search records
            </label>
            <input
              id="procurement-search"
              name="search"
              defaultValue={
                text(search.search) === "—" ? "" : text(search.search)
              }
              placeholder={
                resource === "items"
                  ? "Search item descriptions"
                  : "Search client or reference"
              }
              className="min-w-0 rounded-md border bg-background px-3 py-2 text-sm"
            />
            {requestId && (
              <input type="hidden" name="request" value={requestId} />
            )}
            <button className={outline}>Search</button>
          </form>
        )}
      </div>
      {resource === "finance-requests" && (
        <p className="rounded-lg border bg-muted p-4">
          These are drafts awaiting ledger integration. No payments or official
          financial records are created here.
        </p>
      )}
      {data.results.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <FolderOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h2 className="font-semibold">No records found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a record if permitted, or adjust your search.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {data.results.map((row) => (
            <Link
              key={row.id}
              href={`/dashboard/procurement/${resource}/${row.id}${requestId ? `?request=${requestId}` : ""}`}
              className="rounded-xl border bg-card p-5 transition-colors hover:border-primary"
            >
              <div className="flex items-start gap-3">
                <h2 className="min-w-0 flex-1 break-words font-heading text-lg font-semibold">
                  {label(row)}
                </h2>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                {config.columns.map((key) => (
                  <div key={key} className="min-w-0">
                    <dt className="text-xs capitalize text-muted-foreground">
                      {key.replaceAll("_", " ")}
                    </dt>
                    <dd className="mt-1 truncate text-sm">
                      {fieldDisplay(row, key)}
                    </dd>
                  </div>
                ))}
              </dl>
            </Link>
          ))}
        </div>
      )}
      <nav
        aria-label="Pagination"
        className="flex items-center justify-between gap-3"
      >
        {data.previous ? (
          <Link className={outline} href={pageLink(page - 1)}>
            Previous
          </Link>
        ) : (
          <span />
        )}
        <span className="text-sm text-muted-foreground">
          Page {page} of {Math.max(1, Math.ceil(data.count / 20))}
        </span>
        {data.next ? (
          <Link className={outline} href={pageLink(page + 1)}>
            Next
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
