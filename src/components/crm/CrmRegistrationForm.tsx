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
  createCrmRegistrationAction,
  updateCrmRegistrationAction,
} from "@/features/crm/registration-actions";

import {
  initialCrmRegistrationActionState,
} from "@/features/crm/action-states";
import {
  CRM_IDENTIFIER_TYPE_OPTIONS,
} from "@/features/crm/format";
import {
  CRM_ROUTES,
} from "@/features/crm/routes";

import type {
  CrmPartyIdentifier,
  CrmPartyListItem,
} from "@/features/crm/types";

interface CrmRegistrationFormProps {
  mode: "create" | "edit";
  parties: CrmPartyListItem[];
  initialIdentifier?: CrmPartyIdentifier;
}

function fieldClass(): string {
  return "h-11 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]";
}

function labelClass(): string {
  return "text-sm font-medium text-[#334155]";
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
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F46C0B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D95C06] disabled:cursor-not-allowed disabled:bg-[#FDBA74]"
    >
      {status.pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : null}
      {mode === "create"
        ? "Create registration"
        : "Save registration"}
    </button>
  );
}

export function CrmRegistrationForm({
  mode,
  parties,
  initialIdentifier,
}: CrmRegistrationFormProps) {
  const action =
    mode === "create"
      ? createCrmRegistrationAction
      : updateCrmRegistrationAction;

  const [state, formAction] = useActionState(
    action,
    initialCrmRegistrationActionState,
  );

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6"
    >
      {initialIdentifier ? (
        <input
          type="hidden"
          name="identifier_id"
          value={initialIdentifier.id}
        />
      ) : null}

      {state.message ? (
        <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626]" />
            <p className="text-sm font-semibold text-[#991B1B]">
              {state.message}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass()} htmlFor="party">
            Party
          </label>

          <select
            id="party"
            name="party"
            required
            defaultValue={initialIdentifier?.party ?? ""}
            className={`${fieldClass()} mt-1`}
          >
            <option value="">Select Party</option>
            {parties.map((party) => (
              <option key={party.id} value={party.id}>
                {party.display_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className={labelClass()}
            htmlFor="identifier_type"
          >
            Registration type
          </label>

          <select
            id="identifier_type"
            name="identifier_type"
            required
            defaultValue={
              initialIdentifier?.identifier_type ??
              "COMPANY_REGISTRATION"
            }
            className={`${fieldClass()} mt-1`}
          >
            {CRM_IDENTIFIER_TYPE_OPTIONS.map((option) => (
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
          <label className={labelClass()} htmlFor="label">
            Label
          </label>

          <input
            id="label"
            name="label"
            defaultValue={initialIdentifier?.label ?? ""}
            className={`${fieldClass()} mt-1`}
            placeholder="e.g. CAC registration"
          />
        </div>

        <div>
          <label
            className={labelClass()}
            htmlFor="issuing_country"
          >
            Issuing country
          </label>

          <input
            id="issuing_country"
            name="issuing_country"
            maxLength={2}
            defaultValue={
              initialIdentifier?.issuing_country ?? ""
            }
            className={`${fieldClass()} mt-1 uppercase`}
            placeholder="NG"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass()} htmlFor="value">
            Registration value
          </label>

          <input
            id="value"
            name="value"
            required={mode === "create"}
            className={`${fieldClass()} mt-1 font-mono`}
            placeholder={
              mode === "create"
                ? "Enter registration value"
                : "Leave blank to keep existing encrypted value"
            }
          />

          <p className="mt-1 text-xs text-[#64748B]">
            The value is encrypted by the backend. Normal
            responses only show the masked value.
          </p>
        </div>

        <div>
          <label className={labelClass()} htmlFor="issue_date">
            Issue date
          </label>

          <input
            id="issue_date"
            name="issue_date"
            type="date"
            defaultValue={initialIdentifier?.issue_date ?? ""}
            className={`${fieldClass()} mt-1`}
          />
        </div>

        <div>
          <label className={labelClass()} htmlFor="expiry_date">
            Expiry date
          </label>

          <input
            id="expiry_date"
            name="expiry_date"
            type="date"
            defaultValue={initialIdentifier?.expiry_date ?? ""}
            className={`${fieldClass()} mt-1`}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm font-medium text-[#334155]">
          <input
            type="checkbox"
            name="is_verified"
            defaultChecked={initialIdentifier?.is_verified ?? false}
            className="h-4 w-4 rounded border-[#CBD5E1] accent-[#F46C0B]"
          />
          Verified
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-[#334155]">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={initialIdentifier?.is_active ?? true}
            className="h-4 w-4 rounded border-[#CBD5E1] accent-[#F46C0B]"
          />
          Active
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] pt-5 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href={CRM_ROUTES.registrations}
          className="inline-flex justify-center rounded-lg border border-[#CBD5E1] px-5 py-2.5 text-sm font-semibold text-[#334155] transition hover:border-[#F46C0B] hover:text-[#F46C0B]"
        >
          Cancel
        </Link>

        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}