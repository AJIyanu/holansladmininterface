import {
  Archive,
  Ban,
  Bell,
  CheckCircle2,
  History,
  MessageSquare,
  Pencil,
  RotateCcw,
  UserPlus,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { formatTaskDateTime } from "@/lib/tasks/format-task";

import {
  getActivityActorName,
  getTaskActivityPresentation,
} from "@/lib/tasks/format-task-activity";

import type { TaskActivity } from "@/types/tasks";

interface TaskActivityTimelineProps {
  activities: TaskActivity[];
  totalCount: number;
  title?: string;
  description?: string;
}

function getActivityIcon(activityType: string) {
  if (activityType.includes("COMMENT")) {
    return MessageSquare;
  }

  if (activityType.includes("REMINDER")) {
    return Bell;
  }

  if (activityType.includes("ARCHIVED")) {
    return Archive;
  }

  if (activityType.includes("RESTORED")) {
    return RotateCcw;
  }

  if (activityType.includes("CANCELLED")) {
    return Ban;
  }

  if (activityType === "STATUS_CHANGED") {
    return CheckCircle2;
  }

  if (activityType.includes("UPDATED") || activityType.includes("EDITED")) {
    return Pencil;
  }

  if (activityType.includes("CREATED") || activityType.includes("ASSIGNED")) {
    return UserPlus;
  }

  return History;
}

export function TaskActivityTimeline({
  activities,
  totalCount,
  title = "Activity",
  description = "A chronological record of changes and actions.",
}: TaskActivityTimelineProps) {
  return (
    <Card id="task-activity">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="size-5" />
          {title}
        </CardTitle>

        <CardDescription>
          {description} {totalCount} {totalCount === 1 ? "event" : "events"}{" "}
          recorded.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {activities.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center text-center">
            <History className="mb-3 size-7 text-muted-foreground" />

            <p className="font-medium">No activity recorded</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Task changes will appear here.
            </p>
          </div>
        ) : (
          <ol className="relative ml-4 border-l">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.activity_type);

              const presentation = getTaskActivityPresentation(activity);

              return (
                <li key={activity.id} className="relative pb-7 pl-8 last:pb-0">
                  <span className="absolute -left-[17px] top-0 flex size-8 items-center justify-center rounded-full border bg-background">
                    <Icon className="size-4 text-muted-foreground" />
                  </span>

                  <div className="space-y-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <p className="font-medium">{presentation.title}</p>

                      <time className="shrink-0 text-xs text-muted-foreground">
                        {formatTaskDateTime(activity.created_at)}
                      </time>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      By {getActivityActorName(activity)}
                    </p>

                    {presentation.description ? (
                      <p className="whitespace-pre-wrap break-words text-sm">
                        {presentation.description}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
