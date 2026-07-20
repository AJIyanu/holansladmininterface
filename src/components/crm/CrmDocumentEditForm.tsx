"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { AlertTriangle, Loader2 } from "lucide-react";

import { updateCrmDocumentAction } from "@/features/crm/document-actions";

import { initialCrmDocumentActionState } from "@/features/crm/action-states";
import { CRM_VERIFICATION_STATUS_OPTIONS } from "@/features/crm/format";
import { CRM_ROUTES } from "@/features/crm/routes";

import type { CrmPartyDocument } from "@/features/crm/types";

interface CrmDocumentEditFormProps {
  document: CrmPartyDocument;
}

function fieldClass(): string {
  return "h-11 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]";
}

function labelClass(): string {
  return "text-sm font-medium text-[#334155]";
}

function SubmitButton() {
  const status = useFormStatus();

  return (
    <button
      type="submit"
      disabled={status.pending}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F46C0B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D95C06] disabled:cursor-not-allowed disabled:bg-[#FDBA74]"
    >
      {status.pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      Save document
    </button>
  );
}

export function CrmDocumentEditForm({ document }: CrmDocumentEditFormProps) {
  const [state, formAction] = useActionState(
    updateCrmDocumentAction,
    initialCrmDocumentActionState,
  );

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6"
    >
      <input type="hidden" name="document_id" value={document.id} />

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

      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm text-[#475569]">
        <p className="font-semibold text-[#0F172A]">
          {document.original_filename}
        </p>
        <p className="mt-1">Category: {document.category_display}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass()} htmlFor="verification_status">
            Verification status
          </label>

          <select
            id="verification_status"
            name="verification_status"
            defaultValue={document.verification_status}
            className={`${fieldClass()} mt-1`}
          >
            {CRM_VERIFICATION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass()} htmlFor="expires_at">
            Expiry date
          </label>

          <input
            id="expires_at"
            name="expires_at"
            type="date"
            defaultValue={document.expires_at ?? ""}
            className={`${fieldClass()} mt-1`}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass()} htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={document.description ?? ""}
            className="mt-1 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-[#334155]">
        <input
          type="checkbox"
          name="is_confidential"
          defaultChecked={document.is_confidential}
          className="h-4 w-4 rounded border-[#CBD5E1] accent-[#F46C0B]"
        />
        Confidential document
      </label>

      <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] pt-5 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href={CRM_ROUTES.documents}
          className="inline-flex justify-center rounded-lg border border-[#CBD5E1] px-5 py-2.5 text-sm font-semibold text-[#334155] transition hover:border-[#F46C0B] hover:text-[#F46C0B]"
        >
          Cancel
        </Link>

        <SubmitButton />
      </div>
    </form>
  );
}
