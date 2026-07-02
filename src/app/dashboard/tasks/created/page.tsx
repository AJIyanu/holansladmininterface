import type { Metadata } from "next";

import { TaskListPage } from "@/components/tasks/task-list/TaskListPage";

import type { RawTaskSearchParams } from "@/lib/tasks/task-query";

export const metadata: Metadata = {
  title: "Assigned by Me",
};

interface CreatedTasksPageProps {
  searchParams: Promise<RawTaskSearchParams>;
}

export default async function CreatedTasksPage({
  searchParams,
}: CreatedTasksPageProps) {
  return (
    <TaskListPage
      scope="created"
      pathname="/dashboard/tasks/created"
      searchParams={await searchParams}
    />
  );
}
