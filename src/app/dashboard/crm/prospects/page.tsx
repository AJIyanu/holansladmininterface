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

export default async function ProspectsPage({
  searchParams,
}: PageProps) {
  const user = await requireCrmPermission(
    CRM_PERMISSIONS.party.view,
  );

  const query = crmPartyQueryFromSearchParams(
    (await searchParams) ?? {},
    "PROSPECT",
  );

  const data = await listCrmParties(query);

  return (
    <CrmPartyDirectory
      title="Prospects"
      description="Parties being developed as possible clients, suppliers or service providers."
      basePath={CRM_ROUTES.prospects}
      user={user}
      query={query}
      data={data}
      fixedRoleLabel="Prospect"
      createButtonLabel="Add Prospect"
      createButtonHref={CRM_ROUTES.newPartyWith({
        mode: "individual",
        role: "PROSPECT",
      })}
    />
  );
}