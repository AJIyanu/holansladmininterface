"use client";

import {
  useActionState,
  useMemo,
  useState,
} from "react";
import {
  useFormStatus,
} from "react-dom";
import {
  AlertTriangle,
  Archive,
  Ban,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  X,
} from "lucide-react";

import {
  runCrmLifecycleFormAction,
} from "@/features/crm/lifecycle-actions";

import {
  initialCrmLifecycleActionState,
} from "@/features/crm/action-states";
import {
  CRM_PERMISSIONS,
} from "@/features/crm/permissions";

import {
  hasPermission,
} from "@/types/auth";
import type {
  CurrentUser,
} from "@/types/auth";

import type {
  CrmPartyDetail,
} from "@/features/crm/types";

interface CrmPartyLifecyclePanelProps {
  party: CrmPartyDetail;
  user: CurrentUser;
}

interface LifecycleOption {
  action:
    | "deactivate"
    | "reactivate"
    | "suspend"
    | "block"
    | "archive"
    | "restore";
  label: string;
  description: string;
  permission: string;
  className: string;
}

function SubmitButton() {
  const status = useFormStatus();

  return (
    <button
      type="submit"
      disabled={status.pending}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F46C0B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D95C06] disabled:cursor-not-allowed disabled:bg-[#FDBA74]"
    >
      {status.pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : null}
      Confirm action
    </button>
  );
}

function lifecycleOptionsForParty(
  party: CrmPartyDetail,
): LifecycleOption[] {
  const options: LifecycleOption[] = [];

  if (party.is_archived) {
    options.push({
      action: "restore",
      label: "Restore",
      description: "Return this Party from archive.",
      permission: CRM_PERMISSIONS.party.archive,
      className:
        "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]",
    });

    return options;
  }

  options.push({
    action: "archive",
    label: "Archive",
    description: "Hide this Party from normal active use.",
    permission: CRM_PERMISSIONS.party.archive,
    className:
      "border-[#CBD5E1] bg-[#F8FAFC] text-[#334155]",
  });

  if (party.status === "ACTIVE") {
    options.push({
      action: "deactivate",
      label: "Deactivate",
      description: "Mark this Party inactive.",
      permission: CRM_PERMISSIONS.party.deactivate,
      className:
        "border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C]",
    });

    options.push({
      action: "suspend",
      label: "Suspend",
      description: "Temporarily suspend this Party.",
      permission: CRM_PERMISSIONS.party.block,
      className:
        "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]",
    });

    options.push({
      action: "block",
      label: "Block",
      description: "Block this Party from new use.",
      permission: CRM_PERMISSIONS.party.block,
      className:
        "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]",
    });
  }

  if (
    party.status === "INACTIVE" ||
    party.status === "SUSPENDED"
  ) {
    options.push({
      action: "reactivate",
      label: "Reactivate",
      description: "Return this Party to active use.",
      permission: CRM_PERMISSIONS.party.deactivate,
      className:
        "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]",
    });
  }

  return options;
}

function iconForAction(
  action: LifecycleOption["action"],
) {
  switch (action) {
    case "restore":
    case "reactivate":
      return CheckCircle2;
    case "archive":
      return Archive;
    case "suspend":
      return ShieldAlert;
    case "block":
      return Ban;
    case "deactivate":
      return X;
  }
}

export function CrmPartyLifecyclePanel({
  party,
  user,
}: CrmPartyLifecyclePanelProps) {
  const [selected, setSelected] =
    useState<LifecycleOption | null>(null);

  const [state, formAction] = useActionState(
    runCrmLifecycleFormAction,
    initialCrmLifecycleActionState,
  );

  const options = useMemo(
    () =>
      lifecycleOptionsForParty(party).filter((option) =>
        hasPermission(user, option.permission),
      ),
    [party, user],
  );

  if (options.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#0F172A]">
            Lifecycle actions
          </h2>

          <p className="mt-1 text-sm leading-6 text-[#64748B]">
            These actions are permission-controlled and audited
            by the backend.
          </p>
        </div>

        {state.ok ? (
          <span className="rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-1 text-xs font-semibold text-[#166534]">
            Updated
          </span>
        ) : null}
      </div>

      {state.message && !state.ok ? (
        <div className="mt-4 flex gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm font-semibold text-[#991B1B]">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          {state.message}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => {
          const Icon = iconForAction(option.action);

          return (
            <button
              key={option.action}
              type="button"
              onClick={() => setSelected(option)}
              className={`rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${option.className}`}
            >
              <Icon className="h-5 w-5" />

              <p className="mt-3 text-sm font-bold">
                {option.label}
              </p>

              <p className="mt-1 text-xs leading-5 opacity-90">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/75 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">
                  {selected.label} Party
                </h3>

                <p className="mt-1 text-sm leading-6 text-[#64748B]">
                  This will affect{" "}
                  <span className="font-semibold text-[#0F172A]">
                    {party.display_name}
                  </span>
                  . Give a clear reason before continuing.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-[#CBD5E1] p-2 text-[#475569] hover:border-[#F46C0B] hover:text-[#F46C0B]"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <form action={formAction} className="mt-5 space-y-4">
              <input
                type="hidden"
                name="party_id"
                value={party.id}
              />

              <input
                type="hidden"
                name="action"
                value={selected.action}
              />

              <div>
                <label
                  htmlFor="reason"
                  className="text-sm font-medium text-[#334155]"
                >
                  Reason
                </label>

                <textarea
                  id="reason"
                  name="reason"
                  rows={4}
                  required
                  minLength={3}
                  className="mt-1 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]"
                  placeholder="Explain why this lifecycle action is being taken."
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#334155] hover:border-[#F46C0B] hover:text-[#F46C0B]"
                >
                  Cancel
                </button>

                <SubmitButton />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}