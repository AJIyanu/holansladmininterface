import { TaskFilters } from "./TaskFilters";
import { TaskList } from "./TaskList";
import { TaskPagination } from "./TaskPagination";
import { TaskScopeTabs } from "./TaskScopeTabs";

import { getTasks, TaskApiError } from "@/lib/api/tasks";
import { getCurrentUser } from "@/lib/auth-server";
import { canViewTaskScope } from "@/lib/tasks/task-access";
import {
  buildTaskListQuery,
  flattenTaskSearchParams,
  type RawTaskSearchParams,
} from "@/lib/tasks/task-query";
import { getTaskScopeRoute } from "@/lib/tasks/task-routes";
import Link from "next/link";
import { ListPlus, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { TaskScope } from "@/types/tasks";

interface TaskListPageProps {
  scope: TaskScope;
  pathname: string;
  searchParams: RawTaskSearchParams;
}

export async function TaskListPage({
  scope,
  pathname,
  searchParams,
}: TaskListPageProps) {
  const currentUser = await getCurrentUser();

  const route = getTaskScopeRoute(scope);

  const flatSearchParams = flattenTaskSearchParams(searchParams);

  const query = buildTaskListQuery(searchParams, scope);

  if (!currentUser || !canViewTaskScope(currentUser, scope)) {
    return (
      <div className="space-y-6 bg-blue-100 p-9 min-h-screen">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {query.archived ? `Archived ${route.title}` : route.title}
            </h1>

            <p className="text-sm text-muted-foreground">{route.description}</p>
          </div>

          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/tasks/new">
              <ListPlus className="size-4" />
              Create Task
            </Link>
          </Button>
        </header>

        <div
          role="alert"
          className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <ShieldAlert className="mt-0.5 size-5 shrink-0" />

          <div>
            <p className="font-semibold">Access unavailable</p>

            <p className="mt-1">
              You do not have permission to view this task scope.
            </p>
          </div>
        </div>
      </div>
    );
  }

  try {
    const taskResponse = await getTasks(query);

    return (
      <div className="space-y-6 bg-blue-100 p-9 min-h-screen">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {query.archived ? `Archived ${route.title}` : route.title}
          </h1>

          <p className="text-sm text-muted-foreground">{route.description}</p>
        </header>

        <TaskScopeTabs
          user={currentUser}
          activeScope={scope}
          archived={query.archived ?? false}
          searchParams={flatSearchParams}
        />

        <TaskFilters initialValues={flatSearchParams} />

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {taskResponse.count} {taskResponse.count === 1 ? "task" : "tasks"}{" "}
              found
            </p>
          </div>

          <TaskList tasks={taskResponse.results} />

          <TaskPagination
            currentPage={query.page ?? 1}
            totalCount={taskResponse.count}
            hasPrevious={Boolean(taskResponse.previous)}
            hasNext={Boolean(taskResponse.next)}
            pathname={pathname}
            searchParams={flatSearchParams}
          />
        </section>
      </div>
    );
  } catch (error) {
    const message =
      error instanceof TaskApiError
        ? error.message
        : "The task list could not be loaded.";

    return (
      <div className="space-y-6 bg-blue-100 p-9 min-h-screen">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{route.title}</h1>

          <p className="text-sm text-muted-foreground">{route.description}</p>
        </header>

        <TaskScopeTabs
          user={currentUser}
          activeScope={scope}
          archived={query.archived ?? false}
          searchParams={flatSearchParams}
        />

        <TaskFilters initialValues={flatSearchParams} />

        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {message}
        </div>
      </div>
    );
  }
}
