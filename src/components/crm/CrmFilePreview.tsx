"use client";

import {
  File,
  FileSpreadsheet,
  FileText,
  ImageIcon,
  Eye,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { documentMimeLabel, formatFileSize } from "@/features/crm/format";

interface CrmFilePreviewProps {
  file: File | null;
  onClear?: () => void;
}

function FileTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="h-8 w-8" />;
  }

  if (mimeType === "application/pdf") {
    return <FileText className="h-8 w-8" />;
  }

  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
    return <FileSpreadsheet className="h-8 w-8" />;
  }

  return <File className="h-8 w-8" />;
}

function isPreviewable(mimeType: string): boolean {
  return (
    mimeType.startsWith("image/") ||
    mimeType === "application/pdf" ||
    mimeType === "text/plain"
  );
}

function useObjectUrl(file: File | null): string | null {
  return useMemo(() => {
    if (!file) {
      return null;
    }

    return URL.createObjectURL(file);
  }, [file]);
}

export function CrmFilePreview({ file, onClear }: CrmFilePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const objectUrl = useObjectUrl(file);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  if (!file) {
    return null;
  }

  const previewable = isPreviewable(file.type);

  return (
    <>
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border border-[#CBD5E1] bg-white sm:w-32">
            {file.type.startsWith("image/") && objectUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={objectUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#64748B]">
                <FileTypeIcon mimeType={file.type} />
                <span className="text-xs font-semibold">
                  {documentMimeLabel(file.type)}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#0F172A]">
              {file.name}
            </p>

            <p className="mt-1 text-sm text-[#64748B]">
              {documentMimeLabel(file.type)} · {formatFileSize(file.size)}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                disabled={!objectUrl}
                className="inline-flex items-center gap-2 rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#334155] hover:border-[#F46C0B] hover:text-[#F46C0B] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Eye className="h-3.5 w-3.5" />
                Full preview
              </button>

              {onClear ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#FECACA] px-3 py-2 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEF2F2]"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {isOpen && objectUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/75 p-4">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] p-4">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-[#0F172A]">
                  {file.name}
                </h2>

                <p className="text-sm text-[#64748B]">
                  {documentMimeLabel(file.type)} · {formatFileSize(file.size)}
                </p>
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
              {file.type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={objectUrl}
                  alt={file.name}
                  className="mx-auto max-h-[72vh] max-w-full rounded-xl object-contain"
                />
              ) : previewable ? (
                <iframe
                  src={objectUrl}
                  title={file.name}
                  className="h-[72vh] w-full rounded-xl border border-[#E2E8F0]"
                />
              ) : (
                <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-5 text-sm leading-6 text-[#9A3412]">
                  This file type cannot be rendered directly in the browser. The
                  document can still be uploaded and downloaded securely after
                  it is saved.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
