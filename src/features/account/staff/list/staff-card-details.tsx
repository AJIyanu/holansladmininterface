import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Contact,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";

import type { StaffProfile } from "./staff-list-types";

interface StaffCardDetailsProps {
  profile: StaffProfile;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>

      <dd className="mt-1 text-sm font-medium">{value || "Not provided"}</dd>
    </div>
  );
}

export default function StaffCardDetails({ profile }: StaffCardDetailsProps) {
  return (
    <div className="border-t bg-muted/20 p-5">
      <div className="grid gap-6 xl:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <UserRound className="size-4 text-[#0B4F8A]" />
            <h3 className="font-semibold">Personal information</h3>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Username" value={profile.user.username} />
            <DetailItem
              label="Sex"
              value={
                profile.sex === "M"
                  ? "Male"
                  : profile.sex === "F"
                    ? "Female"
                    : "Not provided"
              }
            />
            <DetailItem
              label="Date of birth"
              value={formatDate(profile.date_of_birth)}
            />
            <DetailItem label="Nationality" value={profile.nationality} />
          </dl>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <BriefcaseBusiness className="size-4 text-[#0B4F8A]" />
            <h3 className="font-semibold">Employment information</h3>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Employee ID" value={profile.employee_id} />
            <DetailItem label="Job title" value={profile.job_title} />
            <DetailItem
              label="Start date"
              value={formatDate(profile.start_date)}
            />
            <DetailItem label="End date" value={formatDate(profile.end_date)} />
          </dl>
        </section>
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6 xl:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Contact className="size-4 text-[#0B4F8A]" />
            <h3 className="font-semibold">Contact information</h3>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Email" value={profile.user.email} />
            <DetailItem label="Phone" value={profile.phone_number} />
            <div className="sm:col-span-2">
              <DetailItem label="Address" value={profile.address} />
            </div>
          </dl>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="size-4 text-[#0B4F8A]" />
            <h3 className="font-semibold">Account and access</h3>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem
              label="Account status"
              value={profile.user.is_active ? "Active" : "Inactive"}
            />
            <DetailItem
              label="Staff access"
              value={profile.user.is_staff ? "Enabled" : "Disabled"}
            />
            <DetailItem
              label="Department"
              value={
                profile.department
                  ? `${profile.department.name} (${profile.department.code})`
                  : "Not assigned"
              }
            />
            <DetailItem
              label="Roles"
              value={
                profile.user.roles.length
                  ? profile.user.roles.map((role) => role.name).join(", ")
                  : "No roles assigned"
              }
            />
          </dl>
        </section>
      </div>
    </div>
  );
}
