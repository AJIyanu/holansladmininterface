"use client";

import { AlertCircle, Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { staffActionApi } from "./staff-action-api";
import type { StaffActionContentProps } from "./staff-action-types";

interface RoleOption {
  id: number;
  name: string;
  permissions: number[];
}

interface PaginatedRoles {
  count: number;
  next: string | null;
  previous: string | null;
  results: RoleOption[];
}

function sortIds(ids: number[]) {
  return [...ids].sort((first, second) => first - second);
}

function sameSelection(first: number[], second: number[]) {
  return JSON.stringify(sortIds(first)) === JSON.stringify(sortIds(second));
}

export default function ManageStaffRolesAction({
  profile,
  onClose,
  onCompleted,
}: StaffActionContentProps) {
  const originalIds = useMemo(
    () => profile.user.roles.map((role) => role.id),
    [profile.user.roles],
  );

  const [roles, setRoles] = useState<RoleOption[]>([]);

  const [selectedIds, setSelectedIds] = useState<number[]>(originalIds);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [confirming, setConfirming] = useState(false);

  const dirty = !sameSelection(originalIds, selectedIds);

  useEffect(() => {
    let active = true;

    async function loadRoles() {
      try {
        const response = await staffActionApi<PaginatedRoles>(
          "/api/account/roles?page_size=1000&ordering=name",
        );

        if (active) {
          setRoles(response.results);
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to load roles.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadRoles();

    return () => {
      active = false;
    };
  }, []);

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return roles;
    }

    return roles.filter((role) => role.name.toLowerCase().includes(query));
  }, [roles, search]);

  const addedRoles = roles.filter(
    (role) => selectedIds.includes(role.id) && !originalIds.includes(role.id),
  );

  const removedRoles = roles.filter(
    (role) => originalIds.includes(role.id) && !selectedIds.includes(role.id),
  );

  function toggleRole(roleId: number) {
    setConfirming(false);

    setSelectedIds((current) =>
      current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId],
    );
  }

  async function updateRoles() {
    setSaving(true);

    try {
      await staffActionApi(`/api/account/users/${profile.user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roles: selectedIds,
        }),
      });

      toast.success("Staff roles updated successfully.");

      onCompleted();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update roles.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search roles..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <ScrollArea className="h-80 rounded-lg border p-3">
          {filteredRoles.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No roles found.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredRoles.map((role) => {
                const checked = selectedIds.includes(role.id);

                return (
                  <label
                    key={role.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-3 transition hover:border-border hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleRole(role.id)}
                    />

                    <span className="font-medium">{role.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </ScrollArea>
      )}

      {confirming && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-700" />

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-amber-900">
                Please check selections again to confirm
              </p>

              {addedRoles.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-xs font-medium uppercase text-amber-800">
                    Roles being added
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {addedRoles.map((role) => (
                      <Badge
                        key={role.id}
                        className="bg-emerald-100 text-emerald-800"
                      >
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {removedRoles.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-xs font-medium uppercase text-amber-800">
                    Roles being removed
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {removedRoles.map((role) => (
                      <Badge key={role.id} className="bg-red-100 text-red-800">
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirming(false)}
                >
                  Review selections
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={saving}
                  onClick={updateRoles}
                >
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  Confirm update
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!confirming && (
        <div className="flex justify-end gap-3 border-t pt-5">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="button"
            disabled={!dirty || loading}
            onClick={() => setConfirming(true)}
          >
            Update roles
          </Button>
        </div>
      )}
    </div>
  );
}
