"use client";

import Link from "next/link";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions";

import { staffActionApi } from "./staff-action-api";
import type { StaffActionContentProps } from "./staff-action-types";

export default function StaffPasswordResetAction({
  profile,
  currentUser,
  onClose,
}: StaffActionContentProps) {
  const [sending, setSending] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const canViewAudit = hasPermission(currentUser, "accounts.auditlog.view");

  async function sendResetLink() {
    setSending(true);

    try {
      await staffActionApi("/api/auth/password-reset/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: profile.user.email,
        }),
      });

      setSubmitted(true);

      toast.success("Password-reset request submitted.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to submit the password-reset request.",
      );
    } finally {
      setSending(false);
    }
  }

  const auditQuery = new URLSearchParams({
    user: profile.user.id,
    event_type: "PASSWORD_RESET_LINK_SENT",
    ordering: "-created_at",
    page: "1",
    page_size: "1",
  });

  if (submitted) {
    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-5">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />

            <div>
              <p className="font-semibold text-emerald-900">
                Request submitted
              </p>

              <p className="mt-2 text-sm leading-6 text-emerald-800">
                If this account is eligible, a password-reset link will be sent
                to <strong>{profile.user.email}</strong>.
              </p>

              <p className="mt-2 text-sm leading-6 text-emerald-800">
                The reset endpoint deliberately does not confirm whether an
                email was sent. Check the latest audit record to verify the
                result.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-end gap-3 border-t pt-5 sm:flex-row">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>

          {canViewAudit && (
            <Button asChild>
              <Link
                href={`/dashboard/admin/security/audit-logs?${auditQuery.toString()}`}
              >
                Check latest audit record
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-muted/30 p-5">
        <div className="flex gap-3">
          <KeyRound className="mt-0.5 size-5 shrink-0 text-[#0B4F8A]" />

          <div>
            <p className="font-semibold">Send password-reset link</p>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              A secure password-reset link will be requested for:
            </p>

            <p className="mt-2 break-all font-medium">{profile.user.email}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-5">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>

        <Button type="button" disabled={sending} onClick={sendResetLink}>
          {sending && <Loader2 className="size-4 animate-spin" />}
          Send reset link
        </Button>
      </div>
    </div>
  );
}
