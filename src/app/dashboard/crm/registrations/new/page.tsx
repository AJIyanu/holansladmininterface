import { listCrmParties } from "@/features/crm/api";
import { CRM_PERMISSIONS } from "@/features/crm/permissions";
import { requireCrmPermission } from "@/features/crm/server";

import { CrmRegistrationForm } from "@/components/crm/CrmRegistrationForm";

export default async function NewRegistrationPage() {
  await requireCrmPermission(CRM_PERMISSIONS.identifier.create);

  const parties = await listCrmParties({
    page_size: 100,
    status: "ACTIVE",
    ordering: "display_name",
  });

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#F46C0B]">
          CRM registration
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#0F172A] sm:text-3xl">
          New registration
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475569]">
          Add an encrypted registration, tax, VAT, import/export or marketplace
          seller identifier to a Party.
        </p>
      </header>

      <CrmRegistrationForm mode="create" parties={parties.results} />
    </section>
  );
}
