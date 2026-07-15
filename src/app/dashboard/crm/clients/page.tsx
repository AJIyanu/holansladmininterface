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

export default async function ClientsPage({
  searchParams,
}: PageProps) {
  const user = await requireCrmPermission(
    CRM_PERMISSIONS.party.view,
  );

  const query = crmPartyQueryFromSearchParams(
    (await searchParams) ?? {},
    "CLIENT",
  );

  const data = await listCrmParties(query);

  return (
    <CrmPartyDirectory
      title="Clients"
      description="Parties with the Client role."
      basePath={CRM_ROUTES.clients}
      user={user}
      query={query}
      data={data}
      fixedRoleLabel="Client"
    />
  );
}