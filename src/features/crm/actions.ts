"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  checkCrmPartyDuplicates,
  createCrmAffiliation,
  createCrmParty,
  deleteCrmParty,
  updateCrmParty,
} from "./api";
import { getCrmErrorMessage } from "./errors";
import { CRM_ROUTES } from "./routes";
import { crmAffiliationWriteSchema, crmPartyWriteSchema } from "./schemas";

import type {
  CrmContactMethodInput,
  CrmDuplicateMatch,
  CrmEntityKind,
  CrmPartyAffiliationWriteInput,
  CrmPartyRoleName,
  CrmPartySourceInput,
  CrmPartyWriteInput,
  CrmSourceType,
  CrmVerificationLevel,
} from "./types";

import type { CrmPartyActionState } from "./action-states";

type PartyCreateMode = "INDIVIDUAL" | "ORGANISATION" | "TRADING_NAME";

type AffiliationMode = "NONE" | "EXISTING_ORGANISATION" | "CREATE_ORGANISATION";

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

function selectedRoles(formData: FormData, key = "roles"): CrmPartyRoleName[] {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value as CrmPartyRoleName);
}

function selectedContactRoleIds(formData: FormData): string[] {
  return formData
    .getAll("contact_role_ids")
    .filter((value): value is string => typeof value === "string")
    .filter(Boolean);
}

function createContactMethodsFromForm(
  formData: FormData,
  options?: {
    emailKey?: string;
    phoneKey?: string;
    whatsappKey?: string;
    websiteKey?: string;
  },
): CrmContactMethodInput[] {
  const email = optionalTextValue(formData, options?.emailKey ?? "email");

  const phone = optionalTextValue(formData, options?.phoneKey ?? "phone");

  const whatsapp = optionalTextValue(
    formData,
    options?.whatsappKey ?? "whatsapp",
  );

  const website = optionalTextValue(formData, options?.websiteKey ?? "website");

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

  if (website) {
    methods.push({
      method_type: "WEBSITE",
      value: website,
      label: "Website",
      is_primary: !email && !phone && !whatsapp,
      is_active: true,
    });
  }

  return methods;
}

function createSourcesFromForm(
  formData: FormData,
  options?: {
    sourceTypeKey?: string;
    platformNameKey?: string;
    sellerNameKey?: string;
    externalIdKey?: string;
    profileUrlKey?: string;
    listingUrlKey?: string;
    marketNameKey?: string;
    locationDetailsKey?: string;
    referrerNameKey?: string;
    notesKey?: string;
  },
): CrmPartySourceInput[] {
  const sourceType =
    optionalTextValue(formData, options?.sourceTypeKey ?? "source_type") ??
    "DIRECT_CONTACT";

  const platformName = optionalTextValue(
    formData,
    options?.platformNameKey ?? "platform_name",
  );

  const sellerName = optionalTextValue(
    formData,
    options?.sellerNameKey ?? "seller_name",
  );

  const externalId = optionalTextValue(
    formData,
    options?.externalIdKey ?? "external_id",
  );

  const profileUrl = optionalTextValue(
    formData,
    options?.profileUrlKey ?? "profile_url",
  );

  const listingUrl = optionalTextValue(
    formData,
    options?.listingUrlKey ?? "listing_url",
  );

  const marketName = optionalTextValue(
    formData,
    options?.marketNameKey ?? "market_name",
  );

  const locationDetails = optionalTextValue(
    formData,
    options?.locationDetailsKey ?? "location_details",
  );

  const referrerName = optionalTextValue(
    formData,
    options?.referrerNameKey ?? "referrer_name",
  );

  const notes = optionalTextValue(
    formData,
    options?.notesKey ?? "source_notes",
  );

  const hasSource =
    platformName ||
    sellerName ||
    externalId ||
    profileUrl ||
    listingUrl ||
    marketName ||
    locationDetails ||
    referrerName ||
    notes;

  if (!hasSource) {
    return [];
  }

  return [
    {
      source_type: sourceType as CrmSourceType,
      platform_name: platformName,
      seller_name: sellerName,
      external_id: externalId,
      profile_url: profileUrl,
      listing_url: listingUrl,
      market_name: marketName,
      location_details: locationDetails,
      referrer_name: referrerName,
      notes,
      is_primary: true,
      is_active: true,
    },
  ];
}

function buildIndividualPartyPayload(formData: FormData): CrmPartyWriteInput {
  const firstName = optionalTextValue(formData, "first_name");
  const lastName = optionalTextValue(formData, "last_name");
  const preferredName = optionalTextValue(formData, "preferred_name");

  const displayName =
    optionalTextValue(formData, "display_name") ??
    [firstName, lastName].filter(Boolean).join(" ") ??
    preferredName ??
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
    sources: createSourcesFromForm(formData),
  };
}

function buildOrganisationPartyPayload(
  formData: FormData,
  prefix = "",
): CrmPartyWriteInput {
  const displayName = textValue(formData, `${prefix}display_name`);

  const website = optionalTextValue(formData, `${prefix}website`);

  const roleKey = prefix ? `${prefix}roles` : "roles";

  const roles = selectedRoles(formData, roleKey);

  return {
    display_name: displayName,
    entity_kind: "ORGANISATION",
    verification_level: textValue(
      formData,
      `${prefix}verification_level`,
    ) as CrmVerificationLevel,
    roles: roles.length ? roles : selectedRoles(formData),
    organisation_profile: {
      legal_name: optionalTextValue(formData, `${prefix}legal_name`),
      trading_name: optionalTextValue(formData, `${prefix}trading_name`),
      website,
      industry: optionalTextValue(formData, `${prefix}industry`),
      business_description: optionalTextValue(
        formData,
        `${prefix}business_description`,
      ),
      registration_country: optionalTextValue(
        formData,
        `${prefix}registration_country`,
      ),
      incorporation_date:
        nullableTextValue(formData, `${prefix}incorporation_date`) ?? null,
    },
    contact_methods: createContactMethodsFromForm(formData, {
      emailKey: `${prefix}email`,
      phoneKey: `${prefix}phone`,
      whatsappKey: `${prefix}whatsapp`,
      websiteKey: `${prefix}website`,
    }),
    sources: createSourcesFromForm(formData, {
      sourceTypeKey: `${prefix}source_type`,
      platformNameKey: `${prefix}platform_name`,
      sellerNameKey: `${prefix}seller_name`,
      externalIdKey: `${prefix}external_id`,
      profileUrlKey: `${prefix}profile_url`,
      listingUrlKey: `${prefix}listing_url`,
      marketNameKey: `${prefix}market_name`,
      locationDetailsKey: `${prefix}location_details`,
      referrerNameKey: `${prefix}referrer_name`,
      notesKey: `${prefix}source_notes`,
    }),
  };
}

function buildTradingNamePartyPayload(formData: FormData): CrmPartyWriteInput {
  const displayName = textValue(formData, "display_name");
  const profileUrl = optionalTextValue(formData, "profile_url");

  return {
    display_name: displayName,
    entity_kind: "TRADING_NAME",
    verification_level: textValue(
      formData,
      "verification_level",
    ) as CrmVerificationLevel,
    roles: selectedRoles(formData),
    organisation_profile: {
      legal_name: optionalTextValue(formData, "legal_name"),
      trading_name: optionalTextValue(formData, "trading_name") ?? displayName,
      website: profileUrl,
      industry: optionalTextValue(formData, "industry"),
      business_description: optionalTextValue(formData, "business_description"),
      registration_country: optionalTextValue(formData, "registration_country"),
      incorporation_date: null,
    },
    contact_methods: createContactMethodsFromForm(formData, {
      emailKey: "email",
      phoneKey: "phone",
      whatsappKey: "whatsapp",
      websiteKey: "profile_url",
    }),
    sources: createSourcesFromForm(formData),
  };
}

function buildEditPartyPayload(formData: FormData): CrmPartyWriteInput {
  const entityKind = textValue(formData, "entity_kind") as CrmEntityKind;

  if (entityKind === "INDIVIDUAL") {
    return buildIndividualPartyPayload(formData);
  }

  if (entityKind === "TRADING_NAME") {
    return buildTradingNamePartyPayload(formData);
  }

  return buildOrganisationPartyPayload(formData);
}

function buildCreatePayload(formData: FormData): CrmPartyWriteInput {
  const createMode = textValue(formData, "create_mode") as PartyCreateMode;

  if (createMode === "ORGANISATION") {
    return buildOrganisationPartyPayload(formData);
  }

  if (createMode === "TRADING_NAME") {
    return buildTradingNamePartyPayload(formData);
  }

  return buildIndividualPartyPayload(formData);
}

function buildAffiliationPayload(
  formData: FormData,
  personId: string,
  organisationId: string,
): CrmPartyAffiliationWriteInput {
  return {
    person: personId,
    organisation: organisationId,
    job_title: optionalTextValue(formData, "aff_job_title"),
    department: optionalTextValue(formData, "aff_department"),
    start_date: nullableTextValue(formData, "aff_start_date"),
    end_date: null,
    is_current: true,
    is_primary_contact: checkboxValue(formData, "aff_is_primary_contact"),
    notes: optionalTextValue(formData, "aff_notes"),
    contact_role_ids: selectedContactRoleIds(formData),
  };
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

async function exactDuplicateMatchesForParty(
  party: CrmPartyWriteInput,
): Promise<CrmDuplicateMatch[]> {
  const duplicateResponse = await checkCrmPartyDuplicates({
    display_name: party.display_name,
    entity_kind: party.entity_kind,
    email: party.contact_methods?.find(
      (method) => method.method_type === "EMAIL",
    )?.value,
    phone: party.contact_methods?.find(
      (method) => method.method_type === "PHONE",
    )?.value,
    platform_name: party.sources?.[0]?.platform_name,
    seller_name: party.sources?.[0]?.seller_name,
    external_id: party.sources?.[0]?.external_id,
    profile_url: party.sources?.[0]?.profile_url,
    listing_url: party.sources?.[0]?.listing_url,
  });

  return extractDuplicateMatches(duplicateResponse).filter(
    (match) => match.match_level === "EXACT",
  );
}

export async function createCrmPartyAction(
  _previousState: CrmPartyActionState,
  formData: FormData,
): Promise<CrmPartyActionState> {
  const createMode = textValue(formData, "create_mode") as PartyCreateMode;

  const affiliationMode = textValue(
    formData,
    "affiliation_mode",
  ) as AffiliationMode;

  const mainPayload = buildCreatePayload(formData);
  const parsedMain = crmPartyWriteSchema.safeParse(mainPayload);

  if (!parsedMain.success) {
    return {
      ok: false,
      message:
        parsedMain.error.issues[0]?.message ??
        "Check the Party form and try again.",
    };
  }

  let createdMainPartyId = "";
  let createdOrganisationId = "";

  try {
    const exactMatches = await exactDuplicateMatchesForParty(parsedMain.data);

    if (exactMatches.length > 0) {
      return {
        ok: false,
        message:
          "An exact duplicate already exists. Open the existing Party instead.",
        duplicateMatches: exactMatches,
      };
    }

    if (
      createMode === "INDIVIDUAL" &&
      affiliationMode === "CREATE_ORGANISATION"
    ) {
      const organisationPayload = buildOrganisationPartyPayload(
        formData,
        "new_org_",
      );

      const parsedOrganisation =
        crmPartyWriteSchema.safeParse(organisationPayload);

      if (!parsedOrganisation.success) {
        return {
          ok: false,
          message:
            parsedOrganisation.error.issues[0]?.message ??
            "Check the organisation details and try again.",
        };
      }

      const organisationExactMatches = await exactDuplicateMatchesForParty(
        parsedOrganisation.data,
      );

      if (organisationExactMatches.length > 0) {
        return {
          ok: false,
          message:
            "The organisation already exists. Choose it from existing organisations instead.",
          duplicateMatches: organisationExactMatches,
        };
      }

      const createdPerson = await createCrmParty(parsedMain.data);
      createdMainPartyId = createdPerson.id;

      const createdOrganisation = await createCrmParty(parsedOrganisation.data);
      createdOrganisationId = createdOrganisation.id;

      const affiliationPayload = buildAffiliationPayload(
        formData,
        createdPerson.id,
        createdOrganisation.id,
      );

      const parsedAffiliation =
        crmAffiliationWriteSchema.safeParse(affiliationPayload);

      if (!parsedAffiliation.success) {
        return {
          ok: false,
          message:
            parsedAffiliation.error.issues[0]?.message ??
            "The person and organisation were created, but the affiliation could not be validated.",
        };
      }

      await createCrmAffiliation(parsedAffiliation.data);
    } else if (
      createMode === "INDIVIDUAL" &&
      affiliationMode === "EXISTING_ORGANISATION"
    ) {
      const existingOrganisationId = textValue(
        formData,
        "existing_organisation_id",
      );

      if (!existingOrganisationId) {
        return {
          ok: false,
          message: "Select the existing organisation.",
        };
      }

      const createdPerson = await createCrmParty(parsedMain.data);
      createdMainPartyId = createdPerson.id;

      const affiliationPayload = buildAffiliationPayload(
        formData,
        createdPerson.id,
        existingOrganisationId,
      );

      const parsedAffiliation =
        crmAffiliationWriteSchema.safeParse(affiliationPayload);

      if (!parsedAffiliation.success) {
        return {
          ok: false,
          message:
            parsedAffiliation.error.issues[0]?.message ??
            "The person was created, but the affiliation could not be validated.",
        };
      }

      await createCrmAffiliation(parsedAffiliation.data);
    } else {
      const created = await createCrmParty(parsedMain.data);
      createdMainPartyId = created.id;
    }
  } catch (error) {
    return {
      ok: false,
      message: getCrmErrorMessage(error),
    };
  }

  revalidatePath(CRM_ROUTES.parties);
  revalidatePath(CRM_ROUTES.clients);
  revalidatePath(CRM_ROUTES.suppliers);
  revalidatePath(CRM_ROUTES.contacts);

  if (createdOrganisationId) {
    revalidatePath(CRM_ROUTES.partyDetail(createdOrganisationId));
  }

  redirect(CRM_ROUTES.partyDetail(createdMainPartyId));
}

export async function updateCrmPartyAction(
  _previousState: CrmPartyActionState,
  formData: FormData,
): Promise<CrmPartyActionState> {
  const partyId = textValue(formData, "party_id");
  const payload = buildEditPartyPayload(formData);
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
