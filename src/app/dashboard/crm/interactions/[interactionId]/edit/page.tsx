import {
  getCrmInteraction,
  listCrmParties,
} from "@/features/crm/api";
import {
  CRM_PERMISSIONS,
} from "@/features/crm/permissions";
import {
  requireCrmPermission,
} from "@/features/crm/server";

import {
  CrmInteractionForm,
} from "@/components/crm/CrmInteractionForm";

type PageProps = {
  params: Promise<{
    interactionId: string;
  }>;
};

export default async function EditInteractionPage({
  params,
}: PageProps) {
  await requireCrmPermission(
    CRM_PERMISSIONS.interaction.edit,
  );

  const { interactionId } = await params;

  const [interaction, parties] = await Promise.all([
    getCrmInteraction(interactionId),
    listCrmParties({
      page_size: 100,
      ordering: "display_name",
    }),
  ]);

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#F46C0B]">
          CRM interaction
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#0F172A] sm:text-3xl">
          Edit interaction
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475569]">
          Update the recorded communication history.
        </p>
      </header>

      <CrmInteractionForm
        mode="edit"
        parties={parties.results}
        initialInteraction={interaction}
      />
    </section>
  );
}