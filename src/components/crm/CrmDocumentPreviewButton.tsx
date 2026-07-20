"use client";

import { useState } from "react";
import { Download, Eye, FileText, X } from "lucide-react";

import {
  canBrowserPreviewDocument,
  documentMimeLabel,
  formatFileSize,
} from "@/features/crm/format";

import type { CrmPartyDocument } from "@/features/crm/types";

interface CrmDocumentPreviewButtonProps {
  document: CrmPartyDocument;
}

export function CrmDocumentPreviewButton({
  document,
}: CrmDocumentPreviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const downloadUrl = `/api/crm/documents/${document.id}/download`;
  const canPreview = canBrowserPreviewDocument(document.mime_type);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#334155] hover:border-[#F46C0B] hover:text-[#F46C0B]"
      >
        <Eye className="h-3.5 w-3.5" />
        Preview
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/75 p-4">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] p-4">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-[#0F172A]">
                  {document.original_filename}
                </h2>

                <p className="mt-1 text-sm text-[#64748B]">
                  {documentMimeLabel(document.mime_type)} ·{" "}
                  {formatFileSize(document.size_bytes)}
                </p>

                {document.is_confidential ? (
                  <p className="mt-2 inline-flex rounded-full border border-[#FECACA] bg-[#FEF2F2] px-2.5 py-1 text-xs font-semibold text-[#B91C1C]">
                    Confidential
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-[#CBD5E1] p-2 text-[#475569] hover:border-[#F46C0B] hover:text-[#F46C0B]"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close preview</span>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-4">
              {canPreview ? (
                document.mime_type.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={downloadUrl}
                    alt={document.original_filename}
                    className="mx-auto max-h-[72vh] max-w-full rounded-xl object-contain"
                  />
                ) : (
                  <iframe
                    src={downloadUrl}
                    title={document.original_filename}
                    className="h-[72vh] w-full rounded-xl border border-[#E2E8F0]"
                  />
                )
              ) : (
                <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-5 text-sm leading-6 text-[#9A3412]">
                  <div className="flex gap-3">
                    <FileText className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-semibold">
                        Browser preview is not available for this file type.
                      </p>
                      <p className="mt-1">
                        The document can still be downloaded securely after
                        backend permission checks.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-[#E2E8F0] p-4">
              <a
                href={downloadUrl}
                download={document.original_filename}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0F4C81] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0B3A63]"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
