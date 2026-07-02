import type { TaskScope } from "@/types/tasks";

export interface TaskAccessUser {
  is_superuser: boolean;
  permissions: string[];
}

const DEPARTMENT_TASK_PERMISSIONS = [
  "tasks.department_task.view",
  "tasks.department_task.manage",
  "tasks.all_task.view",
  "tasks.all_task.manage",
];

const ALL_TASK_PERMISSIONS = ["tasks.all_task.view", "tasks.all_task.manage"];

export function hasAnyTaskPermission(
  user: TaskAccessUser,
  permissions: string[],
): boolean {
  if (user.is_superuser) {
    return true;
  }

  const userPermissions = new Set(user.permissions ?? []);

  return permissions.some((permission) => userPermissions.has(permission));
}

export function canViewDepartmentTaskScope(user: TaskAccessUser): boolean {
  return hasAnyTaskPermission(user, DEPARTMENT_TASK_PERMISSIONS);
}

export function canViewAllTaskScope(user: TaskAccessUser): boolean {
  return hasAnyTaskPermission(user, ALL_TASK_PERMISSIONS);
}

export function canViewTaskScope(
  user: TaskAccessUser,
  scope: TaskScope,
): boolean {
  if (scope === "my" || scope === "created") {
    return true;
  }

  if (scope === "department") {
    return canViewDepartmentTaskScope(user);
  }

  return canViewAllTaskScope(user);
}

const SELECTED_STAFF_ASSIGN_PERMISSIONS = [
  "tasks.task.assign",
  "tasks.department_task.assign",
  "tasks.department_task.manage",
  "tasks.all_task.assign",
  "tasks.all_task.manage",
];

const DEPARTMENT_ASSIGN_PERMISSIONS = [
  "tasks.department_task.assign",
  "tasks.department_task.manage",
  "tasks.all_task.assign",
  "tasks.all_task.manage",
];

export function canAssignTasksToUsers(user: TaskAccessUser): boolean {
  return hasAnyTaskPermission(user, SELECTED_STAFF_ASSIGN_PERMISSIONS);
}

export function canAssignTasksToDepartment(user: TaskAccessUser): boolean {
  return hasAnyTaskPermission(user, DEPARTMENT_ASSIGN_PERMISSIONS);
}

export function getTaskCreateCapabilities(user: TaskAccessUser) {
  return {
    canCreatePersonal: true,
    canAssignUsers: canAssignTasksToUsers(user),
    canAssignDepartment: canAssignTasksToDepartment(user),
  };
}
