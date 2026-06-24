import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import CreateRoleDialog from "@/features/account/access/roles/create-role-dialog";
import RoleFilters from "@/features/account/access/roles/role-filters";
import RolesList from "@/features/account/access/roles/roles-list";
import type {
  PaginatedResponse,
  Permission,
  Role,
} from "@/features/account/access/shared/access-types";
import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/lib/permissions";
import { serverFetch } from "@/lib/server-fetch";

interface RolesPageProps {
  searchParams: Promise<{
    page?: string;
    page_size?: string;
    search?: string;
    ordering?: string;
  }>;
}

export default async function RolesPage({
  searchParams,
}: RolesPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (
    !hasPermission(
      user,
      "accounts.role.view",
    )
  ) {
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

  const [roleResponse, permissions] =
    await Promise.all([
      serverFetch<PaginatedResponse<Role>>(
        `/account/roles/?${query.toString()}`,
      ),
      serverFetch<Permission[]>(
        "/account/permissions/?ordering=codename",
      ),
    ]);

  return (
    <div className="bg-blue-100 min-h-screen space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#0B4F8A]">
            <ShieldCheck className="size-4" />
            User Management
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Roles & permissions
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Create roles and manage their permissions and
            staff assignments.
          </p>
        </div>

        {hasPermission(
          user,
          "accounts.role.create",
        ) && (
          <CreateRoleDialog
            permissions={permissions}
          />
        )}
      </div>

      <RoleFilters
        search={params.search}
        ordering={params.ordering}
        pageSize={params.page_size}
      />

      <RolesList
        roles={roleResponse.results}
        permissions={permissions}
        count={roleResponse.count}
        page={Number(params.page ?? 1)}
        pageSize={Number(
          params.page_size ?? 10,
        )}
        currentUser={user}
      />
    </div>
  );
}