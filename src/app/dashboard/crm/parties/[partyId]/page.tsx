import Link from "next/link";

import {
  ArrowLeft,
  Edit,
} from "lucide-react";

import {
  hasPermission,
} from "@/types/auth";

import {
  getCrmParty,
  listCrmContactRoles,
  listCrmParties,
} from "@/features/crm/api";
import {
  formatCrmDateTime,
} from "@/features/crm/format";
import {
  CRM_PERMISSIONS,
} from "@/features/crm/permissions";
import {
  CRM_ROUTES,
} from "@/features/crm/routes";
import {
  requireCrmPermission,
} from "@/features/crm/server";

import {
  CrmRoleBadges,
  CrmStatusBadge,
  CrmVerificationBadge,
} from "@/components/crm/CrmPartyBadges";
import {
  CrmPartyLifecyclePanel,
} from "@/components/crm/CrmPartyLifecyclePanel";

import {
  CrmAffiliationsPanel,
} from "@/components/crm/CrmAffiliationsPanel";

type PageProps = {
  params: Promise<{
    partyId: string;
  }>;
};

export default async function PartyDetailPage({
  params,
}: PageProps) {
  const user = await requireCrmPermission(
    CRM_PERMISSIONS.party.view,
  );

  const { partyId } = await params;
  const party = await getCrmParty(partyId);

  const [organisations, individuals, contactRoles] =
  await Promise.all([
    listCrmParties({
      page_size: 100,
      status: "ACTIVE",
      entity_kind: "ORGANISATION",
      ordering: "display_name",
    }),
    listCrmParties({
      page_size: 100,
      status: "ACTIVE",
      entity_kind: "INDIVIDUAL",
      ordering: "display_name",
    }),
    listCrmContactRoles({
      page_size: 100,
      is_active: true,
      ordering: "sort_order,name",
    }),
  ]);

  const canEdit = hasPermission(
    user,
    CRM_PERMISSIONS.party.edit,
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={CRM_ROUTES.parties}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#475569] hover:text-[#F46C0B]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Parties
        </Link>

        {canEdit ? (
          <Link
            href={CRM_ROUTES.partyEdit(party.id)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F46C0B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D95C06]"
          >
            <Edit className="h-4 w-4" />
            Edit Party
          </Link>
        ) : null}
      </div>

      <header className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#F46C0B]">
              CRM Party
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#0F172A] sm:text-3xl">
              {party.display_name}
            </h1>

            <p className="mt-2 text-sm text-[#64748B]">
              {party.entity_kind.replaceAll("_", " ")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <CrmStatusBadge status={party.status} />
            <CrmVerificationBadge
              level={party.verification_level}
            />
          </div>
        </div>

        <div className="mt-5">
          <CrmRoleBadges
            party={{
              ...party,
              primary_email:
                party.contact_methods.find(
                  (method) =>
                    method.method_type === "EMAIL" &&
                    method.is_primary,
                )?.value ?? "",
              primary_phone:
                party.contact_methods.find(
                  (method) =>
                    method.method_type === "PHONE" &&
                    method.is_primary,
                )?.value ?? "",
              primary_source:
                party.sources.find((source) => source.is_primary)
                  ?.reference_label ?? "",
            }}
          />
        </div>

        {party.entity_kind === "ORGANISATION" ||
          party.entity_kind === "TRADING_NAME" ? (
            <Link
              href={CRM_ROUTES.newPartyWith({
                mode: "individual",
                organisation: party.id,
              })}
              className="inline-flex rounded-lg bg-[#F46C0B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D95C06]"
            >
              Add contact person
            </Link>
          ) : null}
      </header>

      <CrmPartyLifecyclePanel party={party} user={user} />

      <CrmAffiliationsPanel
          party={party}
          user={user}
          organisations={organisations.results}
          individuals={individuals.results.filter(
            (individual) => individual.id !== party.id,
          )}
          contactRoles={contactRoles.results}
        />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-[#0F172A]">
            Primary contact
          </h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-medium text-[#64748B]">
                Email
              </dt>
              <dd className="text-[#0F172A]">
                {party.contact_methods.find(
                  (method) => method.method_type === "EMAIL",
                )?.value ?? "—"}
              </dd>
            </div>

            <div>
              <dt className="font-medium text-[#64748B]">
                Phone
              </dt>
              <dd className="text-[#0F172A]">
                {party.contact_methods.find(
                  (method) =>
                    method.method_type === "PHONE" ||
                    method.method_type === "MOBILE",
                )?.value ?? "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-[#0F172A]">
            Traceability
          </h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-medium text-[#64748B]">
                Selectable
              </dt>
              <dd className="text-[#0F172A]">
                {party.is_selectable ? "Yes" : "No"}
              </dd>
            </div>

            <div>
              <dt className="font-medium text-[#64748B]">
                Traceable
              </dt>
              <dd className="text-[#0F172A]">
                {party.is_traceable ? "Yes" : "No"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-[#0F172A]">
            Record dates
          </h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-medium text-[#64748B]">
                Created
              </dt>
              <dd className="text-[#0F172A]">
                {formatCrmDateTime(party.created_at)}
              </dd>
            </div>

            <div>
              <dt className="font-medium text-[#64748B]">
                Updated
              </dt>
              <dd className="text-[#0F172A]">
                {formatCrmDateTime(party.updated_at)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-1">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-[#0F172A]">
            Registration records
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#64748B]">
            Manage company registration, tax, VAT, import/export
            and marketplace seller identifiers from the
            Registrations area.
          </p>

          <Link
            href={`${CRM_ROUTES.registrations}?party=${party.id}`}
            className="mt-4 inline-flex rounded-lg border border-[#FED7AA] px-4 py-2 text-sm font-semibold text-[#C2410C] hover:bg-[#FFF7ED]"
          >
            View registrations
          </Link>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
  <h2 className="text-base font-semibold text-[#0F172A]">
    Documents
  </h2>

  <p className="mt-2 text-sm leading-6 text-[#64748B]">
    Upload, preview and manage registration, tax, bank,
    contract, identity and correspondence documents.
  </p>

  <div className="mt-4 flex flex-wrap gap-2">
    <Link
      href={`${CRM_ROUTES.documents}?party=${party.id}`}
      className="inline-flex rounded-lg border border-[#CBD5E1] px-4 py-2 text-sm font-semibold text-[#334155] hover:border-[#F46C0B] hover:text-[#F46C0B]"
    >
      View documents
    </Link>

    <Link
      href={`${CRM_ROUTES.newDocument}?party=${party.id}`}
      className="inline-flex rounded-lg bg-[#0F4C81] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B3A63]"
    >
      Upload document
    </Link>
  </div>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
  <h2 className="text-base font-semibold text-[#0F172A]">
    Interactions
  </h2>

  <p className="mt-2 text-sm leading-6 text-[#64748B]">
    Record WhatsApp chats, calls, emails, meetings and
    follow-up activity for this Party.
  </p>

  <div className="mt-4 flex flex-wrap gap-2">
    <Link
      href={`${CRM_ROUTES.interactions}?party=${party.id}`}
      className="inline-flex rounded-lg border border-[#CBD5E1] px-4 py-2 text-sm font-semibold text-[#334155] hover:border-[#F46C0B] hover:text-[#F46C0B]"
    >
      View interactions
    </Link>

    <Link
      href={`${CRM_ROUTES.newInteraction}?party=${party.id}`}
      className="inline-flex rounded-lg bg-[#0F4C81] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B3A63]"
    >
      Log interaction
    </Link>
  </div>
</div>
      </div>
    </section>
  );
}