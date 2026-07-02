import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchParams } from "@/app/dashboard/requests/page";

interface TablePaginationProps {
  count: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  searchParams: SearchParams; //Record<string, string | undefined>;
  createPaginationUrl: (page: number) => string;
}

export default function TablePagination({
  count,
  currentPage,
  hasNext,
  hasPrevious,
  createPaginationUrl,
}: TablePaginationProps) {
  const totalPages = Math.ceil(count / 20); // Assuming 20 items per page

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Showing {(currentPage - 1) * 20 + 1} to{" "}
        {Math.min(currentPage * 20, count)} of {count} results
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          asChild={hasPrevious}
          disabled={!hasPrevious}
        >
          {hasPrevious ? (
            <Link href={createPaginationUrl(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Link>
          ) : (
            <span>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </span>
          )}
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link href={createPaginationUrl(pageNumber)}>{pageNumber}</Link>
              </Button>
            );
          })}
        </div>

        <div className="sm:hidden text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>

        <Button
          variant="outline"
          size="sm"
          asChild={hasNext}
          disabled={!hasNext}
        >
          {hasNext ? (
            <Link href={createPaginationUrl(currentPage + 1)}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span>
              Next
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
