import { Skeleton } from "@/components/ui/skeleton";

export default function RolesLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-24 w-full" />

      {Array.from({ length: 5 }).map(
        (_, index) => (
          <Skeleton
            key={index}
            className="h-28 w-full rounded-xl"
          />
        ),
      )}
    </div>
  );
}