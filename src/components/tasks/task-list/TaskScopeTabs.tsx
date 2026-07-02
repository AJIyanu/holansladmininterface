import Link from "next/link";

import { Archive } from "lucide-react";

import { cn } from "@/lib/utils";
import { canViewTaskScope, type TaskAccessUser } from "@/lib/tasks/task-access";
import { TASK_SCOPE_ROUTES } from "@/lib/tasks/task-routes";

import type { TaskScope } from "@/types/tasks";

interface TaskScopeTabsProps {
  user: TaskAccessUser;
  activeScope: TaskScope;
  archived: boolean;
  searchParams: Record<string, string>;
}

function createScopeUrl(
  href: string,
  searchParams: Record<string, string>,
  archived: boolean,
): string {
  const params = new URLSearchParams(searchParams);

  params.delete("page");
  params.delete("scope");

  if (archived) {
    params.set("archived", "true");
  } else {
    params.delete("archived");
  }

  const query = params.toString();

  return query ? `${href}?${query}` : href;
}

export function TaskScopeTabs({
  user,
  activeScope,
  archived,
  searchParams,
}: TaskScopeTabsProps) {
  const availableRoutes = TASK_SCOPE_ROUTES.filter((route) =>
    canViewTaskScope(user, route.scope),
  );

  const activeRoute =
    availableRoutes.find((route) => route.scope === activeScope) ??
    availableRoutes[0];

  return (
    <div className="space-y-3">
      <nav aria-label="Task views" className="overflow-x-auto">
        <div className="flex min-w-max gap-1 rounded-lg border bg-muted/30 p-1">
          {availableRoutes.map((route) => {
            const active = !archived && route.scope === activeScope;

            return (
              <Link
                key={route.scope}
                href={createScopeUrl(route.href, searchParams, false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                )}
              >
                <span className="sm:hidden">{route.shortTitle}</span>

                <span className="hidden sm:inline">{route.title}</span>
              </Link>
            );
          })}

          {activeRoute ? (
            <Link
              href={createScopeUrl(activeRoute.href, searchParams, !archived)}
              aria-current={archived ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                archived
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
              )}
            >
              <Archive className="size-4" />
              Archived
            </Link>
          ) : null}
        </div>
      </nav>
    </div>
  );
}
