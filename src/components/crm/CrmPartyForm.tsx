"use client";

import {
  useActionState,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  useFormStatus,
} from "react-dom";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Loader2,
  Store,
  UserRound,
} from "lucide-react";

import {
  createCrmPartyAction,
  updateCrmPartyAction,
} from "@/features/crm/actions";
import {
  initialCrmPartyActionState,
} from "@/features/crm/action-states";
import {
  CRM_PARTY_ROLE_OPTIONS,
  CRM_VERIFICATION_LEVEL_OPTIONS,
} from "@/features/crm/format";
import {
  CRM_ROUTES,
} from "@/features/crm/routes";

import type {
  CrmContactRole,
  CrmPartyDetail,
  CrmPartyListItem,
} from "@/features/crm/types";

interface CrmPartyFormProps {
  mode: "create" | "edit";
  initialParty?: CrmPartyDetail;
  organisations?: CrmPartyListItem[];
  contactRoles?: CrmContactRole[];
  defaultCreateMode?: CreateMode;
  defaultRoles?: string[];
  defaultAffiliationMode?: AffiliationMode;
  defaultOrganisationId?: string;
}

type CreateMode =
  | "INDIVIDUAL"
  | "ORGANISATION"
  | "TRADING_NAME";

type AffiliationMode =
  | "NONE"
  | "EXISTING_ORGANISATION"
  | "CREATE_ORGANISATION";

function SubmitButton({
  mode,
}: {
  mode: "create" | "edit";
}) {
  const status = useFormStatus();

  return (
    <button
      type="submit"
      disabled={status.pending}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F46C0B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D95C06] disabled:cursor-not-allowed disabled:bg-[#FDBA74]"
    >
      {status.pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : null}
      {mode === "create" ? "Create Party" : "Save Changes"}
    </button>
  );
}

function textInputClass(): string {
  return "h-11 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]";
}

function textareaClass(): string {
  return "w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]";
}

function labelClass(): string {
  return "text-sm font-medium text-[#334155]";
}

function ModeCard({
  active,
  title,
  description,
  icon,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? "border-[#F46C0B] bg-[#FFF7ED] shadow-sm"
          : "border-[#E2E8F0] bg-white hover:border-[#FED7AA] hover:bg-[#FFF7ED]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            active
              ? "bg-[#F46C0B] text-white"
              : "bg-[#F8FAFC] text-[#475569]"
          }`}
        >
          {icon}
        </div>

        <div>
          <p className="font-semibold text-[#0F172A]">
            {title}
          </p>

          <p className="mt-1 text-sm leading-6 text-[#64748B]">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

function RoleCheckboxes({
  name = "roles",
  activeRoles,
  
}: {
  name?: string;
  activeRoles?: string[];
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {CRM_PARTY_ROLE_OPTIONS.map((role) => (
        <label
          key={`${name}-${role.value}`}
          className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#334155]"
        >
          <input
            type="checkbox"
            name={name}
            value={role.value}
            defaultChecked={activeRoles?.includes(role.value)}
            className="h-4 w-4 rounded border-[#CBD5E1] accent-[#F46C0B]"
          />
          {role.label}
        </label>
      ))}
    </div>
  );
}

function VerificationSelect({
  name = "verification_level",
  defaultValue = "MINIMAL",
}: {
  name?: string;
  defaultValue?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className={textInputClass()}
    >
      {CRM_VERIFICATION_LEVEL_OPTIONS.map((option) => (
        <option
          key={`${name}-${option.value}`}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}

function SourceFields({
  prefix = "",
  marketplace = false,
}: {
  prefix?: string;
  marketplace?: boolean;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <h2 className="text-base font-semibold text-[#0F172A]">
          Source / traceability
        </h2>

        <p className="mt-1 text-sm text-[#64748B]">
          Record where this Party came from, especially for
          online sellers or market suppliers.
        </p>
      </div>

      <div>
        <label
          className={labelClass()}
          htmlFor={`${prefix}source_type`}
        >
          Source type
        </label>

        <select
          id={`${prefix}source_type`}
          name={`${prefix}source_type`}
          defaultValue={
            marketplace ? "ONLINE_MARKETPLACE" : "DIRECT_CONTACT"
          }
          className={`${textInputClass()} mt-1`}
        >
          <option value="DIRECT_CONTACT">Direct contact</option>
          <option value="ONLINE_MARKETPLACE">
            Online marketplace
          </option>
          <option value="PHYSICAL_MARKET">Physical market</option>
          <option value="REFERRAL">Referral</option>
          <option value="WEBSITE">Website</option>
          <option value="SOCIAL_MEDIA">Social media</option>
          <option value="TRADE_DIRECTORY">
            Trade directory
          </option>
          <option value="PREVIOUS_TRANSACTION">
            Previous transaction
          </option>
          <option value="EVENT">Event</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div>
        <label
          className={labelClass()}
          htmlFor={`${prefix}platform_name`}
        >
          Platform name
        </label>

        <input
          id={`${prefix}platform_name`}
          name={`${prefix}platform_name`}
          placeholder="Jumia, eBay, Amazon, Instagram"
          className={`${textInputClass()} mt-1`}
        />
      </div>

      <input
        name={`${prefix}seller_name`}
        placeholder="Seller name"
        className={textInputClass()}
      />

      <input
        name={`${prefix}external_id`}
        placeholder="Seller ID / external reference"
        className={textInputClass()}
      />

      <input
        name={`${prefix}profile_url`}
        placeholder="Profile URL"
        className={textInputClass()}
      />

      <input
        name={`${prefix}listing_url`}
        placeholder="Listing URL"
        className={textInputClass()}
      />

      <input
        name={`${prefix}market_name`}
        placeholder="Market name"
        className={textInputClass()}
      />

      <input
        name={`${prefix}location_details`}
        placeholder="Location details"
        className={textInputClass()}
      />

      <div className="md:col-span-2">
        <textarea
          name={`${prefix}source_notes`}
          rows={3}
          placeholder="Notes about how this Party was found or verified."
          className={textareaClass()}
        />
      </div>
    </section>
  );
}

function CommonContactFields({
  prefix = "",
}: {
  prefix?: string;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <h2 className="text-base font-semibold text-[#0F172A]">
          Contact details
        </h2>
      </div>

      <input
        name={`${prefix}email`}
        type="email"
        placeholder="Email"
        className={textInputClass()}
      />

      <input
        name={`${prefix}phone`}
        placeholder="Phone / support phone"
        className={textInputClass()}
      />

      <input
        name={`${prefix}whatsapp`}
        placeholder="WhatsApp"
        className={textInputClass()}
      />

      <input
        name={`${prefix}website`}
        placeholder="Website"
        className={textInputClass()}
      />
    </section>
  );
}

function OrganisationProfileFields({
  prefix = "",
  title = "Organisation profile",
}: {
  prefix?: string;
  title?: string;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <h2 className="text-base font-semibold text-[#0F172A]">
          {title}
        </h2>
      </div>

      <input
        name={`${prefix}display_name`}
        required
        placeholder="Display name"
        className={textInputClass()}
      />

      <input
        name={`${prefix}legal_name`}
        placeholder="Legal name"
        className={textInputClass()}
      />

      <input
        name={`${prefix}trading_name`}
        placeholder="Trading name"
        className={textInputClass()}
      />

      <input
        name={`${prefix}industry`}
        placeholder="Industry"
        className={textInputClass()}
      />

      <input
        name={`${prefix}registration_country`}
        maxLength={2}
        placeholder="Registration country, e.g. NG"
        className={`${textInputClass()} uppercase`}
      />

      <input
        name={`${prefix}incorporation_date`}
        type="date"
        className={textInputClass()}
      />

      <div className="md:col-span-2">
        <textarea
          name={`${prefix}business_description`}
          rows={3}
          placeholder="Business description"
          className={textareaClass()}
        />
      </div>
    </section>
  );
}

function EditModeFields({
  initialParty,
}: {
  initialParty: CrmPartyDetail;
}) {
  const activeRoles = initialParty.roles
    .filter((role) => role.is_active)
    .map((role) => role.role);

  const organisationProfile =
    initialParty.organisation_profile ?? null;

  const personProfile = initialParty.person_profile ?? null;

  const primaryEmail =
    initialParty.contact_methods.find(
      (method) =>
        method.method_type === "EMAIL" && method.is_primary,
    )?.value ??
    initialParty.contact_methods.find(
      (method) => method.method_type === "EMAIL",
    )?.value ??
    "";

  const primaryPhone =
    initialParty.contact_methods.find(
      (method) =>
        method.method_type === "PHONE" && method.is_primary,
    )?.value ??
    initialParty.contact_methods.find(
      (method) =>
        method.method_type === "MOBILE" && method.is_primary,
    )?.value ??
    initialParty.contact_methods.find(
      (method) =>
        method.method_type === "PHONE" ||
        method.method_type === "MOBILE",
    )?.value ??
    "";

  const primarySourceNotes =
    initialParty.sources.find((source) => source.is_primary)
      ?.notes ?? "";

  return (
    <>
      <input
        type="hidden"
        name="entity_kind"
        value={initialParty.entity_kind}
      />

      <section className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass()} htmlFor="display_name">
            Display name
          </label>

          <input
            id="display_name"
            name="display_name"
            required
            defaultValue={initialParty.display_name}
            className={`${textInputClass()} mt-1`}
          />
        </div>

        <div>
          <label
            className={labelClass()}
            htmlFor="verification_level"
          >
            Verification level
          </label>

          <div className="mt-1">
            <VerificationSelect
              defaultValue={initialParty.verification_level}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[#0F172A]">
          Roles
        </h2>

        <RoleCheckboxes activeRoles={activeRoles} />
      </section>

      {initialParty.entity_kind === "INDIVIDUAL" ? (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <h2 className="text-base font-semibold text-[#0F172A]">
              Person details
            </h2>
          </div>

          <input
            name="title"
            defaultValue={personProfile?.title ?? ""}
            placeholder="Title"
            className={textInputClass()}
          />

          <input
            name="first_name"
            defaultValue={personProfile?.first_name ?? ""}
            placeholder="First name"
            className={textInputClass()}
          />

          <input
            name="middle_name"
            defaultValue={personProfile?.middle_name ?? ""}
            placeholder="Middle name"
            className={textInputClass()}
          />

          <input
            name="last_name"
            defaultValue={personProfile?.last_name ?? ""}
            placeholder="Last name"
            className={textInputClass()}
          />

          <input
            name="preferred_name"
            defaultValue={personProfile?.preferred_name ?? ""}
            placeholder="Preferred name"
            className={`${textInputClass()} md:col-span-2`}
          />
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <h2 className="text-base font-semibold text-[#0F172A]">
              Organisation / trading name details
            </h2>
          </div>

          <input
            name="legal_name"
            defaultValue={organisationProfile?.legal_name ?? ""}
            placeholder="Legal name"
            className={textInputClass()}
          />

          <input
            name="trading_name"
            defaultValue={
              organisationProfile?.trading_name ?? ""
            }
            placeholder="Trading name"
            className={textInputClass()}
          />

          <input
            name="website"
            defaultValue={organisationProfile?.website ?? ""}
            placeholder="Website"
            className={textInputClass()}
          />

          <input
            name="industry"
            defaultValue={organisationProfile?.industry ?? ""}
            placeholder="Industry"
            className={textInputClass()}
          />

          <input
            name="registration_country"
            defaultValue={
              organisationProfile?.registration_country ?? ""
            }
            maxLength={2}
            placeholder="Registration country"
            className={`${textInputClass()} uppercase`}
          />

          <input
            name="incorporation_date"
            type="date"
            defaultValue={
              organisationProfile?.incorporation_date ?? ""
            }
            className={textInputClass()}
          />

          <div className="md:col-span-2">
            <textarea
              name="business_description"
              rows={3}
              defaultValue={
                organisationProfile?.business_description ?? ""
              }
              placeholder="Business description"
              className={textareaClass()}
            />
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass()} htmlFor="email">
            Primary email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            defaultValue={primaryEmail}
            className={`${textInputClass()} mt-1`}
          />
        </div>

        <div>
          <label className={labelClass()} htmlFor="phone">
            Primary phone
          </label>

          <input
            id="phone"
            name="phone"
            defaultValue={primaryPhone}
            className={`${textInputClass()} mt-1`}
          />
        </div>

        <div className="md:col-span-2">
          <label
            className={labelClass()}
            htmlFor="source_notes"
          >
            Source notes
          </label>

          <textarea
            id="source_notes"
            name="source_notes"
            rows={3}
            defaultValue={primarySourceNotes}
            className={`${textareaClass()} mt-1`}
          />
        </div>
      </section>
    </>
  );
}

export function CrmPartyForm({
  mode,
  initialParty,
  organisations = [],
  contactRoles = [],
  defaultCreateMode = "INDIVIDUAL",
  defaultRoles = [],
  defaultAffiliationMode = "NONE",
  defaultOrganisationId,
}: CrmPartyFormProps) {
  const action =
    mode === "create"
      ? createCrmPartyAction
      : updateCrmPartyAction;

  const [state, formAction] = useActionState(
    action,
    initialCrmPartyActionState,
  );

  const [createMode, setCreateMode] =
  useState<CreateMode>(defaultCreateMode);

const [affiliationMode, setAffiliationMode] =
  useState<AffiliationMode>(
    defaultOrganisationId
      ? "EXISTING_ORGANISATION"
      : defaultAffiliationMode,
  );

  const defaultIndividualDisplayName = useMemo(
    () => createMode === "INDIVIDUAL",
    [createMode],
  );

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6"
    >
      {initialParty ? (
        <input
          type="hidden"
          name="party_id"
          value={initialParty.id}
        />
      ) : null}

      {state.message ? (
        <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626]" />

            <div>
              <p className="text-sm font-semibold text-[#991B1B]">
                {state.message}
              </p>

              {state.duplicateMatches?.length ? (
                <ul className="mt-3 space-y-2 text-sm text-[#7F1D1D]">
                  {state.duplicateMatches.map((match) => (
                    <li key={match.party.id}>
                      Existing Party:{" "}
                      <Link
                        href={CRM_ROUTES.partyDetail(
                          match.party.id,
                        )}
                        className="font-semibold underline"
                      >
                        {match.party.display_name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {mode === "edit" && initialParty ? (
        <EditModeFields initialParty={initialParty} />
      ) : (
        <>
          <input
            type="hidden"
            name="create_mode"
            value={createMode}
          />

          <input
            type="hidden"
            name="affiliation_mode"
            value={affiliationMode}
          />

          <section className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#F46C0B]">
                Create Party
              </p>

              <h2 className="mt-1 text-xl font-bold text-[#0F172A]">
                What are you creating?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                Start with an individual by default, or create an
                organisation / marketplace trading profile directly.
              </p>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              <ModeCard
                active={createMode === "INDIVIDUAL"}
                title="Individual"
                description="A person such as Tunde from Coca-Cola, Bukola, or Charles in the local market."
                icon={<UserRound className="h-5 w-5" />}
                onClick={() => {
                  setCreateMode("INDIVIDUAL");
                }}
              />

              <ModeCard
                active={createMode === "ORGANISATION"}
                title="Organisation"
                description="A company such as Coca-Cola, a client company, or a supplier company."
                icon={<Building2 className="h-5 w-5" />}
                onClick={() => {
                  setCreateMode("ORGANISATION");
                  setAffiliationMode("NONE");
                }}
              />

              <ModeCard
                active={createMode === "TRADING_NAME"}
                title="Trading name / marketplace"
                description="An online seller, market trader, store name, Jumia/eBay/Amazon profile, or informal business."
                icon={<Store className="h-5 w-5" />}
                onClick={() => {
                  setCreateMode("TRADING_NAME");
                  setAffiliationMode("NONE");
                }}
              />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-[#0F172A]">
              Role
            </h2>

            <RoleCheckboxes activeRoles={defaultRoles} />
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                className={labelClass()}
                htmlFor="verification_level"
              >
                Verification level
              </label>

              <div className="mt-1">
                <VerificationSelect />
              </div>
            </div>
          </section>

          {createMode === "INDIVIDUAL" ? (
            <>
              <section className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <h2 className="text-base font-semibold text-[#0F172A]">
                    Individual profile
                  </h2>
                </div>

                <input
                  name="title"
                  placeholder="Title"
                  className={textInputClass()}
                />

                <input
                  name="first_name"
                  required
                  placeholder="First name"
                  className={textInputClass()}
                />

                <input
                  name="middle_name"
                  placeholder="Middle name"
                  className={textInputClass()}
                />

                <input
                  name="last_name"
                  placeholder="Last name"
                  className={textInputClass()}
                />

                <input
                  name="preferred_name"
                  placeholder="Preferred name"
                  className={textInputClass()}
                />

                <input
                  name="display_name"
                  placeholder={
                    defaultIndividualDisplayName
                      ? "Display name, optional if first/last name is enough"
                      : "Display name"
                  }
                  className={textInputClass()}
                />
              </section>

              <CommonContactFields />

              <section className="space-y-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div>
                  <h2 className="text-base font-semibold text-[#0F172A]">
                    Organisation relationship
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-[#64748B]">
                    Link this person to an organisation now, or
                    leave them as an independent individual.
                  </p>
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setAffiliationMode("NONE")}
                    className={`rounded-xl border p-4 text-left text-sm ${
                      affiliationMode === "NONE"
                        ? "border-[#F46C0B] bg-[#FFF7ED] text-[#9A3412]"
                        : "border-[#E2E8F0] bg-white text-[#334155]"
                    }`}
                  >
                    <CheckCircle2 className="mb-2 h-5 w-5" />
                    No organisation
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAffiliationMode(
                        "EXISTING_ORGANISATION",
                      )
                    }
                    className={`rounded-xl border p-4 text-left text-sm ${
                      affiliationMode ===
                      "EXISTING_ORGANISATION"
                        ? "border-[#F46C0B] bg-[#FFF7ED] text-[#9A3412]"
                        : "border-[#E2E8F0] bg-white text-[#334155]"
                    }`}
                  >
                    <Building2 className="mb-2 h-5 w-5" />
                    Link existing organisation
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAffiliationMode("CREATE_ORGANISATION")
                    }
                    className={`rounded-xl border p-4 text-left text-sm ${
                      affiliationMode === "CREATE_ORGANISATION"
                        ? "border-[#F46C0B] bg-[#FFF7ED] text-[#9A3412]"
                        : "border-[#E2E8F0] bg-white text-[#334155]"
                    }`}
                  >
                    <Building2 className="mb-2 h-5 w-5" />
                    Create organisation and link
                  </button>
                </div>

                {affiliationMode ===
                "EXISTING_ORGANISATION" ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label
                        className={labelClass()}
                        htmlFor="existing_organisation_id"
                      >
                        Existing organisation
                      </label>

                      <select
                          id="existing_organisation_id"
                          name="existing_organisation_id"
                          required={
                            affiliationMode ===
                            "EXISTING_ORGANISATION"
                          }
                          defaultValue={defaultOrganisationId ?? ""}
                          className={`${textInputClass()} mt-1`}
                        >
                        <option value="">
                          Select organisation
                        </option>

                        {organisations.map((party) => (
                          <option
                            key={party.id}
                            value={party.id}
                          >
                            {party.display_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : null}

                {affiliationMode ===
                "CREATE_ORGANISATION" ? (
                  <div className="space-y-5 rounded-xl border border-[#FED7AA] bg-white p-4">
                    <OrganisationProfileFields
                      prefix="new_org_"
                      title="New organisation profile"
                    />

                    <CommonContactFields prefix="new_org_" />

                    <section className="space-y-3">
                      <h3 className="text-sm font-semibold text-[#0F172A]">
                        Organisation role
                      </h3>

                      <RoleCheckboxes activeRoles={defaultRoles} name="new_org_roles" />
                    </section>

                    <input
                      type="hidden"
                      name="new_org_verification_level"
                      value="MINIMAL"
                    />
                  </div>
                ) : null}

                {affiliationMode !== "NONE" ? (
                  <div className="grid gap-4 border-t border-[#E2E8F0] pt-4 md:grid-cols-2">
                    <input
                      name="aff_job_title"
                      placeholder="Job title, e.g. Procurement Officer"
                      className={textInputClass()}
                    />

                    <input
                      name="aff_department"
                      placeholder="Department, e.g. Procurement"
                      className={textInputClass()}
                    />

                    <input
                      name="aff_start_date"
                      type="date"
                      className={textInputClass()}
                    />

                    <select
                      name="contact_role_ids"
                      className={textInputClass()}
                    >
                      <option value="">
                        Select contact role
                      </option>

                      {contactRoles
                        .filter((role) => role.is_active)
                        .map((role) => (
                          <option
                            key={role.id}
                            value={role.id}
                          >
                            {role.name}
                          </option>
                        ))}
                    </select>

                    <label className="flex items-center gap-2 text-sm font-medium text-[#334155]">
                      <input
                        type="checkbox"
                        name="aff_is_primary_contact"
                        className="h-4 w-4 rounded border-[#CBD5E1] accent-[#F46C0B]"
                      />
                      Primary contact for this organisation
                    </label>

                    <div className="md:col-span-2">
                      <textarea
                        name="aff_notes"
                        rows={3}
                        placeholder="Affiliation notes"
                        className={textareaClass()}
                      />
                    </div>
                  </div>
                ) : null}
              </section>

              <SourceFields />
            </>
          ) : null}

          {createMode === "ORGANISATION" ? (
            <>
              <OrganisationProfileFields />
              <CommonContactFields />
              <SourceFields />
            </>
          ) : null}

          {createMode === "TRADING_NAME" ? (
            <>
              <section className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <h2 className="text-base font-semibold text-[#0F172A]">
                    Trading name / marketplace profile
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-[#64748B]">
                    Use this for Jumia, eBay, Amazon, Instagram,
                    local market sellers, or informal trading
                    profiles where a registered organisation or
                    named person is not needed.
                  </p>
                </div>

                <input
                  name="display_name"
                  required
                  placeholder="Display name"
                  className={textInputClass()}
                />

                <input
                  name="trading_name"
                  placeholder="Trading name / store name"
                  className={textInputClass()}
                />

                <input
                  name="legal_name"
                  placeholder="Legal name, if known"
                  className={textInputClass()}
                />

                <input
                  name="industry"
                  placeholder="Industry/category"
                  className={textInputClass()}
                />

                <div className="md:col-span-2">
                  <textarea
                    name="business_description"
                    rows={3}
                    placeholder="What does this seller or trading name supply?"
                    className={textareaClass()}
                  />
                </div>
              </section>

              <CommonContactFields />
              <SourceFields marketplace />
            </>
          ) : null}
        </>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] pt-5 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href={
            initialParty
              ? CRM_ROUTES.partyDetail(initialParty.id)
              : CRM_ROUTES.parties
          }
          className="inline-flex justify-center rounded-lg border border-[#CBD5E1] px-5 py-2.5 text-sm font-semibold text-[#334155] transition hover:border-[#F46C0B] hover:text-[#F46C0B]"
        >
          Cancel
        </Link>

        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}