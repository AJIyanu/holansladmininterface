/**
 * Shared TypeScript contracts for the CRM frontend.
 *
 * These contracts follow the backend OpenAPI schema. Sensitive plaintext
 * values appear only in explicit write or reveal response types.
 */

export type UUID = string;
export type ISODate = string;
export type ISODateTime = string;

export type CrmEntityKind = "ORGANISATION" | "INDIVIDUAL" | "TRADING_NAME";

export type CrmPartyStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "BLOCKED"
  | "MERGED";

export type CrmVerificationLevel = "MINIMAL" | "BASIC" | "VERIFIED";

export type CrmPartyRoleName =
  | "CLIENT"
  | "SUPPLIER"
  | "PROSPECT"
  | "LOGISTICS_PROVIDER"
  | "SERVICE_PROVIDER"
  | "OTHER";

export type CrmContactMethodType =
  | "EMAIL"
  | "PHONE"
  | "MOBILE"
  | "WHATSAPP"
  | "WEBSITE"
  | "SOCIAL_MEDIA"
  | "MARKETPLACE"
  | "OTHER";

export type CrmAddressType =
  | "REGISTERED"
  | "OFFICE"
  | "BILLING"
  | "DELIVERY"
  | "RESIDENTIAL"
  | "MARKET"
  | "OTHER";

export type CrmSourceType =
  | "ONLINE_MARKETPLACE"
  | "PHYSICAL_MARKET"
  | "DIRECT_CONTACT"
  | "REFERRAL"
  | "WEBSITE"
  | "SOCIAL_MEDIA"
  | "PREVIOUS_TRANSACTION"
  | "TRADE_DIRECTORY"
  | "EVENT"
  | "OTHER";

export type CrmIdentifierType =
  | "COMPANY_REGISTRATION"
  | "TAX_ID"
  | "VAT"
  | "IMPORT_EXPORT"
  | "MARKETPLACE_SELLER"
  | "OTHER";

export type CrmInteractionType =
  | "CALL"
  | "EMAIL"
  | "WHATSAPP"
  | "MEETING"
  | "MARKETPLACE_MESSAGE"
  | "SITE_VISIT"
  | "OTHER";

export type CrmNoteType =
  | "GENERAL"
  | "PROCUREMENT"
  | "ACCOUNTS"
  | "RISK"
  | "CONFIDENTIAL";

export type CrmDocumentCategory =
  | "REGISTRATION"
  | "TAX"
  | "BANK"
  | "CONTRACT"
  | "CORRESPONDENCE"
  | "IDENTITY"
  | "QUOTE"
  | "OTHER";

export type CrmStorageProvider = "GOOGLE_DRIVE" | "SUPABASE";

export type CrmVerificationStatus =
  | "UNVERIFIED"
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";

export type CrmPaymentMethod = "BANK_TRANSFER" | "MOBILE_MONEY" | "OTHER";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CrmPartyRole {
  id: UUID;
  party: UUID;
  role: CrmPartyRoleName;
  role_display: string;
  is_active: boolean;
  activated_at: ISODateTime;
  deactivated_at: ISODateTime | null;
  notes: string;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CrmOrganisationProfile {
  id: UUID;
  legal_name: string;
  trading_name: string;
  website: string;
  industry: string;
  business_description: string;
  registration_country: string;
  incorporation_date: ISODate | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CrmPersonProfile {
  id: UUID;
  title: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  preferred_name: string;
  full_name: string;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CrmContactMethod {
  id: UUID;
  party: UUID;
  method_type: CrmContactMethodType;
  method_type_display: string;
  value: string;
  normalized_value: string;
  label: string;
  is_primary: boolean;
  is_verified: boolean;
  is_active: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CrmAddress {
  id: UUID;
  party: UUID;
  address_type: CrmAddressType;
  address_type_display: string;
  label: string;
  line_1: string;
  line_2: string;
  city: string;
  state_region: string;
  postal_code: string;
  country_code: string;
  location_notes: string;
  is_primary: boolean;
  is_active: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CrmPartySource {
  id: UUID;
  party: UUID;
  source_type: CrmSourceType;
  source_type_display: string;
  platform_name: string;
  seller_name: string;
  external_id: string;
  profile_url: string;
  listing_url: string;
  market_name: string;
  location_details: string;
  referrer_name: string;
  notes: string;
  discovered_at: ISODate;
  last_verified_at: ISODateTime | null;
  discovered_by: UUID | null;
  is_primary: boolean;
  is_active: boolean;
  reference_label: string;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CrmContactRole {
  id: UUID;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  sort_order: number;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CrmPartyAffiliation {
  id: UUID;
  person: UUID;
  person_name: string;
  organisation: UUID;
  organisation_name: string;
  job_title: string;
  department: string;
  start_date: ISODate | null;
  end_date: ISODate | null;
  is_current: boolean;
  is_primary_contact: boolean;
  notes: string;
  contact_roles: CrmContactRole[];
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CrmPartyListItem {
  id: UUID;
  display_name: string;
  entity_kind: CrmEntityKind;
  status: CrmPartyStatus;
  verification_level: CrmVerificationLevel;
  is_archived: boolean;
  roles: CrmPartyRole[];
  primary_email: string;
  primary_phone: string;
  primary_source: string;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CrmPartyDetail {
  id: UUID;
  display_name: string;
  entity_kind: CrmEntityKind;
  status: CrmPartyStatus;
  verification_level: CrmVerificationLevel;
  is_archived: boolean;
  archived_at: ISODateTime | null;
  merged_into: UUID | null;
  merged_into_name: string | null;
  roles: CrmPartyRole[];
  organisation_profile: CrmOrganisationProfile | null;
  person_profile: CrmPersonProfile | null;
  contact_methods: CrmContactMethod[];
  addresses: CrmAddress[];
  sources: CrmPartySource[];
  people_affiliations: CrmPartyAffiliation[];
  organisation_affiliations: CrmPartyAffiliation[];
  is_selectable: boolean;
  is_traceable: boolean;
  created_by: UUID | null;
  updated_by: UUID | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CrmOrganisationProfileInput {
  legal_name?: string;
  trading_name?: string;
  website?: string;
  industry?: string;
  business_description?: string;
  registration_country?: string;
  incorporation_date?: ISODate | null;
}

export interface CrmPersonProfileInput {
  title?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  preferred_name?: string;
}

export interface CrmContactMethodInput {
  method_type: CrmContactMethodType;
  value: string;
  label?: string;
  is_primary?: boolean;
  is_verified?: boolean;
  is_active?: boolean;
}

export interface CrmAddressInput {
  address_type?: CrmAddressType;
  label?: string;
  line_1?: string;
  line_2?: string;
  city?: string;
  state_region?: string;
  postal_code?: string;
  country_code?: string;
  location_notes?: string;
  is_primary?: boolean;
  is_active?: boolean;
}

export interface CrmPartySourceInput {
  source_type: CrmSourceType;
  platform_name?: string;
  seller_name?: string;
  external_id?: string;
  profile_url?: string;
  listing_url?: string;
  market_name?: string;
  location_details?: string;
  referrer_name?: string;
  notes?: string;
  discovered_at?: ISODate;
  is_primary?: boolean;
  is_active?: boolean;
}

export interface CrmPartyWriteInput {
  display_name: string;
  entity_kind?: CrmEntityKind;
  verification_level?: CrmVerificationLevel;
  roles?: CrmPartyRoleName[];
  organisation_profile?: CrmOrganisationProfileInput;
  person_profile?: CrmPersonProfileInput;
  contact_methods?: CrmContactMethodInput[];
  addresses?: CrmAddressInput[];
  sources?: CrmPartySourceInput[];
}

export interface CrmQuickSupplierInput {
  display_name: string;
  entity_kind?: CrmEntityKind;
  email?: string;
  phone?: string;
  source_type?: CrmSourceType;
  platform_name?: string;
  seller_name?: string;
  external_id?: string;
  profile_url?: string;
  listing_url?: string;
  market_name?: string;
  location_details?: string;
  referrer_name?: string;
  source_notes?: string;
}

export interface CrmDuplicateCheckInput {
  party_id?: UUID;
  display_name?: string;
  entity_kind?: CrmEntityKind;
  email?: string;
  phone?: string;
  platform_name?: string;
  seller_name?: string;
  external_id?: string;
  profile_url?: string;
  listing_url?: string;
}

export interface CrmDuplicateMatch {
  party: CrmPartyListItem;
  match_level: "EXACT" | "STRONG" | "WEAK";
  reasons: string[];
}

export interface CrmDuplicateCheckResponse {
  count?: number;
  matches?: CrmDuplicateMatch[];
  exact_matches?: CrmDuplicateMatch[];
  strong_matches?: CrmDuplicateMatch[];
  weak_matches?: CrmDuplicateMatch[];
}

export interface CrmLifecycleInput {
  reason: string;
}

export interface CrmMergeInput {
  target_party: UUID;
  reason: string;
}

export interface CrmPartyIdentifier {
  id: UUID;
  party: UUID;
  identifier_type: CrmIdentifierType;
  label: string;
  masked_value: string;
  issuing_country: string;
  issue_date: ISODate | null;
  expiry_date: ISODate | null;
  is_verified: boolean;
  is_active: boolean;
  created_by: UUID | null;
  updated_by: UUID | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CrmPartyIdentifierWriteInput {
  party: UUID;
  identifier_type: CrmIdentifierType;
  label?: string;
  value?: string;
  issuing_country?: string;
  issue_date?: ISODate | null;
  expiry_date?: ISODate | null;
  is_verified?: boolean;
  is_active?: boolean;
}

export interface CrmSensitiveValueResponse {
  id: UUID;
  value: string;
}

export interface CrmPartyDocument {
  id: UUID;
  party: UUID;
  category: CrmDocumentCategory;
  category_display: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  checksum_sha256: string;
  storage_provider: CrmStorageProvider;
  description: string;
  is_confidential: boolean;
  verification_status: CrmVerificationStatus;
  verification_status_display: string;
  expires_at: ISODate | null;
  is_active: boolean;
  uploaded_by: UUID | null;
  deleted_by: UUID | null;
  deleted_at: ISODateTime | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CrmPartyDocumentUpdateInput {
  description?: string;
  is_confidential?: boolean;
  verification_status?: CrmVerificationStatus;
  expires_at?: ISODate | null;
}

export interface CrmPartyNote {
  id: UUID;
  party: UUID;
  note_type: CrmNoteType;
  content: string;
  is_confidential: boolean;
  author: UUID | null;
  author_name: string;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CrmPartyInteraction {
  id: UUID;
  party: UUID;
  party_name: string;
  contact_party: UUID | null;
  contact_name: string | null;
  interaction_type: CrmInteractionType;
  interaction_type_display: string;
  occurred_at: ISODateTime;
  subject: string;
  summary: string;
  staff_member: UUID | null;
  staff_member_name: string;
  follow_up_at: ISODateTime | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CrmPartyBankAccount {
  id: UUID;
  party: UUID;
  payment_method: CrmPaymentMethod;
  account_name: string;
  bank_name: string;
  provider_name: string;
  masked_account_number: string;
  masked_iban: string;
  swift_bic: string;
  currency: string;
  country_code: string;
  verification_status: CrmVerificationStatus;
  is_primary: boolean;
  is_active: boolean;
  notes: string;
  created_by: UUID | null;
  updated_by: UUID | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CrmPartyStatusHistory {
  id: UUID;
  party: UUID;
  previous_status: CrmPartyStatus;
  new_status: CrmPartyStatus;
  reason: string;
  changed_by: UUID | null;
  changed_by_name: string;
  metadata: Record<string, unknown>;
  created_at: ISODateTime;
}

export interface CrmPartyMergeRecord {
  id: UUID;
  source_party: UUID;
  source_name: string;
  target_party: UUID;
  target_name: string;
  reason: string;
  merged_by: UUID | null;
  merged_by_name: string;
  summary: Record<string, unknown>;
  created_at: ISODateTime;
}

export interface CrmPartyListQuery {
  search?: string;
  role?: CrmPartyRoleName[];
  entity_kind?: CrmEntityKind;
  status?: CrmPartyStatus;
  verification_level?: CrmVerificationLevel;
  is_archived?: boolean;
  has_email?: boolean;
  has_phone?: boolean;
  has_source?: boolean;
  source_type?: CrmSourceType[];
  platform?: string;
  organisation?: UUID;
  contact_role?: UUID;
  created_after?: ISODateTime;
  created_before?: ISODateTime;
  updated_after?: ISODateTime;
  updated_before?: ISODateTime;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface CrmIdentifierListQuery {
  party?: UUID;
  identifier_type?: CrmIdentifierType;
  issuing_country?: string;
  is_verified?: boolean;
  is_active?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface CrmDocumentListQuery {
  party?: UUID;
  category?: CrmDocumentCategory;
  storage_provider?: CrmStorageProvider;
  verification_status?: CrmVerificationStatus;
  is_confidential?: boolean;
  is_active?: boolean;
  expires_at?: ISODate;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface CrmInteractionListQuery {
  party?: UUID;
  contact_party?: UUID;
  staff_member?: UUID;
  interaction_type?: CrmInteractionType;
  occurred_after?: ISODateTime;
  occurred_before?: ISODateTime;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface CrmContactRoleListQuery {
  search?: string;
  is_active?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface CrmContactRoleWriteInput {
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface CrmPartyInteractionWriteInput {
  party: UUID;
  contact_party?: UUID | null;
  interaction_type: CrmInteractionType;
  occurred_at: ISODateTime;
  subject?: string;
  summary?: string;
  follow_up_at?: ISODateTime | null;
}
