"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import ResponsiveActionGuard from "@/components/shared/responsive-action-guard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { accountApi } from "../shared/account-api";
import type {
  PaginatedResponse,
  Permission,
  Role,
  UserSummary,
} from "../shared/access-types";
import { glassButtonClass, modalClass } from "../shared/glass-styles";
import SelectionList from "../shared/selection-list";
import PermissionMatrixSelector from "../shared/permission-matrix-selector";

export type RoleAction =
  | "edit"
  | "add-permissions"
  | "remove-permissions"
  | "add-staff"
  | "remove-staff"
  | "delete";

interface RoleActionDialogProps {
  role: Role;
  permissions: Permission[];
  action: RoleAction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const titles: Record<RoleAction, string> = {
  edit: "Edit role",
  "add-permissions": "Add permissions",
  "remove-permissions": "Remove permissions",
  "add-staff": "Add staff to role",
  "remove-staff": "Remove staff from role",
  delete: "Delete role",
};

export default function RoleActionDialog({
  role,
  permissions,
  action,
  open,
  onOpenChange,
}: RoleActionDialogProps) {
  const router = useRouter();

  const [roleName, setRoleName] = useState(role.name);

  const [selected, setSelected] = useState<Array<string | number>>([]);

  const [users, setUsers] = useState<UserSummary[]>([]);

  const [loading, setLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !action) {
      return;
    }

    setSelected([]);
    setRoleName(role.name);

    if (action !== "add-staff" && action !== "remove-staff") {
      return;
    }

    async function loadUsers() {
      setLoading(true);

      try {
        if (action === "remove-staff") {
          const response = await accountApi<PaginatedResponse<UserSummary>>(
            `/api/account/users?groups=${role.id}&page_size=1000&ordering=first_name`,
          );

          setUsers(response.results);
          return;
        }

        /*
         * Future backend inverse filter:
         *
         * const response =
         *   await accountApi<PaginatedResponse<UserSummary>>(
         *     `/api/account/users?exclude_groups=${role.id}&page_size=1000&ordering=first_name`,
         *   );
         *
         * setUsers(response.results);
         */

        const response = await accountApi<PaginatedResponse<UserSummary>>(
          "/api/account/users?page_size=1000&ordering=first_name",
        );

        const usersNotInRole = response.results.filter(
          (user) => !user.roles.some((userRole) => userRole.id === role.id),
        );

        setUsers(usersNotInRole);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to load staff.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadUsers();
  }, [action, open, role.id, role.name]);

  function toggleSelected(id: string | number) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((currentId) => currentId !== id)
        : [...current, id],
    );
  }

  function setSelectedPermissionIds(permissionIds: number[]) {
  setSelected(permissionIds);
}

  async function submitAction() {
    if (!action) {
      return;
    }

    setSubmitting(true);

    try {
      if (action === "edit") {
        if (roleName.trim().length < 2) {
          throw new Error("Role name is required.");
        }

        await accountApi(`/api/account/roles/${role.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: roleName.trim(),
          }),
        });
      }

      if (action === "add-permissions" || action === "remove-permissions") {
        const selectedIds = selected.map(Number);

        const updatedPermissions =
          action === "add-permissions"
            ? Array.from(new Set([...role.permissions, ...selectedIds]))
            : role.permissions.filter(
                (permissionId) => !selectedIds.includes(permissionId),
              );

        await accountApi(`/api/account/roles/${role.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            permissions: updatedPermissions,
          }),
        });
      }

      if (action === "add-staff" || action === "remove-staff") {
        const selectedUsers = users.filter((user) =>
          selected.includes(user.id),
        );

        await Promise.all(
          selectedUsers.map((user) => {
            const currentRoleIds = user.roles.map((userRole) => userRole.id);

            const nextRoleIds =
              action === "add-staff"
                ? Array.from(new Set([...currentRoleIds, role.id]))
                : currentRoleIds.filter((roleId) => roleId !== role.id);

            return accountApi(`/api/account/users/${user.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                roles: nextRoleIds,
              }),
            });
          }),
        );
      }

      if (action === "delete") {
        await accountApi(`/api/account/roles/${role.id}`, {
          method: "DELETE",
        });
      }

      toast.success("Role updated successfully.");

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update role.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!action) {
    return null;
  }

  const availablePermissions =
    action === "add-permissions"
      ? permissions.filter(
          (permission) => !role.permissions.includes(permission.id),
        )
      : permissions.filter((permission) =>
          role.permissions.includes(permission.id),
        );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={modalClass}>
        <DialogHeader>
          <DialogTitle>{titles[action]}</DialogTitle>

          <DialogDescription>{role.name}</DialogDescription>
        </DialogHeader>

        <ResponsiveActionGuard actionName={titles[action].toLowerCase()}>
          <div className="space-y-5">
            {action === "edit" && (
              <div>
                <label className="text-sm font-medium">Role name</label>

                <Input
                  value={roleName}
                  onChange={(event) => setRoleName(event.target.value)}
                  className="mt-2 border-white/50 bg-white/30 backdrop-blur-md"
                />
              </div>
            )}

            {(action === "add-permissions" || action === "remove-permissions") && (
  <PermissionMatrixSelector
    permissions={availablePermissions}
    selected={selected.map(Number)}
    onSelectedChange={setSelectedPermissionIds}
    emptyMessage={
      action === "add-permissions"
        ? "All permissions are already assigned."
        : "This role has no permissions to remove."
    }
  />
)}

            {(action === "add-staff" || action === "remove-staff") &&
              (loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="size-6 animate-spin" />
                </div>
              ) : (
                <SelectionList
                  items={users.map((user) => ({
                    id: user.id,
                    title:
                      `${user.first_name} ${user.last_name}`.trim() ||
                      user.username,
                    description: user.email,
                  }))}
                  selected={selected}
                  onToggle={toggleSelected}
                  emptyMessage={
                    action === "add-staff"
                      ? "No additional staff are available."
                      : "No staff currently have this role."
                  }
                  searchPlaceholder="Search staff..."
                />
              ))}

            {action === "delete" && (
              <div className="rounded-lg border border-red-300 bg-red-50/60 p-4">
                <div className="flex gap-3">
                  <Trash2 className="size-5 shrink-0 text-red-600" />

                  <div>
                    <p className="font-medium text-red-700">
                      Permanently delete this role?
                    </p>

                    <p className="mt-1 text-sm text-red-600">
                      This cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className={glassButtonClass}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                className={glassButtonClass}
                disabled={
                  submitting ||
                  ((action === "add-permissions" ||
                    action === "remove-permissions" ||
                    action === "add-staff" ||
                    action === "remove-staff") &&
                    selected.length === 0)
                }
                onClick={submitAction}
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}

                {action === "delete" ? "Delete role" : "Save changes"}
              </Button>
            </div>
          </div>
        </ResponsiveActionGuard>
      </DialogContent>
    </Dialog>
  );
}
