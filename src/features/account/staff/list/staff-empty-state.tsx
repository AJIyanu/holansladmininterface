import { SearchX } from "lucide-react";

export default function StaffEmptyState() {
  return (
    <div className="rounded-xl border border-dashed bg-background px-6 py-16 text-center">
      <SearchX className="mx-auto mb-4 size-10 text-muted-foreground" />

      <h2 className="font-semibold">No staff accounts found</h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Try changing or clearing the current search and filter options.
      </p>
    </div>
  );
}
