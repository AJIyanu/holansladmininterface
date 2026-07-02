import { Skeleton } from "@/components/ui/skeleton";

export default function TaskBatchLoading() {
  return (
    <div className="space-y-6 bg-blue-100 p-9 min-h-screen">
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>

      <Skeleton className="h-56 rounded-lg" />
      <Skeleton className="h-80 rounded-lg" />

      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-96 rounded-lg" />
      </div>
    </div>
  );
}
