import { Skeleton } from "@/components/ui/skeleton";

export function LedgerListSkeleton({ label }: { label: string }) {
  return (
    <div role="status" className="space-y-3 py-2">
      <span className="sr-only">{label}</span>
      <div
        aria-hidden="true"
        className="space-y-3 [&_*]:motion-reduce:animate-none"
      >
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-2 rounded-lg border p-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LedgerPageSkeleton({
  label = "Loading ledger…",
  variant = "ledger",
}: {
  label?: string;
  variant?: "ledger" | "party" | "cashbook" | "journal";
}) {
  return (
    <div role="status" className="space-y-6 p-4 md:p-6">
      <span className="sr-only">{label}</span>
      <div
        aria-hidden="true"
        className="space-y-6 [&_*]:motion-reduce:animate-none"
      >
        <div className="flex flex-wrap justify-between gap-4">
          <div className="w-full max-w-lg space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        {variant === "party" && (
          <div className="space-y-3 rounded-xl border bg-card p-5">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-11 w-full sm:max-w-xl" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
        {variant !== "journal" && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="space-y-3 rounded-xl border bg-card p-4"
              >
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-7 w-3/4" />
              </div>
            ))}
          </div>
        )}
        {variant === "journal" ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="rounded-xl border bg-card">
                <div className="space-y-3 border-b p-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="grid gap-4 p-4 sm:grid-cols-2">
                  <Skeleton className="h-12 w-3/4" />
                  <Skeleton className="h-12 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-xl border bg-card p-4"
                >
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              {Array.from({ length: 6 }, (_, row) => (
                <div
                  key={row}
                  className="grid grid-cols-5 gap-4 border-b p-4 first:bg-muted last:border-0"
                >
                  {Array.from({ length: 5 }, (_, column) => (
                    <Skeleton key={column} className="h-5 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
        <div className="flex justify-between gap-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>
    </div>
  );
}
