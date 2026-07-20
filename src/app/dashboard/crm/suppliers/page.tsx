import { listCrmParties } from "@/features/crm/api";
import { CRM_PERMISSIONS } from "@/features/crm/permissions";
import { CRM_ROUTES } from "@/features/crm/routes";
import { requireCrmPermission } from "@/features/crm/server";
import { crmPartyQueryFromSearchParams } from "@/features/crm/search-params";

import { CrmPartyDirectory } from "@/components/crm/CrmPartyDirectory";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SuppliersPage({ searchParams }: PageProps) {
  const user = await requireCrmPermission(CRM_PERMISSIONS.party.view);

  const query = crmPartyQueryFromSearchParams(
    (await searchParams) ?? {},
    "SUPPLIER",
  );

  const data = await listCrmParties(query);

  return (
    <CrmPartyDirectory
      title="Suppliers"
      description="Formal suppliers, informal vendors, marketplace sellers and direct contacts."
      basePath={CRM_ROUTES.suppliers}
      user={user}
      query={query}
      data={data}
      fixedRoleLabel="Supplier"
      createButtonLabel="Add Supplier"
      createButtonHref={CRM_ROUTES.newPartyWith({
        mode: "trading_name",
        role: "SUPPLIER",
      })}
    />
  );
}
