"use client";

import {
  Columns3,
  Rows3,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import ActivityDetailDialog from "./activity-detail-dialog";
import type { AuditLogEntry } from "./types";
import {
  displayUser,
  formatEventLabel,
  formatSecurityDate,
} from "./utils";

type MobileTableMode =
  | "compact"
  | "full";

function StatusBadge({
  status,
}: {
  status: AuditLogEntry["status"];
}) {
  return (
    <Badge
      variant={
        status === "SUCCESS"
          ? "default"
          : "destructive"
      }
      className={
        status === "SUCCESS"
          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
          : undefined
      }
    >
      {status === "SUCCESS"
        ? "Success"
        : "Failed"}
    </Badge>
  );
}

function MobileTableToggle({
  mode,
  onChange,
}: {
  mode: MobileTableMode;
  onChange: (
    mode: MobileTableMode,
  ) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 md:hidden">
      <p className="text-sm font-medium">
        {mode === "compact"
          ? "Compact table"
          : "Full table"}
      </p>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange(
            mode === "compact"
              ? "full"
              : "compact",
          )
        }
      >
        {mode === "compact" ? (
          <Columns3 className="size-4" />
        ) : (
          <Rows3 className="size-4" />
        )}

        {mode === "compact"
          ? "Show full table"
          : "Compact view"}
      </Button>
    </div>
  );
}

function EmptyTableRow({
  columns,
  message,
}: {
  columns: number;
  message: string;
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={columns}
        className="h-32 text-center text-muted-foreground"
      >
        {message}
      </TableCell>
    </TableRow>
  );
}

/* LOGIN ACTIVITY — COMPACT MOBILE */

function LoginCompactTable({
  entries,
}: {
  entries: AuditLogEntry[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
      <table className="w-full table-fixed text-sm">
        <colgroup>
          <col className="w-[42%]" />
          <col className="w-[33%]" />
          <col className="w-[25%]" />
        </colgroup>

        <thead className="border-b bg-muted/40">
          <tr>
            <th className="h-11 px-3 text-left text-xs font-medium text-muted-foreground">
              User
            </th>

            <th className="h-11 px-2 text-left text-xs font-medium text-muted-foreground">
              Event
            </th>

            <th className="h-11 px-2 text-left text-xs font-medium text-muted-foreground">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="h-32 px-3 text-center text-muted-foreground"
              >
                No login activity matches the
                selected filters.
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b last:border-b-0"
              >
                <td className="min-w-0 px-3 py-3 align-top">
                  <p className="truncate font-medium">
                    {displayUser(
                      entry.user,
                      entry.username_attempted ||
                        "Unknown account",
                    )}
                  </p>

                  <p className="mt-1 text-xs leading-4 text-muted-foreground">
                    {formatSecurityDate(
                      entry.created_at,
                    )}
                  </p>
                </td>

                <td className="min-w-0 px-2 py-3 align-top">
                  <p className="line-clamp-2 text-xs font-medium leading-5">
                    {formatEventLabel(
                      entry.event_type,
                    )}
                  </p>
                </td>

                <td className="px-2 py-3 align-top">
                  <div className="flex flex-wrap items-center gap-1">
                    <StatusBadge
                      status={entry.status}
                    />

                    <ActivityDetailDialog
                      entry={entry}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* LOGIN ACTIVITY — FULL TABLE */

function LoginFullTable({
  entries,
}: {
  entries: AuditLogEntry[];
}) {
  return (
    <div className="rounded-xl border bg-background shadow-sm">
      <Table className="min-w-[1050px]">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-44">
              Date and time
            </TableHead>

            <TableHead className="min-w-48">
              User/account
            </TableHead>

            <TableHead className="min-w-52">
              Event
            </TableHead>

            <TableHead>Status</TableHead>

            <TableHead className="min-w-36">
              IP address
            </TableHead>

            <TableHead className="min-w-64">
              Device/browser
            </TableHead>

            <TableHead className="w-16 text-right">
              View
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {entries.length === 0 ? (
            <EmptyTableRow
              columns={7}
              message="No login activity matches the selected filters."
            />
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="whitespace-nowrap">
                  {formatSecurityDate(
                    entry.created_at,
                  )}
                </TableCell>

                <TableCell>
                  <p className="font-medium">
                    {displayUser(
                      entry.user,
                      entry.username_attempted ||
                        "Unknown account",
                    )}
                  </p>

                  {entry.user?.email && (
                    <p className="text-xs text-muted-foreground">
                      {entry.user.email}
                    </p>
                  )}
                </TableCell>

                <TableCell>
                  <Badge variant="outline">
                    {formatEventLabel(
                      entry.event_type,
                    )}
                  </Badge>
                </TableCell>

                <TableCell>
                  <StatusBadge
                    status={entry.status}
                  />
                </TableCell>

                <TableCell className="font-mono text-xs">
                  {entry.ip_address ?? "—"}
                </TableCell>

                <TableCell
                  className="max-w-72 truncate text-sm text-muted-foreground"
                  title={
                    entry.user_agent ?? undefined
                  }
                >
                  {entry.user_agent || "—"}
                </TableCell>

                <TableCell className="text-right">
                  <ActivityDetailDialog
                    entry={entry}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/* AUDIT LOG — COMPACT MOBILE */

function AuditCompactTable({
  entries,
}: {
  entries: AuditLogEntry[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
      <table className="w-full table-fixed text-sm">
        <colgroup>
          <col className="w-[40%]" />
          <col className="w-[35%]" />
          <col className="w-[25%]" />
        </colgroup>

        <thead className="border-b bg-muted/40">
          <tr>
            <th className="h-11 px-3 text-left text-xs font-medium text-muted-foreground">
              Actor
            </th>

            <th className="h-11 px-2 text-left text-xs font-medium text-muted-foreground">
              Activity
            </th>

            <th className="h-11 px-2 text-left text-xs font-medium text-muted-foreground">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="h-32 px-3 text-center text-muted-foreground"
              >
                No audit logs match the selected
                filters.
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b last:border-b-0"
              >
                <td className="min-w-0 px-3 py-3 align-top">
                  <p className="truncate font-medium">
                    {displayUser(entry.user)}
                  </p>

                  <p className="mt-1 text-xs leading-4 text-muted-foreground">
                    {formatSecurityDate(
                      entry.created_at,
                    )}
                  </p>
                </td>

                <td className="min-w-0 px-2 py-3 align-top">
                  <p className="truncate text-xs font-semibold">
                    {entry.action ||
                      formatEventLabel(
                        entry.event_type,
                      )}
                  </p>

                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {entry.resource || "—"}
                  </p>
                </td>

                <td className="px-2 py-3 align-top">
                  <div className="flex flex-wrap items-center gap-1">
                    <StatusBadge
                      status={entry.status}
                    />

                    <ActivityDetailDialog
                      entry={entry}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* AUDIT LOG — FULL TABLE */

function AuditFullTable({
  entries,
}: {
  entries: AuditLogEntry[];
}) {
  return (
    <div className="rounded-xl border bg-background shadow-sm">
      <Table className="min-w-[1120px]">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-44">
              Date and time
            </TableHead>

            <TableHead className="min-w-44">
              Actor
            </TableHead>

            <TableHead className="min-w-36">
              Action
            </TableHead>

            <TableHead className="min-w-44">
              Resource
            </TableHead>

            <TableHead className="min-w-44">
              Target
            </TableHead>

            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>

            <TableHead className="w-16 text-right">
              View
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {entries.length === 0 ? (
            <EmptyTableRow
              columns={8}
              message="No audit logs match the selected filters."
            />
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="whitespace-nowrap">
                  {formatSecurityDate(
                    entry.created_at,
                  )}
                </TableCell>

                <TableCell>
                  <p className="font-medium">
                    {displayUser(entry.user)}
                  </p>

                  {entry.user?.email && (
                    <p className="text-xs text-muted-foreground">
                      {entry.user.email}
                    </p>
                  )}
                </TableCell>

                <TableCell>
                  <Badge variant="outline">
                    {entry.action ||
                      formatEventLabel(
                        entry.event_type,
                      )}
                  </Badge>
                </TableCell>

                <TableCell>
                  <p className="font-medium">
                    {entry.resource || "—"}
                  </p>

                  {entry.object_id && (
                    <p className="max-w-44 truncate text-xs text-muted-foreground">
                      {entry.object_id}
                    </p>
                  )}
                </TableCell>

                <TableCell>
                  {displayUser(
                    entry.target_user,
                    "—",
                  )}
                </TableCell>

                <TableCell>
                  <StatusBadge
                    status={entry.status}
                  />
                </TableCell>

                <TableCell>
                  <Badge variant="secondary">
                    {entry.event_category ||
                      "General"}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <ActivityDetailDialog
                    entry={entry}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/* EXPORTED LOGIN TABLE */

export function LoginActivityTable({
  entries,
}: {
  entries: AuditLogEntry[];
}) {
  const [mobileMode, setMobileMode] =
    useState<MobileTableMode>("compact");

  return (
    <div className="space-y-3">
      <MobileTableToggle
        mode={mobileMode}
        onChange={setMobileMode}
      />

      <div className="md:hidden">
        {mobileMode === "compact" ? (
          <LoginCompactTable
            entries={entries}
          />
        ) : (
          <div className="overflow-x-auto pb-2">
            <LoginFullTable
              entries={entries}
            />
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto pb-2 md:block">
        <LoginFullTable entries={entries} />
      </div>
    </div>
  );
}

/* EXPORTED AUDIT TABLE */

export function AuditLogTable({
  entries,
}: {
  entries: AuditLogEntry[];
}) {
  const [mobileMode, setMobileMode] =
    useState<MobileTableMode>("compact");

  return (
    <div className="space-y-3">
      <MobileTableToggle
        mode={mobileMode}
        onChange={setMobileMode}
      />

      <div className="md:hidden">
        {mobileMode === "compact" ? (
          <AuditCompactTable
            entries={entries}
          />
        ) : (
          <div className="overflow-x-auto pb-2">
            <AuditFullTable
              entries={entries}
            />
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto pb-2 md:block">
        <AuditFullTable entries={entries} />
      </div>
    </div>
  );
}