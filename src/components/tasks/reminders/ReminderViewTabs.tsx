import Link from "next/link";

import { cn } from "@/lib/utils";

export type ReminderView = "upcoming" | "due" | "cancelled";

interface ReminderViewTabsProps {
  activeView: ReminderView;
}

const views = [
  {
    value: "upcoming" as const,
    label: "Upcoming",
  },
  {
    value: "due" as const,
    label: "Due",
  },
  {
    value: "cancelled" as const,
    label: "Cancelled",
  },
];

export function ReminderViewTabs({ activeView }: ReminderViewTabsProps) {
  return (
    <nav aria-label="Reminder views" className="overflow-x-auto">
      <div className="flex min-w-max gap-1 rounded-lg border bg-muted/30 p-1">
        {views.map((view) => (
          <Link
            key={view.value}
            href={
              view.value === "upcoming"
                ? "/dashboard/tasks/reminders"
                : `/dashboard/tasks/reminders?view=${view.value}`
            }
            aria-current={activeView === view.value ? "page" : undefined}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeView === view.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
          >
            {view.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
