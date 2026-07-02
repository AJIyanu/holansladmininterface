import {
  Ban,
  CheckCircle2,
  Circle,
  CircleAlert,
  Clock3,
  ListChecks,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import type {
  TaskBatchProgress as TaskBatchProgressType,
} from "@/types/tasks";

interface TaskBatchProgressProps {
  progress: TaskBatchProgressType;
}

const progressItems = [
  {
    key: "total" as const,
    label: "Total",
    icon: ListChecks,
  },
  {
    key: "to_do" as const,
    label: "To do",
    icon: Circle,
  },
  {
    key: "in_progress" as const,
    label: "In progress",
    icon: Clock3,
  },
  {
    key: "blocked" as const,
    label: "Blocked",
    icon: CircleAlert,
  },
  {
    key: "completed" as const,
    label: "Completed",
    icon: CheckCircle2,
  },
  {
    key: "cancelled" as const,
    label: "Cancelled",
    icon: Ban,
  },
];

export function TaskBatchProgress({
  progress,
}: TaskBatchProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Assignment progress
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              Completion
            </span>

            <span className="font-semibold">
              {progress.completion_percentage}%
            </span>
          </div>

          <Progress
            value={
              progress.completion_percentage
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {progressItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.key}
                className="rounded-lg border p-3"
              >
                <Icon className="mb-2 size-4 text-muted-foreground" />

                <p className="text-xl font-bold">
                  {progress[item.key]}
                </p>

                <p className="text-xs text-muted-foreground">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}