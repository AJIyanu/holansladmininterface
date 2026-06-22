import { redirect } from "next/navigation";
import { ShieldCheck, UserPlus } from "lucide-react";

import ResponsiveActionGuard from "@/components/shared/responsive-action-guard";
import StaffForm from "@/features/account/staff/staff-form";
import type { Department } from "@/features/account/staff/types";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch } from "@/lib/server-fetch";

interface PaginatedDepartments {
  count: number;
  next: string | null;
  previous: string | null;
  results: Department[];
}

export default async function AddStaffPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!hasPermission(user, "accounts.staffprofile.create")) {
    redirect("/dashboard/unauthorized");
  }

  let departments: Department[] = [];

try {
  const departmentResponse =
    await serverFetch<PaginatedDepartments>(
      "/account/departments/?page_size=1000&ordering=name",
    );

  departments = departmentResponse.results;
} catch {
  departments = [];
}

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-blue-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#0B4F8A]">
            <UserPlus className="size-4" />
            User Management
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Add new staff
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Create a company account and employment profile for a new staff
            member.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-full border bg-background px-3 py-2 text-xs text-muted-foreground md:flex">
          <ShieldCheck className="size-4 text-[#F46C0B]" />
          Restricted administrative action
        </div>
      </div>

      <ResponsiveActionGuard actionName="adding a new staff member">
        {departments.length > 0 ? (
          <StaffForm departments={departments} />
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <h2 className="font-semibold">Departments unavailable</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Departments could not be loaded. Add at least one department or
              refresh the page.
            </p>
          </div>
        )}
      </ResponsiveActionGuard>
    </div>
  );
}
