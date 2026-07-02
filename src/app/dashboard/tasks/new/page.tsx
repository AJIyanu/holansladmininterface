import type { Metadata } from "next";

import { CreateTaskForm } from "@/components/tasks/task-form/CreateTaskForm";

import { getTaskDepartmentOptions, getTaskStaffOptions } from "@/lib/api/tasks";
import { getCurrentUser } from "@/lib/auth-server";
import { getTaskCreateCapabilities } from "@/lib/tasks/task-access";

import type { TaskDepartmentOption, TaskStaffOption } from "@/types/tasks";

export const metadata: Metadata = {
  title: "Create Task",
};

export default async function CreateTaskPage() {
  const currentUser = await getCurrentUser();

  const capabilities = getTaskCreateCapabilities({
    is_superuser: currentUser?.is_superuser ?? false,
    permissions: currentUser?.permissions ?? [],
  });

  let staff: TaskStaffOption[] = [];
  let departments: TaskDepartmentOption[] = [];

  let staffLoadError: string | undefined;
  let departmentLoadError: string | undefined;

  const [staffResult, departmentResult] = await Promise.allSettled([
    capabilities.canAssignUsers ? getTaskStaffOptions() : Promise.resolve([]),

    capabilities.canAssignDepartment
      ? getTaskDepartmentOptions()
      : Promise.resolve([]),
  ]);

  if (staffResult.status === "fulfilled") {
    staff = staffResult.value;
  } else {
    staffLoadError =
      "The staff directory could not be loaded. Personal-task creation remains available.";
  }

  if (departmentResult.status === "fulfilled") {
    departments = departmentResult.value;
  } else {
    departmentLoadError =
      "Departments could not be loaded. Personal-task creation remains available.";
  }

  const effectiveCapabilities = {
    ...capabilities,

    canAssignUsers: capabilities.canAssignUsers && !staffLoadError,

    canAssignDepartment:
      capabilities.canAssignDepartment && !departmentLoadError,
  };

  return (
    <div className="space-y-6 bg-blue-100 p-9 min-h-screen">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Create Task</h1>

        <p className="text-sm text-muted-foreground">
          Create a personal task or assign individual task copies to staff.
        </p>
      </header>

      <CreateTaskForm
        capabilities={effectiveCapabilities}
        staff={staff}
        departments={departments}
        staffLoadError={staffLoadError}
        departmentLoadError={departmentLoadError}
      />
    </div>
  );
}
