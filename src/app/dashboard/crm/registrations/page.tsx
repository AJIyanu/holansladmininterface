import { listCrmIdentifiers, listCrmParties } from "@/features/crm/api";
import { CRM_PERMISSIONS } from "@/features/crm/permissions";
import { requireCrmPermission } from "@/features/crm/server";
import { crmIdentifierQueryFromSearchParams } from "@/features/crm/search-params";

import { CrmRegistrationsTable } from "@/components/crm/CrmRegistrationsTable";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegistrationsPage({ searchParams }: PageProps) {
  const user = await requireCrmPermission([
    CRM_PERMISSIONS.identifier.view,
    CRM_PERMISSIONS.document.view,
  ]);

  const query = crmIdentifierQueryFromSearchParams((await searchParams) ?? {});

  const data = await listCrmIdentifiers(query);

  const partyIds = Array.from(
    new Set(data.results.map((item) => String(item.party))),
  );

  const parties =
    partyIds.length > 0
      ? await Promise.all(
          partyIds.map(async (partyId) => {
            const partyResult = await listCrmParties({
              page_size: 1,
              search: partyId,
            });

            return partyResult.results.find((party) => party.id === partyId);
          }),
        )
      : [];

  const partiesById = Object.fromEntries(
    parties.filter(Boolean).map((party) => [party!.id, party!]),
  );

  return (
    <CrmRegistrationsTable
      user={user}
      data={data}
      partiesById={partiesById}
      query={query}
    />
  );
}
