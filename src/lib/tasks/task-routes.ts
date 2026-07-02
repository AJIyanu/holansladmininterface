import type { TaskScope } from "@/types/tasks";

export interface TaskScopeRoute {
  scope: TaskScope;
  title: string;
  shortTitle: string;
  description: string;
  href: string;
}

export const TASK_SCOPE_ROUTES: TaskScopeRoute[] = [
  {
    scope: "my",
    title: "My Tasks",
    shortTitle: "My Tasks",
    description: "View and manage tasks assigned to you.",
    href: "/dashboard/tasks",
  },
  {
    scope: "created",
    title: "Assigned by Me",
    shortTitle: "Assigned",
    description: "Track tasks and assignments you created.",
    href: "/dashboard/tasks/created",
  },
  {
    scope: "department",
    title: "Department Tasks",
    shortTitle: "Department",
    description:
      "View tasks within departments and reporting lines you manage.",
    href: "/dashboard/tasks/department",
  },
  {
    scope: "all",
    title: "All Tasks",
    shortTitle: "All Tasks",
    description: "View task activity across the organisation.",
    href: "/dashboard/tasks/all",
  },
];

export function getTaskScopeRoute(scope: TaskScope): TaskScopeRoute {
  const route = TASK_SCOPE_ROUTES.find((item) => item.scope === scope);

  if (!route) {
    throw new Error(`Unsupported task scope: ${scope}`);
  }

  return route;
}
