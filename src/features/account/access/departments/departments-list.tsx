import type { CurrentUser } from "@/types/auth";

import type { Department } from "../shared/access-types";
import ResourcePagination from "../shared/resource-pagination";
import DepartmentCard from "./department-card";

interface DepartmentsListProps {
  departments: Department[];
  count: number;
  page: number;
  pageSize: number;
  currentUser: CurrentUser;
}

export default function DepartmentsList({
  departments,
  count,
  page,
  pageSize,
  currentUser,
}: DepartmentsListProps) {
  if (departments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-background px-6 py-16 text-center">
        <h2 className="font-semibold">No departments found</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Create a department or change the current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {count} department
        {count === 1 ? "" : "s"}
      </p>

      {departments.map((department) => (
        <DepartmentCard
          key={department.id}
          department={department}
          currentUser={currentUser}
        />
      ))}

      <ResourcePagination count={count} page={page} pageSize={pageSize} />
    </div>
  );
}
