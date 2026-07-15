"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createCrmIdentifier,
  deleteCrmIdentifier,
  revealCrmIdentifier,
  updateCrmIdentifier,
} from "./api";
import { getCrmErrorMessage } from "./errors";
import { CRM_ROUTES } from "./routes";
import { crmIdentifierWriteSchema } from "./schemas";

import type { CrmIdentifierType, CrmPartyIdentifierWriteInput } from "./types";

export interface CrmRegistrationActionState {
  ok: boolean;
  message: string;
  revealedValue?: string;
}

export function getInitialCrmRegistrationActionState(): CrmRegistrationActionState {
  return {
    ok: false,
    message: "",
  };
}

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function checkboxValue(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

function dateValue(formData: FormData, key: string): string | null {
  const value = textValue(formData, key);

  return value ? value : null;
}

function buildIdentifierPayload(
  formData: FormData,
  options: {
    requireValue: boolean;
  },
): CrmPartyIdentifierWriteInput {
  const value = textValue(formData, "value");

  const payload: CrmPartyIdentifierWriteInput = {
    party: textValue(formData, "party"),
    identifier_type: textValue(
      formData,
      "identifier_type",
    ) as CrmIdentifierType,
    label: textValue(formData, "label"),
    issuing_country: textValue(formData, "issuing_country").toUpperCase(),
    issue_date: dateValue(formData, "issue_date"),
    expiry_date: dateValue(formData, "expiry_date"),
    is_verified: checkboxValue(formData, "is_verified"),
    is_active: !formData.has("is_active")
      ? true
      : checkboxValue(formData, "is_active"),
  };

  if (value || options.requireValue) {
    payload.value = value;
  }

  return payload;
}

export async function createCrmRegistrationAction(
  _previousState: CrmRegistrationActionState,
  formData: FormData,
): Promise<CrmRegistrationActionState> {
  const payload = buildIdentifierPayload(formData, {
    requireValue: true,
  });

  const parsed = crmIdentifierWriteSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "Check the registration form and try again.",
    };
  }

  if (!parsed.data.value) {
    return {
      ok: false,
      message: "Registration value is required.",
    };
  }

  let createdId = "";

  try {
    const created = await createCrmIdentifier(parsed.data);
    createdId = created.id;
  } catch (error) {
    return {
      ok: false,
      message: getCrmErrorMessage(error),
    };
  }

  revalidatePath(CRM_ROUTES.registrations);
  redirect(`${CRM_ROUTES.registrations}?created=${createdId}`);
}

export async function updateCrmRegistrationAction(
  _previousState: CrmRegistrationActionState,
  formData: FormData,
): Promise<CrmRegistrationActionState> {
  const identifierId = textValue(formData, "identifier_id");

  if (!identifierId) {
    return {
      ok: false,
      message: "Registration ID is missing.",
    };
  }

  const payload = buildIdentifierPayload(formData, {
    requireValue: false,
  });

  const parsed = crmIdentifierWriteSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "Check the registration form and try again.",
    };
  }

  const updatePayload = {
    ...parsed.data,
  };

  if (!updatePayload.value) {
    delete updatePayload.value;
  }

  try {
    await updateCrmIdentifier(identifierId, updatePayload);
  } catch (error) {
    return {
      ok: false,
      message: getCrmErrorMessage(error),
    };
  }

  revalidatePath(CRM_ROUTES.registrations);
  redirect(CRM_ROUTES.registrations);
}

export async function deleteCrmRegistrationAction(
  formData: FormData,
): Promise<void> {
  const identifierId = textValue(formData, "identifier_id");

  if (!identifierId) {
    return;
  }

  await deleteCrmIdentifier(identifierId);

  revalidatePath(CRM_ROUTES.registrations);
}

export async function revealCrmRegistrationAction(
  _previousState: CrmRegistrationActionState,
  formData: FormData,
): Promise<CrmRegistrationActionState> {
  const identifierId = textValue(formData, "identifier_id");

  if (!identifierId) {
    return {
      ok: false,
      message: "Registration ID is missing.",
    };
  }

  try {
    const response = await revealCrmIdentifier(identifierId);

    return {
      ok: true,
      message:
        "Sensitive registration value revealed. Close this panel when finished.",
      revealedValue: response.value,
    };
  } catch (error) {
    return {
      ok: false,
      message: getCrmErrorMessage(error),
    };
  }
}
