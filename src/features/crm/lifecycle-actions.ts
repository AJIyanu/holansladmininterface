"use server";

import { revalidatePath } from "next/cache";

import { runCrmPartyLifecycleAction } from "./api";
import { getCrmErrorMessage } from "./errors";
import { CRM_ROUTES } from "./routes";
import { crmLifecycleSchema } from "./schemas";

import type { CrmLifecycleActionState } from "./action-states";

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function runCrmLifecycleFormAction(
  _previousState: CrmLifecycleActionState,
  formData: FormData,
): Promise<CrmLifecycleActionState> {
  const partyId = textValue(formData, "party_id");

  const action = textValue(formData, "action") as
    | "deactivate"
    | "reactivate"
    | "suspend"
    | "block"
    | "archive"
    | "restore";

  const parsed = crmLifecycleSchema.safeParse({
    reason: textValue(formData, "reason"),
  });

  if (!partyId) {
    return {
      ok: false,
      message: "Party ID is missing.",
    };
  }

  if (!action) {
    return {
      ok: false,
      message: "Lifecycle action is missing.",
    };
  }

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "Give a clear reason for this action.",
    };
  }

  try {
    await runCrmPartyLifecycleAction(partyId, action, parsed.data);
  } catch (error) {
    return {
      ok: false,
      message: getCrmErrorMessage(error),
    };
  }

  revalidatePath(CRM_ROUTES.parties);
  revalidatePath(CRM_ROUTES.partyDetail(partyId));

  return {
    ok: true,
    message: "Party lifecycle action completed.",
  };
}
