"use client";

import { CheckSquare, Eraser, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import type { Permission } from "./access-types";

interface PermissionMatrixSelectorProps {
  permissions: Permission[];
  selected: number[];
  onSelectedChange: (selected: number[]) => void;
  emptyMessage?: string;
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
  searchableText: string;
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

  if (value.includes("restore") || value.includes("reactivate")) {
    return "Restore";
  }

  if (value.includes("assign") || value.includes("allocate")) {
    return "Assign";
  }

  if (value.includes("download") || value.includes("export")) {
    return "Download";
  }

  if (value.includes("reveal") || value.includes("sensitive")) {
    return "Reveal";
  }

  if (value.includes("merge")) {
    return "Merge";
  }

  return "Other";
}

function resourceKeyFromPermission(permission: Permission): string {
  const codename = permission.codename.toLowerCase();

  const actionPrefixes = [
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

  const matchedPrefix = actionPrefixes.find((prefix) =>
    codename.startsWith(prefix),
  );

  if (matchedPrefix) {
    return codename.slice(matchedPrefix.length);
  }

  const name = permission.name.toLowerCase();

  const nameMatch = name.match(
    /(?:can\s+)?(?:view|add|create|change|edit|update|delete|remove|approve|archive|deactivate|suspend|block|restore|reactivate|assign|download|export|reveal|merge)\s+(.+)/,
  );

  if (nameMatch?.[1]) {
    return nameMatch[1].replace(/\s+/g, "");
  }

  return codename;
}

function decoratePermission(permission: Permission): DecoratedPermission {
  const action = inferAction(permission);
  const resourceKey = resourceKeyFromPermission(permission);
  const resourceLabel = humaniseToken(resourceKey);

  return {
    permission,
    action,
    actionOrder: ACTION_ORDER[action],
    resourceKey,
    resourceLabel,
    searchableText:
      `${permission.name} ${permission.codename} ${resourceLabel} ${action}`.toLowerCase(),
  };
}

function groupPermissions(
  permissions: Permission[],
  search: string,
): PermissionGroup[] {
  const query = search.trim().toLowerCase();

  const decorated = permissions
    .map(decoratePermission)
    .filter((item) => (query ? item.searchableText.includes(query) : true))
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
    const group = groups.get(item.resourceKey);

    if (group) {
      group.permissions.push(item);
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

function actionBadgeClass(action: PermissionAction): string {
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

export default function PermissionMatrixSelector({
  permissions,
  selected,
  onSelectedChange,
  emptyMessage = "No permissions available.",
}: PermissionMatrixSelectorProps) {
  const [search, setSearch] = useState("");

  const groups = useMemo(
    () => groupPermissions(permissions, search),
    [permissions, search],
  );

  const visiblePermissionIds = useMemo(
    () =>
      groups.flatMap((group) =>
        group.permissions.map((item) => item.permission.id),
      ),
    [groups],
  );

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const visibleSelectedCount = visiblePermissionIds.filter((id) =>
    selectedSet.has(id),
  ).length;

  function setPermissionChecked(permissionId: number, checked: boolean) {
    if (checked) {
      onSelectedChange(Array.from(new Set([...selected, permissionId])));
      return;
    }

    onSelectedChange(selected.filter((id) => id !== permissionId));
  }

  function setManyChecked(permissionIds: number[], checked: boolean) {
    if (checked) {
      onSelectedChange(Array.from(new Set([...selected, ...permissionIds])));
      return;
    }

    const idsToRemove = new Set(permissionIds);

    onSelectedChange(selected.filter((id) => !idsToRemove.has(id)));
  }

  function selectAllVisible() {
    setManyChecked(visiblePermissionIds, true);
  }

  function clearAllVisible() {
    setManyChecked(visiblePermissionIds, false);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#E2E8F0] bg-white/70 p-4 shadow-sm backdrop-blur-md">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">
              Permission selector
            </p>

            <p className="mt-1 text-xs text-[#64748B]">
              {selected.length} selected · {visibleSelectedCount} selected in
              current view
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={selectAllVisible}
              disabled={visiblePermissionIds.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F4C81] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0B3A63] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckSquare className="h-4 w-4" />
              Select all shown
            </button>

            <button
              type="button"
              onClick={clearAllVisible}
              disabled={visiblePermissionIds.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm font-semibold text-[#334155] transition hover:border-[#F46C0B] hover:text-[#F46C0B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Eraser className="h-4 w-4" />
              Clear shown
            </button>
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search permission, action, module or codename..."
            className="h-11 w-full rounded-lg border border-[#CBD5E1] bg-white pl-10 pr-3 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#F46C0B] focus:ring-2 focus:ring-[#FED7AA]"
          />
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center text-sm text-[#64748B]">
          {emptyMessage}
        </div>
      ) : (
        <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-1">
          {groups.map((group) => {
            const groupPermissionIds = group.permissions.map(
              (item) => item.permission.id,
            );

            const selectedInGroup = groupPermissionIds.filter((id) =>
              selectedSet.has(id),
            );

            const allGroupSelected =
              groupPermissionIds.length > 0 &&
              selectedInGroup.length === groupPermissionIds.length;

            return (
              <section
                key={group.key}
                className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm"
              >
                <div className="flex flex-col gap-3 border-b border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF7ED] text-[#F46C0B]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">
                        {group.label}
                      </h3>

                      <p className="mt-1 text-xs text-[#64748B]">
                        {selectedInGroup.length} of {groupPermissionIds.length}{" "}
                        selected
                      </p>
                    </div>
                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm font-semibold text-[#334155] transition hover:border-[#F46C0B] hover:text-[#F46C0B]">
                    <input
                      type="checkbox"
                      checked={allGroupSelected}
                      onChange={(event) =>
                        setManyChecked(groupPermissionIds, event.target.checked)
                      }
                      className="h-4 w-4 rounded border-[#CBD5E1] accent-[#F46C0B]"
                    />
                    Select section
                  </label>
                </div>

                <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                  {group.permissions.map((item) => {
                    const checked = selectedSet.has(item.permission.id);

                    return (
                      <label
                        key={item.permission.id}
                        className={`grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-xl border p-3 transition ${
                          checked
                            ? "border-[#F46C0B] bg-[#FFF7ED]"
                            : "border-[#E2E8F0] bg-white hover:border-[#FED7AA]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) =>
                            setPermissionChecked(
                              item.permission.id,
                              event.target.checked,
                            )
                          }
                          className="mt-1 h-4 w-4 rounded border-[#CBD5E1] accent-[#F46C0B]"
                        />

                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${actionBadgeClass(
                                item.action,
                              )}`}
                            >
                              {item.action}
                            </span>

                            <span className="truncate text-sm font-semibold text-[#0F172A]">
                              {item.permission.name}
                            </span>
                          </span>

                          <span className="mt-1 block break-all text-xs text-[#64748B]">
                            {item.permission.codename}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
