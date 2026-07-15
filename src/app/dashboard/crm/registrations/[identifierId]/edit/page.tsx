import {
  getCrmIdentifier,
  listCrmParties,
} from "@/features/crm/api";
import {
  CRM_PERMISSIONS,
} from "@/features/crm/permissions";
import {
  requireCrmPermission,
} from "@/features/crm/server";

import {
  CrmRegistrationForm,
} from "@/components/crm/CrmRegistrationForm";

type PageProps = {
  params: Promise<{
    identifierId: string;
  }>;
};

export default async function EditRegistrationPage({
  params,
}: PageProps) {
  await requireCrmPermission(
    CRM_PERMISSIONS.identifier.edit,
  );

  const { identifierId } = await params;

  const [identifier, parties] = await Promise.all([
    getCrmIdentifier(identifierId),
    listCrmParties({
      page_size: 100,
      ordering: "display_name",
    }),
  ]);

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#F46C0B]">
          CRM registration
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#0F172A] sm:text-3xl">
          Edit registration
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475569]">
          Update registration metadata. Leave the value field
          blank unless you need to replace the encrypted value.
        </p>
      </header>

      <CrmRegistrationForm
        mode="edit"
        parties={parties.results}
        initialIdentifier={identifier}
      />
    </section>
  );
}