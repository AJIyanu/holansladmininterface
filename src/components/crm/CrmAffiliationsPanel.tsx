import Link from "next/link";
import {
  Building2,
  Plus,
  Save,
  Trash2,
  UserPlus,
  UserRound,
  XCircle,
} from "lucide-react";

import { hasPermission } from "@/types/auth";
import type { CurrentUser } from "@/types/auth";

import {
  createPersonUnderOrganisationAction,
  deleteCrmAffiliationAction,
  endCrmAffiliationAction,
  linkExistingPersonToOrganisationAction,
  linkIndividualToOrganisationAction,
  updateCrmAffiliationAction,
} from "@/features/crm/affiliation-actions";
import {
  CRM_PARTY_ROLE_OPTIONS,
  CRM_VERIFICATION_LEVEL_OPTIONS,
  formatCrmDate,
} from "@/features/crm/format";
import { CRM_PERMISSIONS } from "@/features/crm/permissions";
import { CRM_ROUTES } from "@/features/crm/routes";

import type {
  CrmContactRole,
  CrmPartyAffiliation,
  CrmPartyDetail,
  CrmPartyListItem,
} from "@/features/crm/types";

interface CrmAffiliationsPanelProps {
  party: CrmPartyDetail;
  user: CurrentUser;
  organisations: CrmPartyListItem[];
  individuals: CrmPartyListItem[];
  contactRoles: CrmContactRole[];
}

function fieldClass(): string {
  return "h-11 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]";
}

function textareaClass(): string {
  return "w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]";
}

function labelClass(): string {
  return "text-sm font-medium text-[#334155]";
}

// function ContactRoleSelect({
//   defaultRoleIds = [],
// }: {
//   defaultRoleIds?: string[];
// }) {
//   return (
//     <select
//       name="contact_role_ids"
//       defaultValue={defaultRoleIds[0] ?? ""}
//       className={fieldClass()}
//     >
//       <option value="">No contact role</option>

//       {defaultRoleIds.length > 0 &&
//       !defaultRoleIds[0] ? null : null}

//       {/* Browser select supports one role here. More roles can be added later with a multi-select UI. */}
//       {contactRolePlaceholder}
//     </select>
//   );
// }

/**
 * This placeholder is replaced by ContactRoleOptions in the panel render.
 * It avoids passing functions into nested server component helpers.
 */
// const contactRolePlaceholder = null;

function ContactRoleOptions({
  contactRoles,
}: {
  contactRoles: CrmContactRole[];
}) {
  return (
    <>
      {contactRoles
        .filter((role) => role.is_active)
        .map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
    </>
  );
}

function AffiliationFields({
  affiliation,
  contactRoles,
}: {
  affiliation?: CrmPartyAffiliation;
  contactRoles: CrmContactRole[];
}) {
  const defaultRoleId = affiliation?.contact_roles?.[0]?.id ?? "";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className={labelClass()}>Job title</label>

        <input
          name="job_title"
          defaultValue={affiliation?.job_title ?? ""}
          placeholder="Procurement Officer"
          className={`${fieldClass()} mt-1`}
        />
      </div>

      <div>
        <label className={labelClass()}>Department</label>

        <input
          name="department"
          defaultValue={affiliation?.department ?? ""}
          placeholder="Procurement"
          className={`${fieldClass()} mt-1`}
        />
      </div>

      <div>
        <label className={labelClass()}>Start date</label>

        <input
          name="start_date"
          type="date"
          defaultValue={affiliation?.start_date ?? ""}
          className={`${fieldClass()} mt-1`}
        />
      </div>

      <div>
        <label className={labelClass()}>Contact role</label>

        <select
          name="contact_role_ids"
          defaultValue={defaultRoleId}
          className={`${fieldClass()} mt-1`}
        >
          <option value="">No contact role</option>
          <ContactRoleOptions contactRoles={contactRoles} />
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-[#334155]">
        <input
          type="checkbox"
          name="is_current"
          defaultChecked={affiliation?.is_current ?? true}
          className="h-4 w-4 rounded border-[#CBD5E1] accent-[#F46C0B]"
        />
        Current affiliation
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-[#334155]">
        <input
          type="checkbox"
          name="is_primary_contact"
          defaultChecked={affiliation?.is_primary_contact ?? false}
          className="h-4 w-4 rounded border-[#CBD5E1] accent-[#F46C0B]"
        />
        Primary contact
      </label>

      <div className="md:col-span-2">
        <label className={labelClass()}>Notes</label>

        <textarea
          name="notes"
          rows={3}
          defaultValue={affiliation?.notes ?? ""}
          placeholder="Notes about this relationship."
          className={`${textareaClass()} mt-1`}
        />
      </div>
    </div>
  );
}

function RoleCheckboxes() {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {CRM_PARTY_ROLE_OPTIONS.map((role) => (
        <label
          key={role.value}
          className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#334155]"
        >
          <input
            type="checkbox"
            name="roles"
            value={role.value}
            className="h-4 w-4 rounded border-[#CBD5E1] accent-[#F46C0B]"
          />
          {role.label}
        </label>
      ))}
    </div>
  );
}

function VerificationSelect() {
  return (
    <select
      name="verification_level"
      defaultValue="MINIMAL"
      className={fieldClass()}
    >
      {CRM_VERIFICATION_LEVEL_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function AffiliationCard({
  affiliation,
  returnPartyId,
  contactRoles,
  canEdit,
  canDelete,
}: {
  affiliation: CrmPartyAffiliation;
  returnPartyId: string;
  contactRoles: CrmContactRole[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  return (
    <article className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={CRM_ROUTES.partyDetail(affiliation.person)}
              className="font-semibold text-[#0F172A] hover:text-[#F46C0B]"
            >
              {affiliation.person_name}
            </Link>

            <span className="text-sm text-[#64748B]">↔</span>

            <Link
              href={CRM_ROUTES.partyDetail(affiliation.organisation)}
              className="font-semibold text-[#0F4C81] hover:text-[#F46C0B]"
            >
              {affiliation.organisation_name}
            </Link>
          </div>

          <p className="mt-2 text-sm text-[#475569]">
            {affiliation.job_title || "No job title"} ·{" "}
            {affiliation.department || "No department"}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {affiliation.contact_roles.map((role) => (
              <span
                key={role.id}
                className="rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-[#1D4ED8]"
              >
                {role.name}
              </span>
            ))}

            {affiliation.is_primary_contact ? (
              <span className="rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2.5 py-1 text-xs font-semibold text-[#166534]">
                Primary contact
              </span>
            ) : null}

            <span
              className={
                affiliation.is_current
                  ? "rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2.5 py-1 text-xs font-semibold text-[#166534]"
                  : "rounded-full border border-[#CBD5E1] bg-[#F1F5F9] px-2.5 py-1 text-xs font-semibold text-[#475569]"
              }
            >
              {affiliation.is_current ? "Current" : "Ended"}
            </span>
          </div>

          <p className="mt-3 text-xs text-[#64748B]">
            Start: {formatCrmDate(affiliation.start_date)} · End:{" "}
            {formatCrmDate(affiliation.end_date)}
          </p>

          {affiliation.notes ? (
            <p className="mt-3 text-sm leading-6 text-[#475569]">
              {affiliation.notes}
            </p>
          ) : null}
        </div>
      </div>

      {canEdit ? (
        <details className="mt-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[#0F4C81]">
            Edit affiliation
          </summary>

          <form action={updateCrmAffiliationAction} className="mt-4 space-y-4">
            <input type="hidden" name="affiliation_id" value={affiliation.id} />
            <input type="hidden" name="person_id" value={affiliation.person} />
            <input
              type="hidden"
              name="organisation_id"
              value={affiliation.organisation}
            />
            <input type="hidden" name="return_party_id" value={returnPartyId} />

            <AffiliationFields
              affiliation={affiliation}
              contactRoles={contactRoles}
            />

            <div className="flex flex-wrap justify-end gap-2 border-t border-[#E2E8F0] pt-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-[#0F4C81] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B3A63]"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </form>

          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <form action={endCrmAffiliationAction}>
              <input
                type="hidden"
                name="affiliation_id"
                value={affiliation.id}
              />
              <input
                type="hidden"
                name="person_id"
                value={affiliation.person}
              />
              <input
                type="hidden"
                name="organisation_id"
                value={affiliation.organisation}
              />
              <input
                type="hidden"
                name="return_party_id"
                value={returnPartyId}
              />

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg border border-[#FED7AA] px-4 py-2 text-sm font-semibold text-[#C2410C] hover:bg-[#FFF7ED]"
              >
                <XCircle className="h-4 w-4" />
                End affiliation
              </button>
            </form>

            {canDelete ? (
              <form action={deleteCrmAffiliationAction}>
                <input
                  type="hidden"
                  name="affiliation_id"
                  value={affiliation.id}
                />
                <input
                  type="hidden"
                  name="person_id"
                  value={affiliation.person}
                />
                <input
                  type="hidden"
                  name="organisation_id"
                  value={affiliation.organisation}
                />
                <input
                  type="hidden"
                  name="return_party_id"
                  value={returnPartyId}
                />

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#FECACA] px-4 py-2 text-sm font-semibold text-[#B91C1C] hover:bg-[#FEF2F2]"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete link
                </button>
              </form>
            ) : null}
          </div>
        </details>
      ) : null}
    </article>
  );
}

export function CrmAffiliationsPanel({
  party,
  user,
  organisations,
  individuals,
  contactRoles,
}: CrmAffiliationsPanelProps) {
  const canView = hasPermission(user, CRM_PERMISSIONS.affiliation.view);

  const canCreate = hasPermission(user, CRM_PERMISSIONS.affiliation.create);

  const canEdit = hasPermission(user, CRM_PERMISSIONS.affiliation.edit);

  const canDelete = hasPermission(user, CRM_PERMISSIONS.affiliation.delete);

  if (!canView) {
    return null;
  }

  const isIndividual = party.entity_kind === "INDIVIDUAL";
  const isOrganisationLike =
    party.entity_kind === "ORGANISATION" ||
    party.entity_kind === "TRADING_NAME";

  const relevantAffiliations = isIndividual
    ? party.organisation_affiliations
    : party.people_affiliations;

  return (
    <section className="space-y-5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 shadow-sm">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#F46C0B]">
          Relationships
        </p>

        <h2 className="mt-1 text-xl font-bold text-[#0F172A]">
          {isIndividual ? "Affiliated organisations" : "Organisation contacts"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#64748B]">
          {isIndividual
            ? "See and manage the organisations this individual belongs to."
            : "See and manage the individual contacts linked to this organisation or trading profile."}
        </p>
      </header>

      <div className="grid gap-4">
        {relevantAffiliations.map((affiliation) => (
          <AffiliationCard
            key={affiliation.id}
            affiliation={affiliation}
            returnPartyId={party.id}
            contactRoles={contactRoles}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        ))}

        {relevantAffiliations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center text-sm text-[#64748B]">
            {isIndividual
              ? "This individual is not linked to any organisation yet."
              : "No individual contacts are linked yet."}
          </div>
        ) : null}
      </div>

      {canCreate && isOrganisationLike ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <details className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
            <summary className="cursor-pointer font-semibold text-[#0F4C81]">
              <span className="inline-flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Link existing person
              </span>
            </summary>

            <form
              action={linkExistingPersonToOrganisationAction}
              className="mt-5 space-y-4"
            >
              <input type="hidden" name="organisation_id" value={party.id} />

              <div>
                <label className={labelClass()}>Existing individual</label>

                <select
                  name="person_id"
                  required
                  className={`${fieldClass()} mt-1`}
                >
                  <option value="">Select person</option>
                  {individuals.map((individual) => (
                    <option key={individual.id} value={individual.id}>
                      {individual.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <AffiliationFields contactRoles={contactRoles} />

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-[#F46C0B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D95C06]"
              >
                <Plus className="h-4 w-4" />
                Link person
              </button>
            </form>
          </details>

          <details className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
            <summary className="cursor-pointer font-semibold text-[#0F4C81]">
              <span className="inline-flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                Create new contact person
              </span>
            </summary>

            <form
              action={createPersonUnderOrganisationAction}
              className="mt-5 space-y-5"
            >
              <input type="hidden" name="organisation_id" value={party.id} />

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="title"
                  placeholder="Title"
                  className={fieldClass()}
                />

                <input
                  name="first_name"
                  required
                  placeholder="First name"
                  className={fieldClass()}
                />

                <input
                  name="middle_name"
                  placeholder="Middle name"
                  className={fieldClass()}
                />

                <input
                  name="last_name"
                  placeholder="Last name"
                  className={fieldClass()}
                />

                <input
                  name="preferred_name"
                  placeholder="Preferred name"
                  className={fieldClass()}
                />

                <input
                  name="display_name"
                  placeholder="Display name"
                  className={fieldClass()}
                />

                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className={fieldClass()}
                />

                <input
                  name="phone"
                  placeholder="Phone"
                  className={fieldClass()}
                />

                <input
                  name="whatsapp"
                  placeholder="WhatsApp"
                  className={fieldClass()}
                />

                <VerificationSelect />
              </div>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-[#0F172A]">
                  Person role
                </h3>

                <RoleCheckboxes />
              </section>

              <AffiliationFields contactRoles={contactRoles} />

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-[#F46C0B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D95C06]"
              >
                <Plus className="h-4 w-4" />
                Create and link person
              </button>
            </form>
          </details>
        </div>
      ) : null}

      {canCreate && isIndividual ? (
        <details className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
          <summary className="cursor-pointer font-semibold text-[#0F4C81]">
            <span className="inline-flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Link this individual to an organisation
            </span>
          </summary>

          <form
            action={linkIndividualToOrganisationAction}
            className="mt-5 space-y-4"
          >
            <input type="hidden" name="person_id" value={party.id} />

            <div>
              <label className={labelClass()}>Organisation</label>

              <select
                name="organisation_id"
                required
                className={`${fieldClass()} mt-1`}
              >
                <option value="">Select organisation</option>

                {organisations.map((organisation) => (
                  <option key={organisation.id} value={organisation.id}>
                    {organisation.display_name}
                  </option>
                ))}
              </select>
            </div>

            <AffiliationFields contactRoles={contactRoles} />

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-[#F46C0B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D95C06]"
            >
              <Plus className="h-4 w-4" />
              Link organisation
            </button>
          </form>
        </details>
      ) : null}
    </section>
  );
}
