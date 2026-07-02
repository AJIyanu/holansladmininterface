import Link from "next/link";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface TaskPaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize?: number;
  basePath?: string;
  hasPrevious?: boolean;
  hasNext?: boolean;
  pathname?: string;
  searchParams?: Record<string, string | string[] | undefined>;
}

function createPageUrl(basePath: string, page: number): string {
  const params = new URLSearchParams();

  params.set("page", String(page));

  return `${basePath}?${params.toString()}`;
}

export function TaskPagination({
  currentPage,
  totalCount,
  pageSize = 10,
  basePath = "/dashboard/tasks",
}: TaskPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (totalPages <= 1) {
    return null;
  }

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <Button
          asChild={hasPrevious}
          variant="outline"
          size="sm"
          disabled={!hasPrevious}
        >
          {hasPrevious ? (
            <Link href={createPageUrl(basePath, currentPage - 1)}>
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
            <Link href={createPageUrl(basePath, currentPage + 1)}>
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
