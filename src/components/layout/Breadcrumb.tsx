"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbProps {
  className?: string;
}

// Map of route segments to readable names
const routeNameMap: Record<string, string> = {
  dashboard: "Dashboard",
  profile: "Profile",
  research: "Research",
  market: "Market Analysis",
  users: "User Studies",
  competitors: "Competitor Analysis",
  plans: "Plan & Reports",
  projects: "Project Plans",
  reports: "Status Reports",
  analytics: "Analytics",
  deliverables: "Deliverables",
  files: "Files",
  assets: "Assets",
  concept: "Main Concept",
  legal: "Legal",
  settings: "Settings",
  notifications: "Notifications",
  help: "Help",
  admin: "Administration",
  team: "Team Management",
  billing: "Billing",
  integrations: "Integrations",
};

// Get readable name for a route segment
const getSegmentName = (segment: string): string => {
  return (
    routeNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
  );
};

// Build the full path for a given segment index
const buildPath = (segments: string[], index: number): string => {
  return "/" + segments.slice(0, index + 1).join("/");
};

export function Breadcrumb({ className = "" }: BreadcrumbProps) {
  const pathname = usePathname();

  // Don't show breadcrumb on login page or root
  if (pathname === "/" || pathname === "/login") {
    return null;
  }

  // Split pathname into segments and filter out empty strings
  const segments = pathname.split("/").filter(Boolean);

  // If we're just on /dashboard, show minimal breadcrumb
  if (segments.length === 1 && segments[0] === "dashboard") {
    return (
      <div
        className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}
      >
        <Home className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Dashboard</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 text-sm py-3 rounded-full shadow-md ${className}`}
    >
      {/* Home/Root link */}
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-gray-900 transition-colors"
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </Link>

      {/* Dynamic segments */}
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const segmentPath = buildPath(segments, index);
        const segmentName = getSegmentName(segment);

        // Skip the first segment if it's 'dashboard' since we already show 'Home'
        if (index === 0 && segment === "dashboard") {
          return null;
        }

        return (
          <div key={segmentPath} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{segmentName}</span>
            ) : (
              <Link
                href={segmentPath}
                className="hover:text-gray-900 transition-colors"
              >
                {segmentName}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
