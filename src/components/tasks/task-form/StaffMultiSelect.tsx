"use client";

import { useMemo, useState } from "react";

import { Search, UserRound, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { TaskStaffOption } from "@/types/tasks";

interface StaffMultiSelectProps {
  staff: TaskStaffOption[];
  value: string[];
  onChange: (userIds: string[]) => void;
  error?: string;
}

export function StaffMultiSelect({
  staff,
  value,
  onChange,
  error,
}: StaffMultiSelectProps) {
  const [search, setSearch] = useState("");

  const selectedIds = useMemo(() => new Set(value), [value]);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return staff;
    }

    return staff.filter((member) => {
      const searchableValue = [
        member.fullName,
        member.email,
        member.employeeId,
        member.jobTitle,
        member.department?.name,
        member.department?.code,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableValue.includes(query);
    });
  }, [search, staff]);

  const selectedStaff = staff.filter((member) =>
    selectedIds.has(member.userId),
  );

  function toggleStaff(userId: string, checked: boolean) {
    if (checked) {
      onChange(Array.from(new Set([...value, userId])));
      return;
    }

    onChange(value.filter((id) => id !== userId));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label>Staff members</Label>

        <span className="text-xs text-muted-foreground">
          {value.length} selected
        </span>
      </div>

      {selectedStaff.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedStaff.map((member) => (
            <Badge
              key={member.userId}
              variant="secondary"
              className="gap-1 py-1"
            >
              {member.fullName}

              <button
                type="button"
                aria-label={`Remove ${member.fullName}`}
                onClick={() => toggleStaff(member.userId, false)}
                className="rounded-full p-0.5 hover:bg-background"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search staff by name, email, department or employee ID"
          className="pl-9 placeholder:text-muted-foreground/70"
        />
      </div>

      <div
        className="max-h-80 overflow-y-auto rounded-lg border"
        aria-label="Available staff"
      >
        {filteredStaff.length === 0 ? (
          <div className="flex min-h-32 flex-col items-center justify-center p-6 text-center">
            <UserRound className="mb-2 size-6 text-muted-foreground" />

            <p className="text-sm font-medium">No staff found</p>

            <p className="mt-1 text-xs text-muted-foreground">
              Try another search term.
            </p>
          </div>
        ) : (
          filteredStaff.map((member) => {
            const checked = selectedIds.has(member.userId);

            return (
              <Label
                key={member.userId}
                htmlFor={`staff-${member.userId}`}
                className="flex cursor-pointer items-start gap-3 border-b p-3 last:border-b-0 hover:bg-muted/40"
              >
                <Checkbox
                  id={`staff-${member.userId}`}
                  checked={checked}
                  onCheckedChange={(state) =>
                    toggleStaff(member.userId, state === true)
                  }
                  className="mt-1"
                />

                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {member.fullName}
                  </span>

                  <span className="block truncate text-xs font-normal text-muted-foreground">
                    {[member.jobTitle, member.department?.name]
                      .filter(Boolean)
                      .join(" · ") || member.email}
                  </span>

                  {member.employeeId ? (
                    <span className="block text-xs font-normal text-muted-foreground">
                      ID: {member.employeeId}
                    </span>
                  ) : null}
                </span>
              </Label>
            );
          })
        )}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
