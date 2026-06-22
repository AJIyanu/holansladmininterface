"use client";

import { useState } from "react";

import type { CurrentUser } from "@/types/auth";

import StaffCard from "./staff-card";
import StaffEmptyState from "./staff-empty-state";
import StaffPagination from "./staff-pagination";
import type { StaffProfile } from "./staff-list-types";

interface StaffListProps {
  staff: StaffProfile[];
  count: number;
  page: number;
  pageSize: number;
  user: CurrentUser;
}

export default function StaffList({
  staff,
  count,
  page,
  pageSize,
  user,
}: StaffListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (staff.length === 0) {
    return <StaffEmptyState />;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {count} staff account
        {count === 1 ? "" : "s"} found
      </div>

      <div className="space-y-4">
        {staff.map((profile) => (
          <StaffCard
            key={profile.id}
            profile={profile}
            user={user}
            expanded={expandedId === profile.id}
            onToggle={() =>
              setExpandedId((current) =>
                current === profile.id ? null : profile.id,
              )
            }
          />
        ))}
      </div>

      <StaffPagination count={count} page={page} pageSize={pageSize} />
    </div>
  );
}
