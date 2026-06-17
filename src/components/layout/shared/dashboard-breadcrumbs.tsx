"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

function formatSegment(segment: string): string {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function DashboardBreadcrumbs() {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((segment) => segment !== "dashboard");

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground"
    >
      <Link
        href="/dashboard"
        className="flex shrink-0 items-center gap-1 transition-colors hover:text-foreground"
      >
        <Home className="size-4" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>

      {segments.map((segment, index) => {
        const href = `/dashboard/${segments.slice(0, index + 1).join("/")}`;

        const isLast = index === segments.length - 1;

        return (
          <div key={href} className="flex min-w-0 items-center gap-1">
            <ChevronRight className="size-4 shrink-0" />

            {isLast ? (
              <span className="truncate font-medium text-foreground">
                {formatSegment(segment)}
              </span>
            ) : (
              <Link
                href={href}
                className="truncate transition-colors hover:text-foreground"
              >
                {formatSegment(segment)}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
