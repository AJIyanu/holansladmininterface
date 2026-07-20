import Link from "next/link";
import { Edit, Plus, Trash2 } from "lucide-react";

import { hasPermission } from "@/types/auth";
import type { CurrentUser } from "@/types/auth";

import { deleteCrmDocumentAction } from "@/features/crm/document-actions";
import {
  canBrowserPreviewDocument,
  documentMimeLabel,
  formatCrmDate,
  formatCrmDateTime,
  formatFileSize,
} from "@/features/crm/format";
import { CRM_PERMISSIONS } from "@/features/crm/permissions";
import { CRM_ROUTES } from "@/features/crm/routes";
import { buildDashboardUrl } from "@/features/crm/search-params";

import type {
  CrmDocumentListQuery,
  CrmPartyDocument,
  CrmPartyListItem,
  PaginatedResponse,
} from "@/features/crm/types";

import { CrmDocumentPreviewButton } from "./CrmDocumentPreviewButton";

interface CrmDocumentsTableProps {
  user: CurrentUser;
  data: PaginatedResponse<CrmPartyDocument>;
  partiesById: Record<string, CrmPartyListItem>;
  query: CrmDocumentListQuery;
}

function pageUrl(query: CrmDocumentListQuery, page: number): string {
  return buildDashboardUrl(CRM_ROUTES.documents, {
    party: query.party,
    category: query.category,
    verification_status: query.verification_status,
    is_confidential:
      query.is_confidential === undefined
        ? undefined
        : String(query.is_confidential),
    is_active:
      query.is_active === undefined ? undefined : String(query.is_active),
    search: query.search,
    ordering: query.ordering,
    page,
  });
}

function DocumentStatusBadge({ document }: { document: CrmPartyDocument }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-[#1D4ED8]">
        {document.verification_status_display || document.verification_status}
      </span>

      {document.is_confidential ? (
        <span className="rounded-full border border-[#FECACA] bg-[#FEF2F2] px-2.5 py-1 text-xs font-semibold text-[#B91C1C]">
          Confidential
        </span>
      ) : null}

      {!document.is_active ? (
        <span className="rounded-full border border-[#CBD5E1] bg-[#F1F5F9] px-2.5 py-1 text-xs font-semibold text-[#475569]">
          Inactive
        </span>
      ) : null}
    </div>
  );
}

export function CrmDocumentsTable({
  user,
  data,
  partiesById,
  query,
}: CrmDocumentsTableProps) {
  const canCreate = hasPermission(user, CRM_PERMISSIONS.document.create);

  const canEdit = hasPermission(user, CRM_PERMISSIONS.document.edit);

  const canDelete = hasPermission(user, CRM_PERMISSIONS.document.delete);

  const canDownload = hasPermission(user, CRM_PERMISSIONS.document.download);

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
              CRM documents
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#0F172A] sm:text-3xl">
              Documents
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475569]">
              Upload, preview and manage Party documents stored through the
              backend document provider.
            </p>
          </div>

          {canCreate ? (
            <Link
              href={CRM_ROUTES.newDocument}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F46C0B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#D95C06]"
            >
              <Plus className="h-4 w-4" />
              Upload document
            </Link>
          ) : null}
        </div>
      </header>

      <form
        action={CRM_ROUTES.documents}
        className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_120px]">
          <input
            name="search"
            defaultValue={query.search ?? ""}
            placeholder="Search filename or description"
            className="h-11 rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]"
          />

          <select
            name="category"
            defaultValue={query.category ?? ""}
            className="h-11 rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] outline-none focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]"
          >
            <option value="">Any category</option>
            <option value="REGISTRATION">Registration</option>
            <option value="TAX">Tax</option>
            <option value="BANK">Bank</option>
            <option value="CONTRACT">Contract</option>
            <option value="CORRESPONDENCE">Correspondence</option>
            <option value="IDENTITY">Identity</option>
            <option value="QUOTE">Quote</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            name="verification_status"
            defaultValue={query.verification_status ?? ""}
            className="h-11 rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] outline-none focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]"
          >
            <option value="">Any status</option>
            <option value="UNVERIFIED">Unverified</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
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
                  Document
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#475569]">
                  Party
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#475569]">
                  Status
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
              {data.results.map((document) => {
                const party = partiesById[String(document.party)];

                return (
                  <tr key={document.id}>
                    <td className="px-4 py-4 align-top">
                      <p className="max-w-xs truncate font-semibold text-[#0F172A]">
                        {document.original_filename}
                      </p>

                      <p className="mt-1 text-xs text-[#64748B]">
                        {document.category_display} ·{" "}
                        {documentMimeLabel(document.mime_type)} ·{" "}
                        {formatFileSize(document.size_bytes)}
                      </p>

                      {!canBrowserPreviewDocument(document.mime_type) ? (
                        <p className="mt-1 text-xs text-[#94A3B8]">
                          Metadata preview only
                        </p>
                      ) : null}
                    </td>

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
                          {document.party}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 align-top">
                      <DocumentStatusBadge document={document} />
                    </td>

                    <td className="px-4 py-4 align-top text-sm text-[#475569]">
                      <p>Uploaded: {formatCrmDateTime(document.created_at)}</p>
                      <p className="mt-1">
                        Expires: {formatCrmDate(document.expires_at)}
                      </p>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <div className="flex justify-end gap-2">
                        {canDownload ? (
                          <CrmDocumentPreviewButton document={document} />
                        ) : null}

                        {canEdit ? (
                          <Link
                            href={CRM_ROUTES.documentEdit(document.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#334155] hover:border-[#0F4C81] hover:text-[#0F4C81]"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                        ) : null}

                        {canDelete ? (
                          <form action={deleteCrmDocumentAction}>
                            <input
                              type="hidden"
                              name="document_id"
                              value={document.id}
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
                    No documents found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 p-4 lg:hidden">
          {data.results.map((document) => {
            const party = partiesById[String(document.party)];

            return (
              <article
                key={document.id}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#0F172A]">
                      {document.original_filename}
                    </p>

                    <p className="mt-1 text-sm text-[#64748B]">
                      {party?.display_name ?? document.party}
                    </p>
                  </div>

                  <span className="rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-[#1D4ED8]">
                    {document.category_display}
                  </span>
                </div>

                <p className="mt-3 text-sm text-[#64748B]">
                  {documentMimeLabel(document.mime_type)} ·{" "}
                  {formatFileSize(document.size_bytes)}
                </p>

                <div className="mt-4">
                  <DocumentStatusBadge document={document} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {canDownload ? (
                    <CrmDocumentPreviewButton document={document} />
                  ) : null}

                  {canEdit ? (
                    <Link
                      href={CRM_ROUTES.documentEdit(document.id)}
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
          {data.count} total documents
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
