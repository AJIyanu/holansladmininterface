"use client";

import {
  useActionState,
} from "react";
import Link from "next/link";
import {
  useFormStatus,
} from "react-dom";
import {
  AlertTriangle,
  Loader2,
} from "lucide-react";

import {
  createCrmPartyAction,
  updateCrmPartyAction,
} from "@/features/crm/actions";

import {
  initialCrmPartyActionState,
} from "@/features/crm/action-states";
import {
  CRM_ENTITY_KIND_OPTIONS,
  CRM_PARTY_ROLE_OPTIONS,
  CRM_VERIFICATION_LEVEL_OPTIONS,
} from "@/features/crm/format";
import {
  CRM_ROUTES,
} from "@/features/crm/routes";

import type {
  CrmPartyDetail,
  CrmPartyRoleName,
} from "@/features/crm/types";

interface CrmPartyFormProps {
  mode: "create" | "edit";
  initialParty?: CrmPartyDetail;
}

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
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F46C0B] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#D95C06] disabled:cursor-not-allowed disabled:bg-[#FDBA74]"
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

function labelClass(): string {
  return "text-sm font-medium text-[#334155]";
}

export function CrmPartyForm({
  mode,
  initialParty,
}: CrmPartyFormProps) {
  const action =
    mode === "create"
      ? createCrmPartyAction
      : updateCrmPartyAction;

  const [state, formAction] = useActionState(
    action,
    initialCrmPartyActionState,
  );

  const activeRoles =
    initialParty?.roles
      .filter((role) => role.is_active)
      .map((role) => role.role) ?? [];

  const organisationProfile =
    initialParty?.organisation_profile ?? null;

  const personProfile =
    initialParty?.person_profile ?? null;

  const primaryEmail =
    initialParty?.contact_methods.find(
      (method) => method.method_type === "EMAIL" && method.is_primary,
    )?.value ??
    initialParty?.contact_methods.find(
      (method) => method.method_type === "EMAIL",
    )?.value ??
    "";

  const primaryPhone =
    initialParty?.contact_methods.find(
      (method) => method.method_type === "PHONE" && method.is_primary,
    )?.value ??
    initialParty?.contact_methods.find(
      (method) => method.method_type === "MOBILE" && method.is_primary,
    )?.value ??
    initialParty?.contact_methods.find(
      (method) =>
        method.method_type === "PHONE" ||
        method.method_type === "MOBILE",
    )?.value ??
    "";

  const primarySourceNotes =
    initialParty?.sources.find((source) => source.is_primary)
      ?.notes ??
    "";

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
                        href={CRM_ROUTES.partyDetail(match.party.id)}
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

      <section className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelClass()} htmlFor="display_name">
            Display name
          </label>
          <input
            id="display_name"
            name="display_name"
            required
            defaultValue={initialParty?.display_name ?? ""}
            className={`${textInputClass()} mt-1`}
            placeholder="e.g. ABC Marine Services Ltd"
          />
        </div>

        <div>
          <label className={labelClass()} htmlFor="entity_kind">
            Entity kind
          </label>
          <select
            id="entity_kind"
            name="entity_kind"
            defaultValue={
              initialParty?.entity_kind ?? "ORGANISATION"
            }
            className={`${textInputClass()} mt-1`}
          >
            {CRM_ENTITY_KIND_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className={labelClass()}
            htmlFor="verification_level"
          >
            Verification level
          </label>
          <select
            id="verification_level"
            name="verification_level"
            defaultValue={
              initialParty?.verification_level ?? "MINIMAL"
            }
            className={`${textInputClass()} mt-1`}
          >
            {CRM_VERIFICATION_LEVEL_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-[#0F172A]">
          Roles
        </h2>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CRM_PARTY_ROLE_OPTIONS.map((role) => (
            <label
              key={role.value}
              className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#334155]"
            >
              <input
                type="checkbox"
                name="roles"
                value={role.value}
                defaultChecked={activeRoles.includes(
                  role.value as CrmPartyRoleName,
                )}
                className="h-4 w-4 rounded border-[#CBD5E1] accent-[#F46C0B]"
              />
              {role.label}
            </label>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="text-base font-semibold text-[#0F172A]">
            Organisation details
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Used when the Party is an organisation or trading name.
          </p>
        </div>

        <div>
          <label className={labelClass()} htmlFor="legal_name">
            Legal name
          </label>
          <input
            id="legal_name"
            name="legal_name"
            defaultValue={organisationProfile?.legal_name ?? ""}
            className={`${textInputClass()} mt-1`}
          />
        </div>

        <div>
          <label className={labelClass()} htmlFor="trading_name">
            Trading name
          </label>
          <input
            id="trading_name"
            name="trading_name"
            defaultValue={organisationProfile?.trading_name ?? ""}
            className={`${textInputClass()} mt-1`}
          />
        </div>

        <div>
          <label className={labelClass()} htmlFor="website">
            Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            defaultValue={organisationProfile?.website ?? ""}
            className={`${textInputClass()} mt-1`}
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className={labelClass()} htmlFor="industry">
            Industry
          </label>
          <input
            id="industry"
            name="industry"
            defaultValue={organisationProfile?.industry ?? ""}
            className={`${textInputClass()} mt-1`}
          />
        </div>

        <div>
          <label
            className={labelClass()}
            htmlFor="registration_country"
          >
            Registration country
          </label>
          <input
            id="registration_country"
            name="registration_country"
            maxLength={2}
            defaultValue={
              organisationProfile?.registration_country ?? ""
            }
            className={`${textInputClass()} mt-1 uppercase`}
            placeholder="NG"
          />
        </div>

        <div>
          <label
            className={labelClass()}
            htmlFor="incorporation_date"
          >
            Incorporation date
          </label>
          <input
            id="incorporation_date"
            name="incorporation_date"
            type="date"
            defaultValue={
              organisationProfile?.incorporation_date ?? ""
            }
            className={`${textInputClass()} mt-1`}
          />
        </div>

        <div className="md:col-span-2">
          <label
            className={labelClass()}
            htmlFor="business_description"
          >
            Business description
          </label>
          <textarea
            id="business_description"
            name="business_description"
            rows={3}
            defaultValue={
              organisationProfile?.business_description ?? ""
            }
            className="mt-1 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="text-base font-semibold text-[#0F172A]">
            Person details
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Used when the Party is an individual.
          </p>
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

      <section className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="text-base font-semibold text-[#0F172A]">
            Basic contact and source
          </h2>
        </div>

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
          <label className={labelClass()} htmlFor="source_notes">
            Source notes
          </label>
          <textarea
            id="source_notes"
            name="source_notes"
            rows={3}
            defaultValue={primarySourceNotes}
            placeholder="How did HolanSL discover or verify this Party?"
            className="mt-1 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]"
          />
        </div>
      </section>

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