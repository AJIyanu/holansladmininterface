import { z } from "zod";

export const crmEntityKindSchema = z.enum([
  "ORGANISATION",
  "INDIVIDUAL",
  "TRADING_NAME",
]);

export const crmVerificationLevelSchema = z.enum([
  "MINIMAL",
  "BASIC",
  "VERIFIED",
]);

export const crmPartyRoleSchema = z.enum([
  "CLIENT",
  "SUPPLIER",
  "PROSPECT",
  "LOGISTICS_PROVIDER",
  "SERVICE_PROVIDER",
  "OTHER",
]);

export const crmContactMethodTypeSchema = z.enum([
  "EMAIL",
  "PHONE",
  "MOBILE",
  "WHATSAPP",
  "WEBSITE",
  "SOCIAL_MEDIA",
  "MARKETPLACE",
  "OTHER",
]);

export const crmAddressTypeSchema = z.enum([
  "REGISTERED",
  "OFFICE",
  "BILLING",
  "DELIVERY",
  "RESIDENTIAL",
  "MARKET",
  "OTHER",
]);

export const crmSourceTypeSchema = z.enum([
  "ONLINE_MARKETPLACE",
  "PHYSICAL_MARKET",
  "DIRECT_CONTACT",
  "REFERRAL",
  "WEBSITE",
  "SOCIAL_MEDIA",
  "PREVIOUS_TRANSACTION",
  "TRADE_DIRECTORY",
  "EVENT",
  "OTHER",
]);

const optionalTextSchema = z.string().trim().optional().or(z.literal(""));

const optionalUrlSchema = z
  .string()
  .trim()
  .url("Enter a valid URL.")
  .optional()
  .or(z.literal(""));

const optionalEmailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .optional()
  .or(z.literal(""));

export const crmContactMethodInputSchema = z.object({
  method_type: crmContactMethodTypeSchema,
  value: z.string().trim().min(1, "Contact value is required.").max(500),
  label: optionalTextSchema,
  is_primary: z.boolean().optional(),
  is_verified: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export const crmAddressInputSchema = z.object({
  address_type: crmAddressTypeSchema.optional(),
  label: optionalTextSchema,
  line_1: optionalTextSchema,
  line_2: optionalTextSchema,
  city: optionalTextSchema,
  state_region: optionalTextSchema,
  postal_code: optionalTextSchema,
  country_code: optionalTextSchema,
  location_notes: optionalTextSchema,
  is_primary: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export const crmPartySourceInputSchema = z.object({
  source_type: crmSourceTypeSchema,
  platform_name: optionalTextSchema,
  seller_name: optionalTextSchema,
  external_id: optionalTextSchema,
  profile_url: optionalUrlSchema,
  listing_url: optionalUrlSchema,
  market_name: optionalTextSchema,
  location_details: optionalTextSchema,
  referrer_name: optionalTextSchema,
  notes: optionalTextSchema,
  discovered_at: optionalTextSchema,
  is_primary: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export const crmOrganisationProfileInputSchema = z.object({
  legal_name: optionalTextSchema,
  trading_name: optionalTextSchema,
  website: optionalUrlSchema,
  industry: optionalTextSchema,
  business_description: optionalTextSchema,
  registration_country: optionalTextSchema,
  incorporation_date: optionalTextSchema.nullable(),
});

export const crmPersonProfileInputSchema = z.object({
  title: optionalTextSchema,
  first_name: optionalTextSchema,
  middle_name: optionalTextSchema,
  last_name: optionalTextSchema,
  preferred_name: optionalTextSchema,
});

export const crmPartyWriteSchema = z
  .object({
    display_name: z.string().trim().min(1, "Party name is required.").max(255),

    entity_kind: crmEntityKindSchema.default("ORGANISATION"),

    verification_level: crmVerificationLevelSchema.default("MINIMAL"),

    roles: z
      .array(crmPartyRoleSchema)
      .default([])
      .refine(
        (roles) => new Set(roles).size === roles.length,
        "A role cannot be selected more than once.",
      ),

    organisation_profile: crmOrganisationProfileInputSchema.optional(),

    person_profile: crmPersonProfileInputSchema.optional(),

    contact_methods: z.array(crmContactMethodInputSchema).default([]),

    addresses: z.array(crmAddressInputSchema).default([]),

    sources: z.array(crmPartySourceInputSchema).default([]),
  })
  .superRefine((value, context) => {
    if (value.entity_kind === "INDIVIDUAL" && value.organisation_profile) {
      context.addIssue({
        code: "custom",
        path: ["organisation_profile"],
        message: "An individual cannot have an organisation profile.",
      });
    }

    if (value.entity_kind !== "INDIVIDUAL" && value.person_profile) {
      context.addIssue({
        code: "custom",
        path: ["person_profile"],
        message:
          "An organisation or trading name cannot have a person profile.",
      });
    }
  });

export const crmQuickSupplierSchema = z
  .object({
    display_name: z
      .string()
      .trim()
      .min(1, "Supplier name is required.")
      .max(255),

    entity_kind: crmEntityKindSchema
      .exclude(["INDIVIDUAL"])
      .default("TRADING_NAME"),

    email: optionalEmailSchema,
    phone: optionalTextSchema,
    source_type: crmSourceTypeSchema.optional(),
    platform_name: optionalTextSchema,
    seller_name: optionalTextSchema,
    external_id: optionalTextSchema,
    profile_url: optionalUrlSchema,
    listing_url: optionalUrlSchema,
    market_name: optionalTextSchema,
    location_details: optionalTextSchema,
    referrer_name: optionalTextSchema,
    source_notes: optionalTextSchema,
  })
  .superRefine((value, context) => {
    const traceableValues = [
      value.email,
      value.phone,
      value.platform_name,
      value.external_id,
      value.profile_url,
      value.listing_url,
      value.market_name,
      value.location_details,
      value.referrer_name,
      value.source_notes,
    ];

    const hasTraceableValue = traceableValues.some((entry) =>
      Boolean(entry?.trim()),
    );

    if (!hasTraceableValue) {
      context.addIssue({
        code: "custom",
        path: ["source_notes"],
        message:
          "Provide at least one contact, marketplace, location, referral or source detail.",
      });
    }
  });

export const crmDuplicateCheckSchema = z.object({
  party_id: z.string().uuid().optional(),
  display_name: optionalTextSchema,
  entity_kind: crmEntityKindSchema.optional(),
  email: optionalEmailSchema,
  phone: optionalTextSchema,
  platform_name: optionalTextSchema,
  seller_name: optionalTextSchema,
  external_id: optionalTextSchema,
  profile_url: optionalUrlSchema,
  listing_url: optionalUrlSchema,
});

export const crmLifecycleSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Give a reason of at least three characters.")
    .max(2000),
});

export const crmMergeSchema = crmLifecycleSchema.extend({
  target_party: z.string().uuid("Select a valid target Party."),
});

export const crmPartyListQuerySchema = z.object({
  search: optionalTextSchema,
  role: z.array(crmPartyRoleSchema).optional(),
  entity_kind: crmEntityKindSchema.optional(),
  status: z
    .enum(["ACTIVE", "INACTIVE", "SUSPENDED", "BLOCKED", "MERGED"])
    .optional(),
  verification_level: crmVerificationLevelSchema.optional(),
  is_archived: z.boolean().optional(),
  has_email: z.boolean().optional(),
  has_phone: z.boolean().optional(),
  has_source: z.boolean().optional(),
  source_type: z.array(crmSourceTypeSchema).optional(),
  platform: optionalTextSchema,
  ordering: optionalTextSchema,
  page: z.number().int().positive().optional(),
  page_size: z.number().int().positive().max(100).optional(),
});

export const crmIdentifierTypeSchema = z.enum([
  "COMPANY_REGISTRATION",
  "TAX_ID",
  "VAT",
  "IMPORT_EXPORT",
  "MARKETPLACE_SELLER",
  "OTHER",
]);

export const crmIdentifierWriteSchema = z.object({
  party: z.string().uuid("Select a valid Party."),

  identifier_type: crmIdentifierTypeSchema,

  label: z.string().trim().max(150).optional().or(z.literal("")),

  value: z.string().trim().optional().or(z.literal("")),

  issuing_country: z.string().trim().max(2).optional().or(z.literal("")),

  issue_date: z.string().optional().or(z.literal("")).nullable(),

  expiry_date: z.string().optional().or(z.literal("")).nullable(),

  is_verified: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export type CrmIdentifierWriteValues = z.infer<typeof crmIdentifierWriteSchema>;

export type CrmPartyWriteValues = z.infer<typeof crmPartyWriteSchema>;

export type CrmQuickSupplierValues = z.infer<typeof crmQuickSupplierSchema>;

export type CrmDuplicateCheckValues = z.infer<typeof crmDuplicateCheckSchema>;

export const crmDocumentCategorySchema = z.enum([
  "REGISTRATION",
  "TAX",
  "BANK",
  "CONTRACT",
  "CORRESPONDENCE",
  "IDENTITY",
  "QUOTE",
  "OTHER",
]);

export const crmVerificationStatusSchema = z.enum([
  "UNVERIFIED",
  "PENDING",
  "VERIFIED",
  "REJECTED",
]);

export const crmDocumentUploadSchema = z.object({
  party: z.string().uuid("Select a valid Party."),

  category: crmDocumentCategorySchema.default("OTHER"),

  description: z.string().trim().max(2000).optional().or(z.literal("")),

  is_confidential: z.boolean().optional(),

  verification_status: crmVerificationStatusSchema.default("UNVERIFIED"),

  expires_at: z.string().optional().or(z.literal("")).nullable(),
});

export const crmDocumentUpdateSchema = z.object({
  description: z.string().trim().max(2000).optional().or(z.literal("")),

  is_confidential: z.boolean().optional(),

  verification_status: crmVerificationStatusSchema,

  expires_at: z.string().optional().or(z.literal("")).nullable(),
});

export type CrmDocumentUploadValues = z.infer<typeof crmDocumentUploadSchema>;

export type CrmDocumentUpdateValues = z.infer<typeof crmDocumentUpdateSchema>;

export const crmContactRoleWriteSchema = z.object({
  name: z.string().trim().min(1, "Contact role name is required.").max(100),

  slug: z
    .string()
    .trim()
    .max(120)
    .regex(
      /^[-a-zA-Z0-9_]+$/,
      "Slug can contain letters, numbers, hyphen and underscore only.",
    )
    .optional()
    .or(z.literal("")),

  description: z.string().trim().optional().or(z.literal("")),

  is_active: z.boolean().optional(),

  sort_order: z.number().int().min(0).max(32767).optional(),
});

export const crmInteractionTypeSchema = z.enum([
  "CALL",
  "EMAIL",
  "WHATSAPP",
  "MEETING",
  "MARKETPLACE_MESSAGE",
  "SITE_VISIT",
  "OTHER",
]);

export const crmInteractionWriteSchema = z.object({
  party: z.string().uuid("Select a valid Party."),

  contact_party: z
    .string()
    .uuid("Select a valid contact Party.")
    .optional()
    .or(z.literal(""))
    .nullable(),

  interaction_type: crmInteractionTypeSchema,

  occurred_at: z.string().min(1, "Interaction date and time is required."),

  subject: z.string().trim().max(255).optional().or(z.literal("")),

  summary: z.string().trim().max(5000).optional().or(z.literal("")),

  follow_up_at: z.string().optional().or(z.literal("")).nullable(),
});

export const crmAffiliationWriteSchema = z.object({
  person: z.string().uuid("Select a valid person."),

  organisation: z.string().uuid("Select a valid organisation."),

  job_title: z.string().trim().max(150).optional().or(z.literal("")),

  department: z.string().trim().max(150).optional().or(z.literal("")),

  start_date: z.string().optional().or(z.literal("")).nullable(),

  end_date: z.string().optional().or(z.literal("")).nullable(),

  is_current: z.boolean().optional(),

  is_primary_contact: z.boolean().optional(),

  notes: z.string().trim().optional().or(z.literal("")),

  contact_role_ids: z.array(z.string().uuid()).optional(),
});
