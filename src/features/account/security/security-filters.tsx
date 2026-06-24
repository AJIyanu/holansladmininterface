"use client";

import { RotateCcw, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { SecurityRange } from "./types";

interface FilterOption {
  value: string;
  label: string;
}

interface SecurityFiltersProps {
  kind: "login" | "audit";
  values: Record<string, string | undefined>;
}

const loginEvents: FilterOption[] = [
  { value: "LOGIN_SUCCESS", label: "Login success" },
  { value: "LOGIN_FAILED", label: "Login failed" },
  { value: "LOGOUT", label: "Logout" },
  {
    value: "DEFAULT_PASSWORD_LOGIN_BLOCKED",
    label: "Default password blocked",
  },
  {
    value: "PASSWORD_RESET_REQUESTED",
    label: "Password reset requested",
  },
  {
    value: "PASSWORD_RESET_COMPLETED",
    label: "Password reset completed",
  },
  { value: "PASSWORD_RESET_FAILED", label: "Password reset failed" },
];

const auditEvents: FilterOption[] = [
  { value: "CREATE", label: "Create" },
  { value: "READ", label: "Read" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "ACCOUNT_CREATED", label: "Account created" },
];

export default function SecurityFilters({ kind, values }: SecurityFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const [search, setSearch] = useState(values.search ?? "");
  const [resource, setResource] = useState(values.resource ?? "");
  const [action, setAction] = useState(values.action ?? "");

  useEffect(() => {
    setSearch(values.search ?? "");
    setResource(values.resource ?? "");
    setAction(values.action ?? "");
  }, [values.action, values.resource, values.search]);

  function updateQuery(updates: Record<string, string | undefined>) {
    const query = new URLSearchParams(currentSearchParams.toString());

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

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateQuery({ search: search.trim() || undefined });
  }

  function clearFilters() {
    router.push(`${pathname}?range=month&page=1&page_size=20&ordering=-created_at`);
  }

  const eventOptions = kind === "login" ? loginEvents : auditEvents;

  return (
    <div className="space-y-3 rounded-xl border bg-background p-4 shadow-sm">
      <div className="grid gap-3 xl:grid-cols-6">
        <form onSubmit={submitSearch} className="flex gap-2 xl:col-span-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={kind === "login" ? "Search user, IP or event..." : "Search actor, target or resource..."}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <Select
          value={(values.range as SecurityRange) ?? "month"}
          onValueChange={(value) => updateQuery({ range: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Recent month</SelectItem>
            <SelectItem value="quarter">Recent quarter</SelectItem>
            <SelectItem value="year">Recent year</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={values.status ?? "all"}
          onValueChange={(value) => updateQuery({ status: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="SUCCESS">Successful</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={values.event_type ?? "all"}
          onValueChange={(value) => updateQuery({ event_type: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All event types</SelectItem>
            {eventOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={values.ordering ?? "-created_at"}
          onValueChange={(value) => updateQuery({ ordering: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-created_at">Newest first</SelectItem>
            <SelectItem value="created_at">Oldest first</SelectItem>
            <SelectItem value="event_type">Event A–Z</SelectItem>
            <SelectItem value="-event_type">Event Z–A</SelectItem>
            <SelectItem value="status">Status A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {kind === "audit" && (
        <form
          className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            updateQuery({
              resource: resource.trim() || undefined,
              action: action.trim() || undefined,
            });
          }}
        >
          <Select
            value={values.event_category ?? "all"}
            onValueChange={(value) => updateQuery({ event_category: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="AUTH">Authentication</SelectItem>
              <SelectItem value="CRUD">CRUD activity</SelectItem>
              <SelectItem value="SECURITY">Security</SelectItem>
              <SelectItem value="SYSTEM">System</SelectItem>
            </SelectContent>
          </Select>

          <Input
            value={resource}
            placeholder="Resource filter"
            onChange={(event) => setResource(event.target.value)}
          />

          <Input
            value={action}
            placeholder="Action filter"
            onChange={(event) => setAction(event.target.value)}
          />

          <Button type="submit" variant="outline">
            Apply
          </Button>
        </form>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select
          value={values.page_size ?? "20"}
          onValueChange={(value) => updateQuery({ page_size: value })}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>

        <Button type="button" variant="ghost" onClick={clearFilters}>
          <RotateCcw className="size-4" />
          Clear filters
        </Button>
      </div>
    </div>
  );
}
