import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import StaffFilters from "@/features/account/staff/list/staff-filters";
import StaffList from "@/features/account/staff/list/staff-list";
import type {
  PaginatedStaffResponse,
  StaffListSearchParams,
} from "@/features/account/staff/list/staff-list-types";
import type { Department } from "@/features/account/staff/types";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch } from "@/lib/server-fetch";

interface StaffPageProps {
  searchParams: Promise<StaffListSearchParams>;
}

function buildQuery(searchParams: StaffListSearchParams): string {
  const query = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, value);
    }
  });

  if (!query.has("page_size")) {
    query.set("page_size", "10");
  }

  return query.toString();
}

export default async function StaffAccountsPage({
  searchParams,
}: StaffPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!hasPermission(user, "accounts.staffprofile.view")) {
    redirect("/dashboard/unauthorized");
  }

  const params = await searchParams;
  const query = buildQuery(params);

  const [staffResponse, departmentResponse] = await Promise.all([
    serverFetch<PaginatedStaffResponse>(`/account/profiles/?${query}`),
    serverFetch<{
      count: number;
      results: Department[];
    }>("/account/departments/?page_size=100&ordering=name"),
  ]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-blue-100 min-h-screen">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#0B4F8A]">
            <Users className="size-4" />
            User Management
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Staff accounts
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            View and manage registered staff accounts.
          </p>
        </div>

        {hasPermission(user, "accounts.staffprofile.create") && (
          <Button
            asChild
            className="bg-[#0B4F8A] text-white hover:bg-[#0B4F8A]/90"
          >
            <Link href="/dashboard/admin/newstaff">
              <Plus className="size-4" />
              Add staff
            </Link>
          </Button>
        )}
      </div>

      <StaffFilters departments={departmentResponse.results} values={params} />

      <StaffList
        staff={staffResponse.results}
        count={staffResponse.count}
        page={Number(params.page ?? 1)}
        pageSize={Number(params.page_size ?? 10)}
        user={user}
      />
    </div>
  );
}
