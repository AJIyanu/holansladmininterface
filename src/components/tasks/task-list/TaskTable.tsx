import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  formatTaskDateTime,
  getAssignmentTypeLabel,
} from "@/lib/tasks/format-task";

import { TaskPriorityBadge } from "../TaskPriorityBadge";
import { TaskStatusBadge } from "../TaskStatusBadge";

import type { TaskListItem } from "@/types/tasks";
import Link from "next/link";

interface TaskTableProps {
  tasks: TaskListItem[];
}

export function TaskTable({ tasks }: TaskTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Due</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="max-w-[320px]">
                <div className="space-y-1">
                  <Link
                    href={`/dashboard/tasks/${task.id}`}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {task.batch.title}
                  </Link>

                  {task.batch.description ? (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {task.batch.description}
                    </p>
                  ) : null}

                  {task.is_overdue ? (
                    <p className="text-xs font-medium text-destructive">
                      Overdue
                    </p>
                  ) : null}
                </div>
              </TableCell>

              <TableCell>
                <TaskPriorityBadge priority={task.batch.priority} />
              </TableCell>

              <TableCell>
                <TaskStatusBadge status={task.status} />
              </TableCell>

              <TableCell>
                {getAssignmentTypeLabel(task.batch.assignment_type)}
              </TableCell>

              <TableCell>
                {task.assigned_department_name || "Not assigned"}
              </TableCell>

              <TableCell className="whitespace-nowrap">
                {formatTaskDateTime(task.batch.due_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
