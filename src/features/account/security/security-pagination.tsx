"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

interface SecurityPaginationProps {
  count: number;
  page: number;
  pageSize: number;
}

export default function SecurityPagination({
  count,
  page,
  pageSize,
}: SecurityPaginationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  function goToPage(nextPage: number) {
    const query = new URLSearchParams(searchParams.toString());
    query.set("page", String(nextPage));
    router.push(`${pathname}?${query.toString()}`);
  }

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} · {count} records
      </p>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
