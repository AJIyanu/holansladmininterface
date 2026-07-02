"use client";

import { usePathname, useRouter } from "next/navigation";
import { RotateCcw, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { glassControlClass } from "../shared/glass-styles";

interface DepartmentFiltersProps {
  search?: string;
  ordering?: string;
  pageSize?: string;
}

export default function DepartmentFilters({
  search: initialSearch,
  ordering = "name",
  pageSize = "10",
}: DepartmentFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(initialSearch ?? "");

  function updateQuery(updates: Record<string, string | undefined>) {
    const query = new URLSearchParams(window.location.search);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        query.delete(key);
      } else {
        query.set(key, value);
      }
    });

    query.set("page", "1");

    router.push(`${pathname}?${query.toString()}`);
  }

  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_220px_160px_auto]">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();

            updateQuery({
              search: search.trim() || undefined,
            });
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search departments..."
              className="pl-9"
            />
          </div>

          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <Select
          value={ordering}
          onValueChange={(value) =>
            updateQuery({
              ordering: value,
            })
          }
        >
          <SelectTrigger className={glassControlClass}>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="name">Name A–Z</SelectItem>
            <SelectItem value="-name">Name Z–A</SelectItem>
            <SelectItem value="code">Code A–Z</SelectItem>
            <SelectItem value="-code">Code Z–A</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={pageSize}
          onValueChange={(value) =>
            updateQuery({
              page_size: value,
            })
          }
        >
          <SelectTrigger className={glassControlClass}>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`${pathname}?page=1&page_size=10`)}
        >
          <RotateCcw className="size-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
