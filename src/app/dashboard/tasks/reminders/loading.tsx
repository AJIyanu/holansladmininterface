import { Skeleton } from "@/components/ui/skeleton";

export default function TaskRemindersLoading() {
  return (
    <div className="space-y-6 bg-blue-100 p-9 min-h-screen">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <Skeleton className="h-20 rounded-lg" />
      <Skeleton className="h-12 w-72 rounded-lg" />

      <div className="grid gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
