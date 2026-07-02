import { Skeleton } from "@/components/ui/skeleton";

export default function TasksLoading() {
  return (
    <div className="space-y-6 bg-blue-100 p-9 min-h-screen">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <div className="grid gap-3 md:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-lg" />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border md:block">
        <Skeleton className="h-14 w-full rounded-none" />

        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-none border-t" />
        ))}
      </div>
    </div>
  );
}
