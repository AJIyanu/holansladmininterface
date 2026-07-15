"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { deleteCrmDocument, updateCrmDocument, uploadCrmDocument } from "./api";
import { getCrmErrorMessage } from "./errors";
import { CRM_ROUTES } from "./routes";
import { crmDocumentUpdateSchema, crmDocumentUploadSchema } from "./schemas";

import type { CrmDocumentCategory, CrmVerificationStatus } from "./types";

import type { CrmDocumentActionState } from "./action-states";

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function checkboxValue(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

function nullableDateValue(formData: FormData, key: string): string | null {
  const value = textValue(formData, key);

  return value ? value : null;
}

function getUploadedFile(formData: FormData): File | null {
  const value = formData.get("file");

  if (!(value instanceof File)) {
    return null;
  }

  if (value.size <= 0) {
    return null;
  }

  return value;
}

export async function uploadCrmDocumentAction(
  _previousState: CrmDocumentActionState,
  formData: FormData,
): Promise<CrmDocumentActionState> {
  const file = getUploadedFile(formData);

  if (!file) {
    return {
      ok: false,
      message: "Select a file to upload.",
    };
  }

  const parsed = crmDocumentUploadSchema.safeParse({
    party: textValue(formData, "party"),
    category: textValue(formData, "category") as CrmDocumentCategory,
    description: textValue(formData, "description"),
    is_confidential: checkboxValue(formData, "is_confidential"),
    verification_status: textValue(
      formData,
      "verification_status",
    ) as CrmVerificationStatus,
    expires_at: nullableDateValue(formData, "expires_at"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "Check the document form and try again.",
    };
  }

  const uploadData = new FormData();

  uploadData.append("party", parsed.data.party);
  uploadData.append("file", file);
  uploadData.append("category", parsed.data.category);
  uploadData.append("description", parsed.data.description ?? "");
  uploadData.append(
    "is_confidential",
    parsed.data.is_confidential ? "true" : "false",
  );
  uploadData.append("verification_status", parsed.data.verification_status);

  if (parsed.data.expires_at) {
    uploadData.append("expires_at", parsed.data.expires_at);
  }

  let createdId = "";

  try {
    const created = await uploadCrmDocument(uploadData);
    createdId = created.id;
  } catch (error) {
    return {
      ok: false,
      message: getCrmErrorMessage(error),
    };
  }

  revalidatePath(CRM_ROUTES.documents);
  revalidatePath(CRM_ROUTES.registrations);

  redirect(`${CRM_ROUTES.documents}?created=${createdId}`);
}

export async function updateCrmDocumentAction(
  _previousState: CrmDocumentActionState,
  formData: FormData,
): Promise<CrmDocumentActionState> {
  const documentId = textValue(formData, "document_id");

  if (!documentId) {
    return {
      ok: false,
      message: "Document ID is missing.",
    };
  }

  const parsed = crmDocumentUpdateSchema.safeParse({
    description: textValue(formData, "description"),
    is_confidential: checkboxValue(formData, "is_confidential"),
    verification_status: textValue(
      formData,
      "verification_status",
    ) as CrmVerificationStatus,
    expires_at: nullableDateValue(formData, "expires_at"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "Check the document form and try again.",
    };
  }

  try {
    await updateCrmDocument(documentId, parsed.data);
  } catch (error) {
    return {
      ok: false,
      message: getCrmErrorMessage(error),
    };
  }

  revalidatePath(CRM_ROUTES.documents);
  redirect(CRM_ROUTES.documents);
}

export async function deleteCrmDocumentAction(
  formData: FormData,
): Promise<void> {
  const documentId = textValue(formData, "document_id");

  if (!documentId) {
    return;
  }

  await deleteCrmDocument(documentId);

  revalidatePath(CRM_ROUTES.documents);
  revalidatePath(CRM_ROUTES.registrations);
}
