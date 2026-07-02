"use client";

import { useState } from "react";

import type { CurrentUser } from "@/types/auth";

import ResourcePagination from "../shared/resource-pagination";
import type { Permission, Role } from "../shared/access-types";
import RoleCard from "./role-card";

interface RolesListProps {
  roles: Role[];
  permissions: Permission[];
  count: number;
  page: number;
  pageSize: number;
  currentUser: CurrentUser;
}

export default function RolesList({
  roles,
  permissions,
  count,
  page,
  pageSize,
  currentUser,
}: RolesListProps) {
  const [expandedRoleId, setExpandedRoleId] = useState<number | null>(null);

  if (roles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-background px-6 py-16 text-center">
        <h2 className="font-semibold">No roles found</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Create a role or change the current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {count} role{count === 1 ? "" : "s"}
      </p>

      {roles.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          permissions={permissions}
          currentUser={currentUser}
          expanded={expandedRoleId === role.id}
          onToggle={() =>
            setExpandedRoleId((current) =>
              current === role.id ? null : role.id,
            )
          }
        />
      ))}

      <ResourcePagination count={count} page={page} pageSize={pageSize} />
    </div>
  );
}
