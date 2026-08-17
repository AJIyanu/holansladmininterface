"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createCrmAddress,
  createCrmContactMethod,
  createCrmSource,
  deleteCrmAddress,
  deleteCrmContactMethod,
  deleteCrmSource,
  updateCrmAddress,
  updateCrmContactMethod,
  updateCrmPartyProfile,
  updateCrmSource,
} from "./api";
import { getCrmErrorMessage } from "./errors";
import { CRM_ROUTES } from "./routes";

import type {
  CrmAddressType,
  CrmContactMethodType,
  CrmSourceType,
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

function revalidatePartyDetail(partyId: string) {
  revalidatePath(CRM_ROUTES.partyDetail(partyId));
  revalidatePath(CRM_ROUTES.parties);
  revalidatePath(CRM_ROUTES.clients);
  revalidatePath(CRM_ROUTES.suppliers);
  revalidatePath(CRM_ROUTES.contacts);
}

export async function updateCrmProfileAction(
  formData: FormData,
): Promise<void> {
  const partyId = textValue(formData, "party_id");
  const entityKind = textValue(formData, "entity_kind");

  if (!partyId) {
    throw new Error("Party ID is missing.");
  }

  const payload =
    entityKind === "INDIVIDUAL"
      ? {
          title: optionalTextValue(formData, "title"),
          first_name: optionalTextValue(formData, "first_name"),
          middle_name: optionalTextValue(formData, "middle_name"),
          last_name: optionalTextValue(formData, "last_name"),
          preferred_name: optionalTextValue(formData, "preferred_name"),
        }
      : {
          legal_name: optionalTextValue(formData, "legal_name"),
          trading_name: optionalTextValue(formData, "trading_name"),
          website: optionalTextValue(formData, "website"),
          industry: optionalTextValue(formData, "industry"),
          business_description: optionalTextValue(
            formData,
            "business_description",
          ),
          registration_country: optionalTextValue(
            formData,
            "registration_country",
          ),
          incorporation_date: nullableTextValue(formData, "incorporation_date"),
        };

  try {
    await updateCrmPartyProfile(partyId, payload);
  } catch (error) {
    throw new Error(getCrmErrorMessage(error));
  }

  revalidatePartyDetail(partyId);
  redirect(CRM_ROUTES.partyDetail(partyId));
}

export async function createCrmContactMethodAction(
  formData: FormData,
): Promise<void> {
  const partyId = textValue(formData, "party_id");

  if (!partyId) {
    throw new Error("Party ID is missing.");
  }

  try {
    await createCrmContactMethod({
      party: partyId,
      method_type: textValue(formData, "method_type") as CrmContactMethodType,
      value: textValue(formData, "value"),
      label: optionalTextValue(formData, "label"),
      is_primary: checkboxValue(formData, "is_primary"),
      is_verified: checkboxValue(formData, "is_verified"),
      is_active: checkboxValue(formData, "is_active"),
    });
  } catch (error) {
    throw new Error(getCrmErrorMessage(error));
  }

  revalidatePartyDetail(partyId);
  redirect(CRM_ROUTES.partyDetail(partyId));
}

export async function updateCrmContactMethodAction(
  formData: FormData,
): Promise<void> {
  const partyId = textValue(formData, "party_id");
  const contactMethodId = textValue(formData, "contact_method_id");

  if (!partyId || !contactMethodId) {
    throw new Error("Contact method details are incomplete.");
  }

  try {
    await updateCrmContactMethod(contactMethodId, {
      party: partyId,
      method_type: textValue(formData, "method_type") as CrmContactMethodType,
      value: textValue(formData, "value"),
      label: optionalTextValue(formData, "label"),
      is_primary: checkboxValue(formData, "is_primary"),
      is_verified: checkboxValue(formData, "is_verified"),
      is_active: checkboxValue(formData, "is_active"),
    });
  } catch (error) {
    throw new Error(getCrmErrorMessage(error));
  }

  revalidatePartyDetail(partyId);
  redirect(CRM_ROUTES.partyDetail(partyId));
}

export async function deleteCrmContactMethodAction(
  formData: FormData,
): Promise<void> {
  const partyId = textValue(formData, "party_id");
  const contactMethodId = textValue(formData, "contact_method_id");

  if (!partyId || !contactMethodId) {
    return;
  }

  try {
    await deleteCrmContactMethod(contactMethodId);
  } catch (error) {
    throw new Error(getCrmErrorMessage(error));
  }

  revalidatePartyDetail(partyId);
  redirect(CRM_ROUTES.partyDetail(partyId));
}

export async function createCrmAddressAction(
  formData: FormData,
): Promise<void> {
  const partyId = textValue(formData, "party_id");

  if (!partyId) {
    throw new Error("Party ID is missing.");
  }

  try {
    await createCrmAddress({
      party: partyId,
      address_type: textValue(formData, "address_type") as CrmAddressType,
      label: optionalTextValue(formData, "label"),
      line_1: optionalTextValue(formData, "line_1"),
      line_2: optionalTextValue(formData, "line_2"),
      city: optionalTextValue(formData, "city"),
      state_region: optionalTextValue(formData, "state_region"),
      postal_code: optionalTextValue(formData, "postal_code"),
      country_code: optionalTextValue(formData, "country_code"),
      location_notes: optionalTextValue(formData, "location_notes"),
      is_primary: checkboxValue(formData, "is_primary"),
      is_active: checkboxValue(formData, "is_active"),
    });
  } catch (error) {
    throw new Error(getCrmErrorMessage(error));
  }

  revalidatePartyDetail(partyId);
  redirect(CRM_ROUTES.partyDetail(partyId));
}

export async function updateCrmAddressAction(
  formData: FormData,
): Promise<void> {
  const partyId = textValue(formData, "party_id");
  const addressId = textValue(formData, "address_id");

  if (!partyId || !addressId) {
    throw new Error("Address details are incomplete.");
  }

  try {
    await updateCrmAddress(addressId, {
      party: partyId,
      address_type: textValue(formData, "address_type") as CrmAddressType,
      label: optionalTextValue(formData, "label"),
      line_1: optionalTextValue(formData, "line_1"),
      line_2: optionalTextValue(formData, "line_2"),
      city: optionalTextValue(formData, "city"),
      state_region: optionalTextValue(formData, "state_region"),
      postal_code: optionalTextValue(formData, "postal_code"),
      country_code: optionalTextValue(formData, "country_code"),
      location_notes: optionalTextValue(formData, "location_notes"),
      is_primary: checkboxValue(formData, "is_primary"),
      is_active: checkboxValue(formData, "is_active"),
    });
  } catch (error) {
    throw new Error(getCrmErrorMessage(error));
  }

  revalidatePartyDetail(partyId);
  redirect(CRM_ROUTES.partyDetail(partyId));
}

export async function deleteCrmAddressAction(
  formData: FormData,
): Promise<void> {
  const partyId = textValue(formData, "party_id");
  const addressId = textValue(formData, "address_id");

  if (!partyId || !addressId) {
    return;
  }

  try {
    await deleteCrmAddress(addressId);
  } catch (error) {
    throw new Error(getCrmErrorMessage(error));
  }

  revalidatePartyDetail(partyId);
  redirect(CRM_ROUTES.partyDetail(partyId));
}

export async function createCrmSourceAction(formData: FormData): Promise<void> {
  const partyId = textValue(formData, "party_id");

  if (!partyId) {
    throw new Error("Party ID is missing.");
  }

  try {
    await createCrmSource({
      party: partyId,
      source_type: textValue(formData, "source_type") as CrmSourceType,
      platform_name: optionalTextValue(formData, "platform_name"),
      seller_name: optionalTextValue(formData, "seller_name"),
      external_id: optionalTextValue(formData, "external_id"),
      profile_url: optionalTextValue(formData, "profile_url"),
      listing_url: optionalTextValue(formData, "listing_url"),
      market_name: optionalTextValue(formData, "market_name"),
      location_details: optionalTextValue(formData, "location_details"),
      referrer_name: optionalTextValue(formData, "referrer_name"),
      notes: optionalTextValue(formData, "notes"),
      discovered_at:
        optionalTextValue(formData, "discovered_at") ??
        new Date().toISOString().slice(0, 10),
      is_primary: checkboxValue(formData, "is_primary"),
      is_active: checkboxValue(formData, "is_active"),
    });
  } catch (error) {
    throw new Error(getCrmErrorMessage(error));
  }

  revalidatePartyDetail(partyId);
  redirect(CRM_ROUTES.partyDetail(partyId));
}

export async function updateCrmSourceAction(formData: FormData): Promise<void> {
  const partyId = textValue(formData, "party_id");
  const sourceId = textValue(formData, "source_id");

  if (!partyId || !sourceId) {
    throw new Error("Source details are incomplete.");
  }

  try {
    await updateCrmSource(sourceId, {
      party: partyId,
      source_type: textValue(formData, "source_type") as CrmSourceType,
      platform_name: optionalTextValue(formData, "platform_name"),
      seller_name: optionalTextValue(formData, "seller_name"),
      external_id: optionalTextValue(formData, "external_id"),
      profile_url: optionalTextValue(formData, "profile_url"),
      listing_url: optionalTextValue(formData, "listing_url"),
      market_name: optionalTextValue(formData, "market_name"),
      location_details: optionalTextValue(formData, "location_details"),
      referrer_name: optionalTextValue(formData, "referrer_name"),
      notes: optionalTextValue(formData, "notes"),
      discovered_at: optionalTextValue(formData, "discovered_at"),
      is_primary: checkboxValue(formData, "is_primary"),
      is_active: checkboxValue(formData, "is_active"),
    });
  } catch (error) {
    throw new Error(getCrmErrorMessage(error));
  }

  revalidatePartyDetail(partyId);
  redirect(CRM_ROUTES.partyDetail(partyId));
}

export async function deleteCrmSourceAction(formData: FormData): Promise<void> {
  const partyId = textValue(formData, "party_id");
  const sourceId = textValue(formData, "source_id");

  if (!partyId || !sourceId) {
    return;
  }

  try {
    await deleteCrmSource(sourceId);
  } catch (error) {
    throw new Error(getCrmErrorMessage(error));
  }

  revalidatePartyDetail(partyId);
  redirect(CRM_ROUTES.partyDetail(partyId));
}
