"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { staffActionApi } from "./staff-action-api";
import type { StaffActionContentProps } from "./staff-action-types";

export default function DeleteStaffAction({
  profile,
  currentUser,
  onClose,
  onCompleted,
}: StaffActionContentProps) {
  const [confirmation, setConfirmation] = useState("");

  const [deleting, setDeleting] = useState(false);

  if (!currentUser.is_superuser) {
    return null;
  }

  const confirmationText = `DELETE ${profile.employee_id}`;

  const confirmed = confirmation.trim() === confirmationText;

  async function deleteStaff() {
    setDeleting(true);

    try {
      await staffActionApi(`/api/account/profiles/${profile.id}`, {
        method: "DELETE",
      });

      toast.success("Staff profile permanently deleted.");

      onCompleted();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete staff profile.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-red-300 bg-red-50 p-5">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 size-6 shrink-0 text-red-700" />

          <div>
            <p className="font-semibold text-red-900">
              Permanently delete this staff profile?
            </p>

            <p className="mt-2 text-sm leading-6 text-red-800">
              This action cannot be undone. Use account deactivation instead
              when the staff record and history should be retained.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <p className="font-medium">
          {profile.user.first_name} {profile.user.last_name}
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          {profile.employee_id} · {profile.user.email}
        </p>
      </div>

      <div>
        <label className="text-sm font-medium">
          Type{" "}
          <span className="font-mono text-red-700">{confirmationText}</span> to
          confirm
        </label>

        <Input
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          className="mt-2"
          autoComplete="off"
        />
      </div>

      <div className="flex justify-end gap-3 border-t pt-5">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>

        <Button
          type="button"
          variant="destructive"
          disabled={!confirmed || deleting}
          onClick={deleteStaff}
        >
          {deleting && <Loader2 className="size-4 animate-spin" />}
          Delete permanently
        </Button>
      </div>
    </div>
  );
}
