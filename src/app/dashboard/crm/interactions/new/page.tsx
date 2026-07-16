import {
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
  searchParams?: Promise<
    Record<string, string | string[] | undefined>
  >;
};

export default async function NewInteractionPage({
  searchParams,
}: PageProps) {
  await requireCrmPermission(
    CRM_PERMISSIONS.interaction.create,
  );

  const resolved = (await searchParams) ?? {};

  const defaultPartyId =
    typeof resolved.party === "string"
      ? resolved.party
      : undefined;

  const parties = await listCrmParties({
    page_size: 100,
    status: "ACTIVE",
    ordering: "display_name",
  });

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#F46C0B]">
          CRM interaction
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#0F172A] sm:text-3xl">
          Log interaction
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475569]">
          Record a call, WhatsApp chat, email, meeting or
          follow-up with a CRM Party.
        </p>
      </header>

      <CrmInteractionForm
        mode="create"
        parties={parties.results}
        defaultPartyId={defaultPartyId}
      />
    </section>
  );
}