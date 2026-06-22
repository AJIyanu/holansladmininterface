"use client";

import { usePathname, useRouter } from "next/navigation";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Department } from "@/features/account/staff/types";

import type { EmploymentType, StaffListSearchParams } from "./staff-list-types";

interface StaffFiltersProps {
  departments: Department[];
  values: StaffListSearchParams;
}

export default function StaffFilters({
  departments,
  values,
}: StaffFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(values.search ?? "");

  useEffect(() => {
    setSearch(values.search ?? "");
  }, [values.search]);

  function updateQuery(updates: Record<string, string | undefined>) {
    const query = new URLSearchParams();

    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        query.set(key, value);
      }
    });

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all") {
        query.delete(key);
      } else {
        query.set(key, value);
      }
    });

    query.set("page", "1");

    router.push(`${pathname}?${query.toString()}`);
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    updateQuery({
      search: search.trim() || undefined,
    });
  }

  function clearFilters() {
    router.push(`${pathname}?page=1&page_size=10`);
  }

  const hasFilters = Object.entries(values).some(
    ([key, value]) => !["page", "page_size"].includes(key) && Boolean(value),
  );

  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="size-4 text-[#0B4F8A]" />
        <h2 className="font-medium">Search and filters</h2>
      </div>

      <div className="grid gap-3 lg:grid-cols-6">
        <form onSubmit={submitSearch} className="flex gap-2 lg:col-span-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search staff..."
              className="pl-9"
            />
          </div>

          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <Select
          value={values.user__is_active ?? "all"}
          onValueChange={(value) =>
            updateQuery({
              user__is_active: value === "all" ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent className="bg-white/30 backdrop-blur-md">
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={values.employment_type ?? "all"}
          onValueChange={(value) =>
            updateQuery({
              employment_type:
                value === "all" ? undefined : (value as EmploymentType),
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Employment type" />
          </SelectTrigger>

          <SelectContent className="bg-white/30 backdrop-blur-md">
            <SelectItem value="all">All employment types</SelectItem>
            <SelectItem value="FT">Full-Time</SelectItem>
            <SelectItem value="PT">Part-Time</SelectItem>
            <SelectItem value="CT">Contract</SelectItem>
            <SelectItem value="IN">Intern</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={values.department ?? "all"}
          onValueChange={(value) =>
            updateQuery({
              department: value === "all" ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Department" />
          </SelectTrigger>

          <SelectContent className="bg-white/30 backdrop-blur-md">
            <SelectItem value="all">All departments</SelectItem>

            {departments.map((department) => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={values.ordering ?? "employee_id"}
          onValueChange={(value) =>
            updateQuery({
              ordering: value,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>

          <SelectContent className="bg-white/30 backdrop-blur-md">
            <SelectItem value="employee_id">Employee ID</SelectItem>
            <SelectItem value="job_title">Job title A–Z</SelectItem>
            <SelectItem value="-job_title">Job title Z–A</SelectItem>
            <SelectItem value="start_date">Earliest start date</SelectItem>
            <SelectItem value="-start_date">Latest start date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <Select
          value={values.page_size ?? "10"}
          onValueChange={(value) =>
            updateQuery({
              page_size: value,
            })
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="bg-white/30 backdrop-blur-md">
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button type="button" variant="ghost" onClick={clearFilters}>
            <RotateCcw className="size-4" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
