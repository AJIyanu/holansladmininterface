"use client";

import {
  useActionState,
  useState,
} from "react";
import {
  useFormStatus,
} from "react-dom";
import {
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import {
  getInitialCrmRegistrationActionState,
  revealCrmRegistrationAction,
} from "@/features/crm/registration-actions";

interface CrmRevealIdentifierButtonProps {
  identifierId: string;
}

function RevealSubmitButton() {
  const status = useFormStatus();

  return (
    <button
      type="submit"
      disabled={status.pending}
      className="inline-flex items-center gap-1 rounded-lg border border-[#FED7AA] px-3 py-2 text-xs font-semibold text-[#C2410C] transition hover:bg-[#FFF7ED] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {status.pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Eye className="h-3.5 w-3.5" />
      )}
      Reveal
    </button>
  );
}

export function CrmRevealIdentifierButton({
  identifierId,
}: CrmRevealIdentifierButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [state, formAction] = useActionState(
    revealCrmRegistrationAction,
    getInitialCrmRegistrationActionState(),
  );

  return (
    <div className="relative">
      <form
        action={async (formData) => {
          await formAction(formData);
          setIsOpen(true);
        }}
      >
        <input
          type="hidden"
          name="identifier_id"
          value={identifierId}
        />

        <RevealSubmitButton />
      </form>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">
                  Sensitive registration value
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#64748B]">
                  This reveal is audited by the backend.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-[#CBD5E1] p-2 text-[#475569] hover:border-[#F46C0B] hover:text-[#F46C0B]"
              >
                <EyeOff className="h-4 w-4" />
                <span className="sr-only">Close reveal</span>
              </button>
            </div>

            {state.ok && state.revealedValue ? (
              <div className="mt-5 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-4">
                <p className="break-all font-mono text-base font-semibold text-[#9A3412]">
                  {state.revealedValue}
                </p>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm font-medium text-[#991B1B]">
                {state.message ||
                  "The value could not be revealed."}
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-5 w-full rounded-lg bg-[#0F4C81] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0B3A63]"
            >
              Hide value
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}