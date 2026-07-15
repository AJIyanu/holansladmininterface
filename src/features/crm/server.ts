import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth-server";
import { hasPermission } from "@/types/auth";
import type { CurrentUser } from "@/types/auth";

import { crmPermissionInput } from "./permissions";

import type { CrmPermissionInput } from "./permissions";

export async function requireCrmPermission(
  permission: CrmPermissionInput,
): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const allowed = hasPermission(user, crmPermissionInput(permission));

  if (!allowed) {
    redirect("/dashboard/unauthorized");
  }

  return user;
}
