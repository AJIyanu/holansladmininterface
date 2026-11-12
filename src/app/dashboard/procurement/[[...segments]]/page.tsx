import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProcurementFilters } from "@/features/procurement/Filters";
import { AnalyticsDashboard } from "@/features/procurement/AnalyticsDashboard";
import { RequestCards } from "@/features/procurement/RequestCards";
import { RequestForm } from "@/features/procurement/RequestForm";
import { TrackerCards } from "@/features/procurement/TrackerCards";
import { TrackerDetail } from "@/features/procurement/TrackerDetail";
import type {
  ItemRequest,
  Option,
  Page,
  RequestedItem,
  TrackerDetail as TrackerDetailType,
} from "@/features/procurement/types";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch, ServerFetchError } from "@/lib/server-fetch";

export const metadata = { title: "Procurement | HolanSL" };
type Search = Record<string, string | string[] | undefined>;
type Props = {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Search>;
};

export default async function ProcurementPage({ params, searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { segments: routeSegments = [] } = await params;
  const search = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (Array.isArray(value)) {
      for (const entry of value) query.append(key, entry);
    } else if (value !== undefined) {
      query.append(key, value);
    }
  }
  const suffix = query.size ? `?${query}` : "";
  if (["requests", "items", "analytics"].includes(routeSegments[0])) {
    redirect(
      `/dashboard/procurement/requesttracks/${routeSegments.map(encodeURIComponent).join("/")}${suffix}`,
    );
  }
  if (
    routeSegments.length === 0 ||
    (routeSegments[0] === "requesttracks" && routeSegments.length === 1)
  ) {
    redirect(`/dashboard/procurement/requesttracks/analytics${suffix}`);
  }
  const isRequestTracks = routeSegments[0] === "requesttracks";
  const segments = isRequestTracks ? routeSegments.slice(1) : routeSegments;
  if (isRequestTracks && segments[0] === "requests" && segments.length === 1) {
    if (!hasPermission(user, "procurement.itemrequest.view"))
      redirect("/dashboard/unauthorized");
    const query = queryString(search, [
      "search",
      "client",
      "received_via",
      "registered_from",
      "registered_to",
      "ordering",
      "page",
    ]);
    const [data, clients] = await Promise.all([
      safeFetch<Page<ItemRequest>>(`/procurement/item-requests/?${query}`),
      safeFetch<Option[]>("/procurement/item-requests/client-options/"),
    ]);
    return (
      <main className="space-y-6 p-4 md:p-6 lg:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Procurement</p>
            <h1 className="font-heading text-3xl font-bold">Item Requests</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Register and review every item requested by a CRM client. Items
              entered together remain independently trackable.
            </p>
          </div>
          {hasPermission(user, "procurement.itemrequest.create") && (
            <RequestForm clients={clients} />
          )}
        </header>
        <ProcurementFilters
          kind="requests"
          initial={stringValues(search)}
          clients={clients}
        />
        <RequestCards requests={data.results} />
        <Pagination count={data.count} search={search} />
      </main>
    );
  }
  if (isRequestTracks && segments[0] === "items" && segments.length === 1) {
    if (!hasPermission(user, "procurement.itemtracker.view"))
      redirect("/dashboard/unauthorized");
    const query = queryString(search, [
      "search",
      "client",
      "status",
      "urgency",
      "overdue",
      "ordering",
      "page",
    ]);
    const [data, clients] = await Promise.all([
      safeFetch<Page<RequestedItem>>(`/procurement/items/?${query}`),
      safeFetch<Option[]>("/procurement/item-requests/client-options/"),
    ]);
    return (
      <main className="space-y-6 p-4 md:p-6 lg:p-8">
        <header>
          <p className="text-sm font-medium text-primary">Procurement</p>
          <h1 className="font-heading text-3xl font-bold">Item Trackers</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Follow each item from registration until it is delivered or closed.
          </p>
        </header>
        <ProcurementFilters
          kind="trackers"
          initial={stringValues(search)}
          clients={clients}
        />
        <TrackerCards items={data.results} />
        <Pagination count={data.count} search={search} />
      </main>
    );
  }
  if (isRequestTracks && segments[0] === "items" && segments.length === 2) {
    if (!hasPermission(user, "procurement.itemtracker.view"))
      redirect("/dashboard/unauthorized");
    const item = await trackerDetail(segments[1]);
    return (
      <TrackerDetail
        item={item}
        canAdd={hasPermission(user, "procurement.itemactivity.create")}
        canChangeStatus={hasPermission(user, "procurement.itemstatus.edit")}
        canEdit={hasPermission(user, "procurement.requesteditem.edit")}
        canAddPictures={hasPermission(
          user,
          "procurement.requesteditemimage.create",
        )}
        canDeletePictures={hasPermission(
          user,
          "procurement.requesteditemimage.delete",
        )}
      />
    );
  }
  if (isRequestTracks && segments[0] === "analytics" && segments.length === 1) {
    if (
      !hasPermission(user, "procurement.itemrequest.view") &&
      !hasPermission(user, "procurement.itemtracker.view")
    )
      redirect("/dashboard/unauthorized");
    return <AnalyticsDashboard />;
  }
  const futureTitle = isRequestTracks
    ? undefined
    : futureProcurementTitle(segments, search);
  if (futureTitle) {
    if (!user.is_staff && !user.is_superuser)
      redirect("/dashboard/unauthorized");
    return <UnderDevelopment title={futureTitle} />;
  }
  notFound();
}

async function safeFetch<T>(path: string): Promise<T> {
  try {
    return await serverFetch<T>(path);
  } catch (error) {
    if (error instanceof ServerFetchError && error.status === 403)
      redirect("/dashboard/unauthorized");
    throw error;
  }
}

async function trackerDetail(id: string): Promise<TrackerDetailType> {
  try {
    return await serverFetch<TrackerDetailType>(
      `/procurement/items/${id}/tracker/`,
    );
  } catch (error) {
    if (error instanceof ServerFetchError && error.status === 404) notFound();
    throw error;
  }
}
function queryString(search: Search, allowed: string[]) {
  const query = new URLSearchParams();
  for (const key of allowed) {
    const value = search[key];
    if (typeof value === "string" && value) query.set(key, value);
  }
  return query.toString();
}

function stringValues(search: Search) {
  return Object.fromEntries(
    Object.entries(search).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function futureProcurementTitle(segments: string[], search: Search) {
  const [resource, action] = segments;
  if (resource === "quotations" && action === "new") return "Prepare Quotation";
  if (resource === "purchase-orders" && action === "new")
    return "Record Purchase Order";
  if (resource === "finance-requests")
    return search.kind === "ADVANCE" ? "Advance Requests" : "Invoice Requests";
  const titles: Record<string, string> = {
    "supplier-quotations": "Supplier Offers",
    quotations: "Client Quotations",
    "purchase-orders": "Client Purchase Orders",
    "supplier-purchases": "Supplier Purchases",
    "goods-receipts": "Goods Received",
    deliveries: "Deliveries & Waybills",
    "outcome-lines": "Rejected Items & Replacements",
    costs: "Cost Breakdowns",
    "document-register": "Document Register",
    "document-versions": "Prepare Document",
    documents: "Uploaded Evidence",
  };
  return resource ? titles[resource] : undefined;
}
function Pagination({ count, search }: { count: number; search: Search }) {
  const current = Math.max(
    1,
    Number(typeof search.page === "string" ? search.page : "1") || 1,
  );
  const pages = Math.max(1, Math.ceil(count / 20));
  const href = (page: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(search))
      if (typeof value === "string" && key !== "page") query.set(key, value);
    query.set("page", String(page));
    return `?${query}`;
  };
  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4"
    >
      <p className="text-sm text-muted-foreground">
        {count.toLocaleString("en-NG")} total · Page {current} of {pages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          asChild={current > 1}
          disabled={current <= 1}
        >
          {current > 1 ? (
            <Link href={href(current - 1)}>Previous</Link>
          ) : (
            <span>Previous</span>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild={current < pages}
          disabled={current >= pages}
        >
          {current < pages ? (
            <Link href={href(current + 1)}>Next</Link>
          ) : (
            <span>Next</span>
          )}
        </Button>
      </div>
    </nav>
  );
}
function UnderDevelopment({ title }: { title: string }) {
  return (
    <main className="mx-auto flex min-h-[65vh] max-w-4xl items-center p-4 md:p-8">
      <section className="w-full rounded-3xl border bg-card p-8 text-center shadow-sm md:p-14">
        <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BarChart3 className="size-10" />
        </span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Procurement redesign
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold">{title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          This section is retained in the Procurement roadmap and will be
          redesigned in order after its business rules are approved.
        </p>
        <Button asChild variant="outline" className="mt-8">
          <Link href="/dashboard/procurement/requesttracks/requests">
            <ArrowLeft className="size-4" /> Return to item requests
          </Link>
        </Button>
      </section>
    </main>
  );
}
