import type {
  CrmEntityKind,
  CrmPartyListQuery,
  CrmPartyRoleName,
  CrmPartyStatus,
  CrmVerificationLevel,
  CrmDocumentCategory,
  CrmDocumentListQuery,
  CrmStorageProvider,
  CrmVerificationStatus,
} from "./types";
import type { CrmIdentifierListQuery, CrmIdentifierType } from "./types";

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function values(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function toPositiveInteger(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function toBoolean(value: string | undefined): boolean | undefined {
  if (!value) {
    return undefined;
  }

  if (["true", "1", "yes"].includes(value.toLowerCase())) {
    return true;
  }

  if (["false", "0", "no"].includes(value.toLowerCase())) {
    return false;
  }

  return undefined;
}

export function crmPartyQueryFromSearchParams(
  searchParams: RawSearchParams,
  forcedRole?: CrmPartyRoleName,
): CrmPartyListQuery {
  const roleValues = forcedRole
    ? [forcedRole]
    : (values(searchParams.role) as CrmPartyRoleName[]);

  return {
    search: firstValue(searchParams.search),
    role: roleValues.length ? roleValues : undefined,
    entity_kind: firstValue(searchParams.entity_kind) as
      CrmEntityKind | undefined,
    status: firstValue(searchParams.status) as CrmPartyStatus | undefined,
    verification_level: firstValue(searchParams.verification_level) as
      CrmVerificationLevel | undefined,
    is_archived: toBoolean(firstValue(searchParams.is_archived)),
    ordering: firstValue(searchParams.ordering),
    page: toPositiveInteger(firstValue(searchParams.page)),
    page_size: toPositiveInteger(firstValue(searchParams.page_size)) ?? 20,
  };
}

export function buildDashboardUrl(
  pathname: string,
  params: Record<string, string | number | undefined>,
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }

  const queryString = search.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function crmIdentifierQueryFromSearchParams(
  searchParams: RawSearchParams,
): CrmIdentifierListQuery {
  return {
    party: firstValue(searchParams.party),
    identifier_type: firstValue(searchParams.identifier_type) as
      CrmIdentifierType | undefined,
    issuing_country: firstValue(searchParams.issuing_country),
    is_verified: toBoolean(firstValue(searchParams.is_verified)),
    is_active: toBoolean(firstValue(searchParams.is_active)),
    ordering: firstValue(searchParams.ordering),
    page: toPositiveInteger(firstValue(searchParams.page)),
    page_size: toPositiveInteger(firstValue(searchParams.page_size)) ?? 20,
  };
}

export function crmDocumentQueryFromSearchParams(
  searchParams: RawSearchParams,
): CrmDocumentListQuery {
  return {
    party: firstValue(searchParams.party),
    category: firstValue(searchParams.category) as
      CrmDocumentCategory | undefined,
    storage_provider: firstValue(searchParams.storage_provider) as
      CrmStorageProvider | undefined,
    verification_status: firstValue(searchParams.verification_status) as
      CrmVerificationStatus | undefined,
    is_confidential: toBoolean(firstValue(searchParams.is_confidential)),
    is_active: toBoolean(firstValue(searchParams.is_active)),
    expires_at: firstValue(searchParams.expires_at),
    search: firstValue(searchParams.search),
    ordering: firstValue(searchParams.ordering),
    page: toPositiveInteger(firstValue(searchParams.page)),
    page_size: toPositiveInteger(firstValue(searchParams.page_size)) ?? 20,
  };
}
