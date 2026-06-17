export type UserRole =
  | {
      id: string | number;
      name: string;
      code?: string;
    }
  | string
  | number;

export interface UserProfile {
  id: string;
  employee_id?: string;
  job_title?: string;
  employment_type?: string;
  start_date?: string | null;
  end_date?: string | null;
  phone_number?: string;
  address?: string;
  middle_name?: string;
  sex?: string;
  date_of_birth?: string | null;
  nationality?: string;
  department?: string | null;
}

export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  roles: UserRole[];
  permissions: string[];
  profile: UserProfile | null;
}

export function getUserDisplayName(user: CurrentUser): string {
  const fullName = `${user.first_name} ${user.last_name}`.trim();

  return fullName || user.username || user.email;
}

export function getPrimaryRole(user: CurrentUser): string {
  const role = user.roles[0];

  if (typeof role === "object" && role !== null) {
    return role.name;
  }

  if (typeof role === "string") {
    return role;
  }

  return user.profile?.job_title || "Staff";
}

export function hasPermission(user: CurrentUser, permission?: string): boolean {
  if (!permission) {
    return true;
  }

  if (user.is_superuser) {
    return true;
  }

  return user.permissions.includes(permission);
}
