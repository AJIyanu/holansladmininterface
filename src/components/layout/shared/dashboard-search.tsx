"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export default function DashboardSearch() {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        type="search"
        placeholder="Search dashboard..."
        aria-label="Search dashboard"
        className="h-10 rounded-full border-border bg-muted/50 pl-10 pr-4 shadow-none focus-visible:bg-background"
      />
    </div>
  );
}
