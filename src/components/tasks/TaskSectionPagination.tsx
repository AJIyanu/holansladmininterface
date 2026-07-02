import Link from "next/link";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface TaskSectionPaginationProps {
  pathname: string;
  searchParams: Record<string, string>;
  pageParam: string;
  currentPage: number;
  hasPrevious: boolean;
  hasNext: boolean;
  anchor?: string;
}

function createPageUrl(
  pathname: string,
  searchParams: Record<string, string>,
  pageParam: string,
  page: number,
  anchor?: string,
): string {
  const params = new URLSearchParams(searchParams);

  if (page <= 1) {
    params.delete(pageParam);
  } else {
    params.set(pageParam, String(page));
  }

  const query = params.toString();

  const url = query ? `${pathname}?${query}` : pathname;

  return anchor ? `${url}#${anchor}` : url;
}

export function TaskSectionPagination({
  pathname,
  searchParams,
  pageParam,
  currentPage,
  hasPrevious,
  hasNext,
  anchor,
}: TaskSectionPaginationProps) {
  if (!hasPrevious && !hasNext) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 border-t pt-4">
      <p className="text-sm text-muted-foreground">Page {currentPage}</p>

      <div className="flex gap-2">
        <Button
          asChild={hasPrevious}
          variant="outline"
          size="sm"
          disabled={!hasPrevious}
        >
          {hasPrevious ? (
            <Link
              href={createPageUrl(
                pathname,
                searchParams,
                pageParam,
                currentPage - 1,
                anchor,
              )}
            >
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
            <Link
              href={createPageUrl(
                pathname,
                searchParams,
                pageParam,
                currentPage + 1,
                anchor,
              )}
            >
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
