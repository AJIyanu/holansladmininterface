import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main
      role="status"
      aria-label="Loading procurement"
      aria-busy="true"
      className="space-y-6 p-4 md:p-6 lg:p-8"
    >
      <span className="sr-only">Loading procurement…</span>
      <div aria-hidden="true" className="space-y-6">
        <div className="space-y-3 py-2">
          <Skeleton className="h-8 w-56 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex flex-wrap gap-3 rounded-xl border bg-card p-4 md:p-5">
          <Skeleton className="h-10 min-w-40 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
          <Skeleton className="mb-6 h-5 w-40" />
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              <Skeleton className="size-10 shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="hidden h-6 w-24 sm:block" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
