"use client";

import { FormEvent, useEffect, useState } from "react";

import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";

import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskFiltersProps {
  initialValues: Record<string, string>;
}

const EMPTY_VALUE = "ALL";

export function TaskFilters({ initialValues }: TaskFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(initialValues.search ?? "");

  const [status, setStatus] = useState(initialValues.status ?? EMPTY_VALUE);

  const [priority, setPriority] = useState(
    initialValues.priority ?? EMPTY_VALUE,
  );

  const [assignmentType, setAssignmentType] = useState(
    initialValues.assignment_type ?? EMPTY_VALUE,
  );

  const [overdue, setOverdue] = useState(initialValues.overdue ?? EMPTY_VALUE);

  const [ordering, setOrdering] = useState(initialValues.ordering ?? "due_at");

  useEffect(() => {
    setSearch(initialValues.search ?? "");
    setStatus(initialValues.status ?? EMPTY_VALUE);
    setPriority(initialValues.priority ?? EMPTY_VALUE);
    setAssignmentType(initialValues.assignment_type ?? EMPTY_VALUE);
    setOverdue(initialValues.overdue ?? EMPTY_VALUE);
    setOrdering(initialValues.ordering ?? "due_at");
  }, [initialValues]);

  function setOrDelete(params: URLSearchParams, key: string, value: string) {
    if (!value || value === EMPTY_VALUE) {
      params.delete(key);
      return;
    }

    params.set(key, value);
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams(window.location.search);

    params.delete("page");

    setOrDelete(params, "search", search.trim());

    setOrDelete(params, "status", status);
    setOrDelete(params, "priority", priority);

    setOrDelete(params, "assignment_type", assignmentType);

    setOrDelete(params, "overdue", overdue);
    setOrDelete(params, "ordering", ordering);

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function resetFilters() {
    const params = new URLSearchParams(window.location.search);

    [
      "search",
      "status",
      "priority",
      "assignment_type",
      "overdue",
      "ordering",
      "page",
    ].forEach((key) => params.delete(key));

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <form onSubmit={applyFilters} className="rounded-lg border bg-card p-4">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="size-4 text-muted-foreground" />

        <h2 className="text-sm font-semibold">Search and filters</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <div className="space-y-2 sm:col-span-2 xl:col-span-2">
          <Label htmlFor="task-search">Search</Label>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="task-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search task title, assignee or department"
              className="pl-9 placeholder:text-muted-foreground/70"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>All statuses</SelectItem>
              <SelectItem value="TO_DO">To do</SelectItem>
              <SelectItem value="IN_PROGRESS">In progress</SelectItem>
              <SelectItem value="BLOCKED">Blocked</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>

          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>All priorities</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Assignment</Label>

          <Select value={assignmentType} onValueChange={setAssignmentType}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>All types</SelectItem>
              <SelectItem value="PERSONAL">Personal</SelectItem>
              <SelectItem value="USERS">Selected staff</SelectItem>
              <SelectItem value="DEPARTMENT">Department</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Deadline</Label>

          <Select value={overdue} onValueChange={setOverdue}>
            <SelectTrigger>
              <SelectValue placeholder="All deadlines" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value={EMPTY_VALUE}>All deadlines</SelectItem>
              <SelectItem value="true">Overdue only</SelectItem>
              <SelectItem value="false">Not overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2 xl:col-span-2">
          <Label>Order by</Label>

          <Select value={ordering} onValueChange={setOrdering}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="due_at">Due date: earliest first</SelectItem>
              <SelectItem value="-due_at">Due date: latest first</SelectItem>
              <SelectItem value="-created_at">Newest first</SelectItem>
              <SelectItem value="created_at">Oldest first</SelectItem>
              <SelectItem value="title">Title: A–Z</SelectItem>
              <SelectItem value="-title">Title: Z–A</SelectItem>
              <SelectItem value="priority">Priority: low to urgent</SelectItem>
              <SelectItem value="-priority">Priority: urgent to low</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={resetFilters}
          className="w-full sm:w-auto"
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>

        <Button type="submit" className="w-full sm:w-auto">
          <Search className="size-4" />
          Apply filters
        </Button>
      </div>
    </form>
  );
}
