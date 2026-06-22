"use client";

import {
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/types/auth";

import StaffActionsMenu from "./staff-actions-menu";
import StaffCardDetails from "./staff-card-details";
import type { StaffProfile } from "./staff-list-types";

interface StaffCardProps {
  profile: StaffProfile;
  user: CurrentUser;
  expanded: boolean;
  onToggle: () => void;
}

const employmentLabels = {
  FT: "Full-Time",
  PT: "Part-Time",
  CT: "Contract",
  IN: "Intern",
};

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function StaffCard({
  profile,
  user,
  expanded,
  onToggle,
}: StaffCardProps) {
  const fullName =
    `${profile.user.first_name} ${profile.middle_name} ${profile.user.last_name}`
      .replace(/\s+/g, " ")
      .trim();

  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow",
        expanded && "shadow-md",
      )}
    >
      <CardContent className="p-0">
        <div className="flex gap-4 p-4 sm:p-5">
          <button
            type="button"
            onClick={onToggle}
            className="flex min-w-0 flex-1 items-start gap-4 text-left"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#0B4F8A] font-semibold text-white">
              {getInitials(profile.user.first_name, profile.user.last_name)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-base font-semibold sm:text-lg">
                  {fullName}
                </h2>

                <Badge
                  variant={profile.user.is_active ? "default" : "secondary"}
                  className={
                    profile.user.is_active
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-red-100 text-red-700 hover:bg-red-100"
                  }
                >
                  {profile.user.is_active ? "Active" : "Inactive"}
                </Badge>

                <Badge variant="outline">
                  {employmentLabels[profile.employment_type]}
                </Badge>
              </div>

              <p className="mt-1 text-sm font-medium text-[#0B4F8A]">
                {profile.job_title}
              </p>

              <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                <span className="flex items-center gap-2">
                  <UserRound className="size-4" />
                  {profile.employee_id}
                </span>

                <span className="flex items-center gap-2">
                  <Building2 className="size-4" />
                  {profile.department?.name ?? "No department"}
                </span>

                <span className="flex min-w-0 items-center gap-2">
                  <Mail className="size-4 shrink-0" />
                  <span className="truncate">{profile.user.email}</span>
                </span>

                <span className="flex items-center gap-2">
                  <Phone className="size-4" />
                  {profile.phone_number}
                </span>
              </div>

              {profile.user.roles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.user.roles.map((role) => (
                    <Badge key={role.id} variant="secondary">
                      {role.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </button>

          <div className="flex shrink-0 items-start gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onToggle}
              aria-label={
                expanded ? "Collapse staff details" : "Expand staff details"
              }
            >
              {expanded ? (
                <ChevronUp className="size-5" />
              ) : (
                <ChevronDown className="size-5" />
              )}
            </Button>

            <StaffActionsMenu profile={profile} currentUser={user} />
          </div>
        </div>

        {expanded && <StaffCardDetails profile={profile} />}
      </CardContent>
    </Card>
  );
}
