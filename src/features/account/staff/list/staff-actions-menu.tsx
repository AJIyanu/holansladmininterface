"use client";

import {
  Activity,
  Building2,
  MoreHorizontal,
  Pencil,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRoundCog,
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

  const canEdit = hasPermission(currentUser, "accounts.staffprofile.edit");

  const canDelete =
    currentUser.is_superuser ||
    hasPermission(currentUser, "accounts.staffprofile.delete");

  const canManageUser = hasPermission(currentUser, "accounts.user.edit");

  const canViewAudit = hasPermission(currentUser, "accounts.auditlog.view");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open staff actions">
            <MoreHorizontal className="size-5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 bg-white/30 backdrop-blur-md">
          <DropdownMenuItem onClick={() => setAction("view")}>
            <UserRoundCog className="size-4" />
            View profile
          </DropdownMenuItem>

          {canEdit && (
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
        open={action !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAction(null);
          }
        }}
      />
    </>
  );
}
