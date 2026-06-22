"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface StaffPaginationProps {
  count: number;
  page: number;
  pageSize: number;
}

export default function StaffPagination({
  count,
  page,
  pageSize,
}: StaffPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  function changePage(nextPage: number) {
    const query = new URLSearchParams(window.location.search);

    query.set("page", String(nextPage));

    router.push(`${pathname}?${query.toString()}`);
  }

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between rounded-lg border bg-background px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => changePage(page - 1)}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => changePage(page + 1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
