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

export default async function PartiesPage({
  searchParams,
}: PageProps) {
  const user = await requireCrmPermission(
    CRM_PERMISSIONS.party.view,
  );

  const resolvedSearchParams =
    (await searchParams) ?? {};

  const query = crmPartyQueryFromSearchParams(
    resolvedSearchParams,
  );

  const data = await listCrmParties(query);

  return (
    <CrmPartyDirectory
      title="All Parties"
      description="Browse organisations, individuals and trading names in the CRM directory."
      basePath={CRM_ROUTES.parties}
      user={user}
      query={query}
      data={data}
    />
  );
}