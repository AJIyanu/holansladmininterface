import {
  listCrmParties,
} from "@/features/crm/api";
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
  crmPartyQueryFromSearchParams,
} from "@/features/crm/search-params";

import {
  CrmPartyDirectory,
} from "@/components/crm/CrmPartyDirectory";

type PageProps = {
  searchParams?: Promise<
    Record<string, string | string[] | undefined>
  >;
};

export default async function ContactsPage({
  searchParams,
}: PageProps) {
  const user = await requireCrmPermission(
    CRM_PERMISSIONS.party.view,
  );

  const query = {
    ...crmPartyQueryFromSearchParams(
      (await searchParams) ?? {},
    ),
    entity_kind: "INDIVIDUAL" as const,
  };

  const data = await listCrmParties(query);

  return (
    <CrmPartyDirectory
      title="Contacts"
      description="Individual CRM Party records used as organisation contacts."
      basePath={CRM_ROUTES.contacts}
      user={user}
      query={query}
      data={data}
      fixedRoleLabel="Individual contacts"
      createButtonLabel="Add Contact"
      createButtonHref={CRM_ROUTES.newPartyWith({
        mode: "individual",
        role: "OTHER",
      })}
    />
  );
}