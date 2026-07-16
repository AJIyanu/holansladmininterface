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
  createCrmInteractionAction,
  updateCrmInteractionAction,
} from "@/features/crm/interaction-actions";
import {
  initialCrmInteractionActionState,
} from "@/features/crm/action-states";
import {
  CRM_ROUTES,
} from "@/features/crm/routes";

import type {
  CrmPartyInteraction,
  CrmPartyListItem,
} from "@/features/crm/types";

interface CrmInteractionFormProps {
  mode: "create" | "edit";
  parties: CrmPartyListItem[];
  initialInteraction?: CrmPartyInteraction;
  defaultPartyId?: string;
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

function dateTimeLocalValue(
  value: string | null | undefined,
): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}

function nowDateTimeLocal(): string {
  return new Date().toISOString().slice(0, 16);
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
        ? "Log interaction"
        : "Save interaction"}
    </button>
  );
}

export function CrmInteractionForm({
  mode,
  parties,
  initialInteraction,
  defaultPartyId,
}: CrmInteractionFormProps) {
  const action =
    mode === "create"
      ? createCrmInteractionAction
      : updateCrmInteractionAction;

  const [state, formAction] = useActionState(
    action,
    initialCrmInteractionActionState,
  );

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6"
    >
      {initialInteraction ? (
        <input
          type="hidden"
          name="interaction_id"
          value={initialInteraction.id}
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
            defaultValue={
              initialInteraction?.party ??
              defaultPartyId ??
              ""
            }
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
            htmlFor="contact_party"
          >
            Contact person
          </label>

          <select
            id="contact_party"
            name="contact_party"
            defaultValue={initialInteraction?.contact_party ?? ""}
            className={`${fieldClass()} mt-1`}
          >
            <option value="">No specific contact</option>
            {parties
              .filter((party) => party.entity_kind === "INDIVIDUAL")
              .map((party) => (
                <option key={party.id} value={party.id}>
                  {party.display_name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label
            className={labelClass()}
            htmlFor="interaction_type"
          >
            Type
          </label>

          <select
            id="interaction_type"
            name="interaction_type"
            required
            defaultValue={
              initialInteraction?.interaction_type ?? "WHATSAPP"
            }
            className={`${fieldClass()} mt-1`}
          >
            <option value="CALL">Call</option>
            <option value="EMAIL">Email</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="MEETING">Meeting</option>
            <option value="MARKETPLACE_MESSAGE">
              Marketplace message
            </option>
            <option value="SITE_VISIT">Site visit</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label
            className={labelClass()}
            htmlFor="occurred_at"
          >
            When it happened
          </label>

          <input
            id="occurred_at"
            name="occurred_at"
            type="datetime-local"
            required
            defaultValue={
              dateTimeLocalValue(initialInteraction?.occurred_at) ||
              nowDateTimeLocal()
            }
            className={`${fieldClass()} mt-1`}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass()} htmlFor="subject">
            Subject
          </label>

          <input
            id="subject"
            name="subject"
            maxLength={255}
            defaultValue={initialInteraction?.subject ?? ""}
            placeholder="e.g. Testo 549 rejection discussion"
            className={`${fieldClass()} mt-1`}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass()} htmlFor="summary">
            Summary
          </label>

          <textarea
            id="summary"
            name="summary"
            rows={5}
            defaultValue={initialInteraction?.summary ?? ""}
            placeholder="Write what was discussed, agreed, rejected, promised, or needs follow-up."
            className={`${textareaClass()} mt-1`}
          />
        </div>

        <div>
          <label
            className={labelClass()}
            htmlFor="follow_up_at"
          >
            Follow-up date
          </label>

          <input
            id="follow_up_at"
            name="follow_up_at"
            type="datetime-local"
            defaultValue={dateTimeLocalValue(
              initialInteraction?.follow_up_at,
            )}
            className={`${fieldClass()} mt-1`}
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] pt-5 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href={CRM_ROUTES.interactions}
          className="inline-flex justify-center rounded-lg border border-[#CBD5E1] px-5 py-2.5 text-sm font-semibold text-[#334155] transition hover:border-[#F46C0B] hover:text-[#F46C0B]"
        >
          Cancel
        </Link>

        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}