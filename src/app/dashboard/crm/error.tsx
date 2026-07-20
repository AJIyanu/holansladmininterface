"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

interface CrmErrorPageProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function CrmErrorPage({ error, reset }: CrmErrorPageProps) {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-[#FECACA] bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2] text-[#DC2626]">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <h1 className="mt-4 text-xl font-bold text-[#0F172A]">
          CRM could not be loaded
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#475569]">
          {error.message || "The CRM service is temporarily unavailable."}
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[#F46C0B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D95C06] focus:outline-none focus:ring-2 focus:ring-[#FDBA74] focus:ring-offset-2"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
