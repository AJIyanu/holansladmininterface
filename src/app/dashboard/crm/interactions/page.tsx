import { listCrmInteractions } from "@/features/crm/api";
import { CRM_PERMISSIONS } from "@/features/crm/permissions";
import { requireCrmPermission } from "@/features/crm/server";

import { CrmInteractionsTable } from "@/components/crm/CrmInteractionsTable";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function numberValue(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export default async function InteractionsPage({ searchParams }: PageProps) {
  const user = await requireCrmPermission(CRM_PERMISSIONS.interaction.view);

  const resolved = (await searchParams) ?? {};

  const query = {
    party: firstValue(resolved.party),
    contact_party: firstValue(resolved.contact_party),
    staff_member: firstValue(resolved.staff_member),
    interaction_type: firstValue(resolved.interaction_type) as never,
    search: firstValue(resolved.search),
    ordering: firstValue(resolved.ordering),
    page: numberValue(firstValue(resolved.page)),
    page_size: numberValue(firstValue(resolved.page_size)) ?? 20,
  };

  const data = await listCrmInteractions(query);

  return <CrmInteractionsTable user={user} data={data} query={query} />;
}
