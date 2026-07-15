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
  CrmDocumentUploadForm,
} from "@/components/crm/CrmDocumentUploadForm";

type PageProps = {
  searchParams?: Promise<
    Record<string, string | string[] | undefined>
  >;
};

export default async function NewDocumentPage({
  searchParams,
}: PageProps) {
  await requireCrmPermission(
    CRM_PERMISSIONS.document.create,
  );

  const resolvedSearchParams =
    (await searchParams) ?? {};

  const defaultPartyId =
    typeof resolvedSearchParams.party === "string"
      ? resolvedSearchParams.party
      : undefined;

  const defaultCategory =
    typeof resolvedSearchParams.category === "string"
      ? resolvedSearchParams.category
      : "OTHER";

  const parties = await listCrmParties({
    page_size: 100,
    status: "ACTIVE",
    ordering: "display_name",
  });

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#F46C0B]">
          CRM document
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#0F172A] sm:text-3xl">
          Upload document
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475569]">
          Upload a Party document. The selected file can be
          previewed before submission, while stored documents
          are accessed only through backend permission checks.
        </p>
      </header>

      <CrmDocumentUploadForm
        parties={parties.results}
        defaultPartyId={defaultPartyId}
        defaultCategory={defaultCategory}
      />
    </section>
  );
}