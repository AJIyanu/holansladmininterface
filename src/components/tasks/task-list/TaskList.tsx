import { ClipboardList } from "lucide-react";

import { TaskCard } from "./TaskCard";
import { TaskTable } from "./TaskTable";

import type { TaskListItem } from "@/types/tasks";

interface TaskListProps {
  tasks: TaskListItem[];
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-card px-6 py-12 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">
          <ClipboardList className="size-6 text-muted-foreground" />
        </div>

        <h2 className="text-base font-semibold">No tasks found</h2>

        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          You currently have no tasks matching this view.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <div className="hidden md:block">
        <TaskTable tasks={tasks} />
      </div>
    </>
  );
}
