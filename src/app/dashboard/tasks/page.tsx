import type { Metadata } from "next";

import { TaskListPage } from "@/components/tasks/task-list/TaskListPage";

import type { RawTaskSearchParams } from "@/lib/tasks/task-query";

export const metadata: Metadata = {
  title: "My Tasks",
};

interface MyTasksPageProps {
  searchParams: Promise<RawTaskSearchParams>;
}

export default async function MyTasksPage({ searchParams }: MyTasksPageProps) {
  return (
    <div className="p-9 bg-blue-100 min-h-screen">
      <TaskListPage
        scope="my"
        pathname="/dashboard/tasks"
        searchParams={await searchParams}
      />
    </div>
  );
}
