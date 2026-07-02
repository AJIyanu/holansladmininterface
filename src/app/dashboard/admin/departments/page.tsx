import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";

import CreateDepartmentDialog from "@/features/account/access/departments/create-department-dialog";
import DepartmentFilters from "@/features/account/access/departments/department-filters";
import DepartmentsList from "@/features/account/access/departments/departments-list";
import type {
  Department,
  PaginatedResponse,
} from "@/features/account/access/shared/access-types";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch } from "@/lib/server-fetch";

interface DepartmentsPageProps {
  searchParams: Promise<{
    page?: string;
    page_size?: string;
    search?: string;
    ordering?: string;
  }>;
}

export default async function DepartmentsPage({
  searchParams,
}: DepartmentsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!hasPermission(user, "accounts.department.view")) {
    redirect("/dashboard/unauthorized");
  }

  const params = await searchParams;

  const query = new URLSearchParams({
    page: params.page ?? "1",
    page_size: params.page_size ?? "10",
    ordering: params.ordering ?? "name",
  });

  if (params.search) {
    query.set("search", params.search);
  }

  const departmentResponse = await serverFetch<PaginatedResponse<Department>>(
    `/account/departments/?${query.toString()}`,
  );

  return (
    <div className="bg-blue-100 min-h-screen space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#0B4F8A]">
            <Building2 className="size-4" />
            User Management
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Departments
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage company departments and staff assignments.
          </p>
        </div>

        {hasPermission(user, "accounts.department.create") && (
          <CreateDepartmentDialog />
        )}
      </div>

      <DepartmentFilters
        search={params.search}
        ordering={params.ordering}
        pageSize={params.page_size}
      />

      <DepartmentsList
        departments={departmentResponse.results}
        count={departmentResponse.count}
        page={Number(params.page ?? 1)}
        pageSize={Number(params.page_size ?? 10)}
        currentUser={user}
      />
    </div>
  );
}
