"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createCrmAffiliation,
  createCrmParty,
  deleteCrmAffiliation,
  updateCrmAffiliation,
} from "./api";
import { getCrmErrorMessage } from "./errors";
import { CRM_ROUTES } from "./routes";
import { crmAffiliationWriteSchema, crmPartyWriteSchema } from "./schemas";

import type {
  CrmContactMethodInput,
  CrmPartyAffiliationWriteInput,
  CrmPartyRoleName,
  CrmPartyWriteInput,
  CrmVerificationLevel,
} from "./types";

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

function nullableTextValue(formData: FormData, key: string): string | null {
  const value = textValue(formData, key);

  return value ? value : null;
}

function checkboxValue(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

function selectedContactRoleIds(formData: FormData): string[] {
  return formData
    .getAll("contact_role_ids")
    .filter((value): value is string => typeof value === "string")
    .filter(Boolean);
}

function selectedRoles(formData: FormData): CrmPartyRoleName[] {
  return formData
    .getAll("roles")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value as CrmPartyRoleName);
}

function createContactMethodsFromForm(
  formData: FormData,
): CrmContactMethodInput[] {
  const email = optionalTextValue(formData, "email");
  const phone = optionalTextValue(formData, "phone");
  const whatsapp = optionalTextValue(formData, "whatsapp");

  const methods: CrmContactMethodInput[] = [];

  if (email) {
    methods.push({
      method_type: "EMAIL",
      value: email,
      label: "Primary email",
      is_primary: true,
      is_active: true,
    });
  }

  if (phone) {
    methods.push({
      method_type: "PHONE",
      value: phone,
      label: "Primary phone",
      is_primary: !email,
      is_active: true,
    });
  }

  if (whatsapp) {
    methods.push({
      method_type: "WHATSAPP",
      value: whatsapp,
      label: "WhatsApp",
      is_primary: !email && !phone,
      is_active: true,
    });
  }

  return methods;
}

function buildNewPersonPayload(formData: FormData): CrmPartyWriteInput {
  const firstName = optionalTextValue(formData, "first_name");
  const lastName = optionalTextValue(formData, "last_name");
  const preferredName = optionalTextValue(formData, "preferred_name");

  const displayName =
    optionalTextValue(formData, "display_name") ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    preferredName ||
    "";

  return {
    display_name: displayName,
    entity_kind: "INDIVIDUAL",
    verification_level: textValue(
      formData,
      "verification_level",
    ) as CrmVerificationLevel,
    roles: selectedRoles(formData),
    person_profile: {
      title: optionalTextValue(formData, "title"),
      first_name: firstName,
      middle_name: optionalTextValue(formData, "middle_name"),
      last_name: lastName,
      preferred_name: preferredName,
    },
    contact_methods: createContactMethodsFromForm(formData),
  };
}

function buildAffiliationPayload(
  formData: FormData,
  personId: string,
  organisationId: string,
): CrmPartyAffiliationWriteInput {
  return {
    person: personId,
    organisation: organisationId,
    job_title: optionalTextValue(formData, "job_title"),
    department: optionalTextValue(formData, "department"),
    start_date: nullableTextValue(formData, "start_date"),
    end_date: nullableTextValue(formData, "end_date"),
    is_current: !formData.has("is_current")
      ? true
      : checkboxValue(formData, "is_current"),
    is_primary_contact: checkboxValue(formData, "is_primary_contact"),
    notes: optionalTextValue(formData, "notes"),
    contact_role_ids: selectedContactRoleIds(formData),
  };
}

export async function linkExistingPersonToOrganisationAction(
  formData: FormData,
): Promise<void> {
  const organisationId = textValue(formData, "organisation_id");
  const personId = textValue(formData, "person_id");

  if (!organisationId || !personId) {
    throw new Error("Select both person and organisation.");
  }

  const payload = buildAffiliationPayload(formData, personId, organisationId);

  const parsed = crmAffiliationWriteSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ??
        "Check the affiliation form and try again.",
    );
  }

  try {
    await createCrmAffiliation(parsed.data);
  } catch (error) {
    throw new Error(getCrmErrorMessage(error));
  }

  revalidatePath(CRM_ROUTES.partyDetail(organisationId));
  revalidatePath(CRM_ROUTES.partyDetail(personId));

  redirect(CRM_ROUTES.partyDetail(organisationId));
}

export async function linkIndividualToOrganisationAction(
  formData: FormData,
): Promise<void> {
  const personId = textValue(formData, "person_id");
  const organisationId = textValue(formData, "organisation_id");

  if (!personId || !organisationId) {
    throw new Error("Select an organisation.");
  }

  const payload = buildAffiliationPayload(formData, personId, organisationId);

  const parsed = crmAffiliationWriteSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ??
        "Check the affiliation form and try again.",
    );
  }

  try {
    await createCrmAffiliation(parsed.data);
  } catch (error) {
    throw new Error(getCrmErrorMessage(error));
  }

  revalidatePath(CRM_ROUTES.partyDetail(personId));
  revalidatePath(CRM_ROUTES.partyDetail(organisationId));

  redirect(CRM_ROUTES.partyDetail(personId));
}

export async function createPersonUnderOrganisationAction(
  formData: FormData,
): Promise<void> {
  const organisationId = textValue(formData, "organisation_id");

  if (!organisationId) {
    throw new Error("Organisation ID is missing.");
  }

  const personPayload = buildNewPersonPayload(formData);
  const parsedPerson = crmPartyWriteSchema.safeParse(personPayload);

  if (!parsedPerson.success) {
    throw new Error(
      parsedPerson.error.issues[0]?.message ??
        "Check the person details and try again.",
    );
  }

  let createdPersonId = "";

  try {
    const createdPerson = await createCrmParty(parsedPerson.data);
    createdPersonId = createdPerson.id;

    const affiliationPayload = buildAffiliationPayload(
      formData,
      createdPerson.id,
      organisationId,
    );

    const parsedAffiliation =
      crmAffiliationWriteSchema.safeParse(affiliationPayload);

    if (!parsedAffiliation.success) {
      throw new Error(
        parsedAffiliation.error.issues[0]?.message ??
          "The contact person was created, but the affiliation could not be validated.",
      );
    }

    await createCrmAffiliation(parsedAffiliation.data);
  } catch (error) {
    throw new Error(getCrmErrorMessage(error));
  }

  revalidatePath(CRM_ROUTES.partyDetail(organisationId));
  revalidatePath(CRM_ROUTES.partyDetail(createdPersonId));

  redirect(CRM_ROUTES.partyDetail(organisationId));
}

export async function updateCrmAffiliationAction(
  formData: FormData,
): Promise<void> {
  const affiliationId = textValue(formData, "affiliation_id");
  const personId = textValue(formData, "person_id");
  const organisationId = textValue(formData, "organisation_id");
  const returnPartyId =
    textValue(formData, "return_party_id") || organisationId || personId;

  if (!affiliationId || !personId || !organisationId) {
    throw new Error("Affiliation details are incomplete.");
  }

  const payload = buildAffiliationPayload(formData, personId, organisationId);

  const parsed = crmAffiliationWriteSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ??
        "Check the affiliation form and try again.",
    );
  }

  try {
    await updateCrmAffiliation(affiliationId, parsed.data);
  } catch (error) {
    throw new Error(getCrmErrorMessage(error));
  }

  revalidatePath(CRM_ROUTES.partyDetail(personId));
  revalidatePath(CRM_ROUTES.partyDetail(organisationId));

  redirect(CRM_ROUTES.partyDetail(returnPartyId));
}

export async function endCrmAffiliationAction(
  formData: FormData,
): Promise<void> {
  const affiliationId = textValue(formData, "affiliation_id");
  const personId = textValue(formData, "person_id");
  const organisationId = textValue(formData, "organisation_id");
  const returnPartyId =
    textValue(formData, "return_party_id") || organisationId || personId;

  if (!affiliationId || !personId || !organisationId) {
    throw new Error("Affiliation details are incomplete.");
  }

  try {
    await updateCrmAffiliation(affiliationId, {
      person: personId,
      organisation: organisationId,
      is_current: false,
      end_date: new Date().toISOString().slice(0, 10),
    });
  } catch (error) {
    throw new Error(getCrmErrorMessage(error));
  }

  revalidatePath(CRM_ROUTES.partyDetail(personId));
  revalidatePath(CRM_ROUTES.partyDetail(organisationId));

  redirect(CRM_ROUTES.partyDetail(returnPartyId));
}

export async function deleteCrmAffiliationAction(
  formData: FormData,
): Promise<void> {
  const affiliationId = textValue(formData, "affiliation_id");
  const personId = textValue(formData, "person_id");
  const organisationId = textValue(formData, "organisation_id");
  const returnPartyId =
    textValue(formData, "return_party_id") || organisationId || personId;

  if (!affiliationId) {
    return;
  }

  try {
    await deleteCrmAffiliation(affiliationId);
  } catch (error) {
    throw new Error(getCrmErrorMessage(error));
  }

  if (personId) {
    revalidatePath(CRM_ROUTES.partyDetail(personId));
  }

  if (organisationId) {
    revalidatePath(CRM_ROUTES.partyDetail(organisationId));
  }

  if (returnPartyId) {
    redirect(CRM_ROUTES.partyDetail(returnPartyId));
  }

  redirect(CRM_ROUTES.parties);
}
