import {
  CRM_PERMISSIONS,
} from "@/features/crm/permissions";
import {
  requireCrmPermission,
} from "@/features/crm/server";

import {
  CrmPartyForm,
} from "@/components/crm/CrmPartyForm";

export default async function NewPartyPage() {
  await requireCrmPermission(
    CRM_PERMISSIONS.party.create,
  );

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
          Create an organisation, individual or trading name.
          The backend will run duplicate protection before the
          record is saved.
        </p>
      </header>

      <CrmPartyForm mode="create" />
    </section>
  );
}