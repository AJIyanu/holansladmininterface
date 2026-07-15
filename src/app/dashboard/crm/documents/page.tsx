import {
  getCrmParty,
  listCrmDocuments,
} from "@/features/crm/api";
import {
  CRM_PERMISSIONS,
} from "@/features/crm/permissions";
import {
  requireCrmPermission,
} from "@/features/crm/server";
import {
  crmDocumentQueryFromSearchParams,
} from "@/features/crm/search-params";

import {
  CrmDocumentsTable,
} from "@/components/crm/CrmDocumentsTable";

type PageProps = {
  searchParams?: Promise<
    Record<string, string | string[] | undefined>
  >;
};

export default async function DocumentsPage({
  searchParams,
}: PageProps) {
  const user = await requireCrmPermission(
    CRM_PERMISSIONS.document.view,
  );

  const query = crmDocumentQueryFromSearchParams(
    (await searchParams) ?? {},
  );

  const data = await listCrmDocuments(query);

  const partyIds = Array.from(
    new Set(data.results.map((item) => String(item.party))),
  );

  const parties =
    partyIds.length > 0
      ? await Promise.all(
          partyIds.map(async (partyId) => {
            try {
              const party = await getCrmParty(partyId);

              return {
                id: party.id,
                display_name: party.display_name,
                entity_kind: party.entity_kind,
                status: party.status,
                verification_level: party.verification_level,
                is_archived: party.is_archived,
                roles: party.roles,
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
                  party.sources.find(
                    (source) => source.is_primary,
                  )?.reference_label ?? "",
                created_at: party.created_at,
                updated_at: party.updated_at,
              };
            } catch {
              return null;
            }
          }),
        )
      : [];

  const partiesById = Object.fromEntries(
    parties
      .filter(Boolean)
      .map((party) => [party!.id, party!]),
  );

  return (
    <CrmDocumentsTable
      user={user}
      data={data}
      partiesById={partiesById}
      query={query}
    />
  );
}