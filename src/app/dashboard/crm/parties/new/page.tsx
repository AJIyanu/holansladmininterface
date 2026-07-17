import {
  listCrmContactRoles,
  listCrmParties,
} from "@/features/crm/api";
import {
  CRM_PERMISSIONS,
} from "@/features/crm/permissions";
import {
  requireCrmPermission,
} from "@/features/crm/server";

import {
  CrmPartyForm,
} from "@/components/crm/CrmPartyForm";

import type {
  CrmPartyRoleName,
} from "@/features/crm/types";

type PageProps = {
  searchParams?: Promise<
    Record<string, string | string[] | undefined>
  >;
};

type CreateMode =
  | "INDIVIDUAL"
  | "ORGANISATION"
  | "TRADING_NAME";

function firstValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function createModeFromQuery(
  value: string | undefined,
): CreateMode {
  if (value === "organisation") {
    return "ORGANISATION";
  }

  if (value === "trading_name") {
    return "TRADING_NAME";
  }

  return "INDIVIDUAL";
}

function roleFromQuery(
  value: string | undefined,
): CrmPartyRoleName[] {
  const allowedRoles = [
    "CLIENT",
    "SUPPLIER",
    "PROSPECT",
    "LOGISTICS_PROVIDER",
    "SERVICE_PROVIDER",
    "OTHER",
  ];

  if (!value || !allowedRoles.includes(value)) {
    return [];
  }

  return [value as CrmPartyRoleName];
}

export default async function NewPartyPage({
  searchParams,
}: PageProps) {
  await requireCrmPermission(CRM_PERMISSIONS.party.create);

  const resolvedSearchParams = (await searchParams) ?? {};

  const defaultCreateMode = createModeFromQuery(
    firstValue(resolvedSearchParams.mode),
  );

  const defaultRoles = roleFromQuery(
    firstValue(resolvedSearchParams.role),
  );

  const defaultOrganisationId = firstValue(
    resolvedSearchParams.organisation,
  );

  const [organisations, contactRoles] = await Promise.all([
    listCrmParties({
      page_size: 100,
      status: "ACTIVE",
      entity_kind: "ORGANISATION",
      ordering: "display_name",
    }),
    listCrmContactRoles({
      page_size: 100,
      is_active: true,
      ordering: "sort_order,name",
    }),
  ]);

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#F46C0B]">
          CRM Party
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#0F172A] sm:text-3xl">
          Create Party
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475569]">
          Create an individual, organisation, or trading name.
          Individuals can be linked to an existing organisation
          or used to create a new organisation profile at the
          same time.
        </p>
      </header>

      <CrmPartyForm
        mode="create"
        organisations={organisations.results}
        contactRoles={contactRoles.results}
        defaultCreateMode={defaultCreateMode}
        defaultRoles={defaultRoles}
        defaultOrganisationId={defaultOrganisationId}
      />
    </section>
  );
}