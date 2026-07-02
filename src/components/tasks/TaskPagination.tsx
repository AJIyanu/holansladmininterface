import Link from "next/link";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface TaskPaginationProps {
  currentPage: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  pathname: string;
  searchParams: Record<string, string>;
}

function createPageUrl(
  pathname: string,
  searchParams: Record<string, string>,
  page: number,
): string {
  const params = new URLSearchParams(searchParams);

  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export function TaskPagination({
  currentPage,
  totalCount,
  hasPrevious,
  hasNext,
  pathname,
  searchParams,
}: TaskPaginationProps) {
  if (!hasPrevious && !hasNext) {
    return (
      <p className="text-sm text-muted-foreground">
        {totalCount} {totalCount === 1 ? "task" : "tasks"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {totalCount} {totalCount === 1 ? "task" : "tasks"}
        {" · "}
        Page {currentPage}
      </p>

      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button
          asChild={hasPrevious}
          variant="outline"
          size="sm"
          disabled={!hasPrevious}
        >
          {hasPrevious ? (
            <Link href={createPageUrl(pathname, searchParams, currentPage - 1)}>
              <ChevronLeft className="size-4" />
              Previous
            </Link>
          ) : (
            <span>
              <ChevronLeft className="size-4" />
              Previous
            </span>
          )}
        </Button>

        <Button
          asChild={hasNext}
          variant="outline"
          size="sm"
          disabled={!hasNext}
        >
          {hasNext ? (
            <Link href={createPageUrl(pathname, searchParams, currentPage + 1)}>
              Next
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span>
              Next
              <ChevronRight className="size-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
