import Link from "next/link";

import {
  Edit,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  hasPermission,
} from "@/types/auth";
import type {
  CurrentUser,
} from "@/types/auth";

import {
  deleteCrmPartyAction,
} from "@/features/crm/actions";
import {
  CRM_PERMISSIONS,
} from "@/features/crm/permissions";
import {
  CRM_ROUTES,
} from "@/features/crm/routes";
import {
  buildDashboardUrl,
} from "@/features/crm/search-params";
import {
  formatCrmDateTime,
} from "@/features/crm/format";

import type {
  CrmPartyListItem,
  CrmPartyListQuery,
  PaginatedResponse,
} from "@/features/crm/types";

import {
  CrmRoleBadges,
  CrmStatusBadge,
  CrmVerificationBadge,
} from "./CrmPartyBadges";

interface CrmPartyDirectoryProps {
  title: string;
  description: string;
  basePath: string;
  user: CurrentUser;
  query: CrmPartyListQuery;
  data: PaginatedResponse<CrmPartyListItem>;
  fixedRoleLabel?: string;
}

function currentSearchValue(
  query: CrmPartyListQuery,
): string {
  return query.search ?? "";
}

function pageUrl(
  basePath: string,
  query: CrmPartyListQuery,
  page: number,
): string {
  return buildDashboardUrl(basePath, {
    search: query.search,
    entity_kind: query.entity_kind,
    status: query.status,
    verification_level: query.verification_level,
    ordering: query.ordering,
    page,
  });
}

function PartyActions({
  party,
  user,
}: {
  party: CrmPartyListItem;
  user: CurrentUser;
}) {
  const canEdit = hasPermission(
    user,
    CRM_PERMISSIONS.party.edit,
  );

  const canDelete = hasPermission(
    user,
    CRM_PERMISSIONS.party.delete,
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={CRM_ROUTES.partyDetail(party.id)}
        className="rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#334155] transition hover:border-[#F46C0B] hover:text-[#F46C0B]"
      >
        Open
      </Link>

      {canEdit ? (
        <Link
          href={CRM_ROUTES.partyEdit(party.id)}
          className="inline-flex items-center gap-1 rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#334155] transition hover:border-[#0F4C81] hover:text-[#0F4C81]"
        >
          <Edit className="h-3.5 w-3.5" />
          Edit
        </Link>
      ) : null}

      {canDelete ? (
        <form action={deleteCrmPartyAction}>
          <input
            type="hidden"
            name="party_id"
            value={party.id}
          />

          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-lg border border-[#FECACA] px-3 py-2 text-xs font-semibold text-[#B91C1C] transition hover:bg-[#FEF2F2]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </form>
      ) : null}
    </div>
  );
}

function PartyMobileCard({
  party,
  user,
}: {
  party: CrmPartyListItem;
  user: CurrentUser;
}) {
  return (
    <article className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href={CRM_ROUTES.partyDetail(party.id)}
            className="text-base font-semibold text-[#0F172A] hover:text-[#F46C0B]"
          >
            {party.display_name}
          </Link>

          <p className="mt-1 text-xs text-[#64748B]">
            {party.entity_kind.replaceAll("_", " ")}
          </p>
        </div>

        <CrmStatusBadge status={party.status} />
      </div>

      <div className="mt-3">
        <CrmRoleBadges party={party} />
      </div>

      <dl className="mt-4 grid gap-2 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
            Email
          </dt>
          <dd className="text-[#334155]">
            {party.primary_email || "—"}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
            Phone
          </dt>
          <dd className="text-[#334155]">
            {party.primary_phone || "—"}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
            Updated
          </dt>
          <dd className="text-[#334155]">
            {formatCrmDateTime(party.updated_at)}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <PartyActions party={party} user={user} />
      </div>
    </article>
  );
}

export function CrmPartyDirectory({
  title,
  description,
  basePath,
  user,
  query,
  data,
  fixedRoleLabel,
}: CrmPartyDirectoryProps) {
  const canCreate = hasPermission(
    user,
    CRM_PERMISSIONS.party.create,
  );

  const currentPage = query.page ?? 1;
  const totalPages = Math.max(
    1,
    Math.ceil(data.count / (query.page_size ?? 20)),
  );

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#F46C0B]">
              CRM Directory
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#0F172A] sm:text-3xl">
              {title}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475569]">
              {description}
            </p>

            {fixedRoleLabel ? (
              <p className="mt-3 inline-flex rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-3 py-1 text-xs font-semibold text-[#C2410C]">
                Filtered by {fixedRoleLabel}
              </p>
            ) : null}
          </div>

          {canCreate ? (
            <Link
              href={CRM_ROUTES.newParty}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F46C0B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#D95C06]"
            >
              <Plus className="h-4 w-4" />
              New Party
            </Link>
          ) : null}
        </div>
      </header>

      <form
        action={basePath}
        className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_120px]">
          <label className="relative block">
            <span className="sr-only">Search parties</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              name="search"
              defaultValue={currentSearchValue(query)}
              placeholder="Search name, email, phone, source..."
              className="h-11 w-full rounded-lg border border-[#CBD5E1] bg-white pl-10 pr-3 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]"
            />
          </label>

          <select
            name="status"
            defaultValue={query.status ?? ""}
            className="h-11 rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] outline-none focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]"
          >
            <option value="">Any status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="BLOCKED">Blocked</option>
            <option value="MERGED">Merged</option>
          </select>

          <select
            name="entity_kind"
            defaultValue={query.entity_kind ?? ""}
            className="h-11 rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] outline-none focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]"
          >
            <option value="">Any kind</option>
            <option value="ORGANISATION">Organisation</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="TRADING_NAME">Trading name</option>
          </select>

          <button
            type="submit"
            className="h-11 rounded-lg bg-[#0F4C81] px-4 text-sm font-semibold text-white transition hover:bg-[#0B3A63]"
          >
            Filter
          </button>
        </div>
      </form>

      <div className="hidden overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm lg:block">
        <table className="min-w-full divide-y divide-[#E2E8F0]">
          <thead className="bg-[#F8FAFC]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#475569]">
                Party
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#475569]">
                Roles
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#475569]">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#475569]">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#475569]">
                Updated
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#475569]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E2E8F0]">
            {data.results.map((party) => (
              <tr key={party.id}>
                <td className="px-4 py-4 align-top">
                  <Link
                    href={CRM_ROUTES.partyDetail(party.id)}
                    className="font-semibold text-[#0F172A] hover:text-[#F46C0B]"
                  >
                    {party.display_name}
                  </Link>

                  <p className="mt-1 text-xs text-[#64748B]">
                    {party.entity_kind.replaceAll("_", " ")}
                  </p>

                  <div className="mt-2">
                    <CrmVerificationBadge
                      level={party.verification_level}
                    />
                  </div>
                </td>

                <td className="px-4 py-4 align-top">
                  <CrmRoleBadges party={party} />
                </td>

                <td className="px-4 py-4 align-top">
                  <CrmStatusBadge status={party.status} />
                </td>

                <td className="px-4 py-4 align-top text-sm text-[#475569]">
                  <p>{party.primary_email || "—"}</p>
                  <p className="mt-1">{party.primary_phone || "—"}</p>
                </td>

                <td className="px-4 py-4 align-top text-sm text-[#475569]">
                  {formatCrmDateTime(party.updated_at)}
                </td>

                <td className="px-4 py-4 align-top">
                  <div className="flex justify-end">
                    <PartyActions party={party} user={user} />
                  </div>
                </td>
              </tr>
            ))}

            {data.results.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-sm text-[#64748B]"
                >
                  No CRM parties found for the current filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:hidden">
        {data.results.map((party) => (
          <PartyMobileCard
            key={party.id}
            party={party}
            user={user}
          />
        ))}

        {data.results.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
            No CRM parties found for the current filters.
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 text-sm text-[#475569] shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing page{" "}
          <span className="font-semibold text-[#0F172A]">
            {currentPage}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-[#0F172A]">
            {totalPages}
          </span>{" "}
          · {data.count} total records
        </p>

        <div className="flex gap-2">
          <Link
            href={pageUrl(
              basePath,
              query,
              Math.max(1, currentPage - 1),
            )}
            aria-disabled={currentPage <= 1}
            className={`rounded-lg border px-3 py-2 font-semibold ${
              currentPage <= 1
                ? "pointer-events-none border-[#E2E8F0] text-[#CBD5E1]"
                : "border-[#CBD5E1] text-[#334155] hover:border-[#F46C0B] hover:text-[#F46C0B]"
            }`}
          >
            Previous
          </Link>

          <Link
            href={pageUrl(
              basePath,
              query,
              Math.min(totalPages, currentPage + 1),
            )}
            aria-disabled={currentPage >= totalPages}
            className={`rounded-lg border px-3 py-2 font-semibold ${
              currentPage >= totalPages
                ? "pointer-events-none border-[#E2E8F0] text-[#CBD5E1]"
                : "border-[#CBD5E1] text-[#334155] hover:border-[#F46C0B] hover:text-[#F46C0B]"
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </section>
  );
}