"use client";

import {
  Activity,
  Building2,
  KeyRound,
  MoreHorizontal,
  Pencil,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hasPermission } from "@/lib/permissions";
import type { CurrentUser } from "@/types/auth";

import StaffActionDialog from "./staff-action-dialog";
import type { StaffAction, StaffProfile } from "./staff-list-types";

interface StaffActionsMenuProps {
  profile: StaffProfile;
  currentUser: CurrentUser;
}

export default function StaffActionsMenu({
  profile,
  currentUser,
}: StaffActionsMenuProps) {
  const [action, setAction] = useState<StaffAction | null>(null);

  const canEditProfile = hasPermission(
    currentUser,
    "accounts.staffprofile.edit",
  );

  const canManageUser = hasPermission(currentUser, "accounts.user.edit");

  const canViewAudit = hasPermission(currentUser, "accounts.auditlog.view");

  const canDelete = currentUser.is_superuser === true;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open staff actions"
          >
            <MoreHorizontal className="size-5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-60">
          {canEditProfile && (
            <>
              <DropdownMenuItem onClick={() => setAction("edit")}>
                <Pencil className="size-4" />
                Edit staff
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setAction("department")}>
                <Building2 className="size-4" />
                Change department
              </DropdownMenuItem>
            </>
          )}

          {canManageUser && (
            <>
              <DropdownMenuItem onClick={() => setAction("roles")}>
                <ShieldCheck className="size-4" />
                Manage roles
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  setAction(profile.user.is_active ? "deactivate" : "activate")
                }
              >
                {profile.user.is_active ? (
                  <UserX className="size-4" />
                ) : (
                  <UserCheck className="size-4" />
                )}

                {profile.user.is_active
                  ? "Deactivate account"
                  : "Activate account"}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setAction("reset-password")}>
                <KeyRound className="size-4" />
                Send password-reset link
              </DropdownMenuItem>
            </>
          )}

          {canViewAudit && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setAction("activity")}>
                <Activity className="size-4" />
                Login activity
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setAction("audit")}>
                <ShieldCheck className="size-4" />
                Audit history
              </DropdownMenuItem>
            </>
          )}

          {canDelete && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setAction("delete")}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" />
                Delete permanently
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <StaffActionDialog
        action={action}
        profile={profile}
        currentUser={currentUser}
        open={action !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setAction(null);
          }
        }}
      />
    </>
  );
}
