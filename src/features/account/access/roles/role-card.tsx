"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Pencil,
  ShieldCheck,
  Trash2,
  UserMinus,
  UserPlus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hasPermission } from "@/lib/permissions";
import type { CurrentUser } from "@/types/auth";

import type { Permission, Role } from "../shared/access-types";
import RoleActionDialog, { type RoleAction } from "./role-action-dialog";
import PermissionGroupedSummary from "../shared/permission-grouped-summary";

interface RoleCardProps {
  role: Role;
  permissions: Permission[];
  currentUser: CurrentUser;
  expanded: boolean;
  onToggle: () => void;
}

export default function RoleCard({
  role,
  permissions,
  currentUser,
  expanded,
  onToggle,
}: RoleCardProps) {
  const [action, setAction] = useState<RoleAction | null>(null);

  const rolePermissions = permissions.filter((permission) =>
    role.permissions.includes(permission.id),
  );

  const canEdit = hasPermission(currentUser, "accounts.role.edit");

  const canDelete =
    currentUser.is_superuser ||
    hasPermission(currentUser, "accounts.role.delete");

  const canManageStaff = hasPermission(currentUser, "accounts.user.edit");

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="flex items-start gap-4 p-5">
            <button
              type="button"
              onClick={onToggle}
              className="flex min-w-0 flex-1 items-start gap-4 text-left"
            >
              <div className="rounded-xl bg-blue-50 p-3 text-[#0B4F8A]">
                <ShieldCheck className="size-5" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-semibold">{role.name}</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {role.permissions.length} permission
                  {role.permissions.length === 1 ? "" : "s"}
                </p>
              </div>
            </button>

            <Button variant="ghost" size="icon" onClick={onToggle}>
              {expanded ? (
                <ChevronUp className="size-5" />
              ) : (
                <ChevronDown className="size-5" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="size-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                {canEdit && (
                  <>
                    <DropdownMenuItem onClick={() => setAction("edit")}>
                      <Pencil className="size-4" />
                      Edit role
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => setAction("add-permissions")}
                    >
                      <ShieldCheck className="size-4" />
                      Add permissions
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => setAction("remove-permissions")}
                    >
                      <ShieldCheck className="size-4" />
                      Remove permissions
                    </DropdownMenuItem>
                  </>
                )}

                {canManageStaff && (
                  <>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => setAction("add-staff")}>
                      <UserPlus className="size-4" />
                      Add staff
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setAction("remove-staff")}>
                      <UserMinus className="size-4" />
                      Remove staff
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
                      Delete role
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {expanded && (
  <div className="mt-5 space-y-4">
    <div>
      <h3 className="text-sm font-semibold text-[#0F172A]">
        Assigned permissions
      </h3>

      <p className="mt-1 text-xs text-[#64748B]">
        Permissions are grouped by section and sorted by action.
      </p>
    </div>

    <PermissionGroupedSummary permissions={rolePermissions} />
  </div>
)}
        </CardContent>
      </Card>

      <RoleActionDialog
        role={role}
        permissions={permissions}
        action={action}
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
