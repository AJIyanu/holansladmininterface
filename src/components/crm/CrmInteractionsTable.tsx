import Link from "next/link";

import {
  CalendarClock,
  MessageSquare,
} from "lucide-react";

import {
  CRM_ROUTES,
} from "@/features/crm/routes";
import {
  buildDashboardUrl,
} from "@/features/crm/search-params";
import {
  formatCrmDateTime,
  formatCrmEnum,
} from "@/features/crm/format";

import type {
  CrmInteractionListQuery,
  CrmPartyInteraction,
  PaginatedResponse,
} from "@/features/crm/types";

interface CrmInteractionsTableProps {
  data: PaginatedResponse<CrmPartyInteraction>;
  query: CrmInteractionListQuery;
}

function pageUrl(
  query: CrmInteractionListQuery,
  page: number,
): string {
  return buildDashboardUrl(CRM_ROUTES.interactions, {
    party: query.party,
    contact_party: query.contact_party,
    staff_member: query.staff_member,
    interaction_type: query.interaction_type,
    search: query.search,
    ordering: query.ordering,
    page,
  });
}

export function CrmInteractionsTable({
  data,
  query,
}: CrmInteractionsTableProps) {
  const currentPage = query.page ?? 1;
  const totalPages = Math.max(
    1,
    Math.ceil(data.count / (query.page_size ?? 20)),
  );

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#F46C0B]">
          CRM activity
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#0F172A] sm:text-3xl">
          Interactions
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475569]">
          Review calls, emails, WhatsApp messages, meetings,
          marketplace conversations and follow-up activity.
        </p>
      </header>

      <form
        action={CRM_ROUTES.interactions}
        className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_120px]">
          <input
            name="search"
            defaultValue={query.search ?? ""}
            placeholder="Search subject or summary"
            className="h-11 rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]"
          />

          <select
            name="interaction_type"
            defaultValue={query.interaction_type ?? ""}
            className="h-11 rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] outline-none focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]"
          >
            <option value="">Any type</option>
            <option value="CALL">Call</option>
            <option value="EMAIL">Email</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="MEETING">Meeting</option>
            <option value="MARKETPLACE_MESSAGE">
              Marketplace message
            </option>
            <option value="SITE_VISIT">Site visit</option>
            <option value="OTHER">Other</option>
          </select>

          <button
            type="submit"
            className="h-11 rounded-lg bg-[#0F4C81] px-4 text-sm font-semibold text-white transition hover:bg-[#0B3A63]"
          >
            Filter
          </button>
        </div>
      </form>

      <div className="grid gap-4">
        {data.results.map((interaction) => (
          <article
            key={interaction.id}
            className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-2.5 py-1 text-xs font-semibold text-[#C2410C]">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {interaction.interaction_type_display ||
                      formatCrmEnum(interaction.interaction_type)}
                  </span>

                  {interaction.follow_up_at ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-[#1D4ED8]">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Follow-up{" "}
                      {formatCrmDateTime(interaction.follow_up_at)}
                    </span>
                  ) : null}
                </div>

                <h2 className="mt-3 text-lg font-semibold text-[#0F172A]">
                  {interaction.subject || "Untitled interaction"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#475569]">
                  {interaction.summary || "No summary provided."}
                </p>
              </div>

              <div className="shrink-0 text-sm text-[#64748B] lg:text-right">
                <p>
                  {formatCrmDateTime(interaction.occurred_at)}
                </p>

                <p className="mt-1">
                  Staff:{" "}
                  <span className="font-medium text-[#334155]">
                    {interaction.staff_member_name || "—"}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 border-t border-[#E2E8F0] pt-4 text-sm">
              <Link
                href={CRM_ROUTES.partyDetail(interaction.party)}
                className="font-semibold text-[#0F4C81] hover:text-[#F46C0B]"
              >
                {interaction.party_name}
              </Link>

              {interaction.contact_name ? (
                <span className="text-[#64748B]">
                  Contact: {interaction.contact_name}
                </span>
              ) : null}
            </div>
          </article>
        ))}

        {data.results.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-10 text-center text-sm text-[#64748B] shadow-sm">
            No interactions found.
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 text-sm text-[#475569] shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          Page{" "}
          <span className="font-semibold text-[#0F172A]">
            {currentPage}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-[#0F172A]">
            {totalPages}
          </span>{" "}
          · {data.count} total interactions
        </p>

        <div className="flex gap-2">
          <Link
            href={pageUrl(
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