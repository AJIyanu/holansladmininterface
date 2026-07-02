import type { Metadata } from "next";

import { TaskListPage } from "@/components/tasks/task-list/TaskListPage";

import type { RawTaskSearchParams } from "@/lib/tasks/task-query";

export const metadata: Metadata = {
  title: "Department Tasks",
};

interface DepartmentTasksPageProps {
  searchParams: Promise<RawTaskSearchParams>;
}

export default async function DepartmentTasksPage({
  searchParams,
}: DepartmentTasksPageProps) {
  return (
    <TaskListPage
      scope="department"
      pathname="/dashboard/tasks/department"
      searchParams={await searchParams}
    />
  );
}
