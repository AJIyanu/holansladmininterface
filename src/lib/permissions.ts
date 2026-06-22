import type { CurrentUser } from "@/types/auth";

export function hasPermission(user: CurrentUser, permission: string): boolean {
  return user.is_superuser || user.permissions.includes(permission);
}

export function hasAnyPermission(
  user: CurrentUser,
  permissions: string[],
): boolean {
  return (
    user.is_superuser ||
    permissions.some((permission) => user.permissions.includes(permission))
  );
}
