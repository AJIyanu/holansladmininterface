"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createCrmContactRole,
  deleteCrmContactRole,
  updateCrmContactRole,
} from "./api";
import { getCrmErrorMessage } from "./errors";
import { CRM_ROUTES } from "./routes";
import { crmContactRoleWriteSchema } from "./schemas";

import type { CrmContactRoleWriteInput } from "./types";

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function checkboxValue(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

function numberValue(formData: FormData, key: string): number {
  const value = Number.parseInt(textValue(formData, key), 10);

  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function buildContactRolePayload(formData: FormData): CrmContactRoleWriteInput {
  const payload: CrmContactRoleWriteInput = {
    name: textValue(formData, "name"),
    description: textValue(formData, "description"),
    is_active: checkboxValue(formData, "is_active"),
    sort_order: numberValue(formData, "sort_order"),
  };

  const slug = textValue(formData, "slug");

  if (slug) {
    payload.slug = slug;
  }

  return payload;
}

export async function createCrmContactRoleAction(
  formData: FormData,
): Promise<void> {
  const payload = buildContactRolePayload(formData);
  const parsed = crmContactRoleWriteSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ??
        "Check the contact role form and try again.",
    );
  }

  try {
    await createCrmContactRole(parsed.data);
  } catch (error) {
    throw new Error(getCrmErrorMessage(error));
  }

  revalidatePath(CRM_ROUTES.settings.contactRoles);
  redirect(CRM_ROUTES.settings.contactRoles);
}

export async function updateCrmContactRoleAction(
  formData: FormData,
): Promise<void> {
  const contactRoleId = textValue(formData, "contact_role_id");

  if (!contactRoleId) {
    throw new Error("Contact role ID is missing.");
  }

  const payload = buildContactRolePayload(formData);
  const parsed = crmContactRoleWriteSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ??
        "Check the contact role form and try again.",
    );
  }

  try {
    await updateCrmContactRole(contactRoleId, parsed.data);
  } catch (error) {
    throw new Error(getCrmErrorMessage(error));
  }

  revalidatePath(CRM_ROUTES.settings.contactRoles);
  redirect(CRM_ROUTES.settings.contactRoles);
}

export async function deleteCrmContactRoleAction(
  formData: FormData,
): Promise<void> {
  const contactRoleId = textValue(formData, "contact_role_id");

  if (!contactRoleId) {
    return;
  }

  try {
    await deleteCrmContactRole(contactRoleId);
  } catch (error) {
    throw new Error(getCrmErrorMessage(error));
  }

  revalidatePath(CRM_ROUTES.settings.contactRoles);
  redirect(CRM_ROUTES.settings.contactRoles);
}
