import { getCrmDocument } from "@/features/crm/api";
import { CRM_PERMISSIONS } from "@/features/crm/permissions";
import { requireCrmPermission } from "@/features/crm/server";

import { CrmDocumentEditForm } from "@/components/crm/CrmDocumentEditForm";

type PageProps = {
  params: Promise<{
    documentId: string;
  }>;
};

export default async function EditDocumentPage({ params }: PageProps) {
  await requireCrmPermission(CRM_PERMISSIONS.document.edit);

  const { documentId } = await params;
  const document = await getCrmDocument(documentId);

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#F46C0B]">
          CRM document
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#0F172A] sm:text-3xl">
          Edit document
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#475569]">
          Update document metadata. Replacing the actual file requires deleting
          and uploading a new document.
        </p>
      </header>

      <CrmDocumentEditForm document={document} />
    </section>
  );
}
