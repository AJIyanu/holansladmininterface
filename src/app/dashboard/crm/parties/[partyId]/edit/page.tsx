import {
  getCrmParty,
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

type PageProps = {
  params: Promise<{
    partyId: string;
  }>;
};

export default async function EditPartyPage({
  params,
}: PageProps) {
  await requireCrmPermission(
    CRM_PERMISSIONS.party.edit,
  );

  const { partyId } = await params;
  const party = await getCrmParty(partyId);

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#F46C0B]">
          CRM Party
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#0F172A] sm:text-3xl">
          Edit {party.display_name}
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475569]">
          Update the Party identity, roles and basic contact
          information. Detailed related records will be managed
          from the workspace in Stage 3.
        </p>
      </header>

      <CrmPartyForm mode="edit" initialParty={party} />
    </section>
  );
}