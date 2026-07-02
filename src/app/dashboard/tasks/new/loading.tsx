import { Skeleton } from "@/components/ui/skeleton";

export default function CreateTaskLoading() {
  return (
    <div className="space-y-6 bg-blue-100 p-9 min-h-screen">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-4 rounded-lg border p-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ))}
    </div>
  );
}
