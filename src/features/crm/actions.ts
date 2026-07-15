"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  checkCrmPartyDuplicates,
  createCrmParty,
  deleteCrmParty,
  updateCrmParty,
} from "./api";
import { getCrmErrorMessage } from "./errors";
import { crmPartyWriteSchema } from "./schemas";
import { CRM_ROUTES } from "./routes";

import type {
  CrmContactMethodInput,
  CrmDuplicateMatch,
  CrmEntityKind,
  CrmPartyRoleName,
  CrmPartySourceInput,
  CrmPartyWriteInput,
  CrmVerificationLevel,
} from "./types";

export interface CrmPartyActionState {
  ok: boolean;
  message: string;
  duplicateMatches?: CrmDuplicateMatch[];
}

const initialState: CrmPartyActionState = {
  ok: false,
  message: "",
};

export async function getInitialCrmPartyActionState(): Promise<CrmPartyActionState> {
  return initialState;
}

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function optionalTextValue(
  formData: FormData,
  key: string,
): string | undefined {
  const value = textValue(formData, key);

  return value ? value : undefined;
}

function selectedRoles(formData: FormData): CrmPartyRoleName[] {
  return formData
    .getAll("roles")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value as CrmPartyRoleName);
}

function buildPartyPayload(formData: FormData): CrmPartyWriteInput {
  const entityKind = textValue(formData, "entity_kind") as CrmEntityKind;

  const verificationLevel = textValue(
    formData,
    "verification_level",
  ) as CrmVerificationLevel;

  const email = optionalTextValue(formData, "email");
  const phone = optionalTextValue(formData, "phone");
  const website = optionalTextValue(formData, "website");
  const sourceNotes = optionalTextValue(formData, "source_notes");

  const contactMethods: CrmContactMethodInput[] = [];

  if (email) {
    contactMethods.push({
      method_type: "EMAIL",
      value: email,
      label: "Primary email",
      is_primary: true,
      is_active: true,
    });
  }

  if (phone) {
    contactMethods.push({
      method_type: "PHONE",
      value: phone,
      label: "Primary phone",
      is_primary: !email,
      is_active: true,
    });
  }

  const sources: CrmPartySourceInput[] = [];

  if (sourceNotes || website) {
    sources.push({
      source_type: website ? "WEBSITE" : "DIRECT_CONTACT",
      profile_url: website,
      notes: sourceNotes,
      is_primary: true,
      is_active: true,
    });
  }

  const payload: CrmPartyWriteInput = {
    display_name: textValue(formData, "display_name"),
    entity_kind: entityKind,
    verification_level: verificationLevel,
    roles: selectedRoles(formData),
    contact_methods: contactMethods,
    sources,
  };

  if (entityKind === "INDIVIDUAL") {
    payload.person_profile = {
      title: optionalTextValue(formData, "title"),
      first_name: optionalTextValue(formData, "first_name"),
      middle_name: optionalTextValue(formData, "middle_name"),
      last_name: optionalTextValue(formData, "last_name"),
      preferred_name: optionalTextValue(formData, "preferred_name"),
    };
  } else {
    payload.organisation_profile = {
      legal_name: optionalTextValue(formData, "legal_name"),
      trading_name: optionalTextValue(formData, "trading_name"),
      website,
      industry: optionalTextValue(formData, "industry"),
      business_description: optionalTextValue(formData, "business_description"),
      registration_country: optionalTextValue(formData, "registration_country"),
      incorporation_date:
        optionalTextValue(formData, "incorporation_date") ?? null,
    };
  }

  return payload;
}

function extractDuplicateMatches(response: unknown): CrmDuplicateMatch[] {
  if (!response || typeof response !== "object") {
    return [];
  }

  const record = response as {
    matches?: CrmDuplicateMatch[];
    exact_matches?: CrmDuplicateMatch[];
    strong_matches?: CrmDuplicateMatch[];
    weak_matches?: CrmDuplicateMatch[];
  };

  return [
    ...(record.exact_matches ?? []),
    ...(record.strong_matches ?? []),
    ...(record.weak_matches ?? []),
    ...(record.matches ?? []),
  ];
}

export async function createCrmPartyAction(
  _previousState: CrmPartyActionState,
  formData: FormData,
): Promise<CrmPartyActionState> {
  const payload = buildPartyPayload(formData);
  const parsed = crmPartyWriteSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "Check the Party form and try again.",
    };
  }

  let createdId = "";

  try {
    const duplicateResponse = await checkCrmPartyDuplicates({
      display_name: parsed.data.display_name,
      entity_kind: parsed.data.entity_kind,
      email: parsed.data.contact_methods.find(
        (method) => method.method_type === "EMAIL",
      )?.value,
      phone: parsed.data.contact_methods.find(
        (method) => method.method_type === "PHONE",
      )?.value,
    });

    const duplicateMatches = extractDuplicateMatches(duplicateResponse);

    const exactMatches = duplicateMatches.filter(
      (match) => match.match_level === "EXACT",
    );

    if (exactMatches.length > 0) {
      return {
        ok: false,
        message:
          "An exact duplicate already exists. Open the existing Party instead.",
        duplicateMatches: exactMatches,
      };
    }

    const created = await createCrmParty(parsed.data);
    createdId = created.id;
  } catch (error) {
    return {
      ok: false,
      message: getCrmErrorMessage(error),
    };
  }

  revalidatePath(CRM_ROUTES.parties);
  redirect(CRM_ROUTES.partyDetail(createdId));
}

export async function updateCrmPartyAction(
  _previousState: CrmPartyActionState,
  formData: FormData,
): Promise<CrmPartyActionState> {
  const partyId = textValue(formData, "party_id");
  const payload = buildPartyPayload(formData);
  const parsed = crmPartyWriteSchema.safeParse(payload);

  if (!partyId) {
    return {
      ok: false,
      message: "Party ID is missing.",
    };
  }

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "Check the Party form and try again.",
    };
  }

  let updatedId = partyId;

  try {
    const updated = await updateCrmParty(partyId, parsed.data);

    updatedId = updated.id;
  } catch (error) {
    return {
      ok: false,
      message: getCrmErrorMessage(error),
    };
  }

  revalidatePath(CRM_ROUTES.parties);
  revalidatePath(CRM_ROUTES.partyDetail(updatedId));

  redirect(CRM_ROUTES.partyDetail(updatedId));
}

export async function deleteCrmPartyAction(formData: FormData): Promise<void> {
  const partyId = textValue(formData, "party_id");

  if (!partyId) {
    return;
  }

  await deleteCrmParty(partyId);

  revalidatePath(CRM_ROUTES.parties);
  redirect(CRM_ROUTES.parties);
}
