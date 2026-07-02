import type { Metadata } from "next";

import { TaskListPage } from "@/components/tasks/task-list/TaskListPage";

import type { RawTaskSearchParams } from "@/lib/tasks/task-query";

export const metadata: Metadata = {
  title: "All Tasks",
};

interface AllTasksPageProps {
  searchParams: Promise<RawTaskSearchParams>;
}

export default async function AllTasksPage({
  searchParams,
}: AllTasksPageProps) {
  return (
    <TaskListPage
      scope="all"
      pathname="/dashboard/tasks/all"
      searchParams={await searchParams}
    />
  );
}
