import Link from "next/link";

import { Edit, Plus, Trash2 } from "lucide-react";

import { hasPermission } from "@/types/auth";
import type { CurrentUser } from "@/types/auth";

import { deleteCrmRegistrationAction } from "@/features/crm/registration-actions";
import { CRM_PERMISSIONS } from "@/features/crm/permissions";
import { CRM_ROUTES } from "@/features/crm/routes";
import { buildDashboardUrl } from "@/features/crm/search-params";
import { formatCrmDate, formatCrmEnum } from "@/features/crm/format";

import type {
  CrmIdentifierListQuery,
  CrmPartyIdentifier,
  CrmPartyListItem,
  PaginatedResponse,
} from "@/features/crm/types";

import { CrmRevealIdentifierButton } from "./CrmRevealIdentifierButton";

interface CrmRegistrationsTableProps {
  user: CurrentUser;
  data: PaginatedResponse<CrmPartyIdentifier>;
  partiesById: Record<string, CrmPartyListItem>;
  query: CrmIdentifierListQuery;
}

function pageUrl(query: CrmIdentifierListQuery, page: number): string {
  return buildDashboardUrl(CRM_ROUTES.registrations, {
    party: query.party,
    identifier_type: query.identifier_type,
    issuing_country: query.issuing_country,
    is_verified:
      query.is_verified === undefined ? undefined : String(query.is_verified),
    is_active:
      query.is_active === undefined ? undefined : String(query.is_active),
    ordering: query.ordering,
    page,
  });
}

export function CrmRegistrationsTable({
  user,
  data,
  partiesById,
  query,
}: CrmRegistrationsTableProps) {
  const canCreate = hasPermission(user, CRM_PERMISSIONS.identifier.create);

  const canEdit = hasPermission(user, CRM_PERMISSIONS.identifier.edit);

  const canDelete = hasPermission(user, CRM_PERMISSIONS.identifier.delete);

  const canReveal = hasPermission(user, CRM_PERMISSIONS.identifier.reveal);

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
              CRM registrations
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#0F172A] sm:text-3xl">
              Registrations
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475569]">
              Manage encrypted registration, tax, VAT, import/export and
              marketplace seller identifiers.
            </p>
          </div>

          {canCreate ? (
            <Link
              href={`${CRM_ROUTES.registrations}/new`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F46C0B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#D95C06]"
            >
              <Plus className="h-4 w-4" />
              New registration
            </Link>
          ) : null}
        </div>
      </header>

      <form
        action={CRM_ROUTES.registrations}
        className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_160px_120px]">
          <input
            name="issuing_country"
            defaultValue={query.issuing_country ?? ""}
            placeholder="Country, e.g. NG"
            maxLength={2}
            className="h-11 rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm uppercase text-[#0F172A] outline-none placeholder:normal-case placeholder:text-[#94A3B8] focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]"
          />

          <select
            name="identifier_type"
            defaultValue={query.identifier_type ?? ""}
            className="h-11 rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] outline-none focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]"
          >
            <option value="">Any type</option>
            <option value="COMPANY_REGISTRATION">Company registration</option>
            <option value="TAX_ID">Tax ID</option>
            <option value="VAT">VAT</option>
            <option value="IMPORT_EXPORT">Import/export</option>
            <option value="MARKETPLACE_SELLER">Marketplace seller</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            name="is_verified"
            defaultValue={
              query.is_verified === undefined ? "" : String(query.is_verified)
            }
            className="h-11 rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] outline-none focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]"
          >
            <option value="">Any verification</option>
            <option value="true">Verified</option>
            <option value="false">Not verified</option>
          </select>

          <button
            type="submit"
            className="h-11 rounded-lg bg-[#0F4C81] px-4 text-sm font-semibold text-white transition hover:bg-[#0B3A63]"
          >
            Filter
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="hidden lg:block">
          <table className="min-w-full divide-y divide-[#E2E8F0]">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#475569]">
                  Party
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#475569]">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#475569]">
                  Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#475569]">
                  Dates
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#475569]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E2E8F0]">
              {data.results.map((identifier) => {
                const party = partiesById[String(identifier.party)];

                return (
                  <tr key={identifier.id}>
                    <td className="px-4 py-4 align-top">
                      {party ? (
                        <Link
                          href={CRM_ROUTES.partyDetail(party.id)}
                          className="font-semibold text-[#0F172A] hover:text-[#F46C0B]"
                        >
                          {party.display_name}
                        </Link>
                      ) : (
                        <span className="font-mono text-xs text-[#64748B]">
                          {identifier.party}
                        </span>
                      )}

                      <p className="mt-1 text-xs text-[#64748B]">
                        {identifier.issuing_country || "No country"}
                      </p>
                    </td>

                    <td className="px-4 py-4 align-top text-sm text-[#334155]">
                      {formatCrmEnum(identifier.identifier_type)}
                      {identifier.label ? (
                        <p className="mt-1 text-xs text-[#64748B]">
                          {identifier.label}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-4 py-4 align-top">
                      <p className="font-mono text-sm font-semibold text-[#0F172A]">
                        {identifier.masked_value || "—"}
                      </p>

                      <p className="mt-1 text-xs text-[#64748B]">
                        {identifier.is_verified ? "Verified" : "Not verified"}
                      </p>
                    </td>

                    <td className="px-4 py-4 align-top text-sm text-[#475569]">
                      <p>Issue: {formatCrmDate(identifier.issue_date)}</p>
                      <p className="mt-1">
                        Expiry: {formatCrmDate(identifier.expiry_date)}
                      </p>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <div className="flex justify-end gap-2">
                        {canReveal ? (
                          <CrmRevealIdentifierButton
                            identifierId={identifier.id}
                          />
                        ) : null}

                        {canEdit ? (
                          <Link
                            href={`${CRM_ROUTES.registrations}/${identifier.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#334155] hover:border-[#0F4C81] hover:text-[#0F4C81]"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                        ) : null}

                        {canDelete ? (
                          <form action={deleteCrmRegistrationAction}>
                            <input
                              type="hidden"
                              name="identifier_id"
                              value={identifier.id}
                            />

                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 rounded-lg border border-[#FECACA] px-3 py-2 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEF2F2]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {data.results.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-[#64748B]"
                  >
                    No registrations found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 p-4 lg:hidden">
          {data.results.map((identifier) => {
            const party = partiesById[String(identifier.party)];

            return (
              <article
                key={identifier.id}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#0F172A]">
                      {formatCrmEnum(identifier.identifier_type)}
                    </p>

                    <p className="mt-1 text-sm text-[#64748B]">
                      {party?.display_name ?? identifier.party}
                    </p>
                  </div>

                  <span className="rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-2.5 py-1 text-xs font-semibold text-[#C2410C]">
                    {identifier.is_verified ? "Verified" : "Unverified"}
                  </span>
                </div>

                <p className="mt-4 font-mono text-sm font-semibold text-[#0F172A]">
                  {identifier.masked_value || "—"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {canReveal ? (
                    <CrmRevealIdentifierButton identifierId={identifier.id} />
                  ) : null}

                  {canEdit ? (
                    <Link
                      href={`${CRM_ROUTES.registrations}/${identifier.id}/edit`}
                      className="rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#334155]"
                    >
                      Edit
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 text-sm text-[#475569] shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          Page{" "}
          <span className="font-semibold text-[#0F172A]">{currentPage}</span> of{" "}
          <span className="font-semibold text-[#0F172A]">{totalPages}</span> ·{" "}
          {data.count} total registrations
        </p>

        <div className="flex gap-2">
          <Link
            href={pageUrl(query, Math.max(1, currentPage - 1))}
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
            href={pageUrl(query, Math.min(totalPages, currentPage + 1))}
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
