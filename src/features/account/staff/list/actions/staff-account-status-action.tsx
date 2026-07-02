"use client";

import { AlertTriangle, Loader2, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { staffActionApi } from "./staff-action-api";
import type { StaffActionContentProps } from "./staff-action-types";

interface StaffAccountStatusActionProps extends StaffActionContentProps {
  activate: boolean;
}

export default function StaffAccountStatusAction({
  profile,
  activate,
  onClose,
  onCompleted,
}: StaffAccountStatusActionProps) {
  const [saving, setSaving] = useState(false);

  async function updateStatus() {
    setSaving(true);

    try {
      await staffActionApi(`/api/account/users/${profile.user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: activate,
        }),
      });

      toast.success(
        activate ? "Staff account activated." : "Staff account deactivated.",
      );

      onCompleted();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update account status.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div
        className={
          activate
            ? "rounded-lg border border-emerald-300 bg-emerald-50 p-4"
            : "rounded-lg border border-amber-300 bg-amber-50 p-4"
        }
      >
        <div className="flex gap-3">
          {activate ? (
            <UserCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" />
          ) : (
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700" />
          )}

          <div>
            <p className="font-semibold">
              {activate ? "Activate this account?" : "Deactivate this account?"}
            </p>

            <p className="mt-2 text-sm leading-6">
              {activate
                ? "The staff member will regain access based on their assigned roles and permissions."
                : "The staff member will immediately lose access to the dashboard. Their profile and activity history will be retained."}
            </p>
          </div>
        </div>
      </div>

      <dl className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase text-muted-foreground">
            Staff
          </dt>

          <dd className="mt-1 font-medium">
            {profile.user.first_name} {profile.user.last_name}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase text-muted-foreground">
            Employee ID
          </dt>

          <dd className="mt-1 font-medium">{profile.employee_id}</dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase text-muted-foreground">
            Current status
          </dt>

          <dd className="mt-1">
            <Badge variant={profile.user.is_active ? "default" : "secondary"}>
              {profile.user.is_active ? "Active" : "Inactive"}
            </Badge>
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase text-muted-foreground">
            New status
          </dt>

          <dd className="mt-1">
            <Badge variant={activate ? "default" : "secondary"}>
              {activate ? "Active" : "Inactive"}
            </Badge>
          </dd>
        </div>
      </dl>

      <div className="flex justify-end gap-3 border-t pt-5">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>

        <Button
          type="button"
          variant={activate ? "default" : "destructive"}
          disabled={saving}
          onClick={updateStatus}
        >
          {saving && <Loader2 className="size-4 animate-spin" />}

          {activate ? "Activate account" : "Deactivate account"}
        </Button>
      </div>
    </div>
  );
}
