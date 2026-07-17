"use client";

import {
  ShieldCheck,
} from "lucide-react";

import type {
  Permission,
} from "./access-types";

interface PermissionGroupedSummaryProps {
  permissions: Permission[];
}

type PermissionAction =
  | "View"
  | "Create"
  | "Edit"
  | "Delete"
  | "Approve"
  | "Archive"
  | "Deactivate"
  | "Restore"
  | "Assign"
  | "Download"
  | "Reveal"
  | "Merge"
  | "Other";

interface DecoratedPermission {
  permission: Permission;
  action: PermissionAction;
  actionOrder: number;
  resourceKey: string;
  resourceLabel: string;
}

interface PermissionGroup {
  key: string;
  label: string;
  permissions: DecoratedPermission[];
}

const ACTION_ORDER: Record<PermissionAction, number> = {
  View: 1,
  Create: 2,
  Edit: 3,
  Delete: 4,
  Approve: 5,
  Archive: 6,
  Deactivate: 7,
  Restore: 8,
  Assign: 9,
  Download: 10,
  Reveal: 11,
  Merge: 12,
  Other: 99,
};

const KNOWN_RESOURCE_LABELS: Record<string, string> = {
  party: "CRM Party",
  partyrole: "CRM Party Role",
  partyaffiliation: "CRM Party Affiliation",
  partyidentifier: "CRM Registration / Identifier",
  partydocument: "CRM Document",
  partyinteraction: "CRM Interaction",
  partynote: "CRM Note",
  partysource: "CRM Source",
  contactmethod: "CRM Contact Method",
  contactrole: "CRM Contact Role",
  address: "CRM Address",
  department: "Department",
  role: "Role",
  group: "Role / Group",
  permission: "Permission",
  user: "User Account",
  staffprofile: "Staff Profile",
  loginactivity: "Login Activity",
  auditlog: "Audit Log",
  task: "Task",
  taskcomment: "Task Comment",
  taskactivity: "Task Activity",
  tasknotification: "Task Notification",
};

function humaniseToken(value: string): string {
  const known = KNOWN_RESOURCE_LABELS[value];

  if (known) {
    return known;
  }

  return value
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

function inferAction(permission: Permission): PermissionAction {
  const value = `${permission.codename} ${permission.name}`.toLowerCase();

  if (
    value.startsWith("view_") ||
    value.includes(" can view ") ||
    value.includes("view ")
  ) {
    return "View";
  }

  if (
    value.startsWith("add_") ||
    value.startsWith("create_") ||
    value.includes(" can add ") ||
    value.includes(" can create ") ||
    value.includes("create ")
  ) {
    return "Create";
  }

  if (
    value.startsWith("change_") ||
    value.startsWith("edit_") ||
    value.startsWith("update_") ||
    value.includes(" can change ") ||
    value.includes(" can edit ") ||
    value.includes(" can update ") ||
    value.includes("edit ")
  ) {
    return "Edit";
  }

  if (
    value.startsWith("delete_") ||
    value.startsWith("remove_") ||
    value.includes(" can delete ") ||
    value.includes(" can remove ") ||
    value.includes("delete ")
  ) {
    return "Delete";
  }

  if (value.includes("approve")) {
    return "Approve";
  }

  if (value.includes("archive")) {
    return "Archive";
  }

  if (
    value.includes("deactivate") ||
    value.includes("suspend") ||
    value.includes("block")
  ) {
    return "Deactivate";
  }

  if (
    value.includes("restore") ||
    value.includes("reactivate")
  ) {
    return "Restore";
  }

  if (
    value.includes("assign") ||
    value.includes("allocate")
  ) {
    return "Assign";
  }

  if (
    value.includes("download") ||
    value.includes("export")
  ) {
    return "Download";
  }

  if (
    value.includes("reveal") ||
    value.includes("sensitive")
  ) {
    return "Reveal";
  }

  if (value.includes("merge")) {
    return "Merge";
  }

  return "Other";
}

function resourceKeyFromPermission(permission: Permission): string {
  const codename = permission.codename.toLowerCase();

  const prefixes = [
    "view_",
    "add_",
    "create_",
    "change_",
    "edit_",
    "update_",
    "delete_",
    "remove_",
    "approve_",
    "archive_",
    "deactivate_",
    "suspend_",
    "block_",
    "restore_",
    "reactivate_",
    "assign_",
    "download_",
    "export_",
    "reveal_",
    "merge_",
  ];

  const prefix = prefixes.find((item) =>
    codename.startsWith(item),
  );

  if (prefix) {
    return codename.slice(prefix.length);
  }

  const name = permission.name.toLowerCase();

  const match = name.match(
    /(?:can\s+)?(?:view|add|create|change|edit|update|delete|remove|approve|archive|deactivate|suspend|block|restore|reactivate|assign|download|export|reveal|merge)\s+(.+)/,
  );

  if (match?.[1]) {
    return match[1].replace(/\s+/g, "");
  }

  return codename;
}

function decoratePermission(
  permission: Permission,
): DecoratedPermission {
  const action = inferAction(permission);
  const resourceKey = resourceKeyFromPermission(permission);

  return {
    permission,
    action,
    actionOrder: ACTION_ORDER[action],
    resourceKey,
    resourceLabel: humaniseToken(resourceKey),
  };
}

function groupPermissions(
  permissions: Permission[],
): PermissionGroup[] {
  const decorated = permissions
    .map(decoratePermission)
    .sort((a, b) => {
      if (a.resourceLabel !== b.resourceLabel) {
        return a.resourceLabel.localeCompare(b.resourceLabel);
      }

      if (a.actionOrder !== b.actionOrder) {
        return a.actionOrder - b.actionOrder;
      }

      return a.permission.name.localeCompare(b.permission.name);
    });

  const groups = new Map<string, PermissionGroup>();

  decorated.forEach((item) => {
    const existing = groups.get(item.resourceKey);

    if (existing) {
      existing.permissions.push(item);
      return;
    }

    groups.set(item.resourceKey, {
      key: item.resourceKey,
      label: item.resourceLabel,
      permissions: [item],
    });
  });

  return Array.from(groups.values());
}

function actionClass(action: PermissionAction): string {
  if (action === "View") {
    return "border-[#DBEAFE] bg-[#EFF6FF] text-[#1D4ED8]";
  }

  if (action === "Create") {
    return "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]";
  }

  if (action === "Edit") {
    return "border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C]";
  }

  if (action === "Delete") {
    return "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]";
  }

  return "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]";
}

export default function PermissionGroupedSummary({
  permissions,
}: PermissionGroupedSummaryProps) {
  const groups = groupPermissions(permissions);

  if (permissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-6 text-center text-sm text-[#64748B]">
        This role has no permissions.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section
          key={group.key}
          className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm"
        >
          <header className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF7ED] text-[#F46C0B]">
                <ShieldCheck className="h-4 w-4" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#0F172A]">
                  {group.label}
                </h4>

                <p className="text-xs text-[#64748B]">
                  {group.permissions.length} permission
                  {group.permissions.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </header>

          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {group.permissions.map((item) => (
              <div
                key={item.permission.id}
                className="rounded-xl border border-[#E2E8F0] bg-white p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${actionClass(
                      item.action,
                    )}`}
                  >
                    {item.action}
                  </span>

                  <span className="text-sm font-semibold text-[#0F172A]">
                    {item.permission.name}
                  </span>
                </div>

                <p className="mt-1 break-all text-xs text-[#64748B]">
                  {item.permission.codename}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}