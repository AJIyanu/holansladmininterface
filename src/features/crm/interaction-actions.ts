"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createCrmInteraction,
  deleteCrmInteraction,
  updateCrmInteraction,
} from "./api";
import { getCrmErrorMessage } from "./errors";
import { CRM_ROUTES } from "./routes";
import { crmInteractionWriteSchema } from "./schemas";

import type { CrmInteractionActionState } from "./action-states";

import type {
  CrmInteractionType,
  CrmPartyInteractionWriteInput,
} from "./types";

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function nullableTextValue(formData: FormData, key: string): string | null {
  const value = textValue(formData, key);

  return value ? value : null;
}

function buildInteractionPayload(
  formData: FormData,
): CrmPartyInteractionWriteInput {
  return {
    party: textValue(formData, "party"),
    contact_party: nullableTextValue(formData, "contact_party"),
    interaction_type: textValue(
      formData,
      "interaction_type",
    ) as CrmInteractionType,
    occurred_at: textValue(formData, "occurred_at"),
    subject: textValue(formData, "subject"),
    summary: textValue(formData, "summary"),
    follow_up_at: nullableTextValue(formData, "follow_up_at"),
  };
}

export async function createCrmInteractionAction(
  _previousState: CrmInteractionActionState,
  formData: FormData,
): Promise<CrmInteractionActionState> {
  const payload = buildInteractionPayload(formData);
  const parsed = crmInteractionWriteSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "Check the interaction form and try again.",
    };
  }

  let createdId = "";

  try {
    const created = await createCrmInteraction(parsed.data);
    createdId = created.id;
  } catch (error) {
    return {
      ok: false,
      message: getCrmErrorMessage(error),
    };
  }

  revalidatePath(CRM_ROUTES.interactions);
  revalidatePath(CRM_ROUTES.partyDetail(parsed.data.party));

  redirect(`${CRM_ROUTES.interactions}?created=${createdId}`);
}

export async function updateCrmInteractionAction(
  _previousState: CrmInteractionActionState,
  formData: FormData,
): Promise<CrmInteractionActionState> {
  const interactionId = textValue(formData, "interaction_id");

  if (!interactionId) {
    return {
      ok: false,
      message: "Interaction ID is missing.",
    };
  }

  const payload = buildInteractionPayload(formData);
  const parsed = crmInteractionWriteSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "Check the interaction form and try again.",
    };
  }

  try {
    await updateCrmInteraction(interactionId, parsed.data);
  } catch (error) {
    return {
      ok: false,
      message: getCrmErrorMessage(error),
    };
  }

  revalidatePath(CRM_ROUTES.interactions);
  revalidatePath(CRM_ROUTES.partyDetail(parsed.data.party));

  redirect(CRM_ROUTES.interactions);
}

export async function deleteCrmInteractionAction(
  formData: FormData,
): Promise<void> {
  const interactionId = textValue(formData, "interaction_id");

  if (!interactionId) {
    return;
  }

  await deleteCrmInteraction(interactionId);

  revalidatePath(CRM_ROUTES.interactions);
}
